# Level Up Admin Panel

Web admin console (Next.js App Router, TypeScript, Tailwind + shadcn/ui).

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000. API base URL comes from `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`).

Sign in with an account whose role is `ADMIN`. Non-admin accounts are rejected.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript (`tsc --noEmit`)

## Environment

- `NEXT_PUBLIC_API_BASE_URL` — Spring Boot backend base URL.