from copy import deepcopy
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models.endpoint_config import EndpointConfig
from app.schemas.endpoint_config import EndpointConfigCreate, EndpointConfigInDB

from .base import BaseRepository


class EndpointConfigRepository(
    BaseRepository[EndpointConfig, EndpointConfigCreate, EndpointConfigInDB]
):
    def __init__(self, db: Session):
        super().__init__(EndpointConfig, db)

    def get_by_org_id(
        self, org_id: str, skip: int = 0, limit: int = 100
    ) -> List[EndpointConfig]:
        return (
            self.db.query(self.model)
            .filter(self.model.org_id == org_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update(self, id: str, obj_in: Dict[str, Any]) -> EndpointConfig:
        db_obj = self.get(id)
        if db_obj:
            # Create a new config dictionary instead of updating in-place
            if "config" in obj_in and isinstance(obj_in["config"], dict):
                new_config = deepcopy(db_obj.config)
                new_config.update(obj_in["config"])
                db_obj.config = new_config

            # Update other fields
            for key, value in obj_in.items():
                if key != "config" and value is not None:
                    setattr(db_obj, key, value)

            # Mark the object as modified
            self.db.add(db_obj)

            # Commit the changes
            self.db.commit()

            # Refresh the object
            self.db.expire(db_obj)
            self.db.refresh(db_obj)

        return db_obj
