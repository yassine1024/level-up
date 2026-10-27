import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app import character, placement, practice, slides, speech, writing
from app.llm import MODEL_FAILURES

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
    app.add_exception_handler(failure, model_failure)


class AgentRequest(BaseModel):
    task: str = Field(min_length=1)
    input: str = Field(min_length=1)


class AgentResponse(BaseModel):
    status: str
    result: str


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
