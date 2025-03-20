from datetime import datetime
from typing import Any, Dict

from pydantic import BaseModel, ConfigDict


class ConfigSection(BaseModel):
    section_name: str
    values: Dict[str, Any]


class EndpointConfigBase(BaseModel):
    name: str
    type: str
    config: Dict[str, Any]


class EndpointConfigCreate(EndpointConfigBase):
    id: str
    org_id: str


class EndpointConfigUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    config: Dict[str, Dict[str, Any]] | None = None


class EndpointConfigInDB(EndpointConfigBase):
    id: str
    org_id: str
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
