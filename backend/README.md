# SIBI Backend (FastAPI)

Lightweight FastAPI service that powers user authentication, lesson catalog, and
progress tracking for the SIBI learning website.

## Quick start

```bash
poetry install
poetry run uvicorn app.main:app --reload
# Visit http://localhost:8000/docs for the OpenAPI UI.
```

The SQLite database file lives at `./sibi.db` by default (configurable via the
`DATABASE_URL` env var). On first boot the app seeds the lesson catalog.

## Free deploy

This service is small enough for any free tier:

- Fly.io: `fly launch --no-deploy` then `fly deploy` (use the included
  `Procfile`). Mount a 1 GB volume to `/data` and set `DATABASE_URL=sqlite:////data/sibi.db`.
- Render: New Web Service → Python → start command `poetry run uvicorn app.main:app --host 0.0.0.0 --port 10000`.

## Env vars

| name             | default                | meaning                              |
| ---------------- | ---------------------- | ------------------------------------ |
| `DATABASE_URL`   | `sqlite:///./sibi.db`  | SQLAlchemy URL                       |
| `JWT_SECRET`     | dev value (insecure)   | HMAC secret for JWT signing          |
| `JWT_TTL_MIN`    | `60 * 24 * 7`          | Access-token lifetime in minutes     |
| `CORS_ORIGINS`   | `*`                    | Comma-separated origins for CORS     |
