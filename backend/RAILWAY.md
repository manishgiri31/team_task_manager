# Deploying on Railway

This backend is configured to run on [Railway](https://railway.app/) with **no code changes** beyond setting environment variables in the Railway dashboard.

## Prerequisites

- Railway account
- This repo (or GitHub connection to Railway)
- A separate deployment URL for your frontend (optional but typical)

## Deployment steps

1. **Create a new Railway project**  
   From the Railway dashboard: **New Project** → **Deploy from GitHub repo** (or **Empty project** and connect this repo).

2. **Add PostgreSQL**  
   In the project: **New** → **Database** → **PostgreSQL**.  
   Railway injects `DATABASE_URL` automatically into services that reference the database (use **Variables** reference or add the Postgres plugin to the same service).

3. **Create a web service for the API**  
   - Root directory: `backend` (if the monorepo root is the repo, set **Root Directory** to `backend` in service settings).  
   - **Start command** (if not using Procfile):  
     `uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips "*"`  
   - Railway detects `Procfile` and `requirements.txt` automatically when the service root is `backend`.

4. **Link `DATABASE_URL`**  
   - In the **API** service → **Variables** → **Add variable** → **Reference** → choose the Postgres service’s `DATABASE_URL`.  
   - Do **not** manually paste unless you normalize the scheme; the app accepts `postgresql://` and converts it to `postgresql+asyncpg://` at startup.

5. **Set required variables** (see table below).  
   Set `SECRET_KEY` to a long random string. Set `CORS_ORIGINS` to your real frontend origin(s).

6. **Deploy**  
   Trigger a deploy; watch **Deploy Logs** for `Application started successfully`.  
   Open `https://<your-service>.up.railway.app/docs` to confirm the API.

7. **Migrations / schema**  
   This project creates tables when `DEBUG=True` only. For production, run migrations (e.g. Alembic) or a one-time schema sync before going live. Until then, ensure tables exist (Railway Postgres + your chosen migration strategy).

## Production run command

Railway uses the **Procfile** `web` process:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips "*"
```

- `$PORT` is set by Railway and must not be hard-coded.  
- `--proxy-headers` / `--forwarded-allow-ips='*'` trust Railway’s reverse proxy so redirects and client metadata behave correctly behind HTTPS.

## Railway environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | Reference from the Railway Postgres service. Accepts `postgres://`, `postgresql://`, or `postgresql+asyncpg://`. |
| `SECRET_KEY` | **Yes** | JWT signing secret. Generate e.g. `python -c "import secrets; print(secrets.token_urlsafe(48))"`. |
| `CORS_ORIGINS` | **Yes** (prod) | Comma-separated list of allowed browser origins, e.g. `https://myapp.vercel.app,https://my-frontend.up.railway.app`. No spaces after commas, or trim in app (already trimmed). |
| `DEBUG` | No | Default `False`. Keep `False` in production. |
| `ALGORITHM` | No | Default `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default `30`. |
| `APP_NAME` | No | Display name only. |
| `APP_VERSION` | No | Display version only. |
| `ADMIN_EMAIL` | No | With `ADMIN_PASSWORD` + `ADMIN_NAME`, creates first admin if that email does not exist. |
| `ADMIN_PASSWORD` | No | Min 8 characters if bootstrapping admin. |
| `ADMIN_NAME` | No | Display name for bootstrapped admin. |

Railway may also inject `PORT`, `RAILWAY_*`, etc.; they are ignored by config (`extra="ignore"`).

## CORS (production)

Set `CORS_ORIGINS` to every frontend origin that will call this API, for example:

```text
https://your-frontend.up.railway.app,https://www.yourdomain.com
```

Local development can keep `http://localhost:3000` in a local `.env`; production Railway service should use only real HTTPS origins you control.

## Health check (optional)

In Railway service settings, set **Healthcheck Path** to `/health` if you want automatic restarts on failure.

## Troubleshooting

- **Build fails (Python version)**  
  `runtime.txt` pins Python 3.12.x. Adjust if Railway’s stack changes.

- **Database connection / SSL**  
  If asyncpg rejects SSL, ensure the Postgres `DATABASE_URL` from Railway includes SSL query parameters as provided by default. If you customize the URL, keep `sslmode=require` or equivalent for hosted Postgres.

- **502 / app crash on boot**  
  Check logs for missing `SECRET_KEY` or invalid `DATABASE_URL`. Confirm the API service **references** the same Postgres `DATABASE_URL` as the database service.
