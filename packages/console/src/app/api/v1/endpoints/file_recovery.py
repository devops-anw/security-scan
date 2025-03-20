from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_org_from_api_key, jwt_required
from app.core.dependencies import get_db
from app.repositories.device import DeviceRepository
from app.repositories.file_recovery import FileRecoveryRepository
from app.schemas.common import OrgData
from app.schemas.file_recovery import (
    FileRecoveryCreate,
    FileRecoveryListResponse,
    FileRecoveryResponse,
    FileRecoveryUpdate,
)
from app.services.file_recovery import FileRecoveryService

router = APIRouter()


def get_file_recovery_service(db: Session = Depends(get_db)) -> FileRecoveryService:
    repository = FileRecoveryRepository(db)
    device_repository = DeviceRepository(db)
    return FileRecoveryService(
        file_recovery_repository=repository, device_repository=device_repository
    )


@router.post("/file_recovery", response_model=List[FileRecoveryResponse])
def create_file_recovery(
    recovery_data: List[FileRecoveryCreate],
    org_data: OrgData = Depends(get_org_from_api_key),
    file_recovery_service: FileRecoveryService = Depends(get_file_recovery_service),
):
    return file_recovery_service.create_file_recovery(recovery_data, org_data.org_id)


@router.get(
    "/device/{device_id}/file_recovery", response_model=FileRecoveryListResponse
)
def list_file_recovery_by_device(
    device_id: str,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    org_id: str = Depends(jwt_required),
    file_recovery_service: FileRecoveryService = Depends(get_file_recovery_service),
):
    file_recovery_service.validator.validate_device_access(device_id)
    return file_recovery_service.get_file_recovery_by_device(
        device_id, org_id, skip=skip, limit=limit, search=search, status=status
    )


@router.get("/organization/devices/recoveries", response_model=FileRecoveryListResponse)
def list_all_device_recoveries(
    search: Optional[str] = None,
    device_name: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    org_id: str = Depends(jwt_required),
    file_recovery_service: FileRecoveryService = Depends(get_file_recovery_service),
) -> FileRecoveryListResponse:
    return file_recovery_service.get_file_recoveries_with_filters(
        org_id=org_id,
        search=search,
        device_name=device_name,
        status=status,
        skip=skip,
        limit=limit,
    )


@router.put("/file-recovery/{recovery_id}", response_model=FileRecoveryResponse)
def update_file_recovery(
    recovery_id: int,
    recovery_data: FileRecoveryUpdate,
    org_id: str = Depends(jwt_required),
    file_recovery_service: FileRecoveryService = Depends(get_file_recovery_service),
):
    updated_recovery = file_recovery_service.update_file_recovery(
        recovery_id, recovery_data, org_id
    )
    if not updated_recovery:
        raise HTTPException(status_code=404, detail="Recovery not found")
    return updated_recovery
