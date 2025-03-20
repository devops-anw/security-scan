from uuid import uuid4

import pytest

from .conftest import BASE_URL


@pytest.fixture(scope="function")
def test_device(api_client, test_org_id, jwt_token):
    org_id = test_org_id
    device_data = {
        "name": "Test Device",
        "type": "Sensor",
        "serial_number": f"SN-{uuid4()}",
    }
    response = api_client.post(
        f"{BASE_URL}/devices/", json=device_data, headers={"X-Org-Key": org_id}
    )
    assert response.status_code == 200, f"Failed to create device: {response.text}"
    device = response.json()
    yield device
    # Cleanup
    try:
        # First, get the device's inventory
        get_inventory_response = api_client.get(
            f"{BASE_URL}/devices/{device['id']}/inventory",
            headers={"Authorization": f"Bearer {jwt_token}"},
        )

        if get_inventory_response.status_code == 200:
            inventory = get_inventory_response.json()
            for inventory_item in inventory:
                delete_inventory_response = api_client.delete(
                    f"{BASE_URL}/inventory/{inventory_item['id']}",
                    headers={"Authorization": f"Bearer {jwt_token}"},
                )
                assert delete_inventory_response.status_code in [
                    200,
                    204,
                ], f"Failed to delete inventory item: {delete_inventory_response.text}"

        # Then, delete the device
        delete_device_response = api_client.delete(
            f"{BASE_URL}/devices/{device['id']}",
            headers={"X-Org-Key": org_id},
        )
        assert delete_device_response.status_code in [
            200,
            204,
        ], f"Failed to delete device: {delete_device_response.text}"
    except Exception as e:
        pytest.fail(f"Failed to clean up: {str(e)}")


@pytest.mark.integration
def test_create_application(api_client, test_org_id, jwt_token):
    application_data = {
        "name": "New Test App",
        "version": "1.0.0",
        "publisher": "Test Publisher",
        "hash": "newhash123",
    }

    response = api_client.post(
        f"{BASE_URL}/applications",
        json=application_data,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    assert response.status_code == 200, f"Failed to create application: {response.text}"
    created_app = response.json()
    assert created_app["name"] == application_data["name"]
    assert created_app["version"] == application_data["version"]
    assert "id" in created_app


@pytest.mark.integration
def test_list_applications(api_client, test_org_id, jwt_token):
    response = api_client.get(
        f"{BASE_URL}/applications", headers={"Authorization": f"Bearer {jwt_token}"}
    )

    assert response.status_code == 200, f"Failed to list applications: {response.text}"
    applications = response.json()
    assert isinstance(applications, list)


@pytest.mark.integration
def test_create_device_inventory(api_client, test_device, test_org_id, jwt_token):
    inventory_data = {
        "items": [
            {
                "name": "Test Application",
                "version": "1.0.0",
                "hash": "abc123",
                "publisher": "Test Publisher",
                "path": "/test/path",
            }
        ]
    }

    response = api_client.post(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        json=inventory_data,
        headers={"X-Org-Key": test_org_id},
    )

    assert (
        response.status_code == 200
    ), f"Expected status code 200, but got {response.status_code}. Response: {response.text}"
    created_inventory = response.json()

    assert isinstance(created_inventory, list), "Expected a list of inventory items"
    assert len(created_inventory) == 1, "Expected one inventory item to be created"

    inventory_item = created_inventory[0]
    assert "id" in inventory_item, "Inventory item should have an id"
    assert inventory_item["device_id"] == test_device["id"], "Device ID should match"
    assert (
        "application_id" in inventory_item
    ), "Inventory item should have an application_id"

    # Fetch the created inventory to double-check
    get_response = api_client.get(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        get_response.status_code == 200
    ), f"Failed to fetch inventory: {get_response.text}"
    fetched_inventory = get_response.json()

    assert len(fetched_inventory) == 1, "Expected one inventory item"
    assert (
        fetched_inventory[0]["id"] == inventory_item["id"]
    ), "Fetched inventory item should match created item"


@pytest.mark.integration
def test_get_device_inventory(api_client, test_device, test_org_id, jwt_token):
    org_id = test_org_id
    # First, create some inventory items
    inventory_data = {
        "items": [
            {
                "name": "Test Application 1",
                "version": "1.0.0",
                "hash": "abc123",
                "publisher": "Test Publisher",
                "path": "/test/path1",
            },
            {
                "name": "Test Application 2",
                "version": "2.0.0",
                "hash": "def456",
                "publisher": "Another Publisher",
                "path": "/test/path2",
            },
        ]
    }

    create_response = api_client.post(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        json=inventory_data,
        headers={"X-Org-Key": org_id},
    )
    assert (
        create_response.status_code == 200
    ), f"Failed to create inventory: {create_response.text}"
    created_inventory = create_response.json()

    # Now, get the device inventory
    get_response = api_client.get(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )

    assert (
        get_response.status_code == 200
    ), f"Failed to get inventory: {get_response.text}"
    fetched_inventory = get_response.json()

    # Verify the fetched inventory
    assert isinstance(fetched_inventory, list), "Expected a list of inventory items"
    assert len(fetched_inventory) == len(
        inventory_data["items"]
    ), "Number of fetched items doesn't match created items"

    for created_item, fetched_item in zip(created_inventory, fetched_inventory):
        assert (
            fetched_item["id"] == created_item["id"]
        ), "Fetched item ID doesn't match created item ID"
        assert fetched_item["device_id"] == test_device["id"], "Device ID should match"
        assert (
            "application_id" in fetched_item
        ), "Inventory item should have an application_id"
        assert fetched_item["application"]["name"] in [
            item["name"] for item in inventory_data["items"]
        ], "Application name should match one of the created items"
        assert fetched_item["application"]["version"] in [
            item["version"] for item in inventory_data["items"]
        ], "Application version should match one of the created items"

    # Optionally, test getting inventory for a device with no inventory
    empty_device_id = str(uuid4())
    empty_response = api_client.get(
        f"{BASE_URL}/devices/{empty_device_id}/inventory",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        empty_response.status_code == 404
    ), f"Unexpected status code: {empty_response.status_code}"


@pytest.mark.integration
def test_sync_device_inventory(api_client, test_device, test_org_id, jwt_token):
    org_id = test_org_id
    # First, create initial inventory items
    initial_inventory_data = {
        "items": [
            {
                "name": "Initial App 1",
                "version": "1.0.0",
                "hash": "abc123",
                "publisher": "Test Publisher",
                "path": "/test/path1",
            },
            {
                "name": "Initial App 2",
                "version": "2.0.0",
                "hash": "def456",
                "publisher": "Another Publisher",
                "path": "/test/path2",
            },
        ]
    }

    create_response = api_client.post(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        json=initial_inventory_data,
        headers={"X-Org-Key": org_id},
    )
    assert (
        create_response.status_code == 200
    ), f"Failed to create initial inventory: {create_response.text}"
    initial_inventory = create_response.json()

    # Prepare sync data: remove one app and add a new one
    sync_data = {
        "removed_app_ids": [
            initial_inventory[0]["application_id"]
        ],  # Remove the first app
        "added_apps": [
            {
                "name": "New App 3",
                "version": "3.0.0",
                "hash": "ghi789",
                "publisher": "New Publisher",
                "path": "/test/path3",
            }
        ],
    }

    # Perform sync operation
    sync_response = api_client.post(
        f"{BASE_URL}/devices/{test_device['id']}/inventory/sync",
        json=sync_data,
        headers={"X-Org-Key": org_id},
    )
    assert (
        sync_response.status_code == 200
    ), f"Failed to sync inventory: {sync_response.text}"
    synced_inventory = sync_response.json()

    # Verify the synced inventory
    assert isinstance(synced_inventory, list), "Expected a list of inventory items"
    assert len(synced_inventory) == 2, "Expected two inventory items after sync"

    # Check that the removed app is no longer in the inventory
    assert all(
        item["application_id"] != initial_inventory[0]["application_id"]
        for item in synced_inventory
    ), "Removed app should not be in synced inventory"

    # Check that the remaining initial app and the new app are in the synced inventory
    app_names = [item["application"]["name"] for item in synced_inventory]
    assert (
        "Initial App 2" in app_names
    ), "Expected 'Initial App 2' to remain in inventory"
    assert "New App 3" in app_names, "Expected 'New App 3' to be added to inventory"

    # Verify the details of the new app
    new_app = next(
        item for item in synced_inventory if item["application"]["name"] == "New App 3"
    )
    assert new_app["application"]["version"] == "3.0.0"
    assert new_app["application"]["publisher"] == "New Publisher"

    # Double-check by getting the inventory
    get_response = api_client.get(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        get_response.status_code == 200
    ), f"Failed to get inventory after sync: {get_response.text}"
    final_inventory = get_response.json()

    assert len(final_inventory) == 2, "Final inventory should have two items"
    assert set(item["id"] for item in final_inventory) == set(
        item["id"] for item in synced_inventory
    ), "Final inventory should match synced inventory"


@pytest.mark.integration
def test_approve_deny_inventory_item(api_client, test_device, test_org_id, jwt_token):
    org_id = test_org_id
    # First, create an inventory item
    inventory_data = {
        "items": [
            {
                "name": "Test Application",
                "version": "1.0.0",
                "hash": "abc123",
                "publisher": "Test Publisher",
                "path": "/test/path",
            }
        ]
    }

    create_response = api_client.post(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        json=inventory_data,
        headers={"X-Org-Key": org_id},
    )
    assert (
        create_response.status_code == 200
    ), f"Failed to create inventory: {create_response.text}"
    created_inventory = create_response.json()
    inventory_item_id = created_inventory[0]["id"]

    # Test approving the inventory item
    approve_response = api_client.post(
        f"{BASE_URL}/inventory/{inventory_item_id}/approve",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        approve_response.status_code == 200
    ), f"Failed to approve inventory item: {approve_response.text}"
    approved_item = approve_response.json()
    assert approved_item["status"] == "approved", "Inventory item should be approved"
    assert (
        approved_item["approved_at"] is not None
    ), "Approved item should have approved_at timestamp"

    # Verify the approved status by getting the inventory
    get_response = api_client.get(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        get_response.status_code == 200
    ), f"Failed to get inventory: {get_response.text}"
    fetched_inventory = get_response.json()
    assert (
        fetched_inventory[0]["status"] == "approved"
    ), "Fetched inventory item should be approved"

    # Test denying the inventory item
    deny_response = api_client.post(
        f"{BASE_URL}/inventory/{inventory_item_id}/deny",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        deny_response.status_code == 200
    ), f"Failed to deny inventory item: {deny_response.text}"
    denied_item = deny_response.json()
    assert denied_item["status"] == "denied", "Inventory item should be denied"
    assert (
        denied_item["denied_at"] is not None
    ), "Denied item should have denied_at timestamp"

    # Verify the denied status by getting the inventory
    get_response = api_client.get(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        get_response.status_code == 200
    ), f"Failed to get inventory: {get_response.text}"
    fetched_inventory = get_response.json()
    assert (
        fetched_inventory[0]["status"] == "denied"
    ), "Fetched inventory item should be denied"

    # Test approving/denying a non-existent inventory item
    non_existent_id = str(uuid4())
    error_response = api_client.post(
        f"{BASE_URL}/inventory/{non_existent_id}/approve",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        error_response.status_code == 404
    ), f"Expected 404 for non-existent item, got: {error_response.status_code}"

    error_response = api_client.post(
        f"{BASE_URL}/inventory/{non_existent_id}/deny",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        error_response.status_code == 404
    ), f"Expected 404 for non-existent item, got: {error_response.status_code}"


@pytest.mark.integration
def test_delete_inventory_item(api_client, test_device, test_org_id, jwt_token):
    # First, create an inventory item
    inventory_data = {
        "items": [
            {
                "name": "Test Application",
                "version": "1.0.0",
                "hash": "abc123",
                "publisher": "Test Publisher",
                "path": "/test/path",
            }
        ]
    }
    create_response = api_client.post(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        json=inventory_data,
        headers={"X-Org-Key": test_org_id},
    )
    assert create_response.status_code == 200
    created_inventory = create_response.json()
    inventory_item_id = created_inventory[0]["id"]

    # Now delete the inventory item
    delete_response = api_client.delete(
        f"{BASE_URL}/inventory/{inventory_item_id}",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        delete_response.status_code == 200
    ), f"Failed to delete inventory item: {delete_response.text}"

    # Verify the item is deleted
    get_response = api_client.get(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert get_response.status_code == 404


@pytest.mark.integration
def test_approve_deny_application(api_client, test_org_id, jwt_token):
    # First, create an application
    application_data = {
        "name": "App for Approval",
        "version": "1.0.0",
        "publisher": "Test Publisher",
        "hash": "approvedhash123",
    }
    create_response = api_client.post(
        f"{BASE_URL}/applications",
        json=application_data,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert create_response.status_code == 200
    created_app = create_response.json()
    app_id = created_app["id"]

    # Test approving the application
    approve_response = api_client.post(
        f"{BASE_URL}/applications/{app_id}/approve",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        approve_response.status_code == 200
    ), f"Failed to approve application: {approve_response.text}"
    approved_app = approve_response.json()
    assert approved_app["status"] == "approved", "Application should be approved"

    # Test denying the application
    deny_response = api_client.post(
        f"{BASE_URL}/applications/{app_id}/deny",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        deny_response.status_code == 200
    ), f"Failed to deny application: {deny_response.text}"
    denied_app = deny_response.json()
    assert denied_app["status"] == "denied", "Application should be denied"


@pytest.mark.integration
def test_bulk_approve_deny_applications(api_client, test_org_id, jwt_token):
    # Create multiple applications
    app_ids = []
    for i in range(3):
        application_data = {
            "name": f"Bulk App {i}",
            "version": "1.0.0",
            "publisher": "Test Publisher",
            "hash": f"bulkhash{i}",
        }
        create_response = api_client.post(
            f"{BASE_URL}/applications",
            json=application_data,
            headers={"Authorization": f"Bearer {jwt_token}"},
        )
        assert create_response.status_code == 200
        app_ids.append(create_response.json()["id"])

    # Test bulk approve
    bulk_approve_response = api_client.post(
        f"{BASE_URL}/applications/bulk-approve",
        json=app_ids,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        bulk_approve_response.status_code == 200
    ), f"Failed to bulk approve applications: {bulk_approve_response.text}"
    approved_apps = bulk_approve_response.json()
    assert len(approved_apps) == 3, "All applications should be approved"
    assert all(app["status"] == "approved" for app in approved_apps)

    # Test bulk deny
    bulk_deny_response = api_client.post(
        f"{BASE_URL}/applications/bulk-deny",
        json=app_ids,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        bulk_deny_response.status_code == 200
    ), f"Failed to bulk deny applications: {bulk_deny_response.text}"
    denied_apps = bulk_deny_response.json()
    assert len(denied_apps) == 3, "All applications should be denied"
    assert all(app["status"] == "denied" for app in denied_apps)


@pytest.mark.integration
def test_bulk_approve_deny_inventory_items(
    api_client, test_device, test_org_id, jwt_token
):
    org_id = test_org_id
    # Create multiple inventory items
    inventory_data = {
        "items": [
            {
                "name": f"Bulk Inventory App {i}",
                "version": "1.0.0",
                "hash": f"bulkinvhash{i}",
                "publisher": "Test Publisher",
                "path": f"/test/path{i}",
            }
            for i in range(3)
        ]
    }
    create_response = api_client.post(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        json=inventory_data,
        headers={"X-Org-Key": org_id},
    )
    assert create_response.status_code == 200
    created_inventory = create_response.json()
    inventory_ids = [item["id"] for item in created_inventory]

    # Test bulk approve inventory items
    bulk_approve_response = api_client.post(
        f"{BASE_URL}/inventory/bulk-approve",
        json=inventory_ids,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        bulk_approve_response.status_code == 200
    ), f"Failed to bulk approve inventory items: {bulk_approve_response.text}"
    approved_items = bulk_approve_response.json()
    assert len(approved_items) == 3, "All inventory items should be approved"
    assert all(item["status"] == "approved" for item in approved_items)

    # Test bulk deny inventory items
    bulk_deny_response = api_client.post(
        f"{BASE_URL}/inventory/bulk-deny",
        json=inventory_ids,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert (
        bulk_deny_response.status_code == 200
    ), f"Failed to bulk deny inventory items: {bulk_deny_response.text}"
    denied_items = bulk_deny_response.json()
    assert len(denied_items) == 3, "All inventory items should be denied"
    assert all(item["status"] == "denied" for item in denied_items)


@pytest.mark.integration
def test_get_device_agent_inventory(api_client, test_device, test_org_id):
    org_id = test_org_id
    # First, create some inventory items
    inventory_data = {
        "items": [
            {
                "name": "Agent App 1",
                "version": "1.0.0",
                "hash": "abc123",
                "publisher": "Test Publisher",
                "path": "/test/path1",
            },
            {
                "name": "Agent App 2",
                "version": "2.0.0",
                "hash": "def456",
                "publisher": "Another Publisher",
                "path": "/test/path2",
            },
        ]
    }

    create_response = api_client.post(
        f"{BASE_URL}/devices/{test_device['id']}/inventory",
        json=inventory_data,
        headers={"X-Org-Key": org_id},
    )
    assert (
        create_response.status_code == 200
    ), f"Failed to create inventory: {create_response.text}"

    # Now, get the device inventory using the agent-inventory endpoint
    get_response = api_client.get(
        f"{BASE_URL}/devices/{test_device['id']}/agent-inventory",
        headers={"X-Org-Key": org_id},
    )

    assert (
        get_response.status_code == 200
    ), f"Failed to get agent inventory: {get_response.text}"
    fetched_inventory = get_response.json()

    # Verify the fetched inventory
    assert isinstance(fetched_inventory, list), "Expected a list of inventory items"
    assert len(fetched_inventory) == len(
        inventory_data["items"]
    ), "Number of fetched items doesn't match created items"

    for fetched_item in fetched_inventory:
        assert fetched_item["device_id"] == test_device["id"], "Device ID should match"
        assert (
            "application_id" in fetched_item
        ), "Inventory item should have an application_id"
        assert fetched_item["application"]["name"] in [
            item["name"] for item in inventory_data["items"]
        ], "Application name should match one of the created items"
        assert fetched_item["application"]["version"] in [
            item["version"] for item in inventory_data["items"]
        ], "Application version should match one of the created items"

    # Test with a non-existent device
    non_existent_device_id = str(uuid4())
    error_response = api_client.get(
        f"{BASE_URL}/devices/{non_existent_device_id}/agent-inventory",
        headers={"X-Org-Key": org_id},
    )
    assert (
        error_response.status_code == 404
    ), f"Expected 404 for non-existent device, got: {error_response.status_code}"
