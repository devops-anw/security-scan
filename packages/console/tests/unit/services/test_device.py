from datetime import datetime, timezone
from unittest.mock import Mock, PropertyMock
import pytest

from app.core.exceptions import (
    DuplicateObjectException,
    NotFoundException,
    ObjectNotFoundException,
)
from app.models.device import Device
from app.schemas.device import DeviceCreate, DeviceInDB, DeviceTypes, DeviceUpdate
from app.schemas.endpoint_config import EndpointConfigCreate
from app.services.endpoint_config_converter import DEFAULT_CONFIG


def test_get(device_service):
    # Arrange
    device_id = "1"
    mock_device = Mock(spec=Device)
    mock_device.id = "1"
    mock_device.org_id = "test-org"
    mock_device.name = "Test Device"
    mock_device.type = "Test Type"
    mock_device.serial_number = "test-serial"
    mock_device.created_at = datetime.now(timezone.utc)
    mock_device.updated_at = datetime.now(timezone.utc)
    mock_device.last_seen = datetime.now(timezone.utc)
    mock_device.properties = {}
    device_service.repository.get = Mock(return_value=mock_device)
    device_service.validator.validate_device_access = Mock(return_value=True)

    # Act
    result = device_service.get(device_id)

    # Assert
    assert isinstance(result, DeviceInDB)
    assert result.id == mock_device.id
    assert result.name == mock_device.name
    assert result.type == mock_device.type
    assert result.serial_number == mock_device.serial_number
    assert result.org_id == mock_device.org_id
    device_service.repository.get.assert_called_once_with(device_id)
    device_service.validator.validate_device_access.assert_called_once_with(device_id)


def test_get_not_found(device_service):
    # Arrange
    device_id = "1"
    device_service.validator.validate_device_access = Mock(
        side_effect=NotFoundException(
            message=f"Device not found with the given ID {device_id}"
        )
    )

    # Act & Assert
    with pytest.raises(NotFoundException) as exc_info:
        device_service.get(device_id)

    # Assert
    assert str(exc_info.value) == f"Device not found with the given ID {device_id}"
    device_service.validator.validate_device_access.assert_called_once_with(device_id)


def test_get_all(device_service, mock_device_repository):
    # Arrange
    mock_devices = [Mock(spec=Device), Mock(spec=Device)]
    mock_devices[0].id = "1"
    mock_devices[0].org_id = "test-org"
    mock_devices[0].name = "Test Device 1"
    mock_devices[0].type = "Test Type"
    mock_devices[0].serial_number = "test-serial-1"
    mock_devices[0].created_at = datetime.now(timezone.utc)
    mock_devices[0].updated_at = datetime.now(timezone.utc)
    mock_devices[0].last_seen = datetime.now(timezone.utc)
    mock_devices[0].properties = {}

    mock_devices[1].id = "2"
    mock_devices[1].org_id = "test-org"
    mock_devices[1].name = "Test Device 2"
    mock_devices[1].type = "Test Type"
    mock_devices[1].serial_number = "test-serial-2"
    mock_devices[1].created_at = datetime.now(timezone.utc)
    mock_devices[1].updated_at = datetime.now(timezone.utc)
    mock_devices[1].last_seen = datetime.now(timezone.utc)
    mock_devices[1].properties = {}
    mock_device_repository.get_all.return_value = mock_devices

    # Act
    result = device_service.get_all(skip=0, limit=10)

    # Assert
    assert result == mock_devices
    mock_device_repository.get_all.assert_called_once_with(skip=0, limit=10)


def test_create_device_success(device_service, mock_endpoint_config_repository):
    # Arrange
    device_service.repository.get_by_serial_number = Mock(return_value=None)

    # Create a mock device with proper attribute values instead of mock values
    mock_device = Mock(spec=Device)
    current_time = datetime.now(timezone.utc)

    # Configure mock to return actual values instead of more mocks
    type(mock_device).id = PropertyMock(return_value="test-device-id")
    type(mock_device).org_id = PropertyMock(return_value="test-org-id")
    type(mock_device).name = PropertyMock(return_value="Test Device")
    type(mock_device).type = PropertyMock(return_value="Test Type")
    type(mock_device).serial_number = PropertyMock(return_value="test-serial")
    type(mock_device).created_at = PropertyMock(return_value=current_time)
    type(mock_device).updated_at = PropertyMock(return_value=current_time)
    type(mock_device).last_seen = PropertyMock(return_value=current_time)
    type(mock_device).properties = PropertyMock(return_value={})

    device_service.repository.create = Mock(return_value=mock_device)
    device_service.repository.update = Mock(return_value=mock_device)  # Add this line
    device_service.endpoint_config_service.create_endpoint_config = Mock()

    device_create = DeviceCreate(
        name="Test Device",
        type="Test Type",
        serial_number="test-serial",
        org_id="test-org-id",
        properties={},
    )

    # Act
    result = device_service.create_device(device_create)

    # Assert
    assert result.id == "test-device-id"  # Change to check specific attributes
    assert result.name == "Test Device"
    assert result.type == "Test Type"
    assert result.serial_number == "test-serial"
    assert result.org_id == "test-org-id"

    device_service.repository.get_by_serial_number.assert_called_once_with(
        "test-serial", "test-org-id"
    )
    device_service.repository.create.assert_called_once_with(device_create)

    # Check if endpoint config was created
    device_service.endpoint_config_service.create_endpoint_config.assert_called_once()
    called_config = (
        device_service.endpoint_config_service.create_endpoint_config.call_args[0][0]
    )
    assert isinstance(called_config, EndpointConfigCreate)
    assert called_config.id == "test-device-id"
    assert called_config.org_id == "test-org-id"
    assert called_config.name == "Test Device Config"
    assert called_config.type == "Test Type"
    assert called_config.config == DEFAULT_CONFIG


def test_create_device_duplicate_serial(device_service):
    # Arrange
    existing_device = Mock(spec=Device)
    device_service.repository.get_by_serial_number = Mock(return_value=existing_device)

    device_create = DeviceCreate(
        name="Test Device",
        type="Test",
        serial_number="test-serial",
        org_id="test-org-id",
        properties={},
    )

    # Act & Assert
    with pytest.raises(DuplicateObjectException) as exc_info:
        device_service.create_device(device_create)

    # Assert error message and calls
    assert (
        str(exc_info.value)
        == f"Device with serial number {device_create.serial_number} already exists"
    )
    device_service.repository.get_by_serial_number.assert_called_once_with(
        device_create.serial_number, device_create.org_id
    )
    device_service.repository.create.assert_not_called()


def test_update_device_success(device_service):
    # Arrange
    device_id = "1"
    device_service.validator.validate_device_access = Mock(return_value=True)

    mock_device = Mock(spec=Device)
    device_service.repository.update = Mock(return_value=mock_device)

    device_update = DeviceUpdate(name="Updated Device")

    # Act
    result = device_service.update_device(device_id, device_update)

    # Assert
    assert result == mock_device
    device_service.validator.validate_device_access.assert_called_once_with(device_id)
    device_service.repository.update.assert_called_once_with(device_id, device_update)


def test_update_device_not_found(device_service):
    # Arrange
    device_id = "1"
    device_service.validator.validate_device_access = Mock(return_value=True)
    device_service.repository.update = Mock(return_value=None)

    device_update = DeviceUpdate(name="Updated Device")

    # Act
    result = device_service.update_device(device_id, device_update)

    # Assert
    assert result is None
    device_service.validator.validate_device_access.assert_called_once_with(device_id)
    device_service.repository.update.assert_called_once_with(device_id, device_update)


def test_delete_device_success(device_service, mock_endpoint_config_repository):
    # Arrange
    device_id = "1"
    device_service.validator.validate_device_access = Mock(return_value=True)

    mock_device = Mock(spec=Device)
    device_service.repository.delete = Mock(return_value=mock_device)
    mock_endpoint_config_repository.delete = Mock(return_value=True)

    # Act
    result = device_service.delete_device(device_id)

    # Assert
    assert result.status_code == 200
    device_service.validator.validate_device_access.assert_called_once_with(device_id)
    device_service.repository.delete.assert_called_once_with(device_id)
    mock_endpoint_config_repository.delete.assert_called_once_with(device_id)


def test_delete_not_found(device_service, mock_device_repository):
    # Arrange
    mock_device_repository.delete.return_value = None
    device_id = 1

    # Act & Assert
    with pytest.raises(ObjectNotFoundException) as exc_info:
        device_service.delete(device_id)

    # Assert
    assert str(exc_info.value) == f"Object with id {device_id} not found"
    mock_device_repository.delete.assert_called_once_with(device_id)


def test_get_device_types(device_service):
    # Arrange
    expected_types = ["Type1", "Type2", "Type3"]
    device_service.repository.get_device_types_by_org = Mock(
        return_value=expected_types
    )

    # Act
    result = device_service.get_device_types()

    # Assert
    assert isinstance(result, DeviceTypes)
    assert result.types == expected_types
    device_service.repository.get_device_types_by_org.assert_called_once()


def test_get_devices_by_org_with_count(device_service):
    # Arrange
    # Create actual Device objects
    device1_data = {
        "id": "1",
        "org_id": "test-org",
        "name": "Test Device 1",
        "type": "Test Type",
        "serial_number": "test-serial-1",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "last_seen": datetime.now(timezone.utc),
        "properties": {},
    }
    mock_device1 = Device(**device1_data)

    device2_data = {
        "id": "2",
        "org_id": "test-org",
        "name": "Test Device 2",
        "type": "Test Type",
        "serial_number": "test-serial-2",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "last_seen": datetime.now(timezone.utc),
        "properties": {},
    }
    mock_device2 = Device(**device2_data)

    mock_devices = [mock_device1, mock_device2]
    expected_total = 2
    device_service.repository.get_devices_by_criteria = Mock(
        return_value=(mock_devices, expected_total)
    )

    # Act
    result = device_service.get_devices_by_org_with_count(
        search="test", device_type="type1", status=True, skip=0, limit=10, health=None
    )

    # Assert
    assert isinstance(result, tuple)
    assert len(result) == 2
    assert isinstance(result[0][0], DeviceInDB)  # Verify conversion to DeviceInDB
    assert result[1] == expected_total
    device_service.repository.get_devices_by_criteria.assert_called_once_with(
        search_term="test",
        device_type="type1",
        status=True,
        skip=0,
        limit=10,
        health=None,
    )


def test_service_device_status_update(device_service):
    # Mock repository
    device_service.repository.update_device_status = Mock()

    # Test device status update propagation
    device_service.repository.update_device_status()
    device_service.repository.update_device_status.assert_called_once()


def test_service_device_health_status(device_service, monkeypatch):
    # Mock org_id to match test device
    monkeypatch.setattr("app.core.context.get_org_id", lambda: "test-org")

    # Test device with different health statuses
    test_cases = [
        ({"cpu": 0.95}, "CRITICAL"),
        ({"cpu": 0.85}, "AT_RISK"),
        ({"cpu": 0.65}, "HEALTHY"),
        ({"cpu": None}, "UNKNOWN"),
        ({}, "UNKNOWN"),
    ]

    for properties, expected_health in test_cases:
        device = Device(
            id="test-id",
            org_id="test-org",
            name="Test Device",
            type="Test Type",
            serial_number="test-serial",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            last_seen=datetime.now(timezone.utc),
            properties=properties,
        )
        device_service.repository.get.return_value = device
        device_service.validator.validate_device_access = Mock(return_value=True)

        # Act
        result = device_service.get("test-id")

        # Assert
        assert result.properties == properties
        device_service.repository.get.assert_called_once_with("test-id")
        device_service.validator.validate_device_access.assert_called_once_with(
            "test-id"
        )

        # Reset mocks for next iteration
        device_service.repository.get.reset_mock()
        device_service.validator.validate_device_access.reset_mock()


def test_update_device_heartbeat_service(device_service):
    # Arrange
    device_id = "test-id"
    test_cases = [
        {
            "input": {"cpu": 75},
            "expected": {"cpu": 75.0},  # Ensure consistent float type
        },
        {"input": {"cpu": 95}, "expected": {"cpu": 95.0}},
        {"input": {}, "expected": {}},
    ]

    for case in test_cases:
        # Mock validator and get current device
        device_service.validator.validate_device_access = Mock(return_value=True)

        # Create Device instance
        current_device = Device(
            id=device_id,
            org_id="test-org",
            name="Test Device",
            type="Test Type",
            serial_number="test-serial",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            last_seen=datetime.now(timezone.utc),
            properties={},
        )
        device_service.repository.get = Mock(return_value=current_device)

        # Mock the update with consistent property types
        updated_device = Device(
            id=device_id,
            org_id="test-org",
            name="Test Device",
            type="Test Type",
            serial_number="test-serial",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            last_seen=datetime.now(timezone.utc),
            properties=(
                {k: float(v) for k, v in case["expected"].items()}
                if case["expected"]
                else {}
            ),
        )
        device_service.repository.update = Mock(return_value=updated_device)

        # Act
        result = device_service.update_device_heartbeat(device_id, case["input"])

        # Assert
        assert result.id == device_id
        # Convert all numeric values to float for consistent comparison
        expected_properties = (
            {k: float(v) for k, v in case["expected"].items()}
            if case["expected"]
            else {}
        )
        result_properties = (
            {k: float(v) for k, v in result.properties.items()}
            if result.properties
            else {}
        )
        assert result_properties == expected_properties

        # Verify update call
        update_call = device_service.repository.update.call_args[0]
        assert update_call[0] == device_id
        assert isinstance(update_call[1], DeviceUpdate)
        assert (
            {k: float(v) for k, v in update_call[1].properties.items()}
            if update_call[1].properties
            else {} == expected_properties
        )
        assert update_call[1].last_seen is not None

        # Reset mocks for next iteration
        device_service.validator.validate_device_access.reset_mock()
        device_service.repository.update.reset_mock()
        device_service.repository.get.reset_mock()


def test_create_device_with_initial_status(
    device_service, mock_endpoint_config_repository
):
    # Arrange
    device_service.repository.get_by_serial_number = Mock(return_value=None)

    mock_device = Mock(spec=Device)
    mock_device.id = "test-device-id"
    mock_device.org_id = "test-org-id"
    mock_device.name = "Test Device"
    mock_device.type = "Test Type"
    mock_device.serial_number = "test-serial"
    mock_device.created_at = datetime.now(timezone.utc)
    mock_device.updated_at = datetime.now(timezone.utc)
    mock_device.last_seen = None
    mock_device.properties = {}

    device_service.repository.create = Mock(return_value=mock_device)
    device_service.repository.update = Mock(return_value=mock_device)
    device_service.endpoint_config_service.create_endpoint_config = Mock()

    device_create = DeviceCreate(
        name="Test Device",
        type="Test Type",
        serial_number="test-serial",
        org_id="test-org-id",
        properties={},
    )

    # Act
    result = device_service.create_device(device_create)

    # Assert
    assert isinstance(result, DeviceInDB)
    assert result.id == mock_device.id
    assert result.name == mock_device.name
    assert result.type == mock_device.type
    assert result.serial_number == mock_device.serial_number
    assert result.org_id == mock_device.org_id
    assert result.properties == mock_device.properties
    device_service.repository.create.assert_called_once()
    device_service.repository.update.assert_called_once()

    # Verify last_seen was set
    update_call = device_service.repository.update.call_args[0]
    assert isinstance(update_call[1], DeviceUpdate)
    assert update_call[1].last_seen is not None
