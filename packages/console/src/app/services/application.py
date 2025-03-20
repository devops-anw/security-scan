from uuid import uuid4

from app.core.exceptions import DuplicateObjectException
from app.schemas.application import (
    Application,
    ApplicationListResponse,
    ApplicationResponse,
    ApprovalStatus,
)
from app.services.base import BaseService
from app.repositories.application import ApplicationRepository
from app.schemas.application import ApplicationCreate
from typing import Optional


class ApplicationService(
    BaseService[Application, ApplicationCreate, ApplicationCreate]
):
    def __init__(self, repository: ApplicationRepository):
        super().__init__(repository)
        self.repository = repository

    def get_by_org(
        self,
        org_id: str,
        search: str = None,
        status: Optional[ApprovalStatus] = None,
        skip: int = 0,
        limit: int = 10000,
    ) -> ApplicationListResponse:
        applications, total_count = self.repository.get_by_org(
            org_id=org_id, search=search, status=status, skip=skip, limit=limit
        )
        converted_applications = [
            ApplicationResponse(
                id=application.id,
                name=application.name,
                version=application.version,
                publisher=application.publisher,
                hash=application.hash,
                status=application.status,
                organization_id=application.organization_id,
            )
            for application in applications
        ]
        return ApplicationListResponse(
            applications=converted_applications,
            message=(
                "No applicaions found for the organization"
                if not applications
                else None
            ),
            total_count=total_count,
        )

    def create_application(self, app: ApplicationCreate) -> Application:
        # check if the application already exists with name and version
        existing_app = self.repository.get_by_org_and_name(
            app.organization_id, app.name, app.version
        )
        if existing_app:
            raise DuplicateObjectException(
                message=f"Application with name {app.name} and version {app.version} already exists for organization {app.organization_id}"
            )
        # check if the application already exists with same hash
        existing_app = self.repository.get_by_hash(app.organization_id, app.hash)
        if existing_app:
            raise DuplicateObjectException(
                message=f"Application with hash {app.hash} already exists for organization {app.organization_id}"
            )
        app.id = str(uuid4())

        return self.create(app)

    @staticmethod
    def convert_to_response(application: Application) -> ApplicationResponse:
        return ApplicationResponse(
            id=application.id,
            name=application.name,
            version=application.version,
            publisher=application.publisher,
            hash=application.hash,
            status=application.status,
            organization_id=application.organization_id,
        )
