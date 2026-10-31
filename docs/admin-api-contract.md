# Admin API Contract

All routes are under `/api/admin` and require a valid JWT for a user with role `ADMIN`.
Non-admin tokens receive `403`; missing/invalid tokens receive `401`.

## Conventions

- Pagination: `page` (0-based, default 0) and `size` (default 20, max 100). Responses include `content`, `page`, `size`, `totalElements`, `totalPages`.
- Sorting: `sort` query param as `field,asc|desc` (e.g. `createdAt,desc`).
- Filters: resource-specific query params documented per endpoint.
- Error body (consistent):
  ```json
  { "timestamp": "...", "status": 400, "error": "Bad Request", "message": "...", "path": "/api/admin/..." }
  ```
- Admin DTOs are separate from mobile DTOs. Password hashes and answer keys are never exposed outside admin DTOs; answer keys are admin-only.
- Aggregations are computed in the database, not in memory.

## Endpoints

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
| GET | `/health` | Admin service health (Phase 2) |

## Status
Phase 2 delivers `/health`. Other endpoints are delivered in Phase 6.
## Content review (Phase 8)

- `hidden` boolean on generated exercise sets and slide decks controls visibility to students.
- `POST /lessons/{id}/regenerate` increments `contentVersion`; cached generated content is keyed by version, so a new version triggers fresh generation while older versions remain addressable.
- Students mid-lesson keep their current version; new content applies on next lesson load.
- Every hide/unhide and regenerate action is written to `audit_log`.
