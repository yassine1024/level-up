# Backend ↔ Agents Linking Plan

> Goal: connect the Spring Boot backend to the Python agents service so teacher-uploaded
> resources drive AI-generated content (slides, exercises, writing feedback, placement,
> character chat, speech transcription) and results are cached per lesson version.
>
> Branch: `feature/backend-agent-linking` (off `develop`).  
> Agents service: FastAPI on `http://localhost:8000`, internal-only, stateless.  
> Rule: the Expo app never calls agents directly — only the backend does.

---

## 0. Architecture recap

```
Expo app  --REST+JWT-->  Spring Boot backend  --JSON/HTTP (internal)-->  Agents (FastAPI)  -->  Gemini
                              |                                                   |
                              +-- DB (single owner of all data) -------------------+
```

- Agents are **stateless**: every request carries its context; backend stores results.
- Code decides anything with one right answer; the LLM only fills a Pydantic schema.
- Every agent output is validated; on failure the endpoint returns `502` and the backend
  keeps its current fallback content.
- Generated content is cached by `Lesson.contentVersion`.
- Answer keys (`correctAnswer`, `acceptedAnswers`, `explanation`) never reach the app
  before the student answers.

---

## 1. Phase 0 — Setup (DONE)

- [x] Python 3.12 venv in `agents/.venv`
- [x] `requirements-dev.txt` installed
- [x] `pytest` green (62 tests)
- [x] Personal Gemini key in root `.env` (verified working)
- [x] `uvicorn app.main:app --port 8000` boots; `/api/health` returns UP
- [x] Feature branch `feature/backend-agent-linking` created off latest `develop`

---

## 2. Phase 1 — Fix blockers + AgentsClient (DONE)

**Goal:** remove the caching bug and give the backend a typed way to call agents.

### 2.1 Fix content-version bug (CRITICAL)
- [x] `LessonResourceService.saveFile` → call `lesson.incrementContentVersion()` before save
- [x] `LessonResourceService.saveAudioFile` → same
- [x] `LessonResourceService.saveDescription` → same
- **Why:** without this, replaced files never invalidate cached slides/questions.

### 2.2 Placement schema (DB + seed)
- [x] `PlacementQuestion` entity: add `level`, `skill`, `focus` columns + constructor
- [x] `PlacementQuestionDataInitializer`: replace 15 generic questions with the 15 from
      `docs/placement-test-bank.json` (A1–C1, 3 per level)
- **Why:** current bank can't place above B1; product promises A1–C1.

### 2.3 Typed `AgentsClient`
- [x] Replace bare `WebClient` bean with typed methods for all endpoints
- [x] 45s response timeout
- [x] On 502/503 → return sentinel so callers fall back to local content (never block student)
- [x] Keep `AGENTS_BASE_URL` (default `http://localhost:8000`)

### 2.4 Agents-side minor
- [x] `agents/app/main.py` stream: remove `temperature=0` (use Gemini 3 default)

### 2.5 Security (part 1)
- [x] Gate or remove `/api/agents/stream` (forwards arbitrary prompts to Gemini — quota abuse)

**Acceptance:** resource upload bumps `contentVersion`; agents client compiles and can call `/api/health`.

**Update (2026-10-27):** Phase 1 is complete. Resource and description changes now
invalidate generated-content caches; placement data covers A1–C1 with skill and focus
metadata; `AgentsClient` provides typed calls with 45-second timeouts and 502/503
fallback sentinels; arbitrary agent streaming is disabled. Backend tests pass and all
62 agents tests pass.

---

## 3. Phase 2 — Database schema (DONE)

- [x] `PlacementAttempt`: add `summary` (JSON `{en,fr,ar}`)
- [x] `StudentMistake`: add `focus`, `source` (`PLACEMENT`/`GAME`/`WRITING`/`CHAT`)
- [x] New `CharacterEpisode` (lesson, student, episode JSON, finished)
- [x] New `CharacterMessage` (episode, role, text, correction JSON, created-at)
- [x] Migration scripts for all of the above

**Acceptance:** app starts against migrated DB; new columns/tables present.

**Update (2026-10-27):** Phase 2 is complete. Placement summaries and mistake
metadata are persisted, character episodes/messages have entities and repositories,
and the versioned schema script is available at
`backend/src/main/resources/db/migration/V2__character_and_mistake_schema.sql`.
Existing placement and practice mistakes now record their source and focus. Backend
tests pass.

---

## 4. Phase 3 — Placement

- [ ] `PlacementService.submitAttempt` → call `POST /api/agents/placement/evaluate`
  - send: question bank (with `level`+`focus`), student answers, unit titles per level
  - store: `level` + `summary` (JSON)
  - fallback: keep current scoring bands
- [ ] Frontend: verify `placement.tsx` consumes `level`/`summary`

**Endpoint:** `POST /api/agents/placement/evaluate`  
**Acceptance:** a student taking the test gets a CEFR level A1–C1 + localized summary; fallback works with no key.

---

## 5. Phase 4 — Course slides

- [ ] `LessonStudyService.buildSlidesJson` → call `POST /api/agents/slides/generate`
  - send: lesson title + level, extracted text (Vocabulary/Grammar/Pronunciation), language
  - store: `{"slides":[...]}` in same column, keyed by `contentVersion` + language
  - fallback: keep chunking
- [ ] Validate agent output (every material ≥1 slide, mini-exercise answer ∈ options, short bullets) else fall back
- [ ] (Optional) Teacher preview of generated slides on saved-resources screen

**Endpoint:** `POST /api/agents/slides/generate`  
**Acceptance:** slides reflect uploaded content; re-uploading a file regenerates (via contentVersion); fallback on 502.

---

## 6. Phase 5 — Practice questions

- [ ] `GeneratedContentService.buildExercises` → call `POST /api/agents/practice/questions`
  - send: lesson text, Listening 1 transcript, Writing description, recent mistakes
  - request `count` 10–15; support `excludePrompts`
  - cache by `contentVersion` + `gameType`
- [ ] Never send `correctAnswer`/`acceptedAnswers`/`explanation` to app before answering — only `index`, `prompt`, `options`, `audioText`
- [ ] Frontend practice screens consume structured items (already partially wired)

**Endpoint:** `POST /api/agents/practice/questions`  
**Acceptance:** a lesson yields a pool of 10–15 items per game; sessions sample 3–15 from it.

---

## 7. Phase 6 — Answer checking (typed + spoken)

- [ ] `PracticeSessionService.submitAnswer` → call `POST /api/agents/practice/check-answer`
  - normalize both sides first (case, punctuation, curly quotes, contractions)
  - Gemini judges only when they still differ
  - read `explanation.en` (or student language)
- [ ] Save `focus` with each `StudentMistake`
- [ ] Frontend: show correction/explanation in student language

**Endpoint:** `POST /api/agents/practice/check-answer`  
**Acceptance:** typed/spoken answers graded correctly; mistakes carry `focus`.

---

## 8. Phase 7 — Writing feedback

- [ ] `LessonStudyService.submitWriting` (`buildWritingFeedback`) → call `POST /api/agents/writing/feedback`
  - send: student text, lesson text, writing description
  - store JSON; save each mistake (`sentence`, `wrong`, `right`, `category`, `explanation`, `focus`) with `source=WRITING`
- [ ] Frontend: render headline, comment, corrected text, per-mistake diff (already enriched)

**Endpoint:** `POST /api/agents/writing/feedback`  
**Acceptance:** frame-25 content (corrections + mistakes) populated from agent; mistakes saved.

---

## 9. Phase 8 — Character chat

- [ ] New backend endpoints:
  - `POST /api/student/lessons/{id}/character/episodes`
  - `POST /api/student/character/episodes/{id}/messages`
- [ ] Store episode + messages; send last ~20 messages + episode JSON each turn
- [ ] `spoken: true` path: ignore punctuation/capitals
- [ ] Frontend `practice/character.tsx`: switch from open `/api/agents/stream` to new endpoints; render `emotion`, correction, reply modes

**Endpoints:** `POST /api/agents/character/episode`, `POST /api/agents/character/reply`  
**Acceptance:** role-play chat works in text; character keeps personality across turns.

---

## 10. Phase 9 — Speech-to-text

- [ ] New `POST /api/student/speech/transcribe` (multipart, ≤10MB) → forward to `POST /api/agents/speech/transcribe`
- [ ] Frontend: record → transcribe → send transcript to character reply with `spoken: true`

**Endpoint:** `POST /api/agents/speech/transcribe`  
**Acceptance:** `.m4a` recordings transcribed verbatim (mistakes preserved).

---

## 11. Phase 10 — Security cleanup (part 2)

- [ ] Retire or admin-gate `/api/agents/stream` once character endpoints exist
- [ ] Lock down global `permitAll` for production (protect agent-forwarding routes)
- [ ] Keep agents port unpublished (infra)

**Acceptance:** no unauthenticated path forwards arbitrary prompts to Gemini.

---

## 12. Phase 11 — Teacher-facing AI (later)

- [ ] **Teacher copilot:** from topic + level draft vocab/grammar/listening/writing/role-play; pre-fill Course resources form; warn if uploaded file above lesson level
- [ ] **Teacher insights:** group `StudentMistake` by `focus`; suggest reteach
- [ ] **Content checker:** second pass over generated decks/pools before caching; flag to teacher

---

## 13. Phase 12 — Validation

- [ ] Run `python scripts/live_smoke.py` against `scripts/sample-lesson` — inspect real output
- [ ] Integration tests for each wired service (fallback on 502)
- [ ] End-to-end: teacher uploads → student sees new slides/questions
- [ ] Update `docs/agents-api-contract.md` if any request/response fields change

---

## 14. Order of attack

```
Phase 1 (blockers + client)  →  Phase 2 (schema)
  → Phase 3 (placement)  →  Phase 4 (slides)  →  Phase 5 (practice questions)
  → Phase 6 (check-answer)  →  Phase 7 (writing)  →  Phase 8 (character)
  → Phase 9 (speech)  →  Phase 10 (security)  →  Phase 11 (teacher AI)  →  Phase 12 (validation)
```

Each phase is independently testable and ends with a fallback path so students are never blocked by the model.

---

## 15. References

- `docs/agents-architecture.md` — design, rules, backend integration table
- `docs/agents-api-contract.md` — exact request/response JSON
- `docs/placement-test-bank.json` — replacement seed (A1–C1)
- `agents/README.md` — run/test instructions
- `CONTRIBUTING.md` — git workflow, branch naming, no secrets
- `backend/src/main/java/com/levelup/backend/agent/AgentStreamingController.java`
- `backend/src/main/java/com/levelup/backend/resource/service/LessonResourceService.java`
- `backend/src/main/java/com/levelup/backend/student/service/LessonStudyService.java`
- `backend/src/main/java/com/levelup/backend/student/service/GeneratedContentService.java`
- `backend/src/main/java/com/levelup/backend/student/service/PracticeSessionService.java`
