# Running PropAI.pk with Docker

Docker runs **backend + frontend + PostgreSQL** together so your friend does not need Python, Node, or Neon installed locally.

## Prerequisites (your friend needs only)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac/Linux)
- This project folder (zip or git clone)
- The dataset file `zameen-updated.csv` in the project root

---

## Quick start (recommended — local database)

```bash
# From project root (folder containing docker-compose.yml)
docker compose up --build
```

**First run takes 5–15 minutes** because Docker will:
1. Start PostgreSQL
2. Run migrations
3. Train the ML model (if missing)
4. Seed sample properties (`SEED_LIMIT=5000` by default)

### Open the app

| Service | URL |
|---------|-----|
| **Web app** | http://localhost:5173 |
| **API docs** | http://localhost:8000/docs |

### Demo logins

| Role | Email | Password |
|------|--------|----------|
| Investor | investor@realestate.pk | investor123 |
| Agent | agent@realestate.pk | agent123 |
| Admin | admin@realestate.pk | admin123 |

---

## Useful commands

```bash
# Run in background
docker compose up --build -d

# View logs
docker compose logs -f backend

# Stop everything
docker compose down

# Stop and delete database (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose up --build
```

---

## Environment variables (optional)

Create `.env` in project root to override defaults:

```env
SECRET_KEY=your-secret-key
SEED_LIMIT=5000          # 0 = seed all ~97K rows (slow)
SEED_ON_START=true       # false = skip seeding on startup
```

---

## Option B: Use Neon Postgres (cloud) with Docker

If you prefer Neon instead of local Postgres:

1. Copy `.env.docker.example` → `.env` and add your Neon `DATABASE_URL`
2. Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.neon.yml up --build backend frontend
```

(This skips the local `db` container.)

---

## What to share with your friend

Share the **entire project folder** including:

- `docker-compose.yml`
- `backend/` and `frontend/`
- `zameen-updated.csv` (required for ML + seeding)

**Do NOT share** your personal `.env` with real Neon passwords.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 5173 or 8000 already in use | Stop local `npm run dev` / uvicorn, or change ports in `docker-compose.yml` |
| `zameen-updated.csv` not found | Place CSV in project root |
| Backend keeps restarting | Run `docker compose logs backend` — usually DB not ready or missing CSV |
| Predictions fail | Wait for first-run ML training to finish, or run `docker compose exec backend python -m app.ml.train` |
| Want full dataset in DB | Set `SEED_LIMIT=0` in `.env`, then `docker compose down -v` and `docker compose up --build` |

---

## Architecture

```
Browser → frontend:5173 (nginx)
              ├── /        → React app
              └── /api/*   → backend:8000 (FastAPI)
                                    └── db:5432 (PostgreSQL)
```
