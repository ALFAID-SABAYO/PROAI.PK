"""Verify Postgres connectivity via DATABASE_URL from .env"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.db_connect import get_connect_args

for env_path in (PROJECT_ROOT / ".env", BACKEND_ROOT / ".env"):
    if env_path.exists():
        load_dotenv(env_path)
        break
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL is not set in .env")
    sys.exit(1)

print(f"Connecting to: {DATABASE_URL.split('@')[-1]}")

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        connect_args=get_connect_args(DATABASE_URL),
    )
    with engine.connect() as conn:
        version = conn.execute(text("SELECT version()")).scalar()
        print("SUCCESS: Connected to PostgreSQL")
        print(f"PostgreSQL version: {version}")
except Exception as exc:
    print(f"FAILED: {exc}")
    sys.exit(1)
