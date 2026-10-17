# Contributing Guidelines

## 1. Project Structure

Every contributor must keep application source code inside its designated folder.

| Folder | Owner | Purpose |
|---|---|---|
| `frontend/` | Frontend developer | Android or web application |
| `backend/` | Backend developer | Java and Spring Boot REST API |
| `agents/` | AI developer | Python and LangChain agents |
| `infra/` | Team coordination | Docker Compose and deployment configuration |
| `docs/` | Shared responsibility | API contracts and technical documentation |
| `.github/` | Team coordination | GitHub Actions and repository workflows |

## 2. Folder Rules

- Frontend source code belongs in `frontend/`.
- Spring Boot source code belongs in `backend/`.
- Python and LangChain source code belongs in `agents/`.
- Do not put application source code in the repository root.
- Do not modify another component's folder without discussing the change with its owner.
- Changes affecting multiple components must be coordinated with the team.

## 3. Git Workflow

1. Start from the latest `develop` branch.
2. Create a feature branch for your task.
3. Work primarily within your component's folder.
4. Commit and push your changes to GitHub.
5. Open a pull request targeting `develop`.
6. Wait for review and successful automated checks before merging.

## 4. Branch Naming

Use the following convention:

- `feature/frontend-<description>`
- `feature/backend-<description>`
- `feature/agent-<description>`
- `fix/<description>`

## 5. Clean Code and Security

- Never commit passwords, API keys, or real `.env` files.
- Do not commit build output, dependency caches, or Python virtual environments.
- Update documentation when changing API contracts.
- Include relevant test results in pull requests.

## 6. Integration

The team must coordinate changes to API endpoints and request/response formats.

The frontend communicates with Spring Boot. Spring Boot communicates with the Python agents service.

The `develop` branch is used for integration; `main` is reserved for stable versions.