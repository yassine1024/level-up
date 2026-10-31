# Level Up — Project Overview

## Goal

Level Up is a mobile-first learning platform where **students** (ages 10–16) learn
through AI-generated, adaptive courses. A student takes a **placement test** that
assigns a level; the platform then generates **slide decks**, **practice
exercises** (fill-in-the-blank, multiple choice, letter scramble, typed
answers), **writing tasks**, and **speech** exercises. A **teacher** role (admin)
uploads source material (PDFs/docs) that an LLM extracts text from and turns into
lesson content. An **AI character** acts as a friendly tutor, answering student
questions and giving corrections. The app supports **English / French / Arabic**
with instant language switching.

## Architecture

```text
Expo app (iOS/Android/web)
   │ REST + JWT
   ▼
Spring Boot backend  ──► Database (H2 dev / Postgres prod)
   │ JSON over HTTP (internal network only)
   ▼
Agents service (FastAPI + LangChain) ──► Gemini (gemini-3.5-flash-lite)
```

- The app never calls the agents service directly.
- The backend owns all data (users, lessons, placement attempts, mistakes, chat
  history, generated content cached per `Lesson.contentVersion`).
- The agents service is **stateless**: each request carries its own context; the
  backend stores the JSON responses.

## Stack

### Frontend — `frontend/`
- Expo SDK 58 / React Native 0.88, Expo Router (file-based routing)
- React 19, TypeScript
- State: Zustand, TanStack React Query
- HTTP: Axios; fonts Fredoka/Nunito
- Lint: `expo lint`, typecheck `tsc --noEmit`

### Backend — `backend/`
- Java + Spring Boot (Gradle), REST API
- JWT auth, H2 (dev) / Postgres (prod)
- Communicates with agents service via `AGENTS_BASE_URL`
- Caches generated content per lesson content version

### Agents — `agents/`
- Python, FastAPI, LangChain, Pydantic
- Gemini 3.5 Flash Lite, 30s timeout, 2 retries, structured output
- Modules: placement, slides, practice, writing, character, speech, text
- Stateless, internal-only, returns 502 on model failure (backend keeps fallback)

### Infra — `infra/`
- Docker Compose (`level-up-dev`): backend + agents services

## Agents (AI capabilities)

1. **Placement** — scores deterministic answers, assigns level.
2. **Slides** — generates lesson slide decks with EN/FR/AR hints.
3. **Practice** — fill-in-the-blank, MCQ, letter scramble, typed answers.
4. **Writing** — writing tasks with corrections.
5. **Character** — tutor chat with corrections; ignores instructions in student text.
6. **Speech** — audio text for listening exercises.
7. **Text** — extracts text from teacher-uploaded files (Tika).

Rules: code decides anything with one right answer; LLM fills a schema; every
output is validated; answer keys stay server-side; EN/FR/AR outputs; untrusted
text treated as data.

## Roles

- **Student**: placement, courses, practice, writing, speech, chat with tutor.
- **Teacher (admin)**: upload source material, manage content.

## Development

```bash
# agents
cd agents && uvicorn app.main:app --reload

# backend
cd backend && ./gradlew bootRun

# frontend
cd frontend && npx expo start
```

Shared dev env: `docker compose -f infra/compose.yaml up`.

## Documentation

See `docs/` for API contracts (`api-contract.md`, `teacher-api-contract.md`,
`agents-api-contract.md`), architecture, and Figma screen status.

## Status

Frontend UI overhaul in progress (`feature/figma-ui-overhaul`): profile pages,
change password, language selector, delete account flow. Backend and agents
services functional; integration via Docker Compose.

Planned: a web admin panel (`admin/`, Next.js) for observing the AI pipeline
(generation runs, rejections, fallbacks), teachers, students, uploads, and
content review. See `docs/admin_panel_plan.md`.
