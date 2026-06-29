"""Shared database connection helpers for SQLAlchemy and Alembic."""


def get_connect_args(database_url: str) -> dict:
    """Neon requires SSL; local Docker Postgres does not."""
    if not database_url:
        return {}
    lower = database_url.lower()
    if "neon.tech" in lower or "sslmode=require" in lower:
        return {"sslmode": "require"}
    return {}
