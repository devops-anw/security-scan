from typing import List, Optional, Tuple

from sqlalchemy import String, and_, or_
from sqlalchemy.orm import Session

from app.core.exceptions import DatabaseOperationException
from app.models.device import Device
from app.models.file_recovery import FileRecovery, RecoveryStatus
from app.repositories.base import BaseRepository
from app.schemas.file_recovery import FileRecoveryCreate, FileRecoveryUpdate


class FileRecoveryRepository(
    BaseRepository[FileRecovery, FileRecoveryCreate, FileRecoveryUpdate]
):
    def __init__(self, db: Session):
        super().__init__(FileRecovery, db)

    def get_by_id(self, recovery_id: int) -> Optional[FileRecovery]:
        return (
            self.db.query(FileRecovery).filter(FileRecovery.id == recovery_id).first()
        )

    def get_file_recovereies_by_device(
        self,
        device_id: str,
        org_id: str,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Tuple[FileRecovery, str]]:
        query = (
            self.db.query(FileRecovery, Device.name)
            .join(Device, FileRecovery.device_id == Device.id)
            .filter(FileRecovery.device_id == device_id, FileRecovery.org_id == org_id)
        )

        if search:
            query = query.filter(FileRecovery.file_name.ilike(f"%{search}%"))

        if status:
            query = query.filter(FileRecovery.status.cast(String).ilike(f"%{status}%"))

        return (
            query.order_by(FileRecovery.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_file_recoveries_by_device(
        self,
        device_id: str,
        org_id: str,
        search: Optional[str] = None,
        status: Optional[str] = None,
    ) -> int:
        query = self.db.query(FileRecovery).filter(
            FileRecovery.device_id == device_id, FileRecovery.org_id == org_id
        )

        if search:
            query = query.filter(FileRecovery.file_name.ilike(f"%{search}%"))

        if status:
            query = query.filter(FileRecovery.status.cast(String).ilike(f"%{status}%"))

        return query.count()

    def get_file_recoveries_by_filters(
        self,
        org_id: str,
        search: Optional[str] = None,
        device_name: Optional[str] = None,
        status: Optional[RecoveryStatus] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Tuple[FileRecovery, str]], int]:
        base_conditions = [FileRecovery.org_id == org_id]

        # Filter conditions
        if device_name and device_name.strip():
            base_conditions.append(Device.name.ilike(f"%{device_name.strip()}%"))

        if search and search.strip():
            base_conditions.append(
                or_(
                    Device.name.ilike(f"%{search.strip()}%"),
                    FileRecovery.file_name.ilike(f"%{search.strip()}%"),
                )
            )

        if status and status.strip():
            base_conditions.append(
                FileRecovery.status.cast(String).ilike(f"%{status.strip()}%")
            )

        query = (
            self.db.query(FileRecovery, Device.name)
            .join(Device, FileRecovery.device_id == Device.id)
            .filter(and_(*base_conditions))
        )

        total_filtered = query.count()

        recoveries = (
            query.order_by(FileRecovery.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return recoveries, total_filtered

    def create_file_recoveries(
        self, recoveries_data: List[FileRecoveryCreate], org_id: str
    ) -> List[Tuple[FileRecovery, str]]:
        created_recoveries = []
        try:
            for recovery_data in recoveries_data:
                recovery_dict = recovery_data.model_dump()
                recovery_dict["org_id"] = org_id

                recovery = FileRecovery(**recovery_dict)
                self.db.add(recovery)
                created_recoveries.append(recovery)
            self.db.commit()
            for recovery in created_recoveries:
                self.db.refresh(recovery)
            recoveries_with_names = (
                self.db.query(FileRecovery, Device.name)
                .join(Device, FileRecovery.device_id == Device.id)
                .filter(FileRecovery.id.in_([r.id for r in created_recoveries]))
                .all()
            )

            return recoveries_with_names
        except Exception as e:
            self.db.rollback()
            raise DatabaseOperationException(
                message=f"Failed to create file recoveries: {str(e)}",
                error_code="FILE_RECOVERY_CREATE_FAILED",
                details={"org_id": org_id, "recoveries_count": len(recoveries_data)},
            )

    def update_file_recovery(
        self, recovery_id: int, recovery_data: FileRecoveryUpdate
    ) -> Optional[FileRecovery]:
        recovery = self.get_by_id(recovery_id)
        if recovery:
            for key, value in recovery_data.model_dump(exclude_unset=True).items():
                setattr(recovery, key, value)
            try:
                self.db.commit()
                self.db.refresh(recovery)  # Added refresh to get updated_at timestamp
            except Exception as e:
                self.db.rollback()
                raise DatabaseOperationException(
                    message=f"Failed to update file recovery: {str(e)}",
                    error_code="FILE_RECOVERY_UPDATE_FAILED",
                    details={"recovery_id": recovery_id},
                ) from e
        return recovery
