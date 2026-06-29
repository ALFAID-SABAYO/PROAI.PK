from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]


BACKEND_ROOT = Path(__file__).resolve().parents[1]

_ENV_FILES = [
    PROJECT_ROOT / ".env",
    BACKEND_ROOT / ".env",
]


BACKEND_ROOT = Path(__file__).resolve().parents[1]
ML_ARTIFACTS_DIR = BACKEND_ROOT / "app" / "ml" / "artifacts"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(p) for p in _ENV_FILES if p.exists()] or ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str | None = None
    SECRET_KEY: str = "change-me-in-production-use-strong-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    ML_MODEL_PATH: str = str(ML_ARTIFACTS_DIR / "model.joblib")
    ML_METRICS_PATH: str = str(ML_ARTIFACTS_DIR / "metrics.json")
    DATASET_PATH: str = str(PROJECT_ROOT / "zameen-updated.csv")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
