from typing import List, Optional

from app.models import ActivityLog
from app.repositories.activity_logs import ActivityLogRepository
from app.repositories.device import DeviceRepository
from app.schemas.activity_logs import (
    ActivityLogCreate,
    ActivityLogResponse,
    ActivityLogsListResponse,
)
from app.validators.devices import DeviceValidator


class ActivityLogService:
    def __init__(
        self,
        activity_log_repository: ActivityLogRepository,
        device_repository: DeviceRepository,
    ):
        self.repository = activity_log_repository
        self.validator = DeviceValidator(device_repository)

    def create_activity_logs(
        self, logs: List[ActivityLogCreate], org_id: str
    ) -> List[ActivityLogResponse]:
        for log_data in logs:
            self.validator.validate_device_access(log_data.device_id)
        created_logs = self.repository.create_activity_logs(logs, org_id)
        return [
            ActivityLogResponse(
                id=log.id,
                org_id=log.org_id,
                device_id=log.device_id,
                device_name=device_name,
                activity_type=log.activity_type,
                severity=log.severity,
                details=log.details,
                created_at=log.created_at,
            )
            for log, device_name in created_logs
        ]

    def get_activity_logs_with_filters(
        self,
        org_id: str,
        search: Optional[str] = None,
        device_name: Optional[str] = None,
        severity: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> ActivityLogsListResponse:
        logs, total_count = self.repository.get_activity_logs_by_filters(
            org_id=org_id,
            search=search,
            device_name=device_name,
            severity=severity,
            skip=skip,
            limit=limit,
        )
        converted_logs = [
            ActivityLogResponse(
                id=log.id,
                org_id=log.org_id,
                device_id=log.device_id,
                device_name=device_name,
                activity_type=log.activity_type,
                severity=log.severity,
                details=log.details,
                created_at=log.created_at,
            )
            for log, device_name in logs
        ]

        return ActivityLogsListResponse(
            logs=converted_logs,
            message="No activity logs found for the organization" if not logs else None,
            total_count=total_count,
        )

    def get_activity_logs_by_device(
        self,
        device_id: str,
        org_id: str,
        search: Optional[str] = None,
        severity: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> ActivityLogsListResponse:
        logs, total_count = self.repository.get_activity_logs_by_device(
            device_id, org_id, search=search, severity=severity, skip=skip, limit=limit
        )

        converted_logs = [
            ActivityLogResponse(
                id=log.id,
                org_id=log.org_id,
                device_id=log.device_id,
                device_name=device_name,
                activity_type=log.activity_type,
                severity=log.severity,
                details=log.details,
                created_at=log.created_at,
            )
            for log, device_name in logs
        ]
        return ActivityLogsListResponse(
            logs=converted_logs,
            message=(
                f"No activity logs found for device {device_id}" if not logs else None
            ),
            total_count=total_count,
        )

    @staticmethod
    def _convert_to_response(activity_log: ActivityLog) -> ActivityLogResponse:
        return ActivityLogResponse(
            id=activity_log.id,
            org_id=activity_log.org_id,
            device_id=activity_log.device_id,
            activity_type=activity_log.activity_type,
            severity=activity_log.severity,
            details=activity_log.details,
            created_at=activity_log.created_at,
        )
