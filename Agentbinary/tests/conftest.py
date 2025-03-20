import pytest

# from starlette.middleware.base import BaseHTTPMiddleware
# from fastapi import Request

from app.config.settings import Settings, SettingsManager


@pytest.fixture(autouse=True)
def test_settings():
    test_settings = Settings(
        AB_KEYCLOAK_URL="https://test-keycloak-url",
        AB_KEYCLOAK_REALM="test-realm",
        AB_KEYCLOAK_CLIENT_ID="test-client-id",
        UPLOAD_DIRECTORY="/tmp/test-upload-directory",
        VERSIONS_FILE="test_versions.json",
    )
    SettingsManager.set_settings(test_settings)
    yield test_settings
    SettingsManager._instance = None  # Reset for next test
