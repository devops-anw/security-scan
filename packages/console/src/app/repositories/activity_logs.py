from typing import List, Optional, Tuple

from sqlalchemy import String, and_, or_
from sqlalchemy.orm import Session

from app.models import ActivityLog
from app.models.device import Device
from app.repositories.base import BaseRepository
from app.schemas.activity_logs import ActivityLogCreate


class ActivityLogRepository(BaseRepository[ActivityLog, ActivityLogCreate, None]):
    def __init__(self, db: Session):
        super().__init__(ActivityLog, db)

    def create_activity_logs(
        self, logs: List[ActivityLogCreate], org_id: str
    ) -> List[Tuple[ActivityLog, str]]:
        created_logs = []
        try:
            for log_data in logs:
                log_dict = log_data.model_dump()
                log_dict["org_id"] = org_id

                log = ActivityLog(**log_dict)
                self.db.add(log)
                created_logs.append(log)
            self.db.commit()

            # Fetch device names in a single query
            log_ids = [log.id for log in created_logs]
            device_names = (
                self.db.query(ActivityLog, Device.name)
                .join(Device, ActivityLog.device_id == Device.id)
                .filter(ActivityLog.id.in_(log_ids))
                .all()
            )
            for log in created_logs:
                self.db.refresh(log)
            return device_names
        except Exception as e:
            self.db.rollback()
            raise e

    def get_activity_logs_by_filters(
        self,
        org_id: str,
        search: Optional[str] = None,
        device_name: Optional[str] = None,
        severity: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Tuple[ActivityLog, str]], int]:
        base_conditions = [ActivityLog.org_id == org_id]
        # filter condition
        if device_name and device_name.strip():
            base_conditions.append(Device.name.ilike(f"%{device_name.strip()}%"))

        if search and search.strip():
            base_conditions.append(
                or_(
                    Device.name.ilike(f"%{search.strip()}%"),
                    ActivityLog.activity_type.ilike(f"%{search.strip()}%"),
                )
            )

        if severity and severity.strip():
            base_conditions.append(
                ActivityLog.severity.cast(String).ilike(f"%{severity.strip()}%")
            )

        query = (
            self.db.query(ActivityLog, Device.name)
            .join(Device, ActivityLog.device_id == Device.id)
            .filter(and_(*base_conditions))
        )

        total_filtered = query.count()

        logs = (
            query.order_by(ActivityLog.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return logs, total_filtered

    def get_activity_logs_by_device(
        self,
        device_id: str,
        org_id: str,
        search: Optional[str] = None,
        severity: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Tuple[ActivityLog, str]], int]:
        base_conditions = [
            ActivityLog.device_id == device_id,
            ActivityLog.org_id == org_id,
        ]
        if search and search.strip():
            base_conditions.append(
                ActivityLog.activity_type.ilike(f"%{search.strip()}%")
            )

        if severity and severity.strip():
            base_conditions.append(
                ActivityLog.severity.cast(String).ilike(f"%{severity.strip()}%")
            )

        query = (
            self.db.query(ActivityLog, Device.name)
            .join(Device, ActivityLog.device_id == Device.id)
            .filter(and_(*base_conditions))
        )

        total_filtered = query.count()

        logs = (
            query.order_by(ActivityLog.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return logs, total_filtered
