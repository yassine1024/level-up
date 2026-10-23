# API Contract and Service Communication

## Architecture Rules

1. The frontend communicates with the Spring Boot backend through a REST API.
2. The Spring Boot backend communicates with the Python agents service.
3. The frontend does not call the Python agents service directly.
4. The backend and agents expose documented APIs.
5. API changes must be coordinated between the developers.

## Development Endpoints

The following URLs are examples. They will be configured when the services are implemented and deployed.

- Backend API: `http://localhost:8080/api`
- Agents API: `http://localhost:8000`

For shared testing, the frontend will use the shared development backend URL instead of `localhost`.

## Initial Connectivity Check

The backend should eventually provide:

`GET /api/health`

Expected response:

```json
{
  "status": "UP"
}
```

This endpoint will allow the team to verify that the frontend can reach the backend without requiring the Python agents service.

## Configuration

The frontend API base URL must be configurable.

The backend agents-service URL must also be configurable.

Development URLs and credentials must not be hardcoded into production configuration.

## Teacher · Course resources

Contract requested by the frontend for the "Teacher · course resources" screen
(reference frames 05 / 06 / 07). The backend does not implement these endpoints
yet: the frontend falls back to a mock course and flags it with a "Demo data"
badge until they are available.

### Course structure

| Method | Path | Response |
|---|---|---|
| `GET` | `/api/lessons/levels` | `LessonLevel[]` — `{ id: "A1", name: "Beginner" }` |
| `GET` | `/api/lessons/levels/{levelId}/units` | `LessonUnit[]` — `{ id, levelId, number, title }` |
| `GET` | `/api/units/{unitId}/lessons` | `Lesson[]` — `{ id, unitId, number, title }` |

A list may be returned as a bare array or wrapped in an envelope such as
`{ "data": [...] }`; the frontend accepts both.

### Saving the resources of a lesson

`POST /api/teacher/lessons/{lessonId}/resources` — `multipart/form-data`.

| Part | Type | Description |
|---|---|---|
| `vocabulary` | file | PDF, DOCX or TXT |
| `grammar` | file | PDF, DOCX or TXT |
| `pronunciation` | file | PDF, DOCX or TXT (slot not available yet) |
| `listening1` | file | Transcript, TXT |
| `listening2` | file | PDF, DOCX or TXT (slot not available yet) |
| `other` | file | PDF, DOCX or TXT |
| `writingDescription` | text | Free text written by the teacher |
| `otherDescription` | text | Free text written by the teacher |

Response: `{ "lessonId": 42, "savedAt": "2026-10-21T10:00:00Z" }`.

The backend extracts the text of the uploaded files and uses it to build the
student slides, the practice games and the character chat episode. The frontend
never parses the files itself.

## Student · home and course

Contract requested by the frontend for the "Student: home and course" screens
(reference frames 12-18). The backend does not implement these endpoints yet:
the frontend falls back to a mock course and shows the screens with demo data.

### Current course

`GET /api/me/course`

Response: `StudentCourse`:

```json
{
  "levelId": "A1",
  "levelName": "Beginner",
  "previousUnits": [],
  "currentUnit": {
    "number": 1,
    "title": "Meeting people",
    "completedLessons": 1,
    "totalLessons": 3,
    "progress": 0.33,
    "currentLesson": { "id": 1012, "number": 2, "title": "Introducing yourself" }
  },
  "nextUnits": [
    { "number": 2, "title": "Daily routines" },
    { "number": 3, "title": "Food and drinks" }
  ]
}
```

### Slides

`POST /api/lessons/:id/slides` — generated once, then cached. Response is a
list of slide objects consumed by the slide viewer (`title`, `bullets`,
`example`, `hint`, `miniExercise`). The frontend caches the result locally.
