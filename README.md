# Team Project

Application composed of a frontend, a Spring Boot backend, and Python AI agents.

## Project Structure

| Folder | Responsibility | Technology |
|---|---|---|
| `frontend/` | User interface | Android or web |
| `backend/` | REST API and business logic | Java, Spring Boot |
| `agents/` | AI agents and workflows | Python, LangChain |
| `infra/` | Shared development environment | Docker Compose |
| `docs/` | Architecture and API documentation | Markdown, OpenAPI |

## Development Workflow

1. Create a feature branch for your changes.
2. Commit and push your changes to GitHub.
3. Open a pull request for review.
4. Run automated tests before merging.
5. Integrate and test the components together.

## Integration and Testing

The project will use a shared development environment so developers can test interactions between the frontend, backend, and AI agents without configuring the entire application on their PCs.

## Team Guidelines

- Keep changes focused on your component when possible.
- Coordinate API changes with the other developers.
- Never commit passwords, API keys, or real environment secrets.
- Document any new setup requirements.
