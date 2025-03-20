from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Console"
    API_V1_STR: str = "/console/v1.0"
    DEBUG: bool = False
    CONSOLE_KEYCLOAK_URL: str
    CONSOLE_KEYCLOAK_REALM: str
    CONSOLE_KEYCLOAK_CLIENT_ID: str
    CONSOLE_KEYCLOAK_CLIENT_SECRET: str
    CONSOLE_PUBLIC_KEYCLOAK_URL: str
    CONSOLE_PUBLIC_KEYCLOAK_CLIENT_ID: str

    # Database configuration
    CONSOLE_DATABASE_URL: str

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
