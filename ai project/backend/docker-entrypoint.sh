#!/bin/sh
set -e

echo "==> Waiting for PostgreSQL..."
python - <<'PY'
import os
import sys
import time

from sqlalchemy import create_engine, text

from app.db_connect import get_connect_args

url = os.environ.get("DATABASE_URL")
if not url:
    sys.exit("DATABASE_URL is not set")

for attempt in range(60):
    try:
        engine = create_engine(url, connect_args=get_connect_args(url))
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database is ready.")
        break
    except Exception as exc:
        print(f"  attempt {attempt + 1}/60: {exc}")
        time.sleep(2)
else:
    sys.exit("Could not connect to database after 60 attempts")
PY

echo "==> Running database migrations..."
python -m alembic upgrade head

MODEL_PATH="app/ml/artifacts/model.joblib"
if [ ! -f "$MODEL_PATH" ]; then
  echo "==> ML model not found. Training now (first run may take 2-5 minutes)..."
  python -m app.ml.train
else
  echo "==> ML model found, skipping training."
fi

if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "==> Seeding database (skips if data already exists)..."
  python scripts/seed_db.py
fi

echo "==> Starting API server on http://0.0.0.0:8000"
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
