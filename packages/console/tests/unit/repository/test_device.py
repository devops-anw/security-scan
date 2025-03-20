from unittest.mock import Mock, patch
from app.core.exceptions import NotFoundException
from sqlalchemy.sql.dml import Update
import pytest
from fastapi import HTTPException
from datetime import datetime, timezone, timedelta
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql.elements import BooleanClauseList
from app.models.device import Device
from app.schemas.device import DeviceCreate, DeviceUpdate


def test_get_by_serial_number(device_repository, mock_db):
    # Arrange
    serial_number = "test-serial"
    org_id = "test-org-id"
    mock_device = Mock(spec=Device)

    # Setup the query mock with the specific filter condition
    query_mock = mock_db.query.return_value
    filter_mock = query_mock.filter.return_value
    filter_mock.first.return_value = mock_device

    # Act
    result = device_repository.get_by_serial_number(serial_number, org_id)

    # Assert
    assert result == mock_device

    # Verify the filter was called with the correct AND condition
    mock_db.query.assert_called_once_with(Device)
    query_mock.filter.assert_called_once()

    # Get the filter arguments to check the specific AND condition
    filter_args = query_mock.filter.call_args[0][0]
    assert filter_args.clauses[0].left.key == "serial_number"
    assert filter_args.clauses[0].right.value == serial_number
    assert filter_args.clauses[1].left.key == "org_id"
    assert filter_args.clauses[1].right.value == org_id

    filter_mock.first.assert_called_once()


def test_get_devices_by_criteria(device_repository, mock_db):
    # Arrange
    search_term = "test"
    device_type = "sensor"
    status = "ONLINE"  # Changed from True to "ONLINE"
    health = "AT RISK"
    skip = 0
    limit = 10
    org_id = "test-org-id"

    # Mock the devices and total count
    mock_devices = [Mock(spec=Device), Mock(spec=Device)]

    # Patch the get_org_id to return a fixed org_id
    with patch("app.repositories.device.get_org_id", return_value=org_id):
        # Setup the query mock with a more precise mock chain
        query_mock = mock_db.query.return_value

        # Mock the filtering and ordering chain
        filter_org_mock = query_mock.filter.return_value
        filter_search_mock = filter_org_mock.filter.return_value
        filter_type_mock = filter_search_mock.filter.return_value
        filter_status_mock = filter_type_mock.filter.return_value
        filter_health_mock = filter_status_mock.filter.return_value

        # Set up count and result mocks
        filter_health_mock.count.return_value = len(mock_devices)
        filter_health_mock.order_by.return_value.offset.return_value.limit.return_value.all.return_value = (
            mock_devices
        )

        # Act
        devices, total = device_repository.get_devices_by_criteria(
            search_term=search_term,
            device_type=device_type,
            status=status,
            health=health,
            skip=skip,
            limit=limit,
        )

        # Assert
        assert devices == mock_devices
        assert total == len(mock_devices)

        # Verify query construction
        mock_db.query.assert_called_once_with(Device)

        # Verify filtering calls
        query_mock.filter.assert_called_once()  # org_id filter
        filter_org_mock.filter.assert_called_once()  # search filter
        filter_search_mock.filter.assert_called_once()  # device_type filter
        filter_type_mock.filter.assert_called_once()  # status filter
        filter_status_mock.filter.assert_called_once()  # health filter
        filter_health_mock.count.assert_called_once()
        filter_health_mock.order_by.assert_called_once()


def test_create(device_repository, mock_db):
    # Arrange
    mock_db.add.return_value = None
    mock_db.commit.return_value = None
    mock_db.refresh.return_value = None
    device_create = DeviceCreate(
        name="Test Device",
        type="Test Type",
        serial_number="test-serial",
        org_id="test-org-id",
    )

    # Act
    with patch("app.repositories.device.Device"):
        result = device_repository.create(device_create)

    # Assert
    assert isinstance(result, Device)
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


def test_create_with_db_error(device_repository, mock_db):
    # Arrange
    mock_db.commit.side_effect = SQLAlchemyError("Test error")
    device_create = DeviceCreate(
        name="Test Device",
        type="Test Type",
        serial_number="test-serial",
        org_id="test-org-id",
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        with patch("app.repositories.device.Device"):
            device_repository.create(device_create)

    assert exc_info.value.status_code == 400
    assert "Database error" in str(exc_info.value.detail)
    mock_db.rollback.assert_called_once()


def test_update(device_repository, mock_db):
    # Arrange
    mock_device = Mock(spec=Device)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_device
    device_update = DeviceUpdate(name="Updated Device")

    # Act
    result = device_repository.update("1", device_update)

    # Assert
    assert result == mock_device
    mock_db.add.assert_called_once_with(mock_device)
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(mock_device)


def test_update_not_found(device_repository, mock_db):
    # Arrange
    mock_db.query.return_value.filter.return_value.first.return_value = None
    device_update = DeviceUpdate(name="Updated Device")

    # Act & Assert
    with pytest.raises(NotFoundException) as exc_info:
        device_repository.update("1", device_update)

    assert str(exc_info.value) == "Device with id 1 not found"
    mock_db.add.assert_not_called()
    mock_db.commit.assert_not_called()
    mock_db.refresh.assert_not_called()


def test_update_device_status(device_repository, mock_db):
    # Arrange
    current_time = datetime.now(timezone.utc)
    five_minutes_ago = current_time - timedelta(minutes=5)

    # Setup test devices with properties
    offline_devices = [
        Device(id="1", last_seen=five_minutes_ago, properties={"cpu": 0.8}),
        Device(
            id="2", created_at=five_minutes_ago, last_seen=None, properties={"cpu": 0.9}
        ),
    ]

    # Mock the query chain
    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value = mock_query
    mock_query.all.return_value = offline_devices

    # Mock the execute method to track calls
    mock_db.execute = Mock()

    # Act
    device_repository.update_device_status()

    # Assert
    mock_db.query.assert_called_once_with(Device)

    # Verify filter conditions
    filter_call = mock_query.filter.call_args[0][0]
    assert isinstance(filter_call, BooleanClauseList)

    # Verify execute was called for each device
    assert mock_db.execute.call_count == len(offline_devices)

    # Verify execute was called for each device
    assert mock_db.execute.call_count == len(offline_devices)

    # Verify the update parameters
    expected_updates = {
        "health": "UNKNOWN",
        "last_seen": None,
        "properties": {"cpu": None},
    }

    # Verify each update call
    for call_args in mock_db.execute.call_args_list:
        update_stmt = call_args[0][0]

        # Verify it's an update statement
        assert isinstance(update_stmt, Update), "Expected an Update statement"

        # Verify the WHERE clause contains the device ID
        where_clause = update_stmt.whereclause
        assert where_clause is not None
        assert str(where_clause).startswith("devices.id = :id_1")

        # Verify the SET clause contains all expected updates
        set_clause = update_stmt._values
        assert set_clause is not None
        assert len(set_clause) == len(expected_updates)

        # Verify each update value
        for col, val in expected_updates.items():
            assert col in str(set_clause)


def test_update_device_status_no_offline_devices(device_repository, mock_db):
    # Arrange
    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value = mock_query
    mock_query.all.return_value = []  # No offline devices

    # Act
    device_repository.update_device_status()

    # Assert
    mock_db.query.assert_called_once_with(Device)
    mock_db.execute.assert_not_called()
    mock_db.commit.assert_not_called()


def test_calculate_device_status_variations(device_repository):
    current_time = datetime.now(timezone.utc)

    # Test cases covering both status and health scenarios
    test_cases = [
        # Status scenarios
        (Device(last_seen=current_time - timedelta(seconds=30)), "ONLINE"),
        (Device(last_seen=current_time - timedelta(minutes=6)), "OFFLINE"),
        (
            Device(created_at=current_time - timedelta(minutes=6), last_seen=None),
            "OFFLINE",
        ),
        (Device(last_seen=current_time - timedelta(seconds=45)), "ONLINE"),
        (
            Device(created_at=current_time - timedelta(seconds=30), last_seen=None),
            "ONLINE",
        ),
        # Edge cases
        (Device(last_seen=current_time), "ONLINE"),
        (Device(last_seen=current_time - timedelta(minutes=1)), "ONLINE"),
        (Device(last_seen=current_time - timedelta(minutes=5, seconds=1)), "OFFLINE"),
        # Health scenarios
        (
            Device(
                last_seen=current_time - timedelta(seconds=30),
                properties={"cpu": 0.8},
            ),
            "ONLINE",
        ),
        (
            Device(
                last_seen=current_time - timedelta(seconds=30),
                properties={"cpu": 0.95},
            ),
            "ONLINE",
        ),
        (
            Device(
                last_seen=None,
                created_at=current_time - timedelta(minutes=6),
                properties={},
            ),
            "OFFLINE",
        ),
        (
            Device(
                last_seen=current_time - timedelta(minutes=6), properties={"cpu": 0.8}
            ),
            "OFFLINE",
        ),
        # CPU threshold test cases
        (
            Device(
                last_seen=current_time - timedelta(seconds=30),
                properties={"cpu": 0.91},
            ),
            "ONLINE",
        ),
        (
            Device(
                last_seen=current_time - timedelta(seconds=30),
                properties={"cpu": 0.71},
            ),
            "ONLINE",
        ),
        (
            Device(
                last_seen=current_time - timedelta(seconds=30),
                properties={"cpu": 0.69},
            ),
            "ONLINE",
        ),
        (
            Device(
                last_seen=current_time - timedelta(seconds=30),
                properties={"cpu": None},
            ),
            "ONLINE",
        ),
    ]

    for device, expected_status in test_cases:
        assert device_repository._calculate_device_status(device) == expected_status
