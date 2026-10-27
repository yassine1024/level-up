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

## 4. Phase 3 — Placement (DONE)

- [x] `PlacementService.submitAttempt` → call `POST /api/agents/placement/evaluate`
  - send: question bank (with `level`+`focus`), student answers, unit titles per level
  - store: `level` + `summary` (JSON)
  - fallback: keep current scoring bands
- [x] Frontend: verify `placement.tsx` consumes `level`/`summary`

**Endpoint:** `POST /api/agents/placement/evaluate`  
**Acceptance:** a student taking the test gets a CEFR level A1–C1 + localized summary; fallback works with no key.

**Update (2026-10-27):** Placement submissions now send the complete question
metadata, answers, and unit titles to the agents service. The validated agent level
and localized summary are persisted on the attempt and returned to the frontend.
Unavailable or invalid agent responses use the existing code-based placement level
and a fixed localized fallback summary. The placement screen renders the selected
summary language.

---

## 5. Phase 4 — Course slides (DONE)

- [x] `LessonStudyService.buildSlidesJson` → call `POST /api/agents/slides/generate`
  - send: lesson title + level, extracted text (Vocabulary/Grammar/Pronunciation), language
  - store: `{"slides":[...]}` in same column, keyed by `contentVersion` + language
  - fallback: keep chunking
- [x] Validate agent output (every material ≥1 slide, mini-exercise answer ∈ options, short bullets) else fall back
- [ ] (Optional) Teacher preview of generated slides on saved-resources screen

**Endpoint:** `POST /api/agents/slides/generate`  
**Acceptance:** slides reflect uploaded content; re-uploading a file regenerates (via contentVersion); fallback on 502.

**Update (2026-10-27):** Slide cache misses now send lesson/unit CEFR context,
vocabulary, grammar, pronunciation, language, and the current content version's
resources to the agents service. Backend validation requires a bounded deck,
short bullets, valid mini-exercise answers, and one slide for every supplied
material type. Any unavailable or invalid response falls back to the existing
chunked slide generator; generated decks remain cached by content version and
language.

---

## 6. Phase 5 — Practice questions

- [x] `GeneratedContentService.buildExercises` → call `POST /api/agents/practice/questions`
  - send: lesson CEFR/unit context, vocabulary, grammar, Listening 1 transcript,
    Writing description, recent mistakes, and `excludePrompts`
  - request a pool of 15 items; cache by `contentVersion` + `gameType`
- [x] Validate the agent response before caching: matching game type, 10–15 items,
  sequential indexes, valid options, answer presence, localized explanation, and
  fill-in-the-blank prompt shape
- [x] Fall back to a deterministic 15-item local pool when the agents service is
  unavailable or returns invalid content
- [x] Never send `correctAnswer`/`acceptedAnswers`/`explanation` to app before
  answering — session responses expose only `index`, `prompt`, `options`, and
  `audioText`
- [x] Practice sessions sample 3 questions from the cached pool and retain the
  answer-bearing JSON server-side
- [x] Frontend practice response shape supports structured `audioText` items

**Endpoint:** `POST /api/agents/practice/questions`  
**Acceptance:** a lesson yields a pool of 10–15 items per game; sessions sample 3–15 from it.

**Update (2026-10-27):** Practice generation now sends lesson resources and
student mistake history to the agents service, with excluded prompts to avoid
repetition. Validated pools are cached per lesson content version and game type;
invalid or unavailable agent responses use the local fallback pool. Practice
sessions sample three items and keep answer keys, accepted answers, explanations,
and focus metadata on the backend. Backend tests and all 62 agents tests pass.

---

## 7. Phase 6 — Answer checking (typed + spoken)

- [x] `PracticeSessionService.submitAnswer` → call `POST /api/agents/practice/check-answer`
  - normalize both sides first (case, punctuation, curly quotes, contractions)
  - compare accepted answers locally before calling the agents service
  - Gemini judges only when answers still differ
  - read `explanation.en` and retain the existing explanation fallback
- [x] Support typed and spoken submissions through the `spoken` request flag
- [x] Save agent or question `focus` with each `StudentMistake`
- [x] Frontend API and hook forward the spoken flag and expose correction/explanation

**Endpoint:** `POST /api/agents/practice/check-answer`  
**Acceptance:** typed/spoken answers graded correctly; mistakes carry `focus`.

**Update (2026-10-27):** Practice answers now normalize case, punctuation,
curly quotes, and common contractions before grading. Exact and accepted answers
are handled without a model call; remaining mismatches are sent to the agents
service with CEFR level and spoken context. Agent corrections, English
explanations, and focus metadata are validated and persisted, with deterministic
fallback grading when the service is unavailable. Backend tests, agents tests,
and frontend lint pass.

---

## 8. Phase 7 — Writing feedback

- [x] `LessonStudyService.submitWriting` (`generateWritingFeedback`) → call `POST /api/agents/writing/feedback`
  - send: student text, lesson CEFR/unit context, writing description, vocabulary
  - store the validated agent JSON; save each mistake (`sentence`, `wrong`,
    `right`, `category`, `explanation`, `focus`) with `source=WRITING`
- [x] Validate headline, localized comment, corrected text, mistake source spans,
  replacements, categories, explanations, and focus before accepting feedback
- [x] Fall back to the existing deterministic writing response when the agents
  service is unavailable or returns invalid feedback
- [x] Frontend response shape exposes headline, comment, corrected text, and
  per-mistake corrections with focus

**Endpoint:** `POST /api/agents/writing/feedback`  
**Acceptance:** frame-25 content (corrections + mistakes) populated from agent; mistakes saved.

**Update (2026-10-27):** Writing submissions now send the lesson context,
writing task, student text, and vocabulary to the agents service. Validated
feedback is stored as JSON and returned with structured corrections; every
writing mistake is persisted with `source=WRITING` and its learning focus.
Unavailable or invalid agent responses use the deterministic fallback. Backend
tests and frontend lint pass.

---

## 9. Phase 8 — Character chat

- [x] New backend endpoints:
  - `POST /api/student/lessons/{id}/character/episodes`
  - `POST /api/student/character/episodes/{id}/messages`
- [x] Store episode + messages; send the last 20 messages plus episode JSON each turn
- [x] Support `spoken: true` and pass the transcript context to the character agent
- [x] Frontend `practice/character.tsx`: use authenticated backend endpoints instead
  of `/api/agents/stream`; render emotion, correction, and reply suggestions
- [x] Save character corrections as `StudentMistake` records with `source=CHAT`
- [x] Fall back to a safe deterministic episode/reply when the agents service is unavailable

**Endpoints:** `POST /api/agents/character/episode`, `POST /api/agents/character/reply`  
**Acceptance:** role-play chat works in text; character keeps personality across turns.

**Update (2026-10-27):** Character episodes and messages are now owned by the
backend. Episode creation sends lesson resources and student choices to the
agents service; replies send the persisted episode and bounded conversation
history, validate the response, persist both sides, and save corrections as
chat mistakes. The frontend no longer forwards arbitrary prompts to the agents
stream. Backend tests, agents tests, and frontend lint pass.

---

## 10. Phase 9 — Speech-to-text

- [x] New `POST /api/student/speech/transcribe` (multipart, ≤10MB) → forward to `POST /api/agents/speech/transcribe`
- [x] Frontend: record → transcribe → send transcript to character reply with `spoken: true`

**Endpoint:** `POST /api/agents/speech/transcribe`  
**Acceptance:** `.m4a` recordings transcribed verbatim (mistakes preserved).

**Update (2026-10-27):** Authenticated students can upload supported recordings
up to 10 MB through the backend speech endpoint. The backend validates the
recording before forwarding multipart audio to the agents service. Character
chat now records audio, transcribes it, and submits the verbatim transcript as
a spoken message.

---

## 11. Phase 10 — Security cleanup (part 2)

- [x] Retire or admin-gate `/api/agents/stream` once character endpoints exist
- [x] Lock down global `permitAll` for production (protect agent-forwarding routes)
- [x] Keep agents port unpublished (infra)

**Acceptance:** no unauthenticated path forwards arbitrary prompts to Gemini.

**Update (2026-10-27):** The legacy arbitrary-prompt stream and its test page
were removed. Spring Security now authenticates bearer JWTs for all application
routes except login, registration, health, and preflight requests. The agents
service remains reachable only by the internal Compose network.

---

## 12. Phase 11 — Teacher-facing AI (later)

- [ ] **Teacher copilot:** from topic + level draft vocab/grammar/listening/writing/role-play; pre-fill Course resources form; warn if uploaded file above lesson level
- [ ] **Teacher insights:** group `StudentMistake` by `focus`; suggest reteach
- [ ] **Content checker:** second pass over generated decks/pools before caching; flag to teacher

---

## 13. Phase 12 — Validation

- [x] Run `python scripts/live_smoke.py` against `scripts/sample-lesson` — inspect real output
- [ ] Integration tests for each wired service (fallback on 502)
- [ ] End-to-end: teacher uploads → student sees new slides/questions
- [x] Update `docs/agents-api-contract.md` if any request/response fields change

**Validation (2026-10-27):** The live smoke test completed all 19 real-model
calls successfully: placement, slides, every practice game, repeated-mistake
review, answer checking, writing feedback, character episode/replies, and the
spoken-mistake character path. Backend tests, all 62 agents tests, frontend
lint, and Compose configuration validation also pass. The API contract already
contains the `writingDescription` practice request field. Dedicated backend
HTTP fallback tests and teacher-upload-to-student end-to-end tests still need
an integration-test harness.

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
