from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings
from app.db_connect import get_connect_args

settings = get_settings()

_engine = None
_SessionLocal = None


class Base(DeclarativeBase):
    pass


def _init_db() -> None:
    global _engine, _SessionLocal
    if _engine is None:
        if not settings.DATABASE_URL:
            raise RuntimeError("DATABASE_URL environment variable is required")
        _engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_recycle=300,
            connect_args=get_connect_args(settings.DATABASE_URL),
        )
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


def get_session_local():
    _init_db()
    assert _SessionLocal is not None
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
