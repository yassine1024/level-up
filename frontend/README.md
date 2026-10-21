# Frontend

React Native (Expo) mobile application for the project.

The frontend communicates with the Spring Boot backend through a REST API.

## Tech stack
- React Native 0.86 (Expo SDK 57)
- Expo Router (file-based routing, routes in `src/app/`)
- TypeScript (strict)
- TanStack Query (data fetching/caching)
- Zustand (state)
- Axios (HTTP client)

## Setup
1. Install dependencies: `npm install`
2. Copy env template: `cp .env.example .env.local` and adjust values.
3. Start dev server: `npx expo start`
   - Android: `npx expo start --android`
   - Web: `npx expo start --web`

## API mode
- Default `EXPO_PUBLIC_API_MODE=mock` runs fully offline with mock data.
- Set to `live` and `EXPO_PUBLIC_API_URL` to the Spring Boot base URL when backend is ready.

## Structure
- `src/app/` — routes/screens (Expo Router)
- `src/api/` — API client, mock layer, typed endpoints
- `src/hooks/` — reusable hooks
- `src/store/` — global state
- `src/types/` — shared TypeScript types / API contracts
- `components/`, `constants/` — UI building blocks and theme

## Screens
- `/welcome`, `/signup`, `/login`, `/role` — shared onboarding
- `/teacher/resources` — teacher course resources (pick a level / unit / lesson,
  attach the vocabulary, grammar and listening files, write the descriptions)
- `/teacher/saved` — confirmation shown after a lesson is saved

The teacher screens need `expo-document-picker` (bundled with Expo Go, no
development build required) and the course endpoints described in
`docs/api-contract.md`. Until the backend serves them the frontend falls back to
a mock course and shows a "Demo data" badge.

## Team guidelines
- Keep changes focused on the frontend component.
- Coordinate API contract changes with backend/agent developers.
- Never commit `.env*` (except `.env.example`) or real secrets.
- Document new setup requirements here.