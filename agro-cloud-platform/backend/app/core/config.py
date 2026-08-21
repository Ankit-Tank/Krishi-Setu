from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Agro-Cloud Backend API"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    SECRET_KEY: str = "agro_cloud_super_secret_hackathon_key_2026"
    
    # Database
    DATABASE_URL: str = "postgresql://agro_user:agro_password@localhost:5432/agro_cloud_db"
    
    # AI Engine Microservice endpoint
    AI_ENGINE_URL: str = "http://localhost:8500"
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
