from unittest.mock import Mock

import pytest

from app.models import Application, Inventory
from app.schemas.inventory import (
    ApplicationCreate,
    InventoryCreate,
    InventoryUpdate,
    ApprovalStatus,
)


@pytest.fixture
def sample_inventory_create():
    return InventoryCreate(
        device_id="device_123",
        items=[
            ApplicationCreate(name="App1", version="1.0", hash="hash1"),
            ApplicationCreate(name="App2", version="2.0", hash="hash2"),
        ],
    )


@pytest.fixture
def sample_inventory_update():
    return InventoryUpdate(
        added_apps=[ApplicationCreate(name="App3", version="3.0", hash="hash3")],
        removed_app_ids=["app_id_1", "app_id_2"],
    )


def test_get_device_inventory(inventory_repository, mock_db):
    device_id = "device_123"
    total_count = 10
    search = "test"
    status = ApprovalStatus.APPROVED
    skip = 5
    limit = 5
    mock_inventories = [Mock(spec=Inventory), Mock(spec=Inventory)]
    mock_query = mock_db.query.return_value
    mock_query.filter.return_value = mock_query
    mock_query.count.return_value = total_count
    mock_query.offset.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.all.return_value = mock_inventories

    result = inventory_repository.get_device_inventory(
        device_id=device_id, skip=skip, limit=limit, search=search, status=status
    )

    mock_db.query.assert_called_once_with(Inventory)
    mock_query.offset.assert_called_once_with(skip)
    mock_query.limit.assert_called_once_with(limit)
    assert result == (mock_inventories, total_count)


def test_get_application_by_details(inventory_repository, mock_db):
    name, version, hash, org_id = "TestApp", "1.0", "abcdef123", "org_123"
    mock_app = Mock(spec=Application)
    mock_query = mock_db.query.return_value
    mock_query.filter.return_value.first.return_value = mock_app

    result = inventory_repository.get_application_by_details(
        name, version, org_id, hash
    )

    mock_db.query.assert_called_once_with(Application)
    assert result == mock_app


def test_create_application(inventory_repository, mock_db):
    app_data = {"name": "NewApp", "version": "1.0", "hash": "newhash123"}

    result = inventory_repository.create_application(app_data)

    assert isinstance(result, Application)
    assert result.name == app_data["name"]
    assert result.version == app_data["version"]
    assert result.hash == app_data["hash"]
    mock_db.add.assert_called_once_with(result)
    mock_db.flush.assert_called_once()


def test_create_inventory_item(inventory_repository, mock_db):
    device_id, application_id, status = "device_123", "app_123", "pending"

    result = inventory_repository.create_inventory_item(
        device_id, application_id, status
    )

    assert isinstance(result, Inventory)
    assert result.device_id == device_id
    assert result.application_id == application_id
    mock_db.add.assert_called_once_with(result)


def test_remove_inventory_item(inventory_repository, mock_db):
    device_id, application_id = "device_123", "app_123"
    mock_query = mock_db.query.return_value
    mock_filter = mock_query.filter.return_value

    inventory_repository.remove_inventory_item(device_id, application_id)

    mock_db.query.assert_called_once_with(Inventory)
    mock_filter.delete.assert_called_once()


def test_get_device_inventory_by_application(inventory_repository, mock_db):
    device_id, app_id = "device_123", "app_456"
    mock_inventories = [Mock(spec=Inventory), Mock(spec=Inventory)]
    mock_query = mock_db.query.return_value
    mock_query.filter.return_value.all.return_value = mock_inventories

    result = inventory_repository.get_device_inventory_by_application(device_id, app_id)

    mock_db.query.assert_called_once_with(Inventory)
    mock_query.filter.assert_called_once()
    assert result == mock_inventories


def test_get_by_application_id(inventory_repository, mock_db):
    app_id = "app_789"
    mock_inventories = [Mock(spec=Inventory), Mock(spec=Inventory)]
    mock_query = mock_db.query.return_value
    mock_query.filter.return_value.all.return_value = mock_inventories

    result = inventory_repository.get_by_application_id(app_id)

    mock_db.query.assert_called_once_with(Inventory)
    mock_query.filter.assert_called_once()
    assert result == mock_inventories


def test_get_application_by_details_not_found(inventory_repository, mock_db):
    name, version, org_id, hash = "NonexistentApp", "1.0", "org_123", "newhash123"
    mock_query = mock_db.query.return_value
    mock_query.filter.return_value.first.return_value = None

    result = inventory_repository.get_application_by_details(
        name, version, org_id, hash
    )

    mock_db.query.assert_called_once_with(Application)
    assert result is None


def test_remove_inventory_item_no_match(inventory_repository, mock_db):
    device_id, application_id = "device_123", "app_123"
    mock_query = mock_db.query.return_value
    mock_filter = mock_query.filter.return_value
    mock_filter.delete.return_value = 0

    inventory_repository.remove_inventory_item(device_id, application_id)

    mock_db.query.assert_called_once_with(Inventory)
    mock_filter.delete.assert_called_once()


def test_commit(inventory_repository, mock_db):
    inventory_repository.commit()
    mock_db.commit.assert_called_once()


# Additional tests for inherited methods from BaseRepository


def test_get(inventory_repository, mock_db):
    inventory_id = "inv_123"
    mock_inventory = Mock(spec=Inventory)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_inventory

    result = inventory_repository.get(inventory_id)

    mock_db.query.assert_called_once_with(Inventory)
    assert result == mock_inventory


def test_get_all(inventory_repository, mock_db):
    mock_inventories = [Mock(spec=Inventory), Mock(spec=Inventory)]
    mock_db.query.return_value.offset.return_value.limit.return_value.all.return_value = (
        mock_inventories
    )

    result = inventory_repository.get_all()

    mock_db.query.assert_called_once_with(Inventory)
    assert result == mock_inventories


def test_delete(inventory_repository, mock_db):
    inventory_id = "inv_123"
    mock_inventory = Mock(spec=Inventory)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_inventory

    result = inventory_repository.delete(inventory_id)

    assert result == mock_inventory
    mock_db.delete.assert_called_once_with(mock_inventory)
    mock_db.commit.assert_called_once()
