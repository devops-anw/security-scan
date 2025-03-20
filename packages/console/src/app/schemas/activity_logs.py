from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, ConfigDict, Field

from app.models import SeverityLevel


class ActivityLogBase(BaseModel):
    device_id: str = Field(..., min_length=1, description="Device ID cannot be empty")
    activity_type: str
    severity: SeverityLevel
    details: Dict[str, Any]


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLogUpdate(BaseModel):
    activity_type: Optional[str] = None
    severity: Optional[SeverityLevel] = None
    details: Optional[Dict[str, Any]] = None


class ActivityLogInDB(ActivityLogBase):
    id: str
    org_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityLogResponse(ActivityLogInDB):
    device_name: Optional[str] = None


class ActivityLogsListResponse(BaseModel):
    logs: List[ActivityLogResponse] = Field(
        default_factory=list, description="Array of activity logs"
    )
    message: Optional[str] = Field(None, description="Status or information message")
    total_count: int = Field(..., description="Total number of logs")

    model_config = ConfigDict(from_attributes=True)


class ActivityLogBatchCreate(BaseModel):
    log: list[ActivityLogCreate]


ActivityLogRequest = Union[ActivityLogCreate, ActivityLogBatchCreate]
