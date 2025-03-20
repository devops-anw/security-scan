from datetime import datetime
from unittest.mock import Mock, call

import pytest

from app.core.context import set_org_id
from app.core.exceptions import NotFoundException, ObjectNotFoundException
from app.models import Application, ApprovalStatus, Device, Inventory
from app.schemas.application import ApplicationResponse
from app.schemas.inventory import (
    ApplicationCreate,
    InventoryCreate,
    InventoryListResponse,
    InventoryResponse,
    InventoryUpdate,
)
from app.services.inventory import InventoryService


@pytest.fixture
def inventory_service(
    mock_inventory_repository, mock_device_repository, mock_application_repository
):
    return InventoryService(
        mock_inventory_repository, mock_device_repository, mock_application_repository
    )


@pytest.fixture
def sample_inventory_create():
    set_org_id("org_1")
    return InventoryCreate(
        items=[
            ApplicationCreate(
                name="App1",
                version="1.0",
                hash="hash1",
                publisher="pub1",
                organization_id="org1",
            ),
            ApplicationCreate(
                name="App2",
                version="2.0",
                hash="hash2",
                publisher="pub1",
                organization_id="org1",
            ),
        ],
    )


@pytest.fixture
def sample_inventory_update():
    set_org_id("org_1")
    return InventoryUpdate(
        added_apps=[
            ApplicationCreate(
                name="App3",
                version="3.0",
                hash="hash3",
                publisher="pub1",
                organization_id="org1",
            )
        ],
        removed_app_ids=["app_id_1", "app_id_2"],
    )


def test_get_device_inventory(inventory_service, mock_inventory_repository):
    device_id = "device_123"
    skip = 0
    limit = 100
    search = "test"
    status = ApprovalStatus.PENDING

    inventory_service.device_repository.get.return_value = Mock(org_id="org_123")

    set_org_id("org_123")
    # Create mock Inventory objects
    mock_app = Mock(
        spec=Application,
        id="app_123",
        name="Test App",
        version="1.0",
        publisher="Test Publisher",
        hash="abcdef",
        status=ApprovalStatus.PENDING,
        organization_id="org_123",
    )
    mock_inventory1 = Mock(
        spec=Inventory,
        id="inv_1",
        device_id=device_id,
        application_id="app_123",
        status=ApprovalStatus.PENDING,
        approved_at=None,
        denied_at=None,
        last_updated="2023-01-01T00:00:00",
        application=mock_app,
    )
    mock_inventory2 = Mock(
        spec=Inventory,
        id="inv_2",
        device_id=device_id,
        application_id="app_123",
        status=ApprovalStatus.APPROVED,
        approved_at="2023-01-02T00:00:00",
        denied_at=None,
        last_updated="2023-01-02T00:00:00",
        application=mock_app,
    )
    mock_inventories = [mock_inventory1, mock_inventory2]

    # Set up mock repository behavior
    mock_inventory_repository.get_device_inventory.return_value = (mock_inventories, 2)

    # Create corresponding InventoryResponse objects
    expected_inventories = [
        InventoryResponse(
            id=inv.id,
            device_id=inv.device_id,
            application_id=inv.application_id,
            status=inv.status,
            approved_at=inv.approved_at,
            denied_at=inv.denied_at,
            last_updated=inv.last_updated,
            application=ApplicationResponse(
                id=inv.application.id,
                name=str(inv.application.name),
                version=inv.application.version,
                publisher=inv.application.publisher,
                hash=inv.application.hash,
                status=inv.application.status,
                organization_id=inv.application.organization_id,
            ),
        )
        for inv in mock_inventories
    ]

    expected_response = InventoryListResponse(
        inventory=expected_inventories, skip=skip, limit=limit, total=2
    )
    # Mock the _convert_to_response method
    inventory_service._convert_to_response = Mock(side_effect=expected_inventories)

    # Call the method under test
    result = inventory_service.get_device_inventory(
        device_id, skip, limit, search, status
    )

    # Assertions
    mock_inventory_repository.get_device_inventory.assert_called_once_with(
        device_id, skip, limit, search, status
    )
    inventory_service._convert_to_response.assert_has_calls(
        [call(inv) for inv in mock_inventories]
    )
    assert result == expected_response
    assert all(isinstance(item, InventoryResponse) for item in result.inventory)


def test_get_device_inventory_not_found(inventory_service, mock_inventory_repository):
    set_org_id("org_123")
    device_id = "nonexistent_device"
    skip = 0
    limit = 100
    search = "test"
    status = ApprovalStatus.PENDING
    inventory_service.device_repository.get.return_value = Mock(org_id="org_123")
    mock_inventory_repository.get_device_inventory.return_value = ([], 0)

    with pytest.raises(NotFoundException) as exc_info:
        inventory_service.get_device_inventory(device_id, skip, limit, search, status)

    assert str(exc_info.value) == f"No inventory found for device with id {device_id}"
    mock_inventory_repository.get_device_inventory.assert_called_once_with(
        device_id, skip, limit, search, status
    )


def test_create_inventory(
    inventory_service,
    mock_inventory_repository,
    sample_inventory_create,
    mock_device_repository,
):
    set_org_id("org_123")
    device_id = "device_123"
    # Mock device
    mock_device = Mock(spec=Device, org_id="org_123")

    # Mock Application objects
    mock_app1 = Mock(spec=Application, id="app_id_1")
    mock_app2 = Mock(spec=Application, id="app_id_2")

    # Mock Inventory objects
    mock_inventory_item1 = Mock(spec=Inventory)
    mock_inventory_item2 = Mock(spec=Inventory)

    # Mock InventoryResponse objects
    mock_inventory_response1 = Mock(spec=InventoryResponse)
    mock_inventory_response2 = Mock(spec=InventoryResponse)

    # Set up mock behavior
    mock_device_repository.get.return_value = mock_device
    mock_inventory_repository.get_application_by_details.side_effect = [None, mock_app2]
    mock_inventory_repository.create_application.return_value = mock_app1
    mock_inventory_repository.create_inventory_item.side_effect = [
        mock_inventory_item1,
        mock_inventory_item2,
    ]
    mock_inventory_repository.get_device_inventory_by_application.return_value = []

    # Mock the _convert_to_response method
    inventory_service._convert_to_response = Mock()
    inventory_service._convert_to_response.side_effect = [
        mock_inventory_response1,
        mock_inventory_response2,
    ]

    # Call the method under test
    result = inventory_service.create_inventory(device_id, sample_inventory_create)

    # Assertions
    assert mock_inventory_repository.get_application_by_details.call_count == 2
    mock_inventory_repository.create_application.assert_called_once()
    assert mock_inventory_repository.create_inventory_item.call_count == 2
    mock_inventory_repository.commit.assert_called_once()

    # Assert that _convert_to_response was called for each inventory item
    inventory_service._convert_to_response.assert_has_calls(
        [
            call(mock_inventory_item1),
            call(mock_inventory_item2),
        ]
    )

    # Assert that the result is a list of InventoryResponse objects
    assert result == [mock_inventory_response1, mock_inventory_response2]
    assert all(isinstance(item, InventoryResponse) for item in result)


def test_update_inventory(
    inventory_service, mock_inventory_repository, sample_inventory_update
):
    device_id = "device_123"
    set_org_id("org_123")
    mock_app = Mock(spec=Application, id="app_id_3", organization_id="org_123")

    # Create mock Inventory objects
    mock_inventory1 = Mock(spec=Inventory, id="inv_1", application=mock_app)
    mock_inventory2 = Mock(spec=Inventory, id="inv_2", application=mock_app)
    mock_inventories = [mock_inventory1, mock_inventory2]

    # Create corresponding InventoryResponse objects
    mock_inventory_responses = [
        InventoryResponse(
            id=inv.id,
            device_id=device_id,
            application_id=inv.application.id,
            status="pending",
            approved_at=None,
            denied_at=None,
            last_updated="2023-01-01T00:00:00",
            application=ApplicationResponse(
                id=inv.application.id,
                name="Test App",
                version="1.0",
                publisher="Test Publisher",
                hash="abcdef",
                status="pending",
                organization_id="org_123",
            ),
        )
        for inv in mock_inventories
    ]

    expected_response = InventoryListResponse(
        inventory=mock_inventory_responses,
        skip=0,
        limit=100,
        total=len(mock_inventories),
    )

    # Set up mock repository behavior
    mock_inventory_repository.get_application_by_details.return_value = None
    mock_inventory_repository.create_application.return_value = mock_app
    mock_inventory_repository.get_device_inventory.return_value = mock_inventories, len(
        mock_inventories
    )
    inventory_service.device_repository.get.return_value = Mock(org_id="org_123")

    # Mock the _convert_to_response method
    inventory_service._convert_to_response = Mock(side_effect=mock_inventory_responses)

    # Call the method under test
    result = inventory_service.update_inventory(device_id, sample_inventory_update)

    # Assertions
    assert mock_inventory_repository.remove_inventory_item.call_count == 2
    mock_inventory_repository.get_application_by_details.assert_called_once()
    mock_inventory_repository.create_application.assert_called_once()
    mock_inventory_repository.create_inventory_item.assert_called_once_with(
        device_id, mock_app.id
    )
    mock_inventory_repository.commit.assert_called_once()
    mock_inventory_repository.get_device_inventory.assert_called_once_with(
        device_id, 0, 100, None, None
    )

    # Assert that _convert_to_response was called for each inventory item
    inventory_service._convert_to_response.assert_has_calls(
        [call(inv) for inv in mock_inventories]
    )

    # Assert that the result is a list of InventoryResponse objects
    assert result == expected_response
    assert all(isinstance(item, InventoryResponse) for item in result.inventory)

    # Optional: Add more specific assertions about the content of the InventoryResponse objects if needed
    for response in result.inventory:
        assert response.device_id == device_id
        assert response.application_id == mock_app.id
        assert response.status == "pending"
        assert response.application is not None


def test_delete_inventory_item(inventory_service, mock_inventory_repository):
    set_org_id("org_123")
    inventory_id = "inv_123"
    mock_inventory_repository.delete.return_value = True
    mock_inventory_repository.get.return_value = Mock(device_id="device_123")
    inventory_service.device_repository.get.return_value = Mock(org_id="org_123")
    result = inventory_service.delete_inventory_item(inventory_id)

    assert result == {"message": f"Inventory item {inventory_id} successfully deleted"}
    mock_inventory_repository.delete.assert_called_once_with(inventory_id)


def test_delete_inventory_item_not_found(inventory_service, mock_inventory_repository):
    inventory_id = "nonexistent_inv"
    set_org_id("org_123")
    mock_inventory_repository.delete.return_value = False
    mock_inventory_repository.get.return_value = Mock(device_id="device_123")
    inventory_service.device_repository.get.return_value = Mock(org_id="org_123")
    with pytest.raises(ObjectNotFoundException) as exc_info:
        inventory_service.delete_inventory_item(inventory_id)

    assert str(exc_info.value) == f"Inventory item with id {inventory_id} not found"
    mock_inventory_repository.delete.assert_called_once_with(inventory_id)


def test_approve_application(
    inventory_service, mock_application_repository, mock_inventory_repository
):
    application_id = "app_123"
    mock_application = Mock()
    mock_application.configure_mock(
        id=application_id,
        name="Test App",
        version="1.0.0",
        publisher="Test Publisher",
        hash="abcdef123456",
        status=ApprovalStatus.PENDING,
        organization_id="org_123",
    )
    mock_approve_application = Mock()
    mock_approve_application.configure_mock(
        id=application_id,
        name="Test App",
        version="1.0.0",
        publisher="Test Publisher",
        hash="abcdef123456",
        status=ApprovalStatus.APPROVED,
        organization_id="org_123",
    )
    set_org_id("org_123")
    mock_application_repository.get.return_value = mock_application
    mock_application_repository.approve_application.return_value = (
        mock_approve_application
    )
    mock_inventory_items = [
        Mock(status=ApprovalStatus.PENDING),
        Mock(status=ApprovalStatus.APPROVED),
    ]
    mock_inventory_repository.get_by_application_id.return_value = mock_inventory_items

    result = inventory_service.approve_application(application_id)

    assert isinstance(result, ApplicationResponse)
    assert result.id == application_id
    assert str(result.status) == str(ApprovalStatus.APPROVED)
    assert result.name == "Test App"
    assert result.version == "1.0.0"
    assert result.publisher == "Test Publisher"
    assert result.hash == "abcdef123456"
    assert result.organization_id == "org_123"
    mock_application_repository.approve_application.assert_called_once_with(
        application_id
    )
    mock_inventory_repository.get_by_application_id.assert_called_once_with(
        application_id
    )
    assert mock_inventory_items[0].status == ApprovalStatus.APPROVED
    assert isinstance(mock_inventory_items[0].approved_at, datetime)
    mock_inventory_repository.commit.assert_called_once()


def test_approve_application_not_found(inventory_service, mock_application_repository):
    application_id = "nonexistent_app"
    mock_application_repository.get.return_value = None
    mock_application_repository.approve_application.return_value = None

    with pytest.raises(ObjectNotFoundException) as exc_info:
        inventory_service.approve_application(application_id)

    assert str(exc_info.value) == f"Application with id {application_id} not found"
    mock_application_repository.get.assert_called_once_with(application_id)


def test_deny_application(
    inventory_service, mock_application_repository, mock_inventory_repository
):
    application_id = "app_123"
    mock_application = Mock()
    set_org_id("org_123")
    mock_application.configure_mock(
        id=application_id,
        name="Test App",
        version="1.0.0",
        publisher="Test Publisher",
        hash="abcdef123456",
        status=ApprovalStatus.PENDING,
        organization_id="org_123",
    )
    mock_deny_application = Mock()
    mock_deny_application.configure_mock(
        id=application_id,
        name="Test App",
        version="1.0.0",
        publisher="Test Publisher",
        hash="abcdef123456",
        status=ApprovalStatus.DENIED,
        organization_id="org_123",
    )
    set_org_id("org_123")
    mock_application_repository.get.return_value = mock_application
    mock_application_repository.deny_application.return_value = mock_deny_application
    mock_inventory_items = [
        Mock(status=ApprovalStatus.PENDING),
        Mock(status=ApprovalStatus.APPROVED),
    ]
    mock_inventory_repository.get_by_application_id.return_value = mock_inventory_items
    result = inventory_service.deny_application(application_id)

    assert isinstance(result, ApplicationResponse)
    assert result.id == application_id
    assert str(result.status) == str(ApprovalStatus.DENIED)
    assert result.name == "Test App"
    assert result.version == "1.0.0"
    assert result.publisher == "Test Publisher"
    assert result.hash == "abcdef123456"
    assert result.organization_id == "org_123"
    mock_application_repository.deny_application.assert_called_once_with(application_id)
    mock_inventory_repository.get_by_application_id.assert_called_once_with(
        application_id
    )
    assert mock_inventory_items[0].status == ApprovalStatus.DENIED
    assert mock_inventory_items[1].status == ApprovalStatus.DENIED
    assert isinstance(mock_inventory_items[0].denied_at, datetime)
    mock_inventory_repository.commit.assert_called_once()


def test_deny_application_not_found(inventory_service, mock_application_repository):
    application_id = "nonexistent_app"
    mock_application_repository.get.return_value = None
    mock_application_repository.deny_application.return_value = None

    with pytest.raises(ObjectNotFoundException) as exc_info:
        inventory_service.deny_application(application_id)

    assert str(exc_info.value) == f"Application with id {application_id} not found"
    mock_application_repository.get.assert_called_once_with(application_id)


def test_approve_applications(inventory_service):
    application_ids = ["app_1", "app_2"]
    mock_responses = [
        ApplicationResponse(
            id="app_1",
            status=ApprovalStatus.APPROVED,
            name="App1",
            version="1.0",
            publisher="pub1",
            hash="hash1",
            organization_id="org1",
        ),
        ApplicationResponse(
            id="app_2",
            status=ApprovalStatus.APPROVED,
            name="App2",
            version="2.0",
            publisher="pub1",
            hash="hash1",
            organization_id="org1",
        ),
    ]
    inventory_service.approve_application = Mock(side_effect=mock_responses)

    result = inventory_service.approve_applications(application_ids)

    assert len(result) == 2
    assert all(isinstance(item, ApplicationResponse) for item in result)
    assert all(str(item.status) == str(ApprovalStatus.APPROVED) for item in result)
    inventory_service.approve_application.assert_has_calls(
        [call("app_1"), call("app_2")]
    )


def test_deny_applications(inventory_service):
    application_ids = ["app_1", "app_2"]
    mock_responses = [
        ApplicationResponse(
            id="app_1",
            status=ApprovalStatus.DENIED,
            name="App1",
            version="1.0",
            publisher="pub1",
            hash="hash1",
            organization_id="org1",
        ),
        ApplicationResponse(
            id="app_2",
            status=ApprovalStatus.DENIED,
            name="App2",
            version="2.0",
            publisher="pub1",
            hash="hash1",
            organization_id="org1",
        ),
    ]
    inventory_service.deny_application = Mock(side_effect=mock_responses)

    result = inventory_service.deny_applications(application_ids)

    assert len(result) == 2
    assert all(isinstance(item, ApplicationResponse) for item in result)
    assert all(str(item.status) == str(ApprovalStatus.DENIED) for item in result)
    inventory_service.deny_application.assert_has_calls([call("app_1"), call("app_2")])
