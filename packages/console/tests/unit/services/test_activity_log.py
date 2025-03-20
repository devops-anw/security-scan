import pytest
from datetime import datetime, timezone
from unittest.mock import Mock
from app.schemas.activity_logs import (
    ActivityLogCreate,
    ActivityLogResponse,
    ActivityLogsListResponse,
)
from app.services.activity_logs import ActivityLogService
from app.models import ActivityLog, SeverityLevel


@pytest.fixture
def mock_activity_log_repository():
    return Mock()


@pytest.fixture
def mock_device_repository():
    return Mock()


@pytest.fixture
def activity_log_service(mock_activity_log_repository, mock_device_repository):
    service = ActivityLogService(
        activity_log_repository=mock_activity_log_repository,
        device_repository=mock_device_repository,
    )
    service.validator = Mock()
    service.validator.validate_device_access = Mock(return_value=None)
    return service


@pytest.fixture
def sample_activity_log():
    return ActivityLog(
        id="log123",
        org_id="test_org_id",
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
        created_at=datetime.now(timezone.utc),
    )


class TestActivityLogService:
    def test_create_activity_logs_success(
        self, activity_log_service, sample_activity_log
    ):
        # Arrange
        logs_to_create = [
            ActivityLogCreate(
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
        ]

        activity_log_service.repository.create_activity_logs.return_value = [
            (sample_activity_log, "Test Device")
        ]
        activity_log_service.validator.validate_device_access.return_value = None

        # Act
        result = activity_log_service.create_activity_logs(
            logs_to_create, "test_org_id"
        )

        # Assert
        assert len(result) == 1
        assert result[0].id == sample_activity_log.id
        assert result[0].org_id == sample_activity_log.org_id
        assert result[0].device_id == sample_activity_log.device_id
        assert result[0].device_name == "Test Device"
        assert result[0].activity_type == sample_activity_log.activity_type
        assert result[0].severity == sample_activity_log.severity
        assert result[0].details == sample_activity_log.details
        activity_log_service.validator.validate_device_access.assert_called_once_with(
            "device123"
        )
        activity_log_service.repository.create_activity_logs.assert_called_once_with(
            logs_to_create, "test_org_id"
        )

    def test_get_activity_logs_with_filters_success(
        self, activity_log_service, sample_activity_log
    ):
        # Arrange
        mock_logs = [(sample_activity_log, "Test Device")]
        total_count = 1

        activity_log_service.repository.get_activity_logs_by_filters.return_value = (
            mock_logs,
            total_count,
        )

        # Act
        result = activity_log_service.get_activity_logs_with_filters(
            org_id="test_org_id",
            search="test",
            device_name="device1",
            severity="MEDIUM",
            skip=10,
            limit=50,
        )

        # Assert
        assert isinstance(result, ActivityLogsListResponse)
        assert len(result.logs) == 1
        assert result.total_count == total_count
        assert result.message is None

        log = result.logs[0]
        assert log.id == sample_activity_log.id
        assert log.org_id == sample_activity_log.org_id
        assert log.device_id == sample_activity_log.device_id
        assert log.activity_type == sample_activity_log.activity_type
        assert log.severity == sample_activity_log.severity
        assert log.details == sample_activity_log.details
        assert log.device_name == "Test Device"

        activity_log_service.repository.get_activity_logs_by_filters.assert_called_once_with(
            org_id="test_org_id",
            search="test",
            device_name="device1",
            severity="MEDIUM",
            skip=10,
            limit=50,
        )

    def test_get_activity_logs_with_filters_empty_result(self, activity_log_service):
        # Arrange
        activity_log_service.repository.get_activity_logs_by_filters.return_value = (
            [],
            0,
        )

        # Act
        result = activity_log_service.get_activity_logs_with_filters(
            org_id="test_org_id"
        )

        # Assert
        assert isinstance(result, ActivityLogsListResponse)
        assert len(result.logs) == 0
        assert result.total_count == 0
        assert result.message == "No activity logs found for the organization"

    def test_get_activity_logs_by_device_with_filters_success(
        self, activity_log_service, sample_activity_log
    ):
        mock_logs = [(sample_activity_log, "Test Device")]
        activity_log_service.repository.get_activity_logs_by_device.return_value = (
            mock_logs,
            1,
        )

        result = activity_log_service.get_activity_logs_by_device(
            device_id="device123",
            org_id="test_org_id",
            search="test",
            severity="MEDIUM",
            skip=10,
            limit=50,
        )

        assert isinstance(result, ActivityLogsListResponse)
        assert len(result.logs) == 1
        assert result.total_count == 1
        assert result.message is None

        activity_log_service.repository.get_activity_logs_by_device.assert_called_once_with(
            "device123",
            "test_org_id",
            search="test",
            severity="MEDIUM",
            skip=10,
            limit=50,
        )

    def test_convert_to_response(self, activity_log_service, sample_activity_log):
        # Act
        result = activity_log_service._convert_to_response(sample_activity_log)

        # Assert
        assert isinstance(result, ActivityLogResponse)
        assert result.id == sample_activity_log.id
        assert result.org_id == sample_activity_log.org_id
        assert result.device_id == sample_activity_log.device_id
        assert result.activity_type == sample_activity_log.activity_type
        assert result.severity == sample_activity_log.severity
        assert result.details == sample_activity_log.details
        assert result.created_at == sample_activity_log.created_at
