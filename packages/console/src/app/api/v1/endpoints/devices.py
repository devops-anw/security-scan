import asyncio
from datetime import datetime
from typing import Optional
from datetime import timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.core.auth import get_org_from_api_key, jwt_required
from app.core.dependencies import get_db
from app.repositories.device import DeviceRepository
from app.repositories.endpoint_config import EndpointConfigRepository
from app.schemas.common import OrgData
from app.schemas.device import (
    DeviceBase,
    DeviceCreate,
    DeviceInDB,
    DeviceListResponse,
    DeviceTypes,
    DeviceUpdate,
    DeviceProperties,
)
from app.services.device import DeviceService
from app.core.exceptions import DuplicateObjectException

router = APIRouter()


def get_device_repository(db: Session = Depends(get_db)) -> DeviceRepository:
    return DeviceRepository(db)


def get_endpoint_config_repository(
    db: Session = Depends(get_db),
) -> EndpointConfigRepository:
    return EndpointConfigRepository(db)


def get_device_service(
    repository: DeviceRepository = Depends(get_device_repository),
    endpoint_config_repository: EndpointConfigRepository = Depends(
        get_endpoint_config_repository
    ),
) -> DeviceService:
    return DeviceService(repository, endpoint_config_repository)


async def check_device_status():
    while True:
        await asyncio.sleep(60)
        db = next(get_db())
        try:
            repo = DeviceRepository(db)
            repo.update_device_status()
        finally:
            db.close()


@router.post("/", response_model=DeviceInDB)
async def create_device(
    device: DeviceBase,
    org_data: OrgData = Depends(get_org_from_api_key),
    service: DeviceService = Depends(get_device_service),
):
    try:
        device_create = DeviceCreate(org_id=org_data.org_id, **device.model_dump())
        return service.create_device(device_create)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except DuplicateObjectException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/device-types", response_model=DeviceTypes, include_in_schema=False)
def get_device_types(
    org_id: str = Depends(jwt_required),
    service: DeviceService = Depends(get_device_service),
):
    try:
        return service.get_device_types()
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())


@router.get("/{device_id}", response_model=DeviceInDB)
def read_device(
    device_id: str,
    org_id: str = Depends(jwt_required),
    service: DeviceService = Depends(get_device_service),
):
    return service.get(device_id)


@router.put("/{device_id}", response_model=DeviceInDB)
def update_device(
    device_id: str,
    device: DeviceUpdate,
    org_key: str = Depends(get_org_from_api_key),
    service: DeviceService = Depends(get_device_service),
):
    return service.update_device(device_id, device)


@router.post("/{device_id}/heartbeat", response_model=DeviceInDB)
def update_device_heartbeat(
    device_id: str,
    device_properties: Optional[DeviceProperties] = None,
    org_key: str = Depends(get_org_from_api_key),
    service: DeviceService = Depends(get_device_service),
):
    properties = {}
    if device_properties:
        properties = device_properties.model_dump()

    device = DeviceUpdate(last_seen=datetime.now(timezone.utc), properties=properties)
    return service.update_device(device_id, device)


@router.delete("/{device_id}", response_model=DeviceInDB)
def delete_device(
    device_id: str,
    org_key: str = Depends(get_org_from_api_key),
    service: DeviceService = Depends(get_device_service),
):
    return service.delete_device(device_id)


@router.get("/", response_model=DeviceListResponse)
def read_devices_by_org(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    device_type: Optional[str] = None,
    status: Optional[str] = None,
    health: Optional[str] = None,
    org_id: str = Depends(jwt_required),
    service: DeviceService = Depends(get_device_service),
):
    search = search.strip() if search else None
    health_value = health.upper() if health else None
    status_value = status.upper() if status else None

    devices, total = service.get_devices_by_org_with_count(
        search=search,
        device_type=device_type,
        status=status_value,
        health=health_value,
        skip=skip,
        limit=limit,
    )
    message = None
    if total == 0:
        if search:
            message = f"No devices found matching '{search}'"
        else:
            message = "No devices found for this organization."

    return DeviceListResponse(
        devices=devices, total=total, skip=skip, limit=limit, message=message
    )
