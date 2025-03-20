import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.sql import func

from app.core.database import Base


class RecoveryStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class RecoveryMethod(enum.Enum):
    BR = "backup and restore"
    FH = "file history"
    SC = "shadow copy"
    DEFAULT = "default"


class Recovery(Base):
    __tablename__ = "recoveries"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String, ForeignKey("devices.id"))
    name = Column(String, nullable=False)  # Ensure this is not nullable
    status = Column(Enum(RecoveryStatus), default=RecoveryStatus.PENDING)
    recovered_at = Column(DateTime(timezone=True))
    method = Column(Enum(RecoveryMethod), default=RecoveryMethod.DEFAULT)
    failed_at = Column(DateTime(timezone=True))
    last_updated = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
