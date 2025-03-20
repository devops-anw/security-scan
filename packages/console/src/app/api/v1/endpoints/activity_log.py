from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_org_from_api_key, jwt_required
from app.core.dependencies import get_db
from app.repositories.activity_logs import ActivityLogRepository
from app.repositories.device import DeviceRepository
from app.schemas.activity_logs import (
    ActivityLogCreate,
    ActivityLogResponse,
    ActivityLogsListResponse,
)
from app.schemas.common import OrgData
from app.services.activity_logs import ActivityLogService

router = APIRouter()


def get_activity_log_service(db: Session = Depends(get_db)) -> ActivityLogService:
    activity_log_repository = ActivityLogRepository(db)
    device_repository = DeviceRepository(db)
    return ActivityLogService(
        activity_log_repository=activity_log_repository,
        device_repository=device_repository,
    )


@router.post("/activity-logs", response_model=List[ActivityLogResponse])
def create_activity_log(
    log_data: List[ActivityLogCreate],
    org_data: OrgData = Depends(get_org_from_api_key),
    activity_log_service: ActivityLogService = Depends(get_activity_log_service),
):
    return activity_log_service.create_activity_logs(log_data, org_data.org_id)


@router.get("/activity-logs", response_model=ActivityLogsListResponse)
def list_activity_logs(
    search: Optional[str] = None,
    device_name: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    org_id: str = Depends(jwt_required),
    activity_log_service: ActivityLogService = Depends(get_activity_log_service),
):
    return activity_log_service.get_activity_logs_with_filters(
        org_id=org_id,
        search=search,
        device_name=device_name,
        severity=severity,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/activity-logs/device/{device_id}", response_model=ActivityLogsListResponse
)
def list_activity_logs_by_device(
    device_id: str,
    search: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    org_id: str = Depends(jwt_required),
    activity_log_service: ActivityLogService = Depends(get_activity_log_service),
) -> ActivityLogsListResponse:
    return activity_log_service.get_activity_logs_by_device(
        device_id, org_id, search=search, severity=severity, skip=skip, limit=limit
    )
