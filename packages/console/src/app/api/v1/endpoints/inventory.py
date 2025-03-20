from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_org_from_api_key, jwt_required
from app.repositories.application import ApplicationRepository
from app.repositories.device import DeviceRepository
from app.repositories.inventory import InventoryRepository
from app.schemas.common import OrgData
from app.services.application import ApplicationService
from app.core.dependencies import get_db
from app.services.inventory import InventoryService
from app.schemas.application import (
    ApplicationCreate,
    Application,
    ApplicationBase,
    ApplicationListResponse,
    ApplicationResponse,
    ApprovalStatus,
)
from app.schemas.inventory import (
    InventoryCreate,
    InventoryListResponse,
    InventoryUpdate,
    InventoryResponse,
)
from typing import List, Optional

router = APIRouter()


def get_inventory_service(db: Session = Depends(get_db)) -> InventoryService:
    repository = InventoryRepository(db)
    device_repository = DeviceRepository(db)
    application_repository = ApplicationRepository(db)
    return InventoryService(repository, device_repository, application_repository)


def get_application_service(db: Session = Depends(get_db)) -> ApplicationService:
    repository = ApplicationRepository(db)
    return ApplicationService(repository)


@router.post("/applications", response_model=Application)
def create_application(
    application: ApplicationBase,
    org_id: str = Depends(jwt_required),
    app_service: ApplicationService = Depends(get_application_service),
):
    return app_service.create_application(
        ApplicationCreate(**application.model_dump(), organization_id=org_id)
    )


@router.get("/applications", response_model=ApplicationListResponse)
def list_applications(
    search: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 10000,
    org_id: str = Depends(jwt_required),
    app_service: ApplicationService = Depends(get_application_service),
) -> ApplicationListResponse:
    return app_service.get_by_org(
        org_id=org_id, search=search, status=status, skip=skip, limit=limit
    )


@router.post("/devices/{device_id}/inventory", response_model=List[InventoryResponse])
def create_device_inventory(
    device_id: str,
    inventory: InventoryCreate,
    org_data: OrgData = Depends(get_org_from_api_key),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    items = inventory_service.create_inventory(device_id, inventory)
    return items


@router.get("/devices/{device_id}/inventory", response_model=InventoryListResponse)
def get_device_inventory(
    device_id: str,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[ApprovalStatus] = None,
    org_id: str = Depends(jwt_required),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    return inventory_service.get_device_inventory(
        device_id, skip, limit, search, status=status
    )


@router.get(
    "/devices/{device_id}/agent-inventory", response_model=List[InventoryResponse]
)
def get_device_inventory_agent(
    device_id: str,
    org_data: OrgData = Depends(get_org_from_api_key),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    return inventory_service.get_device_inventory(device_id)


@router.post(
    "/devices/{device_id}/inventory/sync", response_model=List[InventoryResponse]
)
def sync_device_inventory(
    device_id: str,
    inventory_update: InventoryUpdate,
    org_data: OrgData = Depends(get_org_from_api_key),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    return inventory_service.update_inventory(device_id, inventory_update)


@router.delete("/inventory/{inventory_id}", response_model=dict)
async def delete_inventory_item(
    inventory_id: str,
    org_id: str = Depends(jwt_required),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    return inventory_service.delete_inventory_item(inventory_id)


@router.post(
    "/applications/{application_id}/approve", response_model=ApplicationResponse
)
async def approve_application(
    application_id: str,
    org_id: str = Depends(jwt_required),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    return inventory_service.approve_application(application_id)


@router.post("/applications/{application_id}/deny", response_model=ApplicationResponse)
async def deny_application(
    application_id: str,
    org_id: str = Depends(jwt_required),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    return inventory_service.deny_application(application_id)


@router.post("/applications/bulk-approve", response_model=List[ApplicationResponse])
async def bulk_approve_applications(
    application_ids: List[str],
    org_id: str = Depends(jwt_required),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    return inventory_service.approve_applications(application_ids)


@router.post("/applications/bulk-deny", response_model=List[ApplicationResponse])
async def bulk_deny_applications(
    application_ids: List[str],
    org_id: str = Depends(jwt_required),
    inventory_service: InventoryService = Depends(get_inventory_service),
):
    return inventory_service.deny_applications(application_ids)
