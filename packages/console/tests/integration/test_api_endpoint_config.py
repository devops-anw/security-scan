from uuid import uuid4

import pytest

from .conftest import BASE_URL


@pytest.fixture(scope="module")
def test_device(api_client, test_org_id, jwt_token):
    org_id = test_org_id
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
        f"{BASE_URL}/devices", json=device_data, headers={"X-Org-Key": org_id}
    )
    device = response.json()
    yield device
    # Cleanup after tests
    api_client.delete(
        f"{BASE_URL}/devices/{device['id']}", headers={"X-Org-Key": org_id}
    )


@pytest.mark.integration
def test_get_endpoint_config(api_client, test_device, jwt_token):
    response = api_client.get(
        f"{BASE_URL}/endpoint-config/{test_device['id']}",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert response.status_code == 200
    endpoint_config = response.json()
    assert endpoint_config["id"] == test_device["id"]
    assert "config" in endpoint_config


@pytest.mark.integration
def test_update_endpoint_config(api_client, test_device, jwt_token):
    update_data = {
        "config": {"MemcryptLog": {"POST_IP": "127.0.0.1", "PORT": 9999, "DEBUG": True}}
    }
    response = api_client.put(
        f"{BASE_URL}/endpoint-config/{test_device['id']}",
        json=update_data,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert response.status_code == 200
    updated_config = response.json()
    assert updated_config["id"] == test_device["id"]
    assert updated_config["config"]["MemcryptLog"]["POST_IP"] == "127.0.0.1"
    assert updated_config["config"]["MemcryptLog"]["PORT"] == 9999
    assert updated_config["config"]["MemcryptLog"]["DEBUG"] is True


@pytest.mark.integration
def test_get_org_endpoint_configs(api_client, test_device, jwt_token):
    response = api_client.get(
        f"{BASE_URL}/endpoint-config",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert response.status_code == 200
    configs = response.json()
    assert isinstance(configs, list)
    assert len(configs) > 0
    assert any(config["id"] == test_device["id"] for config in configs)


@pytest.mark.integration
def test_get_nonexistent_endpoint_config(api_client, test_org_id, jwt_token):
    nonexistent_id = str(uuid4())
    response = api_client.get(
        f"{BASE_URL}/endpoint-config/{nonexistent_id}",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert response.status_code == 404


@pytest.mark.integration
def test_update_nonexistent_endpoint_config(api_client, test_org_id, jwt_token):
    nonexistent_id = str(uuid4())
    update_data = {
        "config": {
            "MemcryptLog": {
                "POST_IP": "127.0.0.1",
            }
        }
    }
    response = api_client.put(
        f"{BASE_URL}/endpoint-config/{nonexistent_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert response.status_code == 404
