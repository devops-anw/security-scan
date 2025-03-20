from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Union
from functools import cached_property

from pydantic import BaseModel, ConfigDict, Field, field_validator, computed_field

from app.core.exceptions import ValidationException


class DeviceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., min_length=1, max_length=50)
    serial_number: str = Field(..., min_length=1, max_length=50)
    properties: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("properties")
    def validate_properties(cls, properties):
        # Validate property types for know keys
        type_constraints = {"IP": str, "LOCATION": str}

        for key, value in properties.items():
            if key in type_constraints:
                expected_types = type_constraints[key]
                if not isinstance(value, expected_types):
                    raise ValidationException(
                        message=f"Property '{key}' must be of type {expected_types.__name__}",
                        error_code="INVALID_PROPERTY_TYPE",
                        details={
                            "key": key,
                            "value": value,
                            "expected_type": expected_types.__name__,
                        },
                    )

        return properties

    model_config = ConfigDict(extra="forbid")


class DeviceCreate(DeviceBase):
    org_id: str

    model_config = ConfigDict(extra="forbid")


class DeviceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    properties: Optional[Dict[str, Union[str, int, float]]] = Field(
        default_factory=dict
    )
    last_seen: Optional[datetime] = None

    @field_validator("properties", mode="before")
    def validate_properties(cls, properties):
        if properties is None:
            return {}

        # Only validate types for IP and LOCATION if they are present
        if "IP" in properties and not isinstance(properties["IP"], str):
            raise ValidationException(
                message="IP must be a string",
                error_code="INVALID_IP_TYPE",
                details={"value": properties["IP"]},
            )

        if "LOCATION" in properties and not isinstance(properties["LOCATION"], str):
            raise ValidationException(
                message="LOCATION must be a string",
                error_code="INVALID_LOCATION_TYPE",
                details={"value": properties["LOCATION"]},
            )

        return properties

    model_config = ConfigDict(extra="forbid")


class DeviceInDB(DeviceBase):
    id: str
    org_id: str
    created_at: datetime
    updated_at: datetime
    last_seen: Optional[datetime] = None

    @computed_field
    @cached_property
    def health(self) -> str:
        """Device health status based on metrics"""
        # First check if device is active
        if not self.properties:
            return "UNKNOWN"

        if self.is_active == "OFFLINE":
            return "UNKNOWN"

        # Evaluate health based on metrics
        try:
            cpu = self.properties.get("cpu")

            # If CPU is None or 0, treat as unknown
            if cpu is None or cpu == 0:
                return "UNKNOWN"

            # Convert to float for comparison
            cpu = float(cpu)

            # Determine health status based on CPU thresholds
            if cpu > 90:
                return "CRITICAL"
            elif cpu > 70:
                return "AT_RISK"
            elif cpu > 0:
                return "HEALTHY"

        except (ValueError, TypeError):
            return "UNKNOWN"

        return "UNKNOWN"

    @computed_field
    @cached_property
    def is_active(self) -> str:
        current_time = datetime.now(timezone.utc)
        reference_time = self.last_seen

        # If last_seen is None, treat as offline
        if reference_time is None:
            return "OFFLINE"

        return (
            "OFFLINE"
            if (current_time - reference_time) > timedelta(minutes=5)
            else "ONLINE"
        )


class DeviceListResponse(BaseModel):
    devices: List[DeviceInDB]
    total: int
    skip: int
    limit: int
    message: Optional[str] = None


class StatusOption(BaseModel):
    value: bool
    label: str


class DeviceTypes(BaseModel):
    types: List[str]


class DeviceProperties(BaseModel):
    cpu: float = Field(default=0.0)
    disk: float = Field(default=0.0)
    memory: float = Field(default=0.0)
    disk_read_io: Optional[float] = None
    disk_write_io: Optional[float] = None
    network_sent_io: Optional[float] = None
    network_recv_io: Optional[float] = None
    suspect_write_count: Optional[float] = None
    suspect_extension_count: Optional[float] = None
    suspicious_extension_count: Optional[float] = None
    recovered_file_count: Optional[float] = None
    last_suspect_write: Optional[str] = None
    last_suspect_extension: Optional[str] = None
    last_suspicious_extension: Optional[str] = None
    last_recovered_file: Optional[str] = None

    class config:
        extra = "allow"
