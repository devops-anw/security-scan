from unittest.mock import MagicMock, patch

import pytest

from app.core.exceptions import NotFoundException
from app.validators.devices import DeviceValidator


@pytest.fixture
def device_repository():
    return MagicMock()


@pytest.fixture
def device_validator(device_repository):
    return DeviceValidator(device_repository)


def test_validate_device_access_device_not_found(device_validator, device_repository):
    device_repository.get.return_value = None
    device_id = "non_existent_device"

    with patch("app.validators.devices.logger") as mock_logger:
        with pytest.raises(NotFoundException) as excinfo:
            device_validator.validate_device_access(device_id)
        assert str(excinfo.value) == f"Device not found with the given ID {device_id}"
        mock_logger.warning.assert_called_once_with(
            f"Attempt to access non-existent device: {device_id}"
        )


def test_validate_device_access_unauthorized_access(
    device_validator, device_repository
):
    device_id = "device_id"
    device = MagicMock()
    device.org_id = "different_org_id"
    device_repository.get.return_value = device

    with patch("app.validators.devices.get_org_id", return_value="current_org_id"):
        with patch("app.validators.devices.logger") as mock_logger:
            with pytest.raises(NotFoundException) as excinfo:
                device_validator.validate_device_access(device_id)
            assert (
                str(excinfo.value)
                == f"You do not have permission to access this device {device_id}"
            )
            mock_logger.warning.assert_called_once_with(
                f"Unauthorized device access attempt: Device {device_id}, Org current_org_id"
            )


def test_validate_device_access_success(device_validator, device_repository):
    device_id = "device_id"
    device = MagicMock()
    device.org_id = "current_org_id"
    device_repository.get.return_value = device

    with patch("app.validators.devices.get_org_id", return_value="current_org_id"):
        with patch("app.validators.devices.logger") as mock_logger:
            result = device_validator.validate_device_access(device_id)
            assert result == device
            mock_logger.info.assert_called_once_with(
                f"Authorized access to device {device_id} by org current_org_id"
            )
