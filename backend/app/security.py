"""Shared security helpers — input sanitization, secret validation, password rules."""

from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.config import Settings

logger = logging.getLogger(__name__)

INSECURE_DEFAULT_SECRET = "change-me-in-production-use-strong-secret"
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128
_PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).+$")

ALLOWED_AGENT_CITIES = frozenset({"karachi", "islamabad"})


def escape_ilike(value: str) -> str:
    """Escape SQL ILIKE wildcards so user input is matched literally."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def validate_password_strength(password: str) -> str:
    if len(password) < PASSWORD_MIN_LENGTH:
        raise ValueError(f"Password must be at least {PASSWORD_MIN_LENGTH} characters")
    if len(password) > PASSWORD_MAX_LENGTH:
        raise ValueError(f"Password must be at most {PASSWORD_MAX_LENGTH} characters")
    if not _PASSWORD_PATTERN.match(password):
        raise ValueError("Password must contain at least one letter and one number")
    return password


def validate_settings(settings: Settings) -> None:
    env = settings.ENVIRONMENT.lower()
    is_prod = env in ("production", "prod")

    if settings.SECRET_KEY == INSECURE_DEFAULT_SECRET:
        if is_prod:
            raise RuntimeError(
                "SECRET_KEY is not set. Set a strong random SECRET_KEY in backend/.env before production."
            )
        logger.warning("Using default SECRET_KEY — set SECRET_KEY in .env for any shared deployment.")

    if is_prod and len(settings.SECRET_KEY) < 32:
        raise RuntimeError("SECRET_KEY must be at least 32 characters in production.")

    origins = settings.cors_origins_list
    if is_prod and ("*" in origins or not origins):
        raise RuntimeError("CORS_ORIGINS must list explicit trusted origins in production (no wildcard).")
