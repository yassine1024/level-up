# Level Up — Admin Panel: Full Plan (Phase 0 to Delivery)

> Goal: give admins full visibility into teachers, students, uploads, and the AI agents pipeline, including what the AI accepted, retried, refused, or replaced with fallback content.
>
> Based on a read of the `develop` branch of `yassine1024/level-up` (backend entities, `AgentsClient`, agents README, API contracts). Items marked **VERIFY** were not confirmed in code and must be checked first.

---

## 1. Project presentation

**One-liner:** a web admin console that makes the Level Up AI pipeline observable: from teacher upload, to text extraction, to AI generation, to validation, to what students actually see.

**Problem it solves**
- The agents service is stateless and the backend only keeps successful results.
- When the AI refuses or fails, the backend logs a warning and silently uses fallback content. Nobody can see it happened.
- There is no way to check that questions really come from the teacher's course.
- There are no teacher or student overview screens.

**Users:** platform admins (role `ADMIN`). Not teachers, not students.

**Stack**

| Layer | Choice | Why |
|---|---|---|
| Admin UI | Next.js (App Router), TypeScript | Desktop-first web app, familiar stack |
| UI kit | Tailwind CSS + shadcn/ui | Fast tables, dialogs, forms |
| Data fetching | TanStack Query + Axios | Same libraries as the mobile app |
| Charts | Recharts | Dashboard and rejection stats |
| Backend | Existing Spring Boot (Gradle), new `/api/admin/**` | Reuse auth, DB, roles |
| Auth | Existing JWT, role `ADMIN` | No second login system |
| DB | Existing H2 (dev) / Postgres (prod) | New tables via the current migration approach (**VERIFY**: Flyway/Liquibase or `ddl-auto`) |
| Agents | Existing FastAPI + LangChain | Return validation details to the backend |
| Infra | Docker Compose (`infra/compose.yaml`) | Add an `admin` service |

---

## 2. Target architecture

```text
Admin web app (admin/)
   │ REST + JWT (role ADMIN)
   ▼
Spring Boot backend ── /api/admin/** ──► Database
   │                                      ├─ existing tables
   │                                      ├─ generation_runs   (new)
   │                                      └─ audit_log         (new)
   ▼
Agents service (FastAPI + LangChain) ──► Gemini
```

Rules that stay unchanged:
- The admin app never calls the agents service directly.
- The agents service stays stateless. It returns validation details; the backend stores them.
- Existing mobile endpoints and fields are not renamed or removed.

---

## 3. Gap analysis (what exists vs. what is missing)

| You want to see | Exists today | Gap |
|---|---|---|
| Teachers and students | `users` with `username`, `role` (`STUDENT`, `TEACHER`, `ADMIN`) | No `createdAt`, `lastLoginAt` |
| What teachers uploaded | `lesson_resources`: file name, type, size, `extracted_text`, description, timestamps | No `uploaded_by`; one row per lesson+type, so re-uploads overwrite history |
| What the AI generated | `generated_exercise_sets`, `generated_slide_decks` (successes only) | No status, no link to the input, no review state |
| What the AI refused or failed | Nothing. `AgentsClient` returns `Optional.empty()` on 502/503 and only logs | Needs a persisted run log |
| Retries and validation problems | Handled inside the agents `generate()` | Not returned to the backend |
| What students did | Placement attempts/answers, practice sessions/answers, mistakes, writing submissions, lesson progress, character episodes/messages | Needs read endpoints for admins |

---

## 4. Phases

Size guide: **S** = under a day, **M** = 1–3 days, **L** = 3+ days.

### Phase 0 — Alignment and preparation (S)

Do this before writing any code. Several folders belong to other developers.

1. Share this plan with the team and get agreement on:
   - A new top-level `admin/` component (owner: you).
   - Backend changes (new tables, endpoints, `AgentsClient` wrapper).
   - Agents changes (returning validation details).
2. Update `CONTRIBUTING.md`: add `admin/` to the folder table (owner: you), and add the branch pattern `feature/admin-<description>`.
3. Confirm with the backend owner and agents owner who will implement their parts, or that you may.
4. Pull the latest `develop` and create branches (all from `develop`, all PRs back to `develop`):
   - `feature/backend-generation-runs`
   - `feature/backend-admin-api`
   - `feature/agent-validation-details`
   - `feature/admin-scaffold` (then more `feature/admin-*` branches per screen group)
5. **VERIFY** in the backend code (not read yet):
   - Spring Security rules and how the JWT filter maps roles.
   - Whether CORS is configured, and for which origins.
   - How schema changes are applied (migration tool vs. auto DDL).
   - How the existing `ADMIN` role is created or seeded.
   - The controllers under `student/controller`, `auth/controller`, `catalog`.
6. Decide the retention policy for stored inputs and outputs (see Phase 9).

**Exit criteria:** team agreement, `CONTRIBUTING.md` updated, branches created, VERIFY list answered.

---

### Phase 1 — Create and scaffold the `admin/` folder (M)

1. Create the `admin/` folder at the repository root, next to `frontend/`, `backend/`, `agents/`.
2. Scaffold a Next.js app with TypeScript inside it. Add Tailwind CSS, shadcn/ui, TanStack Query, Axios, Recharts.
3. Suggested structure:

```text
admin/
├── README.md
├── .env.example
├── Dockerfile
├── src/
│   ├── app/                 # routes (login, dashboard, teachers, students, ...)
│   ├── components/          # tables, filters, charts, layout
│   ├── lib/                 # api client, auth, formatters
│   ├── hooks/               # query hooks per resource
│   └── types/               # types mirroring the admin API contract
└── tests/
```

4. Configuration:
   - API base URL comes from an environment variable. Nothing hardcoded.
   - Commit `.env.example`. Never commit `.env`.
5. Build the shell: login page, authenticated layout (sidebar, header), route guard that only lets `ADMIN` through, and an API client that attaches the JWT and handles 401 and 403.
6. Add lint and typecheck scripts, a README with run instructions, and a CI job in `.github` (coordinate with the team).

**Exit criteria:** `admin/` runs locally, login screen works against the mock or the real backend, lint and typecheck pass.

---

### Phase 2 — Backend foundation for admin access (M)

Branch: `feature/backend-admin-api`

1. **Security:** require `ADMIN` for every `/api/admin/**` route. Keep existing mobile routes untouched.
2. **CORS:** allow the admin origin (dev and prod) on `/api/admin/**` and the auth endpoints.
3. **Admin account:** a documented way to create the first admin (seed for dev, manual or env-driven for prod). Never a hardcoded password in production config.
4. **User fields:** add `createdAt` and `lastLoginAt` (nullable, so the mobile app keeps working). Update `lastLoginAt` on successful login.
5. **Conventions** for all admin endpoints:
   - Pagination (page, size), sorting, and filter parameters.
   - A consistent error body.
   - Admin DTOs separate from mobile DTOs (never expose password hashes or answer keys carelessly).
6. Write the admin API contract in `docs/admin-api-contract.md` (see Phase 6) before implementing.

**Exit criteria:** an admin token reaches `/api/admin/health`; student and teacher tokens get 403.

---

### Phase 3 — Generation log (the core feature) (L)

Branch: `feature/backend-generation-runs`

#### 3.1 New table: `generation_runs`

| Field | Purpose |
|---|---|
| `id` | Primary key |
| `agent` | placement, slides, practice, writing, character, speech |
| `endpoint` | The agents endpoint called |
| `lesson_id`, `content_version` | Tie the run to a lesson version (nullable for placement/chat) |
| `game_type` | For practice runs |
| `triggered_by_user_id`, `triggered_by_role` | Student request, teacher upload, or admin regenerate |
| `input_hash` | Hash of the request payload |
| `input_ref` | Reference to the source `lesson_resources` rows, instead of copying the text |
| `status` | See 3.2 |
| `attempts` | Number of model attempts (from agents) |
| `validation_problems` | JSON list returned by the agents (what failed, which item) |
| `output_json` | Raw agent response (nullable when it failed) |
| `error_code`, `error_message` | HTTP status (502/503/timeout) and a short message |
| `model` | e.g. the Gemini model name |
| `latency_ms` | Duration of the call |
| `token_usage` | If the agents return it (**VERIFY** availability) |
| `fallback_used` | True when the backend served fallback content |
| `created_at` | Timestamp |

#### 3.2 Status values

| Status | Meaning |
|---|---|
| `ACCEPTED` | Passed validation on the first attempt |
| `ACCEPTED_AFTER_RETRY` | Failed validation once, passed after the retry |
| `REJECTED_VALIDATION` | Failed validation after retries; nothing usable |
| `FALLBACK_USED` | Agents unavailable or model failure (502/503/timeout); backend used fallback |
| `ERROR` | Any other unexpected failure |

#### 3.3 Hook point

`AgentsClient` is the single boundary for every agents call, and it currently drops failures after a log line. Wrap each call there so every call writes one `generation_runs` row. This is a small change relative to the value it gives.

Implementation notes:
- Write the run record in a way that a logging failure never breaks the student or teacher request.
- Pass context (lesson id, content version, user) into the wrapper so rows are linkable.
- Do not store full source text in every run; reference `lesson_resources` and the content version.

#### 3.4 Linking generated content

Add a nullable reference from `generated_exercise_sets` and `generated_slide_decks` to the `generation_runs` row that produced them, so the admin can jump from a question set to its run and to its source text.

**Exit criteria:** after a teacher upload and a student practice request, `generation_runs` contains accurate rows for success, retry, and forced failure (stop the agents service or remove the API key to test the 503 path).

---

### Phase 4 — Agents service changes (M)

Branch: `feature/agent-validation-details`

1. Extend the response of each generating endpoint with metadata: attempts used, the validation problems found at each attempt (including which item), model name, latency, and token usage if available.
2. Keep the existing response fields unchanged so nothing else breaks. Add the metadata as an extra, clearly named section.
3. On final validation failure, return the problem list in the error body, so the backend can store it even when there is no usable output.
4. Update `docs/agents-api-contract.md` to document the new fields.
5. Update the agents tests (they use a fake model, so no API key is needed) to cover: first-try success, success after retry, failure after retries.
6. The agents service stays stateless and holds no database.

**Exit criteria:** tests pass; a deliberately bad fake-model output produces a response with the validation problems.

---

### Phase 5 — Upload traceability (M)

Branch: `feature/backend-admin-api` (or its own branch)

1. Add `uploaded_by` (user id) to `lesson_resources`.
2. Upload history: today a re-upload overwrites the row. Choose one:
   - Keep a `lesson_resource_versions` history table, or
   - Write an upload event into an activity log table.
3. Extraction quality flags computed at upload time: empty text, very short text, mostly non-text characters, extraction error. Store the flag so the admin can filter "uploads the AI could not really read".
4. Make sure `contentVersion` increments consistently when resources change, since generated content is cached per version.

**Exit criteria:** for any lesson, the admin can see who uploaded each file, when, and whether extraction produced usable text.

---

### Phase 6 — Admin API (M–L)

Document in `docs/admin-api-contract.md`, then implement. All routes under `/api/admin`, `ADMIN` only, paginated.

| Method | Path | Purpose |
|---|---|---|
| GET | `/overview` | Dashboard totals and rates |
| GET | `/teachers` | List with upload and acceptance stats |
| GET | `/teachers/{id}` | Teacher detail and their uploads |
| GET | `/students` | List with level, last active, progress |
| GET | `/students/{id}` | Placement, practice, mistakes, writing, progress |
| GET | `/students/{id}/chat` | Tutor conversations |
| GET | `/lessons` | Lessons with generation status |
| GET | `/lessons/{id}/resources` | Files and extracted text |
| GET | `/lessons/{id}/pipeline` | Ordered steps with status, input ref, output, problems |
| GET | `/generation-runs` | Filter by status, agent, lesson, date |
| GET | `/generation-runs/{id}` | Full run detail |
| GET | `/rejections/summary` | Counts by reason for charts |
| GET | `/generated/{type}/{id}` | A generated set or deck |
| POST | `/generated/{type}/{id}/hide` | Hide content from students |
| POST | `/lessons/{id}/regenerate` | Re-run generation for a lesson |
| GET | `/activity` | Chronological feed |
| GET | `/audit-log` | Admin actions |
| GET | `/system/health` | Backend, agents and Gemini status, recent error counts |

Notes:
- Never return password hashes. Be careful with answer keys: admins may see them, but keep that out of any non-admin DTO.
- Aggregations should be done in the database, not in memory.

---

### Phase 7 — Admin UI screens (L)

Build in this order, one branch per group, so each step is usable.

1. **Pipeline viewer** (answers the original question)
   - Per lesson timeline: upload, extraction, slides, practice, writing, speech.
   - Each step shows status, input reference, output, validation problems, retries.
   - Side-by-side: source text on the left, generated questions on the right.
2. **Rejections and fallbacks**
   - Table filterable by reason, agent, lesson, date.
   - Chart of top rejection reasons.
   - List of lessons currently serving fallback content.
3. **Uploads and extraction**
   - File info, extracted text preview, extraction quality flags.
4. **Teachers**: list and detail (uploads, generated items, acceptance rate).
5. **Students**: list and detail (placement, exercises, mistakes, writing, chat).
6. **Dashboard**
   - Success, retry, rejection, fallback rates over time.
   - Average latency, recent failures, totals.
7. **Content review**: view, hide, regenerate.
8. **Activity feed and audit log.**
9. **System health.**

UI requirements for every table: server-side pagination, filters, loading and empty states, and error states.

---

### Phase 8 — Content review actions (M)

1. Add a visibility or review status to generated content (for example visible or hidden) so an admin can pull bad content without deleting it.
2. Regeneration: define clearly what happens to `contentVersion` and to the cache (the backend caches generated content per lesson content version). Decide whether regenerating creates a new version or replaces in place, and what happens to students mid-lesson.
3. Every hide and regenerate action writes to the audit log.

---

### Phase 9 — Security, privacy, and audit (M)

Students are aged 10–16, and the panel exposes their chat and writing.

1. `ADMIN`-only access, enforced on the backend (not just hidden in the UI).
2. Audit log table: admin id, action, target type and id, timestamp. Log views of student chat and writing as well as changes.
3. Minimize stored data: store references and hashes instead of full copies where possible; define a retention period for `generation_runs` outputs and chat views.
4. Mask or limit personal data in lists; show full detail only on the detail page.
5. The agents README warns that Gemini's free tier may use requests to improve Google's products. Real student data needs a paid key, so decide this before production.
6. No secrets in the repo; admin URLs and credentials come from environment configuration.

---

### Phase 10 — Infra and deployment (S–M)

1. Add an `admin` service to `infra/compose.yaml` (coordinate with the team, since `infra/` is shared).
2. Dockerfile for `admin/`, with the API base URL as a build or runtime variable.
3. CI in `.github`: install, lint, typecheck, test for `admin/`.
4. Production: serve the admin app over HTTPS, restrict network exposure if possible (for example an allowlist or VPN), and set the production CORS origin.

---

### Phase 11 — Testing and definition of done (M)

- **Backend:** tests for admin authorization (admin 200, teacher and student 403, anonymous 401); tests for `AgentsClient` run logging in each status; migration tests.
- **Agents:** tests for retry and rejection metadata.
- **Admin UI:** typecheck, lint, and tests for the main tables and the pipeline viewer.
- **End-to-end checks:**
  1. Teacher uploads a file with readable text, so the run is `ACCEPTED` and questions trace back to the source.
  2. Upload an empty or garbled file, so extraction is flagged and the run is rejected or fallback.
  3. Stop the agents service, so the run is `FALLBACK_USED` and the dashboard shows it.
  4. Force a validation failure, so the run is `ACCEPTED_AFTER_RETRY` or `REJECTED_VALIDATION` with problems visible.
- **Regression:** the mobile app works unchanged against the updated backend.
- Each PR includes test results, as `CONTRIBUTING.md` requires.

**Done when:** an admin can answer, from the panel alone, "did the AI read this course, what did it make from it, what did it reject, and why?"

---

## 5. Suggested delivery order

1. Phase 0 (alignment, VERIFY list)
2. Phase 3 + Phase 4 (generation log and agents metadata). This gives you data to look at.
3. Phase 2 (admin access) in parallel with Phase 1 (scaffold)
4. Phase 6 endpoints for runs, rejections, pipeline, then Phase 7 screens 1–3
5. Phase 5 (upload traceability), then Phase 7 screens 4–5
6. Dashboard, content review, audit log, system health (Phases 7–9)
7. Phase 10 and Phase 11

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Touching other developers' folders | Phase 0 agreement; small, separate PRs per folder |
| Breaking the mobile app | Only additive changes; nullable columns; no renamed fields |
| Run log slows requests or grows too large | Async or fail-safe writes; store references and hashes; retention policy |
| Exposing minors' data | Admin-only, audit log, minimal storage, paid Gemini key before real data |
| Regeneration confusing the cache | Define `contentVersion` behavior in Phase 8 before building the button |
| Agents metadata unavailable (for example token usage) | Treat as optional fields in the contract |

---

## 7. Open questions for the team

1. Who implements the backend and agents parts?
2. How are schema changes applied (migrations vs. auto DDL)?
3. How is the first admin created in production?
4. What is the retention period for run logs and student chat views?
5. Should regeneration create a new content version or replace the current one?
6. Where will the admin app be hosted, and who may reach it?

---

## 8. Demo script (for presenting the project)

1. Log in as admin; show the dashboard with success, retry, rejection, and fallback rates.
2. Open a lesson; show the source upload and its extracted text.
3. Open the pipeline viewer; show generated questions next to the source passages they came from.
4. Show a rejected run with its validation problems.
5. Stop the agents service; trigger a student request; show the new `FALLBACK_USED` run appear.
6. Show a student's detail page and the audit log entry created by viewing it.
7. Regenerate a lesson and show the new run.