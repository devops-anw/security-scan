from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple, Union

from app.core.exceptions import NotFoundException
from sqlalchemy import and_, or_, distinct, func, cast, Float
from sqlalchemy.orm import Session

from app.core.context import get_org_id

# from app.core.exceptions import NotFoundException, UnauthorizedException
from app.models.device import Device
from app.schemas.device import DeviceCreate, DeviceUpdate

from .base import BaseRepository


class DeviceRepository(BaseRepository[Device, DeviceCreate, DeviceUpdate]):
    def __init__(self, db: Session):
        super().__init__(Device, db)

    HEALTH_CRITICAL = "CRITICAL"
    HEALTH_AT_RISK = "AT_RISK"
    HEALTH_HEALTHY = "HEALTHY"
    HEALTH_UNKNOWN = "UNKNOWN"

    def get_by_serial_number(self, serial_number: str, org_id: str) -> Optional[Device]:
        return (
            self.db.query(self.model)
            .filter(
                and_(
                    self.model.serial_number == serial_number,
                    self.model.org_id == org_id,
                )
            )
            .first()
        )

    def get_device_types_by_org(self) -> List[str]:
        org_id = get_org_id()
        return [
            type_[0]
            for type_ in self.db.query(distinct(self.model.type))
            .filter(self.model.org_id == org_id)
            .order_by(self.model.type)
            .all()
        ]

    def update_device_status(self) -> None:
        """
        Update device status based on heartbeat timeout
        """
        current_time = datetime.now(timezone.utc)
        five_minutes_ago = current_time - timedelta(minutes=5)

        # Update devices that haven't sent heartbeat in 5 minutes
        inactive_devices = (
            self.db.query(Device)
            .filter(
                or_(
                    # Devices with last_seen older than 5 minutes
                    and_(
                        Device.last_seen.isnot(None),
                        Device.last_seen <= five_minutes_ago,
                    ),
                    # New devices without heartbeat after 5 minutes
                    and_(
                        Device.last_seen.is_(None),
                        Device.created_at <= five_minutes_ago,
                    ),
                )
            )
            .all()
        )

        if inactive_devices:
            for device in inactive_devices:
                # Clear all metrics and set new properties when device goes offline
                self.db.execute(
                    Device.__table__.update()
                    .where(Device.id == device.id)
                    .values(
                        last_seen=None,
                        health=self.HEALTH_UNKNOWN,
                        properties={"cpu": None, "memory": None, "disk": None},
                    )
                )
            self.db.commit()

    def update(self, id: str, obj_in: Union[DeviceUpdate, Dict[str, Any]]) -> Device:
        db_obj = self.get(id)
        if not db_obj:
            raise NotFoundException(f"Device with id {id} not found")

        update_data = (
            obj_in if isinstance(obj_in, dict) else obj_in.dict(exclude_unset=True)
        )

        if "properties" in update_data:
            # Replace properties completely with new values
            update_data["properties"] = update_data["properties"]

        for field in update_data:
            setattr(db_obj, field, update_data[field])

        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def _calculate_device_status(self, device: Device) -> str:
        """Calculate the device status based on last seen timestamp"""
        current_time = datetime.now(timezone.utc)

        # If device has never been seen, check creation time
        if device.last_seen is None:
            if device.created_at and (current_time - device.created_at) > timedelta(
                minutes=5
            ):
                return "OFFLINE"
            return "ONLINE"

        # If last seen within 5 minutes, device is online
        if (current_time - device.last_seen) <= timedelta(minutes=5):
            return "ONLINE"

        return "OFFLINE"

    def _calculate_device_health(self, device: Device) -> str:
        """Calculate the device health status based on CPU metrics"""
        if not device.properties:
            return self.HEALTH_UNKNOWN

        # Get CPU metric from properties
        cpu = device.properties.get("cpu")

        # If device is offline, return UNKNOWN status
        if self._calculate_device_status(device) == "OFFLINE":
            return self.HEALTH_UNKNOWN

        # If CPU metric is missing/undefined, return UNKNOWN
        if cpu is None:
            return self.HEALTH_UNKNOWN

        # Convert to float if it's a string
        try:
            cpu = float(cpu) if isinstance(cpu, str) else cpu
        except (ValueError, TypeError):
            return self.HEALTH_UNKNOWN

        # Determine health status based on CPU thresholds
        if cpu > 0.9:
            return self.HEALTH_CRITICAL
        elif cpu > 0.7:
            return self.HEALTH_AT_RISK
        return self.HEALTH_HEALTHY

    def get_devices_by_criteria(
        self,
        search_term: Optional[str] = None,
        device_type: Optional[str] = None,
        status: Optional[str] = None,
        health: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Device], int]:
        org_id = get_org_id()
        query = self.db.query(self.model).filter(self.model.org_id == org_id)

        if search_term and search_term.strip():
            search_term = f"%{search_term.strip().lower()}%"
            search_filter = or_(
                func.lower(self.model.name).contains(search_term),
                func.lower(self.model.serial_number).contains(search_term),
            )
            query = query.filter(search_filter)

        if device_type is not None:
            query = query.filter(self.model.type == device_type)

        if status is not None:
            status = status.upper()
            if status not in ["ONLINE", "OFFLINE"]:
                return [], 0

            current_time = datetime.now(timezone.utc)
            five_minutes_ago = current_time - timedelta(minutes=5)

            if status == "ONLINE":
                query = query.filter(
                    or_(Device.last_seen.is_(None), Device.last_seen > five_minutes_ago)
                )
            else:  # OFFLINE
                query = query.filter(
                    and_(
                        Device.last_seen.isnot(None),
                        Device.last_seen <= five_minutes_ago,
                    )
                )

        if health is not None:
            health = health.upper().replace(" ", "_")
            if health not in [
                self.HEALTH_CRITICAL,
                self.HEALTH_AT_RISK,
                self.HEALTH_HEALTHY,
                self.HEALTH_UNKNOWN,
            ]:
                return [], 0

            if health == self.HEALTH_UNKNOWN:
                query = query.filter(
                    or_(
                        self.model.properties["cpu"].is_(None),
                        self.model.properties["cpu"].astext == "",
                        self.model.properties["cpu"].astext == "0",
                        cast(self.model.properties["cpu"].astext, Float) == 0,
                    )
                )
            elif health == self.HEALTH_CRITICAL:
                query = query.filter(
                    and_(
                        self.model.properties["cpu"].isnot(None),
                        self.model.properties["cpu"].astext != "",
                        self.model.properties["cpu"].astext != "0",
                        cast(self.model.properties["cpu"].astext, Float) > 90,
                    )
                )
            elif health == self.HEALTH_AT_RISK:
                query = query.filter(
                    and_(
                        self.model.properties["cpu"].isnot(None),
                        self.model.properties["cpu"].astext != "",
                        self.model.properties["cpu"].astext != "0",
                        cast(self.model.properties["cpu"].astext, Float) <= 90,
                        cast(self.model.properties["cpu"].astext, Float) > 70,
                    )
                )
            elif health == self.HEALTH_HEALTHY:
                query = query.filter(
                    and_(
                        self.model.properties["cpu"].isnot(None),
                        self.model.properties["cpu"].astext != "",
                        self.model.properties["cpu"].astext != "0",
                        cast(self.model.properties["cpu"].astext, Float) <= 70,
                        cast(self.model.properties["cpu"].astext, Float) > 0,
                    )
                )

        total_filtered = query.count()
        devices = (
            query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()
        )
        return devices, total_filtered
