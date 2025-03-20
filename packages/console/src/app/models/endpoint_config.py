from sqlalchemy import JSON, Column, DateTime, String
from sqlalchemy.sql import func

from app.core.database import Base


class EndpointConfig(Base):
    __tablename__ = "endpoint_configs"

    id = Column(String, primary_key=True)
    org_id = Column(String, nullable=False)
    name = Column(String, nullable=False)  # Ensure this is not nullable
    type = Column(String, nullable=False)
    config = Column(JSON, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=True
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
