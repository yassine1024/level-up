import logging
import os
import time
from collections.abc import Callable
from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated, Any

from fastapi import Depends, HTTPException
from langchain.chat_models import init_chat_model
from langchain_core.exceptions import ModelError
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_google_genai.chat_models import ChatGoogleGenerativeAIError
from pydantic import BaseModel

from app.schemas import GenerationMeta

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


def _token_usage(result: dict[str, Any]) -> int | None:
    raw = result.get("raw")
    usage = None
    if isinstance(raw, dict):
        usage = raw.get("usage_metadata")
    else:
        usage = getattr(raw, "usage_metadata", None)
    if isinstance(usage, dict):
        value = usage.get("total_tokens", usage.get("total_token_count"))
    else:
        value = getattr(usage, "total_tokens", None)
        if value is None:
            value = getattr(usage, "total_token_count", None)
    return value if isinstance(value, int) else None


async def generate[T: BaseModel](
    model: BaseChatModel,
    messages: list[BaseMessage],
    schema: type[T],
    check: Callable[[T], list[str]] | None = None,
) -> tuple[T, GenerationMeta]:
    """Get structured output; if it fails parsing or `check`, send the problems back once.

    Returns the parsed value together with a ``GenerationMeta`` describing the
    attempts, the validation problems found, the model name, the latency and the
    token usage (when the provider reports it).
    """
    started = time.monotonic()
    structured = model.with_structured_output(schema, include_raw=True)
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

    result = await structured.ainvoke(messages)
    problems = _problems(result, check)
    attempts = 1
    all_problems: list[str] = list(problems)
    token_usage = _token_usage(result)

    if problems:
        logger.warning("%s output rejected, asking for a fix: %s", schema.__name__, problems)
        fix_request = HumanMessage(
            "Your answer has these problems:\n"
            + "\n".join(f"- {problem}" for problem in problems)
            + "\nReturn the whole answer again with them fixed."
        )
        result = await structured.ainvoke([*messages, result["raw"], fix_request])
        attempts = 2
        problems = _problems(result, check)
        token_usage = _token_usage(result) or token_usage
        if problems:
            all_problems.extend(problems)
            raise GenerationError(schema.__name__, problems)

    latency_ms = int((time.monotonic() - started) * 1000)
    meta = GenerationMeta(
        attempts=attempts,
        validation_problems=all_problems,
        model=model_name,
        latency_ms=latency_ms,
        token_usage=token_usage,
    )
    return result["parsed"], meta


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