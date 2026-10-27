from fastapi.testclient import TestClient

from app.main import app


def test_health():
    assert TestClient(app).get("/api/health").json() == {"status": "UP", "service": "agents"}


def test_agents_answer_503_without_an_api_key(monkeypatch):
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    response = TestClient(app).post(
        "/api/agents/slides/generate",
        json={"lesson": {"title": "Food", "level": "A1"}, "vocabularyText": "rice, bread"},
    )

    assert response.status_code == 503
