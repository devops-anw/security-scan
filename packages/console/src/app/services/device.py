from datetime import datetime, timezone
from typing import List, Optional, Tuple, Union

from fastapi.responses import JSONResponse

from app.core.exceptions import DuplicateObjectException
from app.models.device import Device
from app.repositories.device import DeviceRepository
from app.repositories.endpoint_config import EndpointConfigRepository
from app.schemas.device import DeviceCreate, DeviceInDB, DeviceTypes, DeviceUpdate
from app.schemas.endpoint_config import EndpointConfigCreate
from app.services.endpoint_config_converter import DEFAULT_CONFIG

from ..validators.devices import DeviceValidator
from .base import BaseService
from .endpoint_config import EndpointConfigService


class DeviceService(BaseService[Device, DeviceCreate, DeviceUpdate]):
    def __init__(
        self,
        repository: DeviceRepository,
        endpoint_config_repository: EndpointConfigRepository,
    ):
        super().__init__(repository)
        self.repository = repository
        self.validator = DeviceValidator(repository)
        self.endpoint_config_repository = endpoint_config_repository
        self.endpoint_config_service = EndpointConfigService(endpoint_config_repository)

    def _convert_to_response(
        self, device: Union[Device, List[Device]]
    ) -> Union[DeviceInDB, List[DeviceInDB]]:
        if isinstance(device, list):
            return [self._convert_to_response(d) for d in device]

        device_data = {
            "id": device.id,
            "org_id": device.org_id,
            "name": device.name,
            "type": device.type,
            "serial_number": device.serial_number,
            "created_at": device.created_at,
            "updated_at": device.updated_at,
            "last_seen": device.last_seen,
            "properties": device.properties or {},
        }
        return DeviceInDB(**device_data)

    def create_device(self, device: DeviceCreate) -> Device:
        existing_device = self.repository.get_by_serial_number(
            device.serial_number, device.org_id
        )
        if existing_device:
            raise DuplicateObjectException(
                message=f"Device with serial number {device.serial_number} already exists",
                error_code="DUPLICATE_DEVICE_SERIAL",
                details={"serial_number": device.serial_number},
            )

        # Create device with initial properties and last_seen
        current_time = datetime.now(timezone.utc)

        # Initialize properties with metrics if provided
        properties = device.properties or {}
        if properties:
            # Initialize CPU metric if provided
            if "cpu" in properties:
                properties["cpu"] = float(properties["cpu"])
            else:
                properties["cpu"] = 0.0

        # Create device with initial properties and last_seen
        create_data = DeviceCreate(
            org_id=device.org_id,
            name=device.name,
            type=device.type,
            serial_number=device.serial_number,
            properties=properties,
        )
        new_device = self.repository.create(create_data)

        # Update with last_seen and properties
        update_data = DeviceUpdate(last_seen=current_time, properties=properties)
        new_device = self.repository.update(new_device.id, update_data)

        endpoint_config = EndpointConfigCreate(
            id=str(new_device.id),
            org_id=str(new_device.org_id),
            name=f"{new_device.name} Config",
            type=str(new_device.type),
            config=DEFAULT_CONFIG,
        )
        self.endpoint_config_service.create_endpoint_config(endpoint_config)

        return self._convert_to_response(new_device)

    def get(self, device_id: str) -> Device:
        self.validator.validate_device_access(device_id)
        device = self.repository.get(device_id)
        return self._convert_to_response(device)

    def get_device_types(self) -> DeviceTypes:
        types = self.repository.get_device_types_by_org()
        return DeviceTypes(types=types)

    def get_devices_by_org_with_count(
        self,
        search: Optional[str] = None,
        device_type: Optional[str] = None,
        status: Optional[str] = None,
        health: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[DeviceInDB], int]:
        devices, total = self.repository.get_devices_by_criteria(
            search_term=search,
            device_type=device_type,
            status=status,
            health=health,
            skip=skip,
            limit=limit,
        )
        return self._convert_to_response(devices), total

    def update_device(self, device_id: str, device: DeviceUpdate) -> Device:
        self.validator.validate_device_access(device_id)
        return self.repository.update(device_id, device)

    def update_device_heartbeat(
        self, device_id: str, device_properties: Optional[dict] = None
    ) -> Device:
        self.validator.validate_device_access(device_id)

        if not device_properties:
            # If no properties provided, just update last_seen
            update_data = DeviceUpdate(last_seen=datetime.now(timezone.utc))
        else:
            # Convert and validate metrics
            processed_properties = {}

            # Handle CPU metric
            if "cpu" in device_properties:
                try:
                    processed_properties["cpu"] = float(device_properties["cpu"])
                except (ValueError, TypeError):
                    processed_properties["cpu"] = 0.0
            else:
                processed_properties["cpu"] = 0.0

            # Add any other properties
            for key, value in device_properties.items():
                if key != "cpu":
                    processed_properties[key] = value

            # Create update data with new properties
            update_data = DeviceUpdate(
                last_seen=datetime.now(timezone.utc), properties=processed_properties
            )

        updated_device = self.repository.update(device_id, update_data)
        return self._convert_to_response(updated_device)

    def delete_device(self, device_id: str) -> Device:
        self.validator.validate_device_access(device_id)
        device = self.repository.delete(device_id)
        if device:
            self.endpoint_config_repository.delete(device_id)
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Device Deleted successfully",
                "data": None,
            },
        )
