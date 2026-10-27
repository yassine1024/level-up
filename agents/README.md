# AI Agents Service

Python service with the app's AI agents. The Spring Boot backend calls it; the app
never does.

| Agent | Module | Endpoints |
|---|---|---|
| 1 Placement test | `app/placement.py` | `POST /api/agents/placement/evaluate` |
| 2 Course slides | `app/slides.py` | `POST /api/agents/slides/generate` |
| 3 Practice | `app/practice.py`, `app/writing.py` | `POST /api/agents/practice/questions`, `POST /api/agents/practice/check-answer`, `POST /api/agents/writing/feedback` |
| 4 Character chat | `app/character.py` | `POST /api/agents/character/episode`, `POST /api/agents/character/reply` |
| Speech-to-text tool | `app/speech.py` | `POST /api/agents/speech/transcribe` |

`app/llm.py` holds the Gemini client and `generate()`, which asks for structured
output and sends the problems back once when the answer fails its checks.

- Design and build plan: [`docs/agents-architecture.md`](../docs/agents-architecture.md)
- Request and response JSON: [`docs/agents-api-contract.md`](../docs/agents-api-contract.md)

## Technology

- Python 3.12, FastAPI
- LangChain with Gemini (`langchain-google-genai`)

## Configuration

| Variable | Default | Notes |
|---|---|---|
| `GOOGLE_API_KEY` or `GEMINI_API_KEY` | none | Without it the agent endpoints answer `503` and the backend uses its fallback content |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | |

Each developer uses their own key. Create one at
[Google AI Studio](https://aistudio.google.com/apikey) with a personal Google account
(school accounts may have AI Studio turned off), copy `.env.example` to `.env` at the
repository root and paste the key there. `.env` is git-ignored. On the free tier Google
may use the requests to improve its products, so real student data needs a paid key.

## Run locally

```bash
cd agents
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

The interactive API docs are at `http://localhost:8000/docs`. With Docker, run
`docker compose -f infra/compose.yaml up --build` from the repository root; it reads
the API key from the root `.env`.

## Tests

```bash
pytest
```

The tests replace Gemini with a fake model (`tests/conftest.py`), so they need no
API key and no network.

To check the agents against the real model, run every endpoint once on a lesson and
read the saved responses:

```bash
python scripts/live_smoke.py
python scripts/live_smoke.py --lesson-dir path/to/lesson --title "Daily Routines" --audio answer.m4a
```

A lesson folder has one text file per upload slot of the lesson form
(`vocabulary.txt`, `grammar.txt`, `pronunciation.txt`, `listening.txt`, `writing.txt`,
`other.txt`); `scripts/sample-lesson` is an example.

## Adding a game

Add the type to `GameType` and its rules to `GAME_RULES` in `app/practice.py`.
Checks the model must pass go in `item_problems`; anything code can set itself
(shuffled options, fixed options, text read aloud) goes in `to_practice_item`.
