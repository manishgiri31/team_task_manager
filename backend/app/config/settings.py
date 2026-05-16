"""
Application configuration settings.
Uses environment variables for sensitive data.
"""
from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "Team Task Manager API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database (Railway provides postgresql://…; async SQLAlchemy needs postgresql+asyncpg://)
    DATABASE_URL: str

    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS — comma-separated origins, e.g. https://your-frontend.up.railway.app,https://app.vercel.app
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Optional: bootstrap admin on startup (all three must be set to run; see README)
    ADMIN_EMAIL: Optional[str] = None
    ADMIN_PASSWORD: Optional[str] = None
    ADMIN_NAME: Optional[str] = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: object) -> str:
        """
        Ensure asyncpg driver prefix for SQLAlchemy 2 async engine.

        Accepts Railway/Heroku-style URLs:
        - postgres://…
        - postgresql://…
        - postgresql+asyncpg://… (unchanged)
        """
        if v is None or not isinstance(v, str):
            raise ValueError("DATABASE_URL must be a non-empty string")
        url = v.strip()
        if not url:
            raise ValueError("DATABASE_URL must be a non-empty string")

        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://") :]

        if url.startswith("postgresql+asyncpg://"):
            return url

        if url.startswith("postgresql://"):
            return "postgresql+asyncpg://" + url[len("postgresql://") :]

        raise ValueError(
            "DATABASE_URL must start with postgres://, postgresql://, or postgresql+asyncpg://"
        )


settings = Settings()


def get_cors_origins() -> list[str]:
    """Parse CORS origins from comma-separated string."""
    return [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
