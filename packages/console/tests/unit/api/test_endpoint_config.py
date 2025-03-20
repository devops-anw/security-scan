from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.api.v1.endpoints.endpoint_config import get_endpoint_config_service
from app.main import app
from app.schemas.endpoint_config import EndpointConfigInDB, EndpointConfigUpdate

# Setup test client
client = TestClient(app)


# Override the get_endpoint_config_service dependency
@pytest.fixture(autouse=True)
def override_get_endpoint_config_service(mock_endpoint_config_service):
    app.dependency_overrides[get_endpoint_config_service] = (
        lambda: mock_endpoint_config_service
    )
    yield
    app.dependency_overrides.clear()


def test_get_endpoint_config(mock_endpoint_config_service):
    # Arrange
    endpoint_id = "endpoint1"
    mock_config = EndpointConfigInDB(
        id=endpoint_id,
        org_id="org1",
        name="Test Endpoint",
        type="Windows",
        config={"MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False}},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    mock_endpoint_config_service.get_endpoint_by_id.return_value = mock_config

    # Act
    response = client.get(
        f"/console/v1.0/endpoint-config/{endpoint_id}",
        headers={"Authorization": "Bearer org1"},
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["id"] == endpoint_id
    mock_endpoint_config_service.get_endpoint_by_id.assert_called_once_with(endpoint_id)


def test_get_endpoint_config_not_found(mock_endpoint_config_service):
    # Arrange
    # endpoint_id = "nonexistent"
    mock_endpoint_config_service.get_endpoint_by_id.return_value = None

    # Act
    response = client.get(
        "/console/v1.0/endpoint-config/{endpoint_id}",
        headers={"Authorization": "Bearer org1"},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Endpoint configuration not found"


def test_update_endpoint_config(mock_endpoint_config_service):
    # Arrange
    endpoint_id = "endpoint1"
    update_data = EndpointConfigUpdate(
        name="Updated Endpoint",
        type="Linux",
        config={"MemcryptLog": {"POST_IP": "127.0.0.1", "PORT": 9999, "DEBUG": True}},
    )
    mock_updated_config = EndpointConfigInDB(
        id=endpoint_id,
        org_id="org1",
        **update_data.model_dump(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    mock_endpoint_config_service.update_endpoint_config.return_value = (
        mock_updated_config
    )

    # Act
    response = client.put(
        f"/console/v1.0/endpoint-config/{endpoint_id}",
        json=update_data.model_dump(exclude_unset=True),
        headers={"Authorization": "Bearer org1"},
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["name"] == update_data.name
    assert response.json()["type"] == update_data.type
    assert response.json()["config"] == update_data.config
    mock_endpoint_config_service.update_endpoint_config.assert_called_once_with(
        endpoint_id, update_data
    )


def test_update_endpoint_config_not_found(mock_endpoint_config_service):
    # Arrange
    endpoint_id = "nonexistent"
    update_data = EndpointConfigUpdate(name="Updated Endpoint")
    mock_endpoint_config_service.update_endpoint_config.return_value = None

    # Act
    response = client.put(
        f"/console/v1.0/endpoint-config/{endpoint_id}",
        json=update_data.model_dump(exclude_unset=True),
        headers={"Authorization": "Bearer org_1"},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Endpoint configuration not found"


def test_get_org_endpoint_configs(mock_endpoint_config_service):
    # Arrange
    org_id = "org1"
    mock_configs = [
        EndpointConfigInDB(
            id="endpoint1",
            org_id=org_id,
            name="Endpoint 1",
            type="Windows",
            config={"MemcryptLog": {"POST_IP": "localhost"}},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        ),
        EndpointConfigInDB(
            id="endpoint2",
            org_id=org_id,
            name="Endpoint 2",
            type="Linux",
            config={"MemcryptLog": {"POST_IP": "127.0.0.1"}},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        ),
    ]
    mock_endpoint_config_service.get_endpoints_by_org.return_value = mock_configs

    # Act
    response = client.get(
        "/console/v1.0/endpoint-config",
        headers={"Authorization": f"Bearer {org_id}"},
    )

    # Assert
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert all(config["org_id"] == org_id for config in response.json())
    mock_endpoint_config_service.get_endpoints_by_org.assert_called_once_with(
        org_id, skip=0, limit=100
    )
