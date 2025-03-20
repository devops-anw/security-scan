import enum
import uuid

from sqlalchemy import JSON, Column, DateTime, Enum, String
from sqlalchemy.sql import func

from app.core.database import Base


class SeverityLevel(str, enum.Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, nullable=False, index=True)
    device_id = Column(String, nullable=False, index=True)
    activity_type = Column(String, nullable=False, index=True)
    severity = Column(Enum(SeverityLevel), nullable=False, index=True)
    details = Column(JSON, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
