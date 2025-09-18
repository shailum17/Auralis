from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Service settings
    service_name: str = "ml-service"
    debug: bool = os.getenv("NODE_ENV") == "development"
    
    # Redis settings
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Model settings
    model_cache_dir: str = "./models"
    max_text_length: int = 2000
    
    # Privacy settings
    enable_differential_privacy: bool = True
    privacy_epsilon: float = 1.0
    
    # Performance settings
    batch_size: int = 32
    max_concurrent_requests: int = 100
    
    # Thresholds
    stress_threshold_high: float = 0.7
    stress_threshold_medium: float = 0.4
    toxicity_threshold: float = 0.8
    
    class Config:
        env_file = ".env"

settings = Settings()