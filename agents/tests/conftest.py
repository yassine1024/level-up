import json

import pytest
from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage
from pydantic import ValidationError

from app.llm import get_model
from app.main import app


class FakeModel:
    """Stands in for the Gemini chat model: answers with queued outputs and records every prompt."""

    def __init__(self):
        self.outputs = []
        self.prompts = []

    def queue(self, *outputs):
        self.outputs.extend(outputs)

    def with_structured_output(self, schema, include_raw=False):
        assert include_raw
        return FakeStructuredModel(self, schema)

    def prompt(self, call=-1) -> str:
        return "\n".join(str(message.content) for message in self.prompts[call])


class FakeStructuredModel:
    def __init__(self, model, schema):
        self.model = model
        self.schema = schema

    async def ainvoke(self, messages):
        self.model.prompts.append(messages)
        output = self.model.outputs.pop(0)
        if isinstance(output, Exception):
            raise output
        # Same result shape as the real model with include_raw=True.
        raw = AIMessage(json.dumps(output, ensure_ascii=False))
        try:
            parsed = self.schema.model_validate(output)
        except ValidationError as error:
            return {"raw": raw, "parsed": None, "parsing_error": error}
        return {"raw": raw, "parsed": parsed, "parsing_error": None}


@pytest.fixture
def model():
    fake = FakeModel()
    app.dependency_overrides[get_model] = lambda: fake
    yield fake
    app.dependency_overrides.clear()
    assert not fake.outputs, "the test queued model outputs that were never used"


@pytest.fixture
def client(model):
    return TestClient(app)


def localized(text):
    return {"en": text, "fr": f"{text} (fr)", "ar": f"{text} (ar)"}
