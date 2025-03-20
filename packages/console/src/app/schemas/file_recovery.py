from datetime import datetime
from typing import List, Optional, Union

from pydantic import BaseModel, ConfigDict, Field

from app.models.file_recovery import RecoveryMethod, RecoveryStatus


class FileRecoveryBase(BaseModel):
    device_id: str = Field(..., min_length=1, description="Device ID cannot be empty")
    file_name: str = Field(..., min_length=1, description="File name cannot be empty")
    status: RecoveryStatus
    recovery_method: RecoveryMethod
    file_size: float

    model_config = ConfigDict(extra="forbid")


class FileRecoveryCreate(FileRecoveryBase):
    pass

    model_config = ConfigDict(extra="forbid")


class FileRecoveryUpdate(BaseModel):
    status: Optional[RecoveryStatus] = None
    recovery_method: Optional[RecoveryMethod] = None


class FileRecoveryInDB(FileRecoveryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FileRecoveryResponse(FileRecoveryInDB):
    org_id: str
    device_name: Optional[str] = None


class FileRecoveryListResponse(BaseModel):
    recoveries: List[FileRecoveryResponse] = Field(
        default_factory=list, description="Array of recoveries"
    )
    message: Optional[str] = Field(None, description="Status or information message")
    total_count: int = Field(..., description="Total number of recoveries")

    model_config = ConfigDict(from_attributes=True)


class FileRecoveryBatchCreate(BaseModel):
    recoveries: list[FileRecoveryCreate]


FileRecoveriesRequest = Union[FileRecoveryCreate, FileRecoveryBatchCreate]
