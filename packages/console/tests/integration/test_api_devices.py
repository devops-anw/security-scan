from uuid import uuid4

import pytest

from .conftest import BASE_URL


@pytest.fixture(scope="module")
def test_device(api_client, test_org_id):
    # Create a test device and yield it for the tests
    device_data = {
        "name": "Test Device",
        "type": "Sensor",
        "serial_number": f"SN-{uuid4()}",
        "properties": {
            "location": "Test Location",
            "manufacturer": "TechCorp",
            "model": "SensorPro X1",
            "mac_address": "00:1B:44:11:3A:B7",
        },
    }
    response = api_client.post(
        f"{BASE_URL}/devices", json=device_data, headers={"X-Org-Key": test_org_id}
    )
    device = response.json()
    yield device
    # Cleanup after tests
    api_client.delete(f"{BASE_URL}/devices/{device['id']}")


@pytest.mark.integration
def test_create_device(api_client, test_org_id):
    org_id = test_org_id
    device_data = {
        "name": "New Test Device",
        "type": "Sensor",
        "serial_number": f"SN-{uuid4()}",
        "properties": {
            "location": "Test Location",
            "manufacturer": "TechCorp",
            "model": "SensorPro X1",
            "mac_address": "00:1B:44:11:3A:B7",
        },
    }
    response = api_client.post(
        f"{BASE_URL}/devices", json=device_data, headers={"X-Org-Key": org_id}
    )
    assert response.status_code == 200
    created_device = response.json()
    assert created_device["name"] == device_data["name"]
    # Cleanup
    api_client.delete(
        f"{BASE_URL}/devices/{created_device['id']}", headers={"X-Org-Key": org_id}
    )


@pytest.mark.integration
def test_get_device(api_client, test_device, jwt_token):
    response = api_client.get(
        f"{BASE_URL}/devices/{test_device['id']}",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert response.status_code == 200
    fetched_device = response.json()
    assert fetched_device["id"] == test_device["id"]


@pytest.mark.integration
def test_update_device(api_client, test_device):
    update_data = {"name": "Updated Device Name"}
    response = api_client.put(
        f"{BASE_URL}/devices/{test_device['id']}",
        json=update_data,
        headers={"X-Org-Key": test_device["org_id"]},
    )
    assert response.status_code == 200
    updated_device = response.json()
    assert updated_device["name"] == update_data["name"]


@pytest.mark.integration
def test_device_heartbeat(api_client, test_device):
    # Send heartbeat
    response = api_client.post(
        f"{BASE_URL}/devices/{test_device['id']}/heartbeat",
        headers={"X-Org-Key": test_device["org_id"]},
    )

    assert response.status_code == 200
    updated_device = response.json()
    assert "last_seen" in updated_device


@pytest.mark.integration
def test_delete_device(api_client, test_org_id, jwt_token):
    org_id = test_org_id
    # Create a device to delete
    device_data = {
        "name": "Device to Delete",
        "type": "Sensor",
        "serial_number": f"SN-{uuid4()}",
    }
    create_response = api_client.post(
        f"{BASE_URL}/devices", json=device_data, headers={"X-Org-Key": org_id}
    )
    created_device = create_response.json()

    # Delete the device
    delete_response = api_client.delete(
        f"{BASE_URL}/devices/{created_device['id']}", headers={"X-Org-Key": org_id}
    )
    assert delete_response.status_code == 200

    # Verify deletion
    get_response = api_client.get(
        f"{BASE_URL}/devices/{created_device['id']}",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert get_response.status_code == 404
