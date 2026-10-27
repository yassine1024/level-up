import json
from collections import Counter
from pathlib import Path

import pytest
from langchain_google_genai.chat_models import ChatGoogleGenerativeAIError

from app.placement import FALLBACK_SUMMARIES
from conftest import localized

BANK = json.loads((Path(__file__).parents[2] / "docs" / "placement-test-bank.json").read_text("utf-8"))
UNIT_TITLES = {"A1": ["Greetings and Introductions"], "A2": ["Daily routines", "Food and drinks"]}


def placement_request(correct_per_level: dict[str, int]) -> dict:
    """Answer the first n questions of each level right and the rest wrong."""
    answered = Counter()
    questions, answers = [], []
    for item in BANK:
        questions.append({
            "id": item["sortOrder"],
            "prompt": item["prompt"],
            "correctOption": item["correctOption"],
            "level": item["level"],
            "skill": item["skill"],
            "focus": item["focus"],
        })
        right = answered[item["level"]] < correct_per_level.get(item["level"], 0)
        answered[item["level"]] += 1
        wrong = "A" if item["correctOption"] != "A" else "B"
        answers.append({
            "questionId": item["sortOrder"],
            "selectedOption": item["correctOption"] if right else wrong,
        })
    return {"questions": questions, "answers": answers, "unitTitles": UNIT_TITLES}


@pytest.mark.parametrize(
    ("correct_per_level", "expected_level"),
    [
        ({}, "A1"),
        ({"A1": 3, "A2": 1}, "A2"),
        ({"A1": 2, "A2": 2, "B1": 2, "B2": 1}, "B2"),
        ({"A1": 3, "A2": 3, "B1": 3, "B2": 3, "C1": 3}, "C1"),
        # Passing B1 and B2 after failing A1 is guessing, not knowledge.
        ({"A1": 1, "A2": 3, "B1": 3, "B2": 3}, "A1"),
    ],
)
def test_level_is_the_one_after_the_last_level_passed(client, model, correct_per_level, expected_level):
    model.queue(localized("Summary."))

    response = client.post("/api/agents/placement/evaluate", json=placement_request(correct_per_level))

    assert response.status_code == 200
    body = response.json()
    assert body["level"] == expected_level
    assert body["score"] == sum(correct_per_level.values())
    assert body["total"] == 15
    assert body["summary"] == localized("Summary.")


def test_summary_prompt_gets_the_decided_level_and_its_units(client, model):
    model.queue(localized("Summary."))

    client.post("/api/agents/placement/evaluate", json=placement_request({"A1": 3, "A2": 1}))

    prompt = model.prompt()
    assert "Assigned level: A2" in prompt
    assert "By level: A1 3/3, A2 1/3, B1 0/3, B2 0/3, C1 0/3" in prompt
    assert "Units of the A2 course: Daily routines; Food and drinks" in prompt
    assert "Greetings and Introductions" not in prompt
    right, missed = prompt.split("Topics answered correctly:")[1].split("Topics missed:")
    assert "past simple: irregular verbs" in right
    assert "some and any" in missed


def test_level_breakdown_is_returned(client, model):
    model.queue(localized("Summary."))

    body = client.post("/api/agents/placement/evaluate", json=placement_request({"A1": 3, "A2": 1})).json()

    assert body["byLevel"][:2] == [
        {"level": "A1", "correct": 3, "total": 3},
        {"level": "A2", "correct": 1, "total": 3},
    ]


def test_fallback_summary_when_the_model_fails(client, model):
    model.queue(ChatGoogleGenerativeAIError("quota exceeded"))

    response = client.post("/api/agents/placement/evaluate", json=placement_request({"A1": 3}))

    assert response.status_code == 200
    assert response.json()["summary"] == FALLBACK_SUMMARIES["A2"].model_dump()


def test_fallback_summary_when_the_output_stays_invalid(client, model):
    model.queue({"en": "only English"}, {"en": "still only English"})

    response = client.post("/api/agents/placement/evaluate", json=placement_request({}))

    assert response.status_code == 200
    assert response.json()["summary"] == FALLBACK_SUMMARIES["A1"].model_dump()


def test_lowercase_options_are_accepted(client, model):
    model.queue(localized("Summary."))
    request = placement_request({})
    request["answers"] = [{**answer, "selectedOption": answer["selectedOption"].lower()} for answer in request["answers"]]

    assert client.post("/api/agents/placement/evaluate", json=request).status_code == 200


def test_every_question_needs_exactly_one_answer(client):
    missing = placement_request({})
    missing["answers"].pop()
    duplicate = placement_request({})
    duplicate["answers"][1]["questionId"] = duplicate["answers"][0]["questionId"]
    unknown = placement_request({})
    unknown["answers"][0]["questionId"] = 999

    for request in (missing, duplicate, unknown):
        assert client.post("/api/agents/placement/evaluate", json=request).status_code == 422


def test_non_text_option_is_rejected(client):
    request = placement_request({})
    request["answers"][0]["selectedOption"] = 2

    assert client.post("/api/agents/placement/evaluate", json=request).status_code == 422
