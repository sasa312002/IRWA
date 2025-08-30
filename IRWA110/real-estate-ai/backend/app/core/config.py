from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./realestate.db"
    
    # JWT
    jwt_secret: str = "change_me_to_a_secure_random_string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Gemini AI
    gemini_api_key: str = ""
    
    # CORS - Use string type to avoid JSON parsing
    allow_origins: str = "http://localhost:3000"
    
    # Security
    min_password_length: int = 8
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def cors_origins(self) -> List[str]:
        """Convert allow_origins string to list for CORS middleware"""
        if "," in self.allow_origins:
            return [origin.strip() for origin in self.allow_origins.split(",")]
        return [self.allow_origins.strip()]

# Create settings instance
settings = Settings()
