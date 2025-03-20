from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.application import (
    Application,
    ApplicationBase,
    ApplicationCreate,
    ApplicationResponse,
    ApprovalStatus,
)


class InventoryCreate(BaseModel):
    items: List[ApplicationBase]

    model_config = ConfigDict(extra="forbid")


class InventoryUpdate(BaseModel):
    added_apps: List[ApplicationCreate]
    removed_app_ids: List[str]


class InventoryItem(BaseModel):
    id: str
    application: Application
    status: ApprovalStatus
    approved_at: Optional[datetime] = None
    denied_at: Optional[datetime] = None
    last_updated: datetime
    model_config = ConfigDict(from_attributes=True)


class Inventory(BaseModel):
    device_id: str
    items: List[InventoryItem]
    model_config = ConfigDict(from_attributes=True)


class InventoryApproval(BaseModel):
    inventory_id: str
    status: ApprovalStatus


class InventoryResponse(BaseModel):
    id: str
    device_id: str
    application_id: str
    status: ApprovalStatus
    approved_at: datetime | None
    denied_at: datetime | None
    last_updated: datetime
    application: ApplicationResponse | None
    message: Optional[str] = None


class InventoryListResponse(BaseModel):
    inventory: List[InventoryResponse]
    total: int
    skip: int
    limit: int
