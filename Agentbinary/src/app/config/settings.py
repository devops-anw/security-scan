import logging
import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    AB_PUBLIC_KEYCLOAK_URL: str
    AB_KEYCLOAK_URL: str
    AB_KEYCLOAK_REALM: str
    AB_KEYCLOAK_CLIENT_ID: str
    AB_UPLOAD_MAX_FILE_SIZE: int
    UPLOAD_DIRECTORY: str = "./uploads"
    VERSIONS_FILE: str = "versions.json"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


class SettingsManager:
    _instance: Optional[Settings] = None

    @classmethod
    def get_settings(cls) -> Settings:
        if cls._instance is None:
            cls._instance = Settings()
        return cls._instance

    @classmethod
    def set_settings(cls, settings: Settings):
        cls._instance = settings


@lru_cache()
def get_settings():
    try:
        return SettingsManager.get_settings()
    except Exception as e:
        missing_fields = [
            field for field in Settings.__fields__ if field not in os.environ
        ]
        if missing_fields:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing_fields)}"
            )
        raise ValueError(f"Error loading configuration: {str(e)}")


# Configure logging to write to a file
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()],
)
