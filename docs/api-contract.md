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
