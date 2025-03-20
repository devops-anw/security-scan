import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, String

from app.core.database import Base
from sqlalchemy.sql import func


class ApprovalStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"


class Application(Base):
    __tablename__ = "applications"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    version = Column(String)
    publisher = Column(String)
    hash = Column(String)
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True))
    denied_at = Column(DateTime(timezone=True))
    organization_id = Column(String)
