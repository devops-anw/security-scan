import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.application import ApprovalStatus


class Inventory(Base):
    __tablename__ = "inventories"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String, ForeignKey("devices.id"))
    application_id = Column(String, ForeignKey("applications.id"))
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)
    approved_at = Column(DateTime(timezone=True))
    denied_at = Column(DateTime(timezone=True))
    last_updated = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    application = relationship("Application")

    __table_args__ = (Index("ix_inventory_status", "status"),)
