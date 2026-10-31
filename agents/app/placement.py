import logging
from collections import Counter
from typing import Annotated, Literal

from fastapi import APIRouter
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from pydantic import BeforeValidator, Field, model_validator

from app.llm import MODEL_FAILURES, Model, generate
from app.schemas import LEVELS, CamelModel, GenerationMeta, Level, Localized

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agents/placement", tags=["Agent 1: placement test"])

Option = Annotated[
    Literal["A", "B", "C", "D"],
    BeforeValidator(lambda value: value.upper() if isinstance(value, str) else value),
]


class PlacementQuestion(CamelModel):
    id: int
    prompt: str
    correct_option: Option
    level: Level
    skill: str = ""
    focus: str = ""


class PlacementAnswer(CamelModel):
    question_id: int
    selected_option: Option


class PlacementRequest(CamelModel):
    questions: list[PlacementQuestion] = Field(min_length=1)
    answers: list[PlacementAnswer]
    unit_titles: dict[Level, list[str]] = Field(
        default={},
        description="Unit titles of each course level, used to say what comes next",
    )

    @model_validator(mode="after")
    def one_answer_per_question(self) -> "PlacementRequest":
        question_ids = [question.id for question in self.questions]
        answered_ids = [answer.question_id for answer in self.answers]
        if len(set(question_ids)) != len(question_ids):
            raise ValueError("question ids must be unique")
        if sorted(answered_ids) != sorted(question_ids):
            raise ValueError("send exactly one answer for every question")
        return self


class LevelScore(CamelModel):
    level: Level
    correct: int
    total: int

    @property
    def passed(self) -> bool:
        return 3 * self.correct >= 2 * self.total


class PlacementResult(CamelModel):
    score: int
    total: int
    level: Level
    by_level: list[LevelScore]
    summary: Localized
    meta: GenerationMeta | None = None


def score_by_level(request: PlacementRequest) -> list[LevelScore]:
    selected = {answer.question_id: answer.selected_option for answer in request.answers}
    totals = Counter(question.level for question in request.questions)
    correct = Counter(
        question.level
        for question in request.questions
        if selected[question.id] == question.correct_option
    )
    return [
        LevelScore(level=level, correct=correct[level], total=totals[level])
        for level in LEVELS
        if totals[level]
    ]


def assign_level(scores: list[LevelScore]) -> Level:
    # The student studies the level after the last one passed, and the walk
    # stops at the first failed level: with four options a level is passed by
    # pure guessing about one time in six, and those lucky passes on the hard
    # questions must not move a beginner up.
    placed = LEVELS[0]
    for score in scores:
        if not score.passed:
            break
        placed = LEVELS[min(LEVELS.index(score.level) + 1, len(LEVELS) - 1)]
    return placed


SYSTEM_PROMPT = """You write the result message of an English placement test in a language-learning app.
The scoring code has already chosen the student's level. Do not change it, question it or name other levels.
Write exactly two short sentences to the student ("you"):
1. what they can already do in English, judged from the topics they got right;
2. what they will learn next, using the units of their level when they are listed.
Use English that a learner at the assigned level can read. Be warm and specific, never discouraging.
Give the same message in English (en), French (fr, address the student as "tu") and Modern Standard Arabic (ar)."""


def summary_messages(
    request: PlacementRequest,
    scores: list[LevelScore],
    level: Level,
) -> list[BaseMessage]:
    selected = {answer.question_id: answer.selected_option for answer in request.answers}
    right, missed = [], []
    for question in request.questions:
        topic = question.focus or question.prompt
        (right if selected[question.id] == question.correct_option else missed).append(topic)
    lines = [
        f"Assigned level: {level}",
        f"Correct answers: {sum(s.correct for s in scores)} of {len(request.questions)}",
        "By level: " + ", ".join(f"{s.level} {s.correct}/{s.total}" for s in scores),
        "Topics answered correctly: " + ("; ".join(dict.fromkeys(right)) or "none"),
        "Topics missed: " + ("; ".join(dict.fromkeys(missed)) or "none"),
    ]
    if units := request.unit_titles.get(level):
        lines.append(f"Units of the {level} course: " + "; ".join(units))
    return [SystemMessage(SYSTEM_PROMPT), HumanMessage("\n".join(lines))]


FALLBACK_SUMMARIES: dict[Level, Localized] = {
    "A1": Localized(
        en="You already know some English words. Next you will learn to introduce yourself and talk about everyday things.",
        fr="Tu connais déjà quelques mots d'anglais. Ensuite, tu vas apprendre à te présenter et à parler de la vie de tous les jours.",
        ar="أنت تعرف بعض الكلمات الإنجليزية. ستتعلم بعد ذلك كيف تقدّم نفسك وتتحدث عن الحياة اليومية.",
    ),
    "A2": Localized(
        en="You can understand and use simple sentences about yourself. Next you will learn to talk about the past and your daily life in more detail.",
        fr="Tu comprends et utilises des phrases simples sur toi-même. Ensuite, tu vas apprendre à parler du passé et de ta vie quotidienne plus en détail.",
        ar="أنت تفهم وتستعمل جملاً بسيطة عن نفسك. ستتعلم بعد ذلك كيف تتحدث عن الماضي وعن حياتك اليومية بتفصيل أكثر.",
    ),
    "B1": Localized(
        en="You can talk about familiar topics and your experiences. Next you will learn to give opinions and explain your ideas more clearly.",
        fr="Tu peux parler de sujets familiers et de tes expériences. Ensuite, tu vas apprendre à donner ton avis et à expliquer tes idées plus clairement.",
        ar="يمكنك التحدث عن مواضيع مألوفة وعن تجاربك. ستتعلم بعد ذلك كيف تعبّر عن رأيك وتشرح أفكارك بوضوح أكبر.",
    ),
    "B2": Localized(
        en="You can follow and join most conversations with confidence. Next you will work on complex grammar and more precise vocabulary.",
        fr="Tu peux suivre la plupart des conversations et y participer avec assurance. Ensuite, tu vas travailler la grammaire complexe et un vocabulaire plus précis.",
        ar="يمكنك متابعة معظم المحادثات والمشاركة فيها بثقة. ستعمل بعد ذلك على القواعد المعقدة والمفردات الأكثر دقة.",
    ),
    "C1": Localized(
        en="You use English fluently, even with advanced grammar. Next you will polish your style and the precision of your vocabulary.",
        fr="Tu utilises l'anglais avec aisance, même avec une grammaire avancée. Ensuite, tu vas perfectionner ton style et la précision de ton vocabulaire.",
        ar="أنت تستعمل الإنجليزية بطلاقة حتى مع القواعد المتقدمة. ستعمل بعد ذلك على صقل أسلوبك ودقة مفرداتك.",
    ),
}


@router.post("/evaluate", response_model=PlacementResult)
async def evaluate(request: PlacementRequest, model: Model) -> PlacementResult:
    scores = score_by_level(request)
    level = assign_level(scores)
    meta = None
    try:
        summary, meta = await generate(model, summary_messages(request, scores, level), Localized)
    except MODEL_FAILURES:
        # The level is already known; a fixed message is better than blocking onboarding.
        logger.exception("Placement summary failed, using the fixed summary for %s", level)
        summary = FALLBACK_SUMMARIES[level]
    return PlacementResult(
        score=sum(s.correct for s in scores),
        total=len(request.questions),
        level=level,
        by_level=scores,
        summary=summary,
        meta=meta,
    )
