from datetime import datetime

from app.repositories.base import BaseRepository
from app.models import Application, ApprovalStatus
from sqlalchemy import String, cast, case
from sqlalchemy.orm import Session
from typing import Optional, Type, Tuple
from app.schemas.application import ApplicationCreate


class ApplicationRepository(
    BaseRepository[Application, ApplicationCreate, ApplicationCreate]
):
    def __init__(self, db: Session):
        super().__init__(Application, db)

    def get_by_org(
        self,
        org_id: str,
        search: str = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 10000,
    ) -> Tuple[list[Type[Application]], int]:
        query = self.db.query(self.model).filter(self.model.organization_id == org_id)

        base_conditions = []
        if status:
            if status and status.strip():
                base_conditions.append(
                    cast(self.model.status, String).ilike(f"%{status.strip()}%")
                )
        if search:
            base_conditions.append(self.model.name.ilike(f"%{search.strip()}%"))

        for condition in base_conditions:
            query = query.filter(condition)

        total_filtered = query.count()

        # Fixed case syntax for status ordering
        status_order = case(
            (self.model.status == ApprovalStatus.PENDING, 1),
            (self.model.status == ApprovalStatus.APPROVED, 2),
            (self.model.status == ApprovalStatus.DENIED, 3),
            else_=4,
        )

        results = (
            query.order_by(status_order, self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return results, total_filtered

    def get_by_org_and_name(
        self, org_id: str, name: str, version: str
    ) -> Type[Application] | None:
        return (
            self.db.query(self.model)
            .filter(self.model.organization_id == org_id)
            .filter(self.model.name == name)
            .filter(self.model.version == version)
            .first()
        )

    def get_by_hash(self, org_id: str, hash: str) -> Type[Application] | None:
        return (
            self.db.query(self.model)
            .filter(self.model.organization_id == org_id)
            .filter(self.model.hash == hash)
            .first()
        )

    def approve_application(self, application_id: str) -> Application | None:
        application = self.get(application_id)
        if application:
            application.status = ApprovalStatus.APPROVED
            application.approved_at = datetime.now()
            self.db.commit()
        return application

    def deny_application(self, application_id: str) -> Application | None:
        application = self.get(application_id)
        if application:
            application.status = ApprovalStatus.DENIED
            application.denied_at = datetime.now()
            self.db.commit()
        return application

    def commit(self):
        self.db.commit()
