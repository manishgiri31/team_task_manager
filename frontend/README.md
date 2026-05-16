# Team Task Manager — Frontend

Next.js 14 (App Router) client for the Team Task Manager FastAPI backend.

## Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8000` (or set `NEXT_PUBLIC_API_URL`)

## Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Environment (optional):

```bash
cp .env.example .env.local
```

Edit `NEXT_PUBLIC_API_URL` if the API is not on `http://localhost:8000`.

3. CORS: ensure the backend `CORS_ORIGINS` includes your frontend origin (`http://localhost:3000` locally, and your `https://*.vercel.app` URL in production).

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

See **[VERCEL.md](./VERCEL.md)** for environment variables, root directory, production build checks, and CORS notes.

## Production build

```bash
npm run lint
npm run build
npm start
```

Or: `npm run verify` (lint + build). Same checks Vercel runs during deploy.

## Architecture

| Area | Purpose |
|------|---------|
| `app/` | App Router pages, layouts, `providers.tsx` |
| `components/` | Reusable UI (including `ui/` primitives and `layout/`) |
| `services/` | Axios instance and REST wrappers |
| `context/` | Auth and toast state (Context API only) |
| `hooks/` | Shared hooks (e.g. `useRequireAuth`) |
| `lib/` | Constants, token/session helpers, formatting |
| `lib/session-constants.ts` | Static cookie/storage keys (Edge-safe; used by `middleware.ts`) |
| `types/` | TypeScript models aligned with Pydantic schemas |
| `middleware.ts` | Session cookie gate for protected routes |
| `vercel.json` | Optional Vercel headers / framework hint |

## Authentication

- JWT is stored in `localStorage` and sent as `Authorization: Bearer …` on each request.
- A lightweight `tm_session` cookie is set in sync so Edge `middleware` can redirect unauthenticated users away from `/dashboard`, `/projects`, and `/tasks`.
- For stricter production setups, consider a BFF that stores tokens in `httpOnly` cookies and proxies to the API.

## Role behavior (matches API)

- **Admin**: create/delete projects and tasks, add project members, full task updates.
- **Member**: sees assigned tasks and projects they belong to; may only update **status** on tasks assigned to them.

New signups default to **member** in the API; promote to admin via the database or admin tooling if needed.
