from datetime import datetime, timedelta, timezone
from unittest.mock import Mock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.v1.endpoints.devices import get_device_service
from app.core.context import set_org_id
from app.main import app

# from app.repositories.device import DeviceRepository
from app.schemas.device import DeviceCreate, DeviceInDB, DeviceUpdate
from app.schemas.endpoint_config import EndpointConfigCreate
from app.services.device import DeviceService
from app.services.endpoint_config_converter import DEFAULT_CONFIG

# Setup test client
client = TestClient(app)


# Fixture to create a properly configured mock device repository
@pytest.fixture
def configured_mock_device_repository(mock_device_repository):
    # Use Mock with proper spec
    mock_device_repository.create = Mock(return_value=None)
    mock_device_repository.get = Mock(return_value=None)
    mock_device_repository.update = Mock(return_value=None)
    mock_device_repository.delete = Mock(return_value=None)
    mock_device_repository.get_by_serial_number = Mock(return_value=None)
    mock_device_repository.get_devices_by_criteria = Mock(return_value=([], 0))

    return mock_device_repository


@pytest.fixture
def mock_device_validator():
    with patch(
        "app.validators.devices.DeviceValidator.validate_device_access"
    ) as mock_validate:
        mock_validate.return_value = True
        yield mock_validate


# Override the get_device_service dependency
@pytest.fixture(autouse=True)
def override_get_device_service(
    configured_mock_device_repository,
    mock_device_validator,
    mock_endpoint_config_repository,
):
    def get_service():
        service = DeviceService(
            configured_mock_device_repository, mock_endpoint_config_repository
        )
        service.validator = mock_device_validator
        return service

    app.dependency_overrides[get_device_service] = get_service
    yield
    app.dependency_overrides.clear()


def test_create_device(
    configured_mock_device_repository, mock_endpoint_config_repository
):
    # Arrange
    device_create = DeviceCreate(
        name="Test Device",
        type="Test",
        serial_number="123",
        properties={},
        org_id="org1",
    )
    mock_device = DeviceInDB(
        id="1",
        name="Test Device",
        type="Test",
        serial_number="123",
        properties={},
        org_id="org1",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        last_seen=datetime.now(timezone.utc),
    )
    configured_mock_device_repository.create.return_value = mock_device
    configured_mock_device_repository.update.return_value = mock_device

    mock_endpoint_config_repository.create.return_value = Mock()

    # Act
    response = client.post(
        "console/v1.0/devices/",
        json={
            "name": "Test Device",
            "type": "Test",
            "serial_number": "123",
            "properties": {},
        },
        headers={"X-Org-Key": "org1"},
    )

    # Assert
    print(response.json())
    assert response.status_code == 200
    assert response.json()["name"] == device_create.name
    configured_mock_device_repository.create.assert_called_once_with(device_create)
    mock_endpoint_config_repository.create.assert_called_once()
    called_config = mock_endpoint_config_repository.create.call_args[0][0]
    assert isinstance(called_config, EndpointConfigCreate)
    assert called_config.id == "1"
    assert called_config.org_id == device_create.org_id
    assert called_config.name == f"{device_create.name} Config"
    assert called_config.type == device_create.type
    assert called_config.config == DEFAULT_CONFIG


def test_read_device(configured_mock_device_repository):
    # Arrange
    device_id = "1"
    mock_device = DeviceInDB(
        id=device_id,
        name="Test Device",
        type="Test",
        serial_number="123",
        org_id="org1",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    # Explicitly set return value
    configured_mock_device_repository.get.return_value = mock_device

    # Act
    response = client.get(
        f"console/v1.0/devices/{device_id}",
        headers={"Authorization": "Bearer org1"},
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["id"] == device_id

    # Verify method call
    configured_mock_device_repository.get.assert_called_once_with(device_id)


def test_update_device(configured_mock_device_repository):
    # Arrange
    device_id = "1"
    device_update = DeviceUpdate(name="Updated Device")
    mock_device = DeviceInDB(
        id=device_id,
        name="Updated Device",
        type="Test",
        serial_number="123",
        org_id="org1",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    # Explicitly set return value
    configured_mock_device_repository.update.return_value = mock_device

    # Act
    response = client.put(
        f"console/v1.0/devices/{device_id}",
        json=device_update.model_dump(exclude_unset=True),
        headers={"X-Org-Key": "org1"},
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Device"

    # Verify method call
    configured_mock_device_repository.update.assert_called_once_with(
        device_id, device_update
    )


def test_device_heartbeat(mock_device_repository):
    # Arrange
    device_id = "1"
    device_properties = {
        "cpu": 0.3,
        "disk": 37.7,
        "memory": 52.4,
        "disk_read_io": 0,
        "disk_write_io": 84,
        "network_recv_io": 188,
        "network_sent_io": 237,
        "last_suspect_write": "",
        "last_recovered_file": "",
        "suspect_write_count": 0,
        "recovered_file_count": 0,
        "last_suspect_extension": "",
        "suspect_extension_count": 0,
        "last_suspicious_extension": "",
        "suspicious_extension_count": 0,
    }
    mock_device_repository.get.return_value = DeviceInDB(
        id=device_id,
        name="Test Device",
        type="Test",
        serial_number="123",
        org_id="org1",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        last_seen=datetime.now(timezone.utc),
    )
    updated_device = DeviceInDB(
        id=device_id,
        name="Test Device",
        type="Test",
        serial_number="123",
        org_id="org1",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        last_seen=datetime.now(timezone.utc),
        properties=device_properties,
    )
    mock_device_repository.update.return_value = updated_device
    set_org_id("org1")

    # Act
    response = client.post(
        f"console/v1.0/devices/{device_id}/heartbeat",
        headers={"X-Org-Key": "org1"},
        json=device_properties,
    )

    # Assert
    assert response.status_code == 200
    assert "last_seen" in response.json()
    assert response.json()["properties"] == device_properties
    mock_device_repository.update.assert_called_once()
    args, kwargs = mock_device_repository.update.call_args
    assert args[0] == device_id
    assert isinstance(args[1], DeviceUpdate)
    assert args[1].last_seen is not None
    assert args[1].properties == device_properties


def test_delete_device(mock_device_repository):
    # Arrange
    device_id = "1"
    mock_device_repository.get.return_value = DeviceInDB(
        id=device_id,
        name="Test Device",
        type="Test",
        serial_number="123",
        org_id="org1",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    mock_device_repository.delete.return_value = DeviceInDB(
        id=device_id,
        name="Test Device",
        type="Test",
        serial_number="123",
        org_id="org1",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    set_org_id("org1")

    # Act
    response = client.delete(
        f"console/v1.0/devices/{device_id}", headers={"X-Org-Key": "org1"}
    )

    # Assert
    assert response.status_code == 200
    mock_device_repository.delete.assert_called_once_with(device_id)


def test_read_devices_by_org(mock_device_repository):
    # Arrange
    org_id = "org1"
    search = "test"
    device_type = "sensor"
    status = "ONLINE"  # Changed from True to "ONLINE"
    health = "AT RISK"
    skip = 0
    limit = 10

    mock_device_repository.get_devices_by_criteria.return_value = (
        [
            DeviceInDB(
                id="1",
                name="Device 1",
                type="Test",
                serial_number="123",
                org_id=org_id,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                properties={"cpu_usage": 0.75},  # Added properties for health status
            ),
            DeviceInDB(
                id="2",
                name="Device 2",
                type="Test",
                serial_number="456",
                org_id=org_id,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                properties={"cpu_usage": 0.85},  # Added properties for health status
            ),
        ],
        2,
    )

    # Act
    response = client.get(
        "console/v1.0/devices",
        params={
            "skip": skip,
            "limit": limit,
            "search": search,
            "device_type": device_type,
            "status": status,
            "health": health,
        },
        headers={"Authorization": "Bearer org1"},
    )

    # Assert
    assert response.status_code == 200
    response_data = response.json()
    assert isinstance(response_data, dict)
    assert "devices" in response_data
    assert "total" in response_data
    assert "skip" in response_data
    assert "limit" in response_data
    assert len(response_data["devices"]) == 2
    assert response_data["total"] == 2
    assert response_data["skip"] == skip
    assert response_data["limit"] == limit
    assert all(device["org_id"] == org_id for device in response_data["devices"])

    # Additional assertions for new status and health fields
    assert all(
        device["is_active"] in ["ONLINE", "OFFLINE"]
        for device in response_data["devices"]
    )
    assert all(
        device["health"] in ["UNKNOWN", "CRITICAL", "AT_RISK", "HEALTHY"]
        for device in response_data["devices"]
    )

    mock_device_repository.get_devices_by_criteria.assert_called_once_with(
        search_term=search.strip(),
        device_type=device_type,
        status=status.upper(),  # Status is now passed as uppercase string
        health=health.upper(),
        skip=skip,
        limit=limit,
    )


def test_read_devices_by_org_empty(mock_device_repository):
    # Arrange
    # org_id = "org1"
    mock_device_repository.get_devices_by_criteria.return_value = ([], 0)

    # Act
    response = client.get(
        "console/v1.0/devices", headers={"Authorization": "Bearer org1"}
    )

    # Assert
    assert response.status_code == 200
    response_data = response.json()
    assert isinstance(response_data, dict)
    assert "devices" in response_data
    assert "total" in response_data
    assert "skip" in response_data
    assert "limit" in response_data
    assert "message" in response_data
    assert len(response_data["devices"]) == 0
    assert response_data["total"] == 0
    assert response_data["skip"] == 0
    assert response_data["limit"] == 100
    assert response_data["message"] == "No devices found for this organization."
    mock_device_repository.get_devices_by_criteria.assert_called_once()


def test_read_devices_by_org_with_filters(mock_device_repository):
    # Arrange
    test_devices = [
        DeviceInDB(
            id="1",
            name="Test Device 1",
            type="sensor",
            serial_number="123",
            org_id="org1",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            last_seen=datetime.now(timezone.utc),
            properties={"cpu_usage": "45.3"},
        ),
        DeviceInDB(
            id="2",
            name="Test Device 2",
            type="gateway",
            serial_number="456",
            org_id="org1",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            last_seen=datetime.now(timezone.utc) - timedelta(minutes=2),
            properties={"cpu_usage": "92.1"},
        ),
    ]

    mock_device_repository.get_devices_by_criteria.return_value = (
        test_devices,
        len(test_devices),
    )

    # Test different filter combinations
    filter_combinations = [
        {"status": "ONLINE", "health": "HEALTHY"},
        {"status": "OFFLINE", "health": "CRITICAL"},
        {"device_type": "sensor", "search": "Test"},
        {"device_type": "gateway", "health": "AT_RISK"},
    ]

    for filters in filter_combinations:
        # Act
        response = client.get(
            "console/v1.0/devices",
            params={**filters, "skip": 0, "limit": 10},
            headers={"Authorization": "Bearer org1"},
        )

        # Assert
        assert response.status_code == 200
        assert "devices" in response.json()
        assert "total" in response.json()
        mock_device_repository.get_devices_by_criteria.assert_called()
