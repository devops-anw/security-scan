import os
from unittest.mock import Mock

import pytest
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.auth import api_key_required, jwt_required
from app.core.dependencies import (
    api_key_header,
    get_current_org,
    get_keycloak_client,
    get_org_from_api_key,
)
from app.core.exceptions import ForbiddenException
from app.main import app
from app.repositories.application import ApplicationRepository
from app.repositories.device import DeviceRepository
from app.repositories.endpoint_config import EndpointConfigRepository
from app.repositories.inventory import InventoryRepository
from app.schemas.common import OrgData
from app.services.application import ApplicationService
from app.services.device import DeviceService
from app.services.endpoint_config import EndpointConfigService

# Set a default value for DATABASE_URL for unit tests
os.environ.setdefault("CONSOLE_DATABASE_URL", "sqlite:///./unit_test.db")
os.environ.setdefault("CONSOLE_KEYCLOAK_URL", "http://localhost:8080")
os.environ.setdefault("CONSOLE_KEYCLOAK_REALM", "console")
os.environ.setdefault("CONSOLE_KEYCLOAK_CLIENT_ID", "console")
os.environ.setdefault("CONSOLE_KEYCLOAK_CLIENT_SECRET", "console")
os.environ.setdefault("CONSOLE_PUBLIC_KEYCLOAK_URL", "http://localhost:8080")
os.environ.setdefault("CONSOLE_PUBLIC_KEYCLOAK_CLIENT", "console")

security = HTTPBearer()


@pytest.fixture
def mock_db():
    return Mock(spec=Session)


@pytest.fixture
def device_repository(mock_db):
    return DeviceRepository(mock_db)


@pytest.fixture
def endpoint_config_repository(mock_db):
    return EndpointConfigRepository(mock_db)


@pytest.fixture
def mock_device_repository():
    return Mock()


@pytest.fixture
def mock_endpoint_config_repository():
    return Mock()


@pytest.fixture
def device_service(mock_device_repository, mock_endpoint_config_repository):
    return DeviceService(mock_device_repository, mock_endpoint_config_repository)


@pytest.fixture
def endpoint_config_service(mock_endpoint_config_repository):
    return EndpointConfigService(mock_endpoint_config_repository)


@pytest.fixture
def mock_endpoint_config_service():
    return Mock()


@pytest.fixture
def inventory_repository(mock_db):
    return InventoryRepository(mock_db)


@pytest.fixture
def application_repository(mock_db):
    return ApplicationRepository(mock_db)


@pytest.fixture
def mock_inventory_repository():
    return Mock()


@pytest.fixture
def mock_application_repository():
    return Mock()


@pytest.fixture
def application_service(mock_application_repository):
    return ApplicationService(mock_application_repository)


@pytest.fixture
def mock_inventory_service():
    return Mock()


@pytest.fixture
def mock_application_service():
    return Mock()


@pytest.fixture
def mock_get_current_org():
    async def _get_current_org():
        return "test_org"

    return _get_current_org


@pytest.fixture
def mock_jwt_required():
    def jwt_required(
        credentials: HTTPAuthorizationCredentials = Security(security),
    ) -> str:
        if not credentials.credentials:
            raise HTTPException(status_code=401, detail="Invalid or missing token")
        # Return the token itself as the org_id
        return credentials.credentials

    return jwt_required


@pytest.fixture
def mock_api_key_required():
    async def _api_key_required():
        return "test_org"

    return _api_key_required


@pytest.fixture
def mock_keycloak_client():
    mock_client = Mock()
    mock_client.validate_org_access.return_value = True
    return mock_client


@pytest.fixture
def mock_get_keycloak_client(mock_keycloak_client):
    return lambda: mock_keycloak_client


@pytest.fixture
def mock_get_org_from_api_key(mock_keycloak_client):
    def _get_org_from_api_key(api_key: str = Security(api_key_header)) -> OrgData:
        if not mock_keycloak_client.validate_org_access(api_key):
            raise ForbiddenException(message="Invalid API key")
        return OrgData(org_id=api_key)

    return _get_org_from_api_key


@pytest.fixture(autouse=True)
def override_auth_dependencies(
    mock_get_current_org,
    mock_jwt_required,
    mock_api_key_required,
    mock_get_org_from_api_key,
    mock_get_keycloak_client,
):
    app.dependency_overrides[get_current_org] = lambda: mock_get_current_org
    app.dependency_overrides[jwt_required] = mock_jwt_required
    app.dependency_overrides[api_key_required] = lambda: mock_api_key_required
    app.dependency_overrides[get_org_from_api_key] = mock_get_org_from_api_key
    app.dependency_overrides[get_keycloak_client] = mock_get_keycloak_client
    yield
    app.dependency_overrides.clear()
