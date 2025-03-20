from datetime import datetime
from typing import Dict, List
from uuid import uuid4

from app.core.context import get_org_id
from app.core.exceptions import (
    NotFoundException,
    ObjectNotFoundException,
    UnauthorizedException,
    ValidationException,
)
from app.core.logging import logger
from app.models import ApprovalStatus, Device, Inventory
from app.repositories.application import ApplicationRepository
from app.repositories.device import DeviceRepository
from app.repositories.inventory import InventoryRepository
from app.schemas.application import Application, ApplicationResponse
from app.schemas.inventory import (
    InventoryCreate,
    InventoryListResponse,
    InventoryResponse,
    InventoryUpdate,
)
from app.services.application import ApplicationService
from typing import Optional


class InventoryService:
    def __init__(
        self,
        inventory_repository: InventoryRepository,
        device_repository: DeviceRepository,
        application_repository: ApplicationRepository,
    ):
        self.inventory_repository = inventory_repository
        self.device_repository = device_repository
        self.application_repository = application_repository

    def _validate_inventory_access(self, inventory_id: str) -> Inventory:
        inventory_item = self.inventory_repository.get(inventory_id)
        if not inventory_item:
            raise ObjectNotFoundException(
                f"Inventory item with id {inventory_id} not found"
            )

        self._validate_device_access(inventory_item.device_id)
        return inventory_item

    def _validate_device_access(self, device_id: str) -> Device:
        org_id = get_org_id()
        if not org_id:
            raise UnauthorizedException("Organization ID not found in context")

        device = self.device_repository.get(device_id)

        if not device:
            raise ObjectNotFoundException(f"Device with id {device_id} not found")

        if device.org_id != org_id:
            raise UnauthorizedException(
                f"Organization does not have access to device {device_id}"
            )

        return device

    def _validate_application(self, application_id: str) -> Application:
        application = self.application_repository.get(application_id)
        if not application:
            raise ObjectNotFoundException(
                f"Application with id {application_id} not found"
            )

        if not get_org_id():
            raise UnauthorizedException(
                "platformadmin cannot access the application approve api"
            )

        if application.organization_id != get_org_id():
            raise UnauthorizedException(
                f"Organization does not have access to application {application_id}"
            )
        return application

    def _validate_application_status(self, application_id: str) -> bool:
        application = self.application_repository.get(application_id)
        if application.status != ApprovalStatus.PENDING:
            raise ValidationException(
                f"Application {application_id} is already in Approved or Denied state"
            )
        return application

    def get_device_inventory(
        self,
        device_id: str,
        skip: int = 0,
        limit: int = 100,
        search: str = None,
        status: Optional[ApprovalStatus] = None,
    ) -> List[InventoryResponse]:
        self._validate_device_access(device_id)
        inventory_items, total = self.inventory_repository.get_device_inventory(
            device_id, skip, limit, search, status
        )

        if not inventory_items and len(inventory_items) == 0:
            raise NotFoundException(
                f"No inventory found for device with id {device_id}"
            )
        inventory = [self._convert_to_response(item) for item in inventory_items]
        return InventoryListResponse(
            inventory=inventory, total=total, skip=skip, limit=limit
        )

    def create_inventory(
        self, device_id: str, inventory: InventoryCreate
    ) -> List[InventoryResponse]:
        new_items = []
        existing_items = []

        # validate and load device
        device = self._validate_device_access(device_id)

        for application in inventory.items:
            app = self.inventory_repository.get_application_by_details(
                application.name, application.version, device.org_id, application.hash
            )
            if not app:
                app = Application(
                    name=application.name,
                    version=application.version,
                    hash=application.hash,
                    publisher=application.publisher,
                    organization_id=device.org_id,
                    id=str(uuid4()),
                )
                app = self.inventory_repository.create_application(
                    app.model_dump(),
                )

            inventories = self.inventory_repository.get_device_inventory_by_application(
                device_id=device_id, app_id=app.id
            )
            if inventories and len(inventories) > 0:
                logger.warn(
                    f"Inventory item already exists for device {device_id} and application {app.id}"
                )
                existing_items.append(inventories[0])
                continue

            new_item = self.inventory_repository.create_inventory_item(
                device_id, app.id, app.status
            )
            new_items.append(new_item)

        self.inventory_repository.commit()
        return [self._convert_to_response(item) for item in new_items] + [
            self._convert_to_response(item, isExisted=True) for item in existing_items
        ]

    def update_inventory(
        self, device_id: str, inventory_update: InventoryUpdate
    ) -> list[InventoryResponse]:
        # validate and load device
        device = self._validate_device_access(device_id)

        # Remove applications
        for app_id in inventory_update.removed_app_ids:
            self.inventory_repository.remove_inventory_item(device_id, app_id)

        # Add new applications
        for app in inventory_update.added_apps:
            db_app = self.inventory_repository.get_application_by_details(
                app.name, app.version, device.org_id
            )
            if not db_app:
                db_app = self.inventory_repository.create_application(
                    {**app.model_dump(), "organization_id": device.org_id}
                )

            self.inventory_repository.create_inventory_item(device_id, db_app.id)

        self.inventory_repository.commit()
        return self.get_device_inventory(device_id)

    def delete_inventory_item(self, inventory_id: str) -> Dict[str, str]:
        self._validate_inventory_access(inventory_id)
        deleted = self.inventory_repository.delete(inventory_id)
        if not deleted:
            raise ObjectNotFoundException(
                message=f"Inventory item with id {inventory_id} not found"
            )
        return {"message": f"Inventory item {inventory_id} successfully deleted"}

    def approve_application(self, application_id: str) -> ApplicationResponse:
        self._validate_application(application_id)
        self._validate_application_status(application_id)
        application = self.application_repository.approve_application(application_id)
        # Approve all pending inventory items related to this application
        inventory_items = self.inventory_repository.get_by_application_id(
            application_id
        )
        for item in inventory_items:
            if item.status == ApprovalStatus.PENDING:
                item.status = ApprovalStatus.APPROVED
                item.approved_at = datetime.now()

        self.inventory_repository.commit()

        return ApplicationService.convert_to_response(application)

    def deny_application(self, application_id: str) -> ApplicationResponse:
        self._validate_application(application_id)
        self._validate_application_status(application_id)
        application = self.application_repository.deny_application(application_id)
        # Deny all pending or approved inventory items related to this application
        inventory_items = self.inventory_repository.get_by_application_id(
            application_id
        )
        for item in inventory_items:
            if (
                item.status == ApprovalStatus.PENDING
                or item.status == ApprovalStatus.APPROVED
            ):
                item.status = ApprovalStatus.DENIED
                item.denied_at = datetime.now()

        self.inventory_repository.commit()
        return ApplicationService.convert_to_response(application)

    def approve_applications(
        self, application_ids: List[str]
    ) -> List[ApplicationResponse]:
        approved_applications = []
        for app_id in application_ids:
            approved_app = self.approve_application(app_id)
            approved_applications.append(approved_app)
        return approved_applications

    def deny_applications(
        self, application_ids: List[str]
    ) -> List[ApplicationResponse]:
        denied_applications = []
        for app_id in application_ids:
            denied_app = self.deny_application(app_id)
            denied_applications.append(denied_app)
        return denied_applications

    def _convert_to_response(
        self, inventory: Inventory, isExisted: bool = False
    ) -> InventoryResponse:
        return InventoryResponse(
            id=inventory.id,
            device_id=inventory.device_id,
            application_id=inventory.application_id,
            status=inventory.status,
            approved_at=inventory.approved_at,
            denied_at=inventory.denied_at,
            last_updated=inventory.last_updated,
            application=(
                ApplicationResponse(
                    id=inventory.application.id,
                    name=inventory.application.name,
                    version=inventory.application.version,
                    publisher=inventory.application.publisher,
                    hash=inventory.application.hash,
                    status=inventory.application.status,
                    organization_id=inventory.application.organization_id,
                )
                if inventory.application
                else None
            ),
            message=(
                "An inventory item for this device and application already exists."
                if isExisted
                else "Created Successfully."
            ),
        )
