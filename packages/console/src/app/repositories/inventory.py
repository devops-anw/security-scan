from typing import List, Tuple, Type

from sqlalchemy.orm import Session

from app.models import Application, Inventory
from app.repositories.base import BaseRepository
from app.schemas.inventory import ApprovalStatus, InventoryCreate, InventoryUpdate
from typing import Optional


class InventoryRepository(BaseRepository[Inventory, InventoryCreate, InventoryUpdate]):
    def __init__(self, db: Session):
        super().__init__(Inventory, db)

    def get_device_inventory(
        self,
        device_id: str,
        skip: int = 0,
        limit: int = 100,
        search: str = None,
        status: Optional[ApprovalStatus] = None,
    ) -> Tuple[List[Inventory], int]:
        query = self.db.query(Inventory).filter(Inventory.device_id == device_id)
        if search:
            query = query.filter(
                Inventory.application.has(Application.name.ilike(f"%{search}%"))
            )

        if status:
            query = query.filter(Inventory.status == status.value.upper())
        total = query.count()
        device_inventory = query.offset(skip).limit(limit).all()
        return device_inventory, total

    def get_device_inventory_by_application(
        self, device_id: str, app_id: str
    ) -> List[Type[Inventory]]:
        return (
            self.db.query(Inventory)
            .filter(
                Inventory.device_id == device_id, Inventory.application_id == app_id
            )
            .all()
        )

    def get_application_by_details(
        self, name: str, version: str, org_id: str, hash: str
    ) -> Type[Application] | None:
        return (
            self.db.query(Application)
            .filter(
                Application.name == name,
                Application.version == version,
                Application.organization_id == org_id,
                Application.hash == hash,
            )
            .first()
        )

    def create_application(self, app_data: dict) -> Application:
        app = Application(**app_data)
        self.db.add(app)
        self.db.flush()
        return app

    def create_inventory_item(
        self, device_id: str, application_id: str, status: ApprovalStatus
    ) -> Inventory:
        inventory_item = Inventory(
            device_id=device_id, application_id=application_id, status=status
        )
        self.db.add(inventory_item)
        return inventory_item

    def remove_inventory_item(self, device_id: str, application_id: str) -> None:
        self.db.query(Inventory).filter(
            Inventory.device_id == device_id, Inventory.application_id == application_id
        ).delete()

    def get_by_application_id(self, app_id: str) -> List[Type[Inventory]]:
        return (
            self.db.query(self.model).filter(self.model.application_id == app_id).all()
        )

    def commit(self):
        self.db.commit()
