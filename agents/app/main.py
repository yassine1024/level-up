from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="Level Up Agents API",
    version="0.1.0",
)


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
    # Temporary mock response.
    # Replace this logic with a real LangChain workflow later.
    return AgentResponse(
        status="completed",
        result=f"Demo agent received task '{request.task}'.",
    )