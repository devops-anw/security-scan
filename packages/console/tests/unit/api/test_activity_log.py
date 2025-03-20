from app.schemas.common import OrgData
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from unittest.mock import Mock, ANY

from app.main import app
from app.core.auth import get_org_from_api_key, jwt_required
from app.models import SeverityLevel
from app.schemas.activity_logs import (
    ActivityLogCreate,
    ActivityLogResponse,
    ActivityLogsListResponse,
)
from app.api.v1.endpoints.activity_log import get_activity_log_service

client = TestClient(app)
API_PREFIX = "console/v1.0"
ORG_KEY = "test_org_key"
TEST_ORG_ID = "test_org_id"


# Fixtures
@pytest.fixture(autouse=True)
def override_dependencies(mock_activity_log_service):
    app.dependency_overrides[get_activity_log_service] = (
        lambda: mock_activity_log_service
    )
    app.dependency_overrides[get_org_from_api_key] = lambda: OrgData(org_id=TEST_ORG_ID)
    app.dependency_overrides[jwt_required] = lambda: TEST_ORG_ID
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_activity_log_service():
    return Mock()


@pytest.fixture
def sample_activity_log():
    return {
        "id": "log123",
        "device_id": "device123",
        "activity_type": "RANSOMEWARE",
        "severity": SeverityLevel.MEDIUM,
        "details": {
            "details": {
                "threat_name": "WannaCry",
                "affected_files": [
                    "C:/Users/Documents/important.doc",
                    "C:/Users/Desktop/critical.xlsx",
                ],
            }
        },
        "created_at": datetime.now(timezone.utc),
        "org_id": TEST_ORG_ID,
    }


@pytest.fixture
def sample_activity_log_create():
    return ActivityLogCreate(
        device_id="device123",
        activity_type="RANSOMEWARE",
        severity=SeverityLevel.MEDIUM,
        details={
            "details": {
                "threat_name": "WannaCry",
                "affected_files": [
                    "C:/Users/Documents/important.doc",
                    "C:/Users/Desktop/critical.xlsx",
                ],
            }
        },
    )


# API Tests
def test_create_activity_log(
    mock_activity_log_service, sample_activity_log, sample_activity_log_create
):
    # Setup mock response
    mock_response = ActivityLogResponse(**sample_activity_log)
    mock_activity_log_service.create_activity_logs.return_value = [mock_response]

    # Make request
    response = client.post(
        f"{API_PREFIX}/activity-logs",
        json=[sample_activity_log_create.model_dump()],
        headers={"Authorization": f"Bearer {ORG_KEY}"},
    )
    # Assert response
    assert response.status_code == 200
    assert response.json()[0]["id"] == sample_activity_log["id"]
    mock_activity_log_service.create_activity_logs.assert_called_once_with(
        [ANY], TEST_ORG_ID
    )


def test_create_activity_log_invalid_data(mock_activity_log_service):
    invalid_data = [
        {"device_id": "", "activity_type": "TEST"}
    ]  # Missing required fields

    response = client.post(
        f"{API_PREFIX}/activity-logs",
        json=invalid_data,
        headers={"Authorization": f"Bearer {ORG_KEY}"},
    )

    assert response.status_code == 400
    mock_activity_log_service.create_activity_logs.assert_not_called()


def test_list_activity_logs(mock_activity_log_service, sample_activity_log):
    # Setup mock response
    mock_response = ActivityLogsListResponse(
        logs=[ActivityLogResponse(**sample_activity_log)], total_count=1
    )
    mock_activity_log_service.get_activity_logs_with_filters.return_value = (
        mock_response
    )

    # Make request
    response = client.get(
        f"{API_PREFIX}/activity-logs",
        headers={"Authorization": f"Bearer {TEST_ORG_ID}"},
    )

    # Assert response
    assert response.status_code == 200
    assert response.json()["total_count"] == 1
    assert len(response.json()["logs"]) == 1
    mock_activity_log_service.get_activity_logs_with_filters.assert_called_once_with(
        org_id=TEST_ORG_ID,
        search=None,
        device_name=None,
        severity=None,
        skip=0,
        limit=100,
    )


def test_list_activity_logs_with_search(mock_activity_log_service, sample_activity_log):
    # Setup mock response
    mock_response = ActivityLogsListResponse(
        logs=[ActivityLogResponse(**sample_activity_log)], total_count=1
    )
    mock_activity_log_service.get_activity_logs_with_filters.return_value = (
        mock_response
    )

    # Make request
    response = client.get(
        f"{API_PREFIX}/activity-logs?search=test&device_name=device1&severity=MEDIUM",
        headers={"Authorization": f"Bearer {TEST_ORG_ID}"},
    )

    # Assert response
    assert response.status_code == 200
    mock_activity_log_service.get_activity_logs_with_filters.assert_called_once_with(
        org_id=TEST_ORG_ID,
        search="test",
        device_name="device1",
        severity="MEDIUM",
        skip=0,
        limit=100,
    )


def test_get_activity_logs_by_device_with_filters(
    mock_activity_log_service, sample_activity_log
):
    mock_response = ActivityLogsListResponse(
        logs=[ActivityLogResponse(**sample_activity_log)], total_count=1
    )
    mock_activity_log_service.get_activity_logs_by_device.return_value = mock_response

    response = client.get(
        f"{API_PREFIX}/activity-logs/device/device123?search=test&severity=MEDIUM&skip=10&limit=50",
        headers={"Authorization": f"Bearer {TEST_ORG_ID}"},
    )

    assert response.status_code == 200
    assert response.json()["total_count"] == 1
    assert len(response.json()["logs"]) == 1
    mock_activity_log_service.get_activity_logs_by_device.assert_called_once_with(
        "device123", TEST_ORG_ID, search="test", severity="MEDIUM", skip=10, limit=50
    )
