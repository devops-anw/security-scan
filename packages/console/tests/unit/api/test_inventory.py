from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.api.v1.endpoints.inventory import (
    get_application_service,
    get_inventory_service,
)
from app.core.auth import get_org_from_api_key
from app.core.exceptions import ObjectNotFoundException
from app.main import app
from app.schemas.application import (
    Application,
    ApplicationBase,
    ApplicationCreate,
    ApplicationResponse,
    ApplicationListResponse,
    ApprovalStatus,
)
from app.schemas.inventory import (
    InventoryCreate,
    InventoryListResponse,
    InventoryResponse,
    InventoryUpdate,
)

client = TestClient(app)

API_PREFIX = "/console/v1.0"
ORG_KEY = "test_org_key"


@pytest.fixture(autouse=True)
def override_dependencies(mock_inventory_service, mock_application_service):
    app.dependency_overrides[get_inventory_service] = lambda: mock_inventory_service
    app.dependency_overrides[get_application_service] = lambda: mock_application_service
    app.dependency_overrides[get_org_from_api_key] = lambda: ORG_KEY
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def sample_application():
    return Application(
        id="app_123",
        name="TestApp",
        version="1.0",
        publisher="TestPublisher",
        hash="abcdef123456",
        organization_id=ORG_KEY,
    )


@pytest.fixture
def sample_application_response():
    return ApplicationResponse(
        id="app_123",
        name="TestApp",
        version="1.0",
        publisher="TestPublisher",
        hash="abcdef123456",
        organization_id=ORG_KEY,
        status=ApprovalStatus.PENDING,
    )


def test_create_application(mock_application_service, sample_application):
    mock_application_service.create_application.return_value = sample_application
    app_base = ApplicationBase(
        name="TestApp",
        version="1.0",
        publisher="TestPublisher",
        hash="abcdef123456",
    )
    response = client.post(
        f"{API_PREFIX}/applications",
        json=app_base.model_dump(),
        headers={"Authorization": f"Bearer {ORG_KEY}"},
    )
    assert response.status_code == 200
    assert response.json() == sample_application.model_dump()


def test_list_applications(mock_application_service, sample_application_response):
    mock_application_service.get_by_org.return_value = ApplicationListResponse(
        applications=[sample_application_response], message=None, total_count=2
    )
    response = client.get(
        f"{API_PREFIX}/applications",
        headers={"Authorization": f"Bearer {ORG_KEY}"},
    )
    assert response.status_code == 200
    assert response.json()["applications"] == [sample_application_response.model_dump()]


def test_create_device_inventory(mock_inventory_service, sample_application):
    # Prepare the input data
    device_id = "device_123"
    inventory_create = InventoryCreate(
        items=[
            ApplicationBase(
                **sample_application.model_dump(exclude={"id", "organization_id"})
            )
        ],
    )

    # Prepare the mock response from the service
    mock_inventory_response = InventoryResponse(
        id="inv_123",
        device_id=device_id,
        application_id=sample_application.id,
        status=ApprovalStatus.PENDING,
        approved_at=None,
        denied_at=None,
        last_updated=datetime.fromisoformat("2023-01-01T00:00:00"),
        application=ApplicationResponse(
            id=sample_application.id,
            name=sample_application.name,
            version=sample_application.version,
            publisher=sample_application.publisher,
            hash=sample_application.hash,
            status=ApprovalStatus.APPROVED,
            organization_id=sample_application.organization_id,
        ),
    )

    # Set up the mock service to return our prepared response
    mock_inventory_service.create_inventory.return_value = [mock_inventory_response]

    # Make the API call
    response = client.post(
        f"{API_PREFIX}/devices/{device_id}/inventory",
        json=inventory_create.model_dump(mode="json"),
        headers={"X-Org-Key": ORG_KEY},
    )

    # Check the response status code
    assert response.status_code == 200

    # Get the response JSON
    response_json = response.json()

    # Prepare the expected output
    expected_output = mock_inventory_response.model_dump(mode="json")

    # Assert the response matches our expectation
    assert response_json == [expected_output]

    # Verify that the service method was called correctly
    mock_inventory_service.create_inventory.assert_called_once()
    actual_call_args1 = mock_inventory_service.create_inventory.call_args[0][0]
    actual_call_args2 = mock_inventory_service.create_inventory.call_args[0][1]
    assert actual_call_args1 == device_id
    assert len(actual_call_args2.items) == len(inventory_create.items)
    assert (
        actual_call_args2.items[0].model_dump()
        == inventory_create.items[0].model_dump()
    )


def test_get_device_inventory(
    mock_inventory_service, sample_application, mock_jwt_required
):
    total_count = 2
    mock_inventory = InventoryResponse(
        device_id="device_123",
        id="inv_123",
        application_id=sample_application.id,
        status=ApprovalStatus.PENDING,
        approved_at=None,
        denied_at=None,
        last_updated="2023-01-01T00:00:00",
        application=ApplicationResponse(
            id=sample_application.id,
            name=sample_application.name,
            version=sample_application.version,
            publisher=sample_application.publisher,
            hash=sample_application.hash,
            status=ApprovalStatus.PENDING,
            organization_id=sample_application.organization_id,
        ),
    )
    mock_inventory_service.get_device_inventory.return_value = InventoryListResponse(
        inventory=[mock_inventory], total=total_count, skip=0, limit=100
    )
    response = client.get(
        f"{API_PREFIX}/devices/device_123/inventory",
        headers={"Authorization": f"Bearer {sample_application.organization_id}"},
    )
    assert response.status_code == 200
    # Get the response JSON
    response_json = response.json()

    # Modify the expected output to match the serialized format
    expected_output = mock_inventory.model_dump()
    expected_output["last_updated"] = "2023-01-01T00:00:00"
    expected_output["application"]["status"] = "pending"
    expected_output["status"] = "pending"
    expected_output["approved_at"] = None

    assert response_json["inventory"] == [expected_output]
    assert response_json["total"] == total_count
    assert response_json["skip"] == 0
    assert response_json["limit"] == 100


def test_get_device_agent_inventory(mock_inventory_service, sample_application):
    mock_inventory = InventoryResponse(
        device_id="device_123",
        id="inv_123",
        application_id=sample_application.id,
        status=ApprovalStatus.PENDING,
        approved_at=None,
        denied_at=None,
        last_updated="2023-01-01T00:00:00",
        application=ApplicationResponse(
            id=sample_application.id,
            name=sample_application.name,
            version=sample_application.version,
            publisher=sample_application.publisher,
            hash=sample_application.hash,
            status=ApprovalStatus.PENDING,
            organization_id=sample_application.organization_id,
        ),
    )
    mock_inventory_service.get_device_inventory.return_value = [mock_inventory]
    response = client.get(
        f"{API_PREFIX}/devices/device_123/agent-inventory",
        headers={"X-Org-Key": ORG_KEY},
    )
    assert response.status_code == 200
    # Get the response JSON
    response_json = response.json()

    # Modify the expected output to match the serialized format
    expected_output = mock_inventory.model_dump()
    expected_output["last_updated"] = "2023-01-01T00:00:00"
    expected_output["application"]["status"] = "pending"
    expected_output["status"] = "pending"
    expected_output["approved_at"] = None

    assert response_json == [expected_output]


def test_sync_device_inventory(mock_inventory_service, sample_application):
    # Prepare the input data
    inventory_update = InventoryUpdate(
        added_apps=[ApplicationCreate(**sample_application.model_dump())],
        removed_app_ids=["old_app_id"],
    )

    # Create a mock InventoryResponse
    mock_inventory_response = InventoryResponse(
        id="inv_123",
        device_id="device_123",
        application_id=sample_application.id,
        status=ApprovalStatus.PENDING,
        approved_at=None,
        denied_at=None,
        last_updated=datetime.fromisoformat("2023-01-01T00:00:00").replace(
            tzinfo=timezone.utc
        ),
        application=ApplicationResponse(
            id=sample_application.id,
            name=sample_application.name,
            version=sample_application.version,
            publisher=sample_application.publisher,
            hash=sample_application.hash,
            status=ApprovalStatus.PENDING,
            organization_id=sample_application.organization_id,
        ),
    )

    # Set up the mock service to return our prepared response
    mock_inventory_service.update_inventory.return_value = [mock_inventory_response]

    # Make the API call
    response = client.post(
        f"{API_PREFIX}/devices/device_123/inventory/sync",
        json=inventory_update.model_dump(mode="json"),
        headers={"X-Org-Key": ORG_KEY},
    )

    # Check the response status code
    assert response.status_code == 200

    # Get the response JSON
    response_json = response.json()

    # Prepare the expected output
    expected_output = mock_inventory_response.model_dump(mode="json")

    # Assert the response matches our expectation
    assert response_json == [expected_output]

    # Verify that the service method was called correctly
    mock_inventory_service.update_inventory.assert_called_once_with(
        "device_123", inventory_update
    )


def test_create_application_invalid_data(mock_application_service):
    response = client.post(
        f"{API_PREFIX}/applications",
        json={"name": "TestApp"},
        headers={"Authorization": f"Bearer {ORG_KEY}"},
    )
    assert response.status_code == 400


def test_sync_device_inventory_invalid_data(mock_inventory_service):
    response = client.post(
        f"{API_PREFIX}/devices/device_123/inventory/sync",
        json={"added_apps": []},
        headers={"X-Org-Key": ORG_KEY},
    )
    assert response.status_code == 400


def test_delete_inventory_item(mock_inventory_service):
    mock_inventory_service.delete_inventory_item.return_value = {
        "message": "Inventory item inv_123 successfully deleted"
    }

    response = client.delete(
        f"{API_PREFIX}/inventory/inv_123",
        headers={"Authorization": f"Bearer {ORG_KEY}"},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Inventory item inv_123 successfully deleted"}
    mock_inventory_service.delete_inventory_item.assert_called_once_with("inv_123")


def test_delete_nonexistent_inventory_item(mock_inventory_service):
    mock_inventory_service.delete_inventory_item.side_effect = ObjectNotFoundException(
        message="Inventory item with id nonexistent_id not found"
    )

    response = client.delete(
        f"{API_PREFIX}/inventory/nonexistent_id",
        headers={"Authorization": f"Bearer {ORG_KEY}"},
    )

    assert response.status_code == 404
    # Print the response JSON to inspect its structure
    print(response.json())
    assert response.json()["error"] == "Inventory item with id nonexistent_id not found"


def test_approve_application(mock_inventory_service, sample_application):
    mock_application_response = ApplicationResponse(
        **sample_application.model_dump(), status=ApprovalStatus.APPROVED
    )
    mock_inventory_service.approve_application.return_value = mock_application_response

    response = client.post(
        f"{API_PREFIX}/applications/{sample_application.id}/approve",
        headers={"Authorization": f"Bearer {sample_application.organization_id}"},
    )

    assert response.status_code == 200
    assert response.json() == mock_application_response.model_dump(mode="json")
    mock_inventory_service.approve_application.assert_called_once_with(
        sample_application.id
    )


def test_deny_application(mock_inventory_service, sample_application):
    mock_application_response = ApplicationResponse(
        **sample_application.model_dump(), status=ApprovalStatus.DENIED
    )
    mock_inventory_service.deny_application.return_value = mock_application_response

    response = client.post(
        f"{API_PREFIX}/applications/{sample_application.id}/deny",
        headers={"Authorization": f"Bearer {sample_application.organization_id}"},
    )

    assert response.status_code == 200
    assert response.json() == mock_application_response.model_dump(mode="json")
    mock_inventory_service.deny_application.assert_called_once_with(
        sample_application.id
    )


def test_bulk_approve_applications(mock_inventory_service, sample_application):
    application_ids = ["app_1", "app_2"]
    mock_responses = [
        ApplicationResponse(
            **{**sample_application.model_dump(), "status": ApprovalStatus.APPROVED}
        ),
        ApplicationResponse(
            **{
                **sample_application.model_dump(),
                "id": "app_2",
                "status": ApprovalStatus.APPROVED,
            }
        ),
    ]
    mock_inventory_service.approve_applications.return_value = mock_responses

    response = client.post(
        f"{API_PREFIX}/applications/bulk-approve",
        json=application_ids,
        headers={"Authorization": f"Bearer {sample_application.organization_id}"},
    )

    assert response.status_code == 200
    assert response.json() == [resp.model_dump(mode="json") for resp in mock_responses]
    mock_inventory_service.approve_applications.assert_called_once_with(application_ids)


def test_bulk_deny_applications(mock_inventory_service, sample_application):
    application_ids = ["app_1", "app_2"]
    mock_responses = [
        ApplicationResponse(
            **{**sample_application.model_dump(), "status": ApprovalStatus.APPROVED}
        ),
        ApplicationResponse(
            **{
                **sample_application.model_dump(),
                "id": "app_2",
                "status": ApprovalStatus.APPROVED,
            }
        ),
    ]
    mock_inventory_service.deny_applications.return_value = mock_responses

    response = client.post(
        f"{API_PREFIX}/applications/bulk-deny",
        json=application_ids,
        headers={"Authorization": f"Bearer {sample_application.organization_id}"},
    )

    assert response.status_code == 200
    assert response.json() == [resp.model_dump(mode="json") for resp in mock_responses]
    mock_inventory_service.deny_applications.assert_called_once_with(application_ids)
