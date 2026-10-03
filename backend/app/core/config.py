import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://examuser:exampass@localhost:5432/examdb"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # Admin
    ADMIN_EMAIL: str = "admin@awslearning.com"
    ADMIN_PASSWORD: str = "Admin@123"
    ADMIN_NAME: str = "AWS Trainer"

    # Exam defaults
    DEFAULT_EXAM_DURATION_MINUTES: int = 30
    DEFAULT_MAX_VIOLATIONS: int = 3
    DEFAULT_QUESTIONS_PER_EXAM: int = 30

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
