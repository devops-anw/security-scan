from enum import Enum as PyEnum

from sqlalchemy import Column, DateTime, Enum, Float, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


# Enum for Recovery Status
class RecoveryStatus(PyEnum):
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    FAILED = "Failed"
    QUEUED = "Queued"
    PENDING = "Pending"


# Enum for Recovery Method
class RecoveryMethod(PyEnum):
    SHADOW_COPY = "Shadow Copy"
    BACKUP_RESTORE = "Backup Restore"
    FILE_HISTORY = "File History"
    CLOUD_BACKUP = "Cloud Backup"
    LOCAL_BACKUP = "Local Backup"
    REMOTE_RECOVERY = "Remote Recovery"
    MANUAL = "Manual"
    DEFAULT = "Default"  # Memcrypt standard recovery method


class FileRecovery(Base):
    __tablename__ = "file_recoveries"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, nullable=False)
    org_id = Column(String, nullable=True)
    file_name = Column(String, nullable=False)
    status = Column(
        Enum(RecoveryStatus), default=RecoveryStatus.IN_PROGRESS, nullable=False
    )
    recovery_method = Column(Enum(RecoveryMethod), nullable=False)
    file_size = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
