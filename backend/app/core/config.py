from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "CYBER RAKSHA AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "cyber-raksha-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RATE_LIMIT_LOGIN_MAX_ATTEMPTS: int = 5
    RATE_LIMIT_LOGIN_WINDOW_MINUTES: int = 5
    DATABASE_URL: str = "sqlite+aiosqlite:///cyber_raksha.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    USE_REDIS: bool = False
    DEMO_MODE: bool = True
    EMAIL_SERVICE_CONFIGURED: bool = False
    MAX_UPLOAD_SIZE_MB: int = 10
    CREATE_INITIAL_ADMIN: bool = True
    INITIAL_ADMIN_EMAIL: str = "admin@cyberraksha.gov.in"
    INITIAL_ADMIN_PASSWORD: str = "CyberRaksha@Admin2026"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

settings = Settings()
