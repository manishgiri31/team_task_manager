# Deploying on Vercel

This Next.js 14 app is ready for [Vercel](https://vercel.com/) with environment-based API configuration and no code changes beyond env vars.

## Prerequisites

- Vercel account (GitHub/GitLab/Bitbucket connection recommended)
- A deployed FastAPI backend with a **public HTTPS** base URL
- Backend **`CORS_ORIGINS`** must include your Vercel app URL(s), e.g. `https://your-project.vercel.app` and any preview URLs you use

## Deployment steps

1. **Import the project**  
   Vercel → **Add New** → **Project** → import the repo. Set **Root Directory** to `frontend` if the repository root is the monorepo (not the `frontend` folder alone).

2. **Framework**  
   Vercel auto-detects **Next.js**. The included `vercel.json` sets optional security headers; the default build command `next build` is used.

3. **Environment variables**  
   In the project → **Settings** → **Environment Variables**, add at least:

   | Name | Environment | Value |
   |------|-------------|--------|
   | `NEXT_PUBLIC_API_URL` | Production, Preview, (Development optional) | `https://your-api.example.com` (no trailing slash) |

   Use **different** API URLs for Preview vs Production if you have staging and prod APIs.

4. **Redeploy after changing `NEXT_PUBLIC_*`**  
   `NEXT_PUBLIC_` variables are inlined at **build** time. After adding or changing them, trigger **Redeploy** (or push a new commit) so the client bundle picks up the new API URL.

5. **Deploy**  
   Merge to the production branch or click **Deploy**. After build, open the Vercel URL and test login against your API.

## Production API base URL

- Configure **`NEXT_PUBLIC_API_URL`** to the full origin of your FastAPI service (scheme + host + optional port), **without** a trailing slash.  
- Example: `https://team-task-api.up.railway.app`  
- The Axios client reads this via `lib/constants.ts` (`API_BASE_URL`).

## SSR / Edge notes

- **Middleware** only imports `lib/session-constants.ts` (static cookie name), not the API URL module, to keep the Edge bundle minimal and avoid accidental env coupling.
- **Auth and API calls** run in **client components**; JWT and `localStorage` are not used during RSC for API calls.
- **`NEXT_PUBLIC_*`** is not a secret; do not put private keys in these variables.

## Production build checks

Run locally before shipping (same as Vercel’s build pipeline):

```bash
cd frontend
npm ci
npm run lint
npm run build
```

Optional one-liner (after adding the `verify` script to `package.json`):

```bash
npm run verify
```

**CI / Vercel expectations**

- `npm run build` must complete with **0** TypeScript errors and **0** ESLint errors (Next runs both by default).
- Node **18.18+** or **20+** (see `package.json` `engines`).

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| API calls go to `localhost:8000` on Vercel | `NEXT_PUBLIC_API_URL` not set for that environment, or deploy didn’t run after setting it |
| CORS errors in the browser | Backend `CORS_ORIGINS` missing your `https://*.vercel.app` origin |
| Login works locally but not on Vercel | Wrong API URL for Preview vs Production, or API not reachable over HTTPS |
| Infinite redirect on `/login` | Clear site cookies; ensure `tm_session` cookie and `localStorage` stay in sync after login |

## Files reference

| File | Role |
|------|------|
| `.env.example` | Documented variables for local copy |
| `vercel.json` | Optional headers; framework hint |
| `next.config.mjs` | Strict mode, disable `X-Powered-By` |
