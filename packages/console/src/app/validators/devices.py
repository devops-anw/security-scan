import logging

from app.core.context import get_org_id
from app.core.exceptions import NotFoundException
from app.repositories.device import DeviceRepository

logger = logging.getLogger(__name__)


class DeviceValidator:
    def __init__(self, device_repository: DeviceRepository):
        self.device_repository = device_repository

    def validate_device_access(self, device_id: str):
        device = self.device_repository.get(device_id)
        if not device:
            logger.warning(f"Attempt to access non-existent device: {device_id}")
            raise NotFoundException(
                message=f"Device not found with the given ID {device_id}"
            )
        org_id = get_org_id()
        if device.org_id != get_org_id():
            logger.warning(
                f"Unauthorized device access attempt: Device {device_id}, Org {org_id}"
            )
            raise NotFoundException(
                message=f"You do not have permission to access this device {device_id}"
            )
        logger.info(f"Authorized access to device {device_id} by org {org_id}")
        return device
