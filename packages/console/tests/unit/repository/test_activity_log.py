import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from unittest.mock import Mock
from app.repositories.activity_logs import ActivityLogRepository
from app.main import app
from app.models import SeverityLevel
from app.schemas.activity_logs import ActivityLogCreate

client = TestClient(app)
API_PREFIX = "console/v1.0"
ORG_KEY = "test_org_key"
TEST_ORG_ID = "test_org_id"


@pytest.fixture
def mock_db_session():
    return Mock()


@pytest.fixture
def sample_activity_log():
    return {
        "id": "log123",
        "device_id": "device123",
        "activity_type": "RANSOMEWARE",
        "severity": SeverityLevel.MEDIUM,
        "details": {
            "threat_name": "WannaCry",
            "affected_files": [
                "C:/Users/Documents/important.doc",
                "C:/Users/Desktop/critical.xlsx",
            ],
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


def test_repository_create_activity_logs(mock_db_session, sample_activity_log_create):
    repository = ActivityLogRepository(mock_db_session)
    logs_to_create = [sample_activity_log_create]

    # Call the method
    repository.create_activity_logs(logs_to_create, TEST_ORG_ID)

    # Assert DB operations
    mock_db_session.add.assert_called()
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called()


def test_repository_get_activity_logs_by_filters(mock_db_session):
    # Create repository instance
    repository = ActivityLogRepository(mock_db_session)

    # Create mock chain
    query_mock = Mock()
    join_mock = Mock()
    filter_mock = Mock()
    order_mock = Mock()
    offset_mock = Mock()
    limit_mock = Mock()

    # Setup the mock chain
    mock_db_session.query.return_value = query_mock
    query_mock.join.return_value = join_mock
    join_mock.filter.return_value = filter_mock
    filter_mock.count.return_value = 1
    filter_mock.order_by.return_value = order_mock
    order_mock.offset.return_value = offset_mock
    offset_mock.limit.return_value = limit_mock
    limit_mock.all.return_value = []

    # Calling the method with various filters
    logs, count = repository.get_activity_logs_by_filters(
        org_id=TEST_ORG_ID,
        search="test",
        device_name="device1",
        severity="MEDIUM",
        skip=0,
        limit=100,
    )

    # Assert results
    assert count == 1
    assert logs == []

    # Verify method chain
    mock_db_session.query.assert_called_once()
    query_mock.join.assert_called_once()


def test_repository_get_activity_logs_by_filters_no_search(mock_db_session):
    # Create repository instance
    repository = ActivityLogRepository(mock_db_session)

    # Create mock chain
    query_mock = Mock()
    join_mock = Mock()
    filter_mock = Mock()
    order_mock = Mock()
    offset_mock = Mock()
    limit_mock = Mock()

    # Setup the mock chain
    mock_db_session.query.return_value = query_mock
    query_mock.join.return_value = join_mock
    join_mock.filter.return_value = filter_mock
    filter_mock.count.return_value = 1
    filter_mock.order_by.return_value = order_mock
    order_mock.offset.return_value = offset_mock
    offset_mock.limit.return_value = limit_mock
    limit_mock.all.return_value = []

    # Calling the method with various filters
    logs, count = repository.get_activity_logs_by_filters(
        org_id=TEST_ORG_ID,
        search=None,
        device_name=None,
        severity=None,
        skip=0,
        limit=100,
    )

    # Assert results
    assert count == 1
    assert logs == []

    # Verify method chain
    mock_db_session.query.assert_called_once()
    query_mock.join.assert_called_once()


def test_repository_get_activity_logs_by_device_with_filters(mock_db_session):
    repository = ActivityLogRepository(mock_db_session)

    query_mock = Mock()
    join_mock = Mock()
    filter_mock = Mock()
    order_mock = Mock()
    offset_mock = Mock()
    limit_mock = Mock()

    mock_db_session.query.return_value = query_mock
    query_mock.join.return_value = join_mock
    join_mock.filter.return_value = filter_mock
    filter_mock.count.return_value = 1
    filter_mock.order_by.return_value = order_mock
    order_mock.offset.return_value = offset_mock
    offset_mock.limit.return_value = limit_mock
    limit_mock.all.return_value = []

    logs, count = repository.get_activity_logs_by_device(
        "device123", "test_org_id", search="test", severity="MEDIUM", skip=10, limit=50
    )

    assert count == 1
    assert logs == []
    mock_db_session.query.assert_called_once()
    query_mock.join.assert_called_once()
    join_mock.filter.assert_called_once()
    filter_mock.count.assert_called_once()
