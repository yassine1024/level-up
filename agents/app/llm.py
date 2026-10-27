import logging
import os
from collections.abc import Callable
from functools import lru_cache
from typing import Annotated, Any

from fastapi import Depends, HTTPException
from langchain.chat_models import init_chat_model
from langchain_core.exceptions import ModelError
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_google_genai.chat_models import ChatGoogleGenerativeAIError
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# A lesson's vocabulary or grammar sheet is a few thousand characters; the
# backend keeps up to 200 000 per file, which would only add cost.
MAX_BLOCK_CHARS = 12_000


class GenerationError(Exception):
    def __init__(self, schema: str, problems: list[str]):
        super().__init__(f"{schema} output rejected: {'; '.join(problems)}")
        self.problems = problems


# Failures of the model call, as opposed to bugs in this service.
MODEL_FAILURES = (GenerationError, ChatGoogleGenerativeAIError, ModelError)


@lru_cache
def chat_model() -> BaseChatModel:
    # No temperature: for Gemini 3 models the wrapper then keeps Google's
    # default, which Google recommends over lower values.
    return init_chat_model(
        model=f"google_genai:{os.getenv('GEMINI_MODEL', 'gemini-3.5-flash-lite')}",
        timeout=30,
        max_retries=2,
    )


def get_model() -> BaseChatModel:
    if not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is not configured.",
        )
    return chat_model()


Model = Annotated[BaseChatModel, Depends(get_model)]


async def generate[T: BaseModel](
    model: BaseChatModel,
    messages: list[BaseMessage],
    schema: type[T],
    check: Callable[[T], list[str]] | None = None,
) -> T:
    """Get structured output; if it fails parsing or `check`, send the problems back once."""
    structured = model.with_structured_output(schema, include_raw=True)
    result = await structured.ainvoke(messages)
    problems = _problems(result, check)
    if not problems:
        return result["parsed"]

    logger.warning("%s output rejected, asking for a fix: %s", schema.__name__, problems)
    fix_request = HumanMessage(
        "Your answer has these problems:\n"
        + "\n".join(f"- {problem}" for problem in problems)
        + "\nReturn the whole answer again with them fixed."
    )
    result = await structured.ainvoke([*messages, result["raw"], fix_request])
    problems = _problems(result, check)
    if problems:
        raise GenerationError(schema.__name__, problems)
    return result["parsed"]


def _problems(result: dict[str, Any], check: Callable[[Any], list[str]] | None) -> list[str]:
    if result["parsing_error"] is not None:
        return [str(result["parsing_error"])]
    return check(result["parsed"]) if check else []


def data_block(name: str, text: str) -> str:
    """Delimit teacher or student text so the model reads it as material, not as instructions."""
    text = text.strip()
    if len(text) > MAX_BLOCK_CHARS:
        logger.warning("%s cut from %d to %d characters", name, len(text), MAX_BLOCK_CHARS)
        text = text[:MAX_BLOCK_CHARS]
    return f"<{name}>\n{text}\n</{name}>"
