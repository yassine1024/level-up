# Admin Panel — Phase 0 Verification Notes

Answers to the VERIFY list in `docs/admin_panel_plan.md` (Phase 0, step 5), plus the retention policy decision (step 6).

## Security rules and JWT handling
- `SecurityConfig` disables CSRF, enables CORS, and sets `anyRequest().permitAll()`.
- There is **no JWT servlet filter**. Authentication/authorization is done **manually** in controllers via the `Authorization: Bearer <token>` header and `JwtService` (e.g. `UserController.me`, `StudentAccessService.requireStudent`).
- Roles live in `User.Role` enum: `STUDENT`, `TEACHER`, `ADMIN`.
- Implication for admin endpoints: each `/api/admin/**` handler must extract the bearer token, validate it with `JwtService`, load the `User`, and require `Role.ADMIN` (returning 401/403 otherwise). Alternatively, introduce a filter later; for now follow the existing manual pattern to stay consistent.

## CORS
- `CorsConfiguration` allows origin patterns `*`, methods `GET/POST/PUT/DELETE/OPTIONS`, all headers, credentials allowed.
- Registered for `/**`. The admin origin (dev `http://localhost:3000`, prod TBD) is therefore already allowed; no change needed for Phase 2, but prod should be tightened to the real admin origin.

## Schema changes
- Applied via **Flyway**: SQL files in `backend/src/main/resources/db/migration/` (`V2__...`, `V3__admin_panel_user_fields.sql`, `V4__generation_runs.sql`).
- New tables/columns must be added as new `V5__...`, `V6__...` migration files. `ddl-auto` is not the mechanism.

## ADMIN role creation / seeding
- `User.Role.ADMIN` exists in the enum, but **no initializer seeds an admin account** (no `UserDataInitializer` in the tree; only `CatalogDataInitializer` and `PlacementQuestionDataInitializer`).
- Decision: add a dev-only seed (e.g. `admin`/`admin`) in Phase 2 via a `CommandLineRunner` guarded by a profile/property, and document a manual/env-driven creation path for prod. Never hardcode prod credentials.

## Relevant controllers
- `auth/controller/AuthController` — login/register
- `auth/controller/UserController` — `/api/users/me`
- `catalog/controller/CatalogController` — levels/units/lessons
- `resource/controller/TeacherLessonResourceController` — teacher uploads
- `student/controller/StudentController` — student endpoints
- `health/HealthController` — health

## Retention policy (decided)
- `generation_runs`: keep row metadata (status, agent, lesson, user, timestamps, latency) **indefinitely**; purge `output_json` and `validation_problems` after **90 days**.
- Do not copy full source text into runs; store `input_ref` (lesson_resource ids) + `content_version` + `input_hash`.
- Student chat/writing remain in their existing tables; admin views are **audited** (audit_log) but no separate copies are stored.
- Personal data in lists is masked; full detail only on detail pages, and views of student chat/writing are logged.

## Branches created (from `develop`)
- `feature/backend-generation-runs`
- `feature/backend-admin-api`
- `feature/agent-validation-details`
- `feature/admin-scaffold` (existing)

## Exit criteria
- Team agreement: pending (process).
- CONTRIBUTING.md: updated.
- Branches: created.
- VERIFY list: answered (this document).