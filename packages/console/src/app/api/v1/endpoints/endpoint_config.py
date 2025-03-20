from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import jwt_required
from app.core.database import get_db
from app.repositories.endpoint_config import EndpointConfigRepository
from app.schemas.endpoint_config import EndpointConfigInDB, EndpointConfigUpdate
from app.services.endpoint_config import EndpointConfigService

router = APIRouter()


def get_endpoint_config_service(db: Session = Depends(get_db)) -> EndpointConfigService:
    repository = EndpointConfigRepository(db)
    return EndpointConfigService(repository)


@router.get("/{endpoint_id}", response_model=EndpointConfigInDB)
def get_endpoint_config(
    endpoint_id: str,
    org_id: str = Depends(jwt_required),  # Use the imported function
    service: EndpointConfigService = Depends(get_endpoint_config_service),
):
    endpoint_config = service.get_endpoint_by_id(endpoint_id)
    if not endpoint_config:
        raise HTTPException(status_code=404, detail="Endpoint configuration not found")
    return endpoint_config


@router.put("/{endpoint_id}", response_model=EndpointConfigInDB)
def update_endpoint_config(
    endpoint_id: str,
    update_data: EndpointConfigUpdate,
    org_id: str = Depends(jwt_required),  # Use the imported function
    service: EndpointConfigService = Depends(get_endpoint_config_service),
):
    updated_config = service.update_endpoint_config(endpoint_id, update_data)
    if not updated_config:
        raise HTTPException(status_code=404, detail="Endpoint configuration not found")
    return updated_config


@router.get("/", response_model=List[EndpointConfigInDB])
def get_org_endpoint_configs(
    skip: int = 0,
    limit: int = 100,
    org_id: str = Depends(jwt_required),  # Use the imported function
    service: EndpointConfigService = Depends(get_endpoint_config_service),
):
    return service.get_endpoints_by_org(org_id, skip=skip, limit=limit)
