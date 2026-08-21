import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    AI_SERVICE_NAME: str = "Agro-Cloud AI Engine"
    AI_SERVICE_PORT: int = 8500
    APP_ENV: str = "development"
    
    # Hugging Face Free Inference API Configuration
    # Uses public pretrained model: linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    HF_MODEL_ID: str = os.getenv("HF_MODEL_ID", "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
