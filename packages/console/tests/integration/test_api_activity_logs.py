import pytest
from uuid import uuid4
from .conftest import BASE_URL


@pytest.fixture(scope="module")
def test_activity_log(api_client, test_org_id):
    # Create a test activity log and yield it for the tests
    activity_log_data = {
        "device_id": f"device-{uuid4()}",
        "activity_type": "RANSOMEWARE",
        "severity": "MEDIUM",
        "details": {
            "details": {
                "threat_name": "WannaCry",
                "affected_files": [
                    "C:/Users/Documents/important.doc",
                    "C:/Users/Desktop/critical.xlsx",
                ],
            }
        },
    }
    response = api_client.post(
        f"{BASE_URL}/activity-logs",
        json=[activity_log_data],
        headers={"X-Org-Key": test_org_id},
    )
    activity_log = response.json()[0]
    yield activity_log
    # Cleanup after tests
    api_client.delete(f"{BASE_URL}/activity-logs/{activity_log['id']}")


@pytest.mark.integration
def test_create_activity_log(api_client, test_org_id):
    org_id = test_org_id
    activity_log_data = {
        "device_id": f"device-{uuid4()}",
        "activity_type": "RANSOMEWARE",
        "severity": "MEDIUM",
        "details": {
            "details": {
                "threat_name": "WannaCry",
                "affected_files": [
                    "C:/Users/Documents/important.doc",
                    "C:/Users/Desktop/critical.xlsx",
                ],
            }
        },
    }
    response = api_client.post(
        f"{BASE_URL}/activity-logs",
        json=[activity_log_data],
        headers={"X-Org-Key": org_id},
    )
    assert response.status_code == 200
    created_log = response.json()[0]
    assert created_log["device_id"] == activity_log_data["device_id"]
    assert created_log["activity_type"] == activity_log_data["activity_type"]
    assert created_log["severity"] == activity_log_data["severity"]
    # Cleanup
    api_client.delete(f"{BASE_URL}/activity-logs/{created_log['id']}")


@pytest.mark.integration
def test_get_activity_log(api_client, test_activity_log, jwt_token):
    response = api_client.get(
        f"{BASE_URL}/activity-logs/{test_activity_log['id']}",
        headers={"Authorization": f"Bearer {jwt_token}"},
    )
    assert response.status_code == 200
    fetched_log = response.json()
    assert fetched_log["id"] == test_activity_log["id"]


@pytest.mark.integration
def test_list_activity_logs(api_client, test_org_id, jwt_token):
    response = api_client.get(
        f"{BASE_URL}/activity-logs",
        headers={"Authorization": f"Bearer {jwt_token}"},
        params={"org_id": test_org_id, "search_term": "Test App"},
    )
    assert response.status_code == 200
    logs = response.json()
    assert "logs" in logs
    assert len(logs["logs"]) > 0


@pytest.mark.integration
def test_filter_activity_logs(api_client, test_org_id, jwt_token):
    response = api_client.get(
        f"{BASE_URL}/activity-logs",
        headers={"Authorization": f"Bearer {jwt_token}"},
        params={"org_id": test_org_id, "activity_type": "RANSOMEWARE"},
    )
    assert response.status_code == 200
    logs = response.json()
    assert "logs" in logs
    for log in logs["logs"]:
        assert log["activity_type"] == "RANSOMEWARE"
