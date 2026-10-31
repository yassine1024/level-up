import logging
import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field

from app import character, placement, practice, slides, speech, writing
from app.llm import MODEL_FAILURES, GenerationError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Level Up Agents API",
    version="0.3.0",
)

app.include_router(placement.router)
app.include_router(slides.router)
app.include_router(practice.router)
app.include_router(writing.router)
app.include_router(character.router)
app.include_router(speech.router)


async def model_failure(request: Request, error: Exception) -> JSONResponse:
    # 502 tells the backend to use its own fallback content.
    logger.warning("Model call failed for %s: %s", request.url.path, error)
    return JSONResponse(status_code=502, content={"detail": str(error)})


for failure in MODEL_FAILURES:
    if failure is GenerationError:
        continue
    app.add_exception_handler(failure, model_failure)


async def validation_failure(request: Request, error: GenerationError) -> JSONResponse:
    logger.warning("Validation failed for %s: %s", request.url.path, error.problems)
    return JSONResponse(
        status_code=422,
        content={"detail": str(error), "validationProblems": error.problems},
    )


app.add_exception_handler(GenerationError, validation_failure)


class AgentRequest(BaseModel):
    task: str = Field(min_length=1)
    input: str = Field(min_length=1)


class AgentResponse(BaseModel):
    status: str
    result: str


class AgentStreamRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=8000)


@app.get("/api/health")
def health():
    return {
        "status": "UP",
        "service": "agents",
    }


@app.post("/api/agents/execute", response_model=AgentResponse)
def execute_agent(request: AgentRequest):
    # Temporary mock endpoint. We can replace it with
    # actual agent execution when needed.
    return AgentResponse(
        status="completed",
        result=f"Demo agent received task '{request.task}'.",
    )


@app.post("/api/agents/stream")
async def stream_agent(request: AgentStreamRequest):
    if not (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
    ):
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is not configured.",
        )

    model_name = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.5-flash-lite",
    )

    model = init_chat_model(
        model=f"google_genai:{model_name}",
    )

    async def generate():
        try:
            async for chunk in model.astream(request.prompt):
                text = chunk.text

                if text:
                    yield text

        except Exception:
            logger.exception("Gemini streaming failed")
            yield "\n\n[Agent stream failed. Check the service logs.]\n"

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )