from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from enum import Enum


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"


class ApplicationBase(BaseModel):
    name: str = Field(..., min_length=3)
    version: str
    publisher: str
    hash: str = Field(..., min_length=3)

    model_config = ConfigDict(extra="forbid")


class ApplicationCreate(ApplicationBase):
    organization_id: str | None = None
    id: str = None


class ApplicationIdentifier(BaseModel):
    name: str
    version: str


class Application(ApplicationBase):
    id: str
    organization_id: str

    model_config = ConfigDict(from_attributes=True)


class ApplicationResponse(BaseModel):
    id: str
    name: str
    version: str
    publisher: str
    hash: str
    status: ApprovalStatus
    organization_id: str


class ApplicationListResponse(BaseModel):
    applications: List[ApplicationResponse] = Field(
        default_factory=list, description="Array of applications"
    )
    message: Optional[str] = Field(None, description="Status or information message")
    total_count: int = Field(None, description="Total number of applications")
    model_config = ConfigDict(from_attributes=True)
