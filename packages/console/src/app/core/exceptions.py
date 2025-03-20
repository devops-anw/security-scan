from typing import Any, Dict, Optional

from app.models.activity_logs import SeverityLevel


class AppException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int,
        error_code: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class ObjectNotFoundException(AppException):
    def __init__(
        self,
        message: str,
        error_code: str = "OBJECT_NOT_FOUND",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message, status_code=404, error_code=error_code, details=details
        )


class NotFoundException(AppException):
    def __init__(
        self,
        message: str,
        error_code: str = "OBJECT_NOT_FOUND",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message, status_code=404, error_code=error_code, details=details
        )


class DuplicateObjectException(AppException):
    def __init__(
        self,
        message: str,
        error_code: str = "DUPLICATE_OBJECT",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message, status_code=400, error_code=error_code, details=details
        )


class ValidationException(AppException):
    def __init__(
        self,
        message: str,
        error_code: str = "VALIDATION_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message, status_code=400, error_code=error_code, details=details
        )


class UnauthorizedException(AppException):
    def __init__(
        self,
        message: str,
        error_code: str = "UNAUTHORIZED",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message, status_code=401, error_code=error_code, details=details
        )


class ForbiddenException(AppException):
    def __init__(
        self,
        message: str,
        error_code: str = "FORBIDDEN",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message, status_code=403, error_code=error_code, details=details
        )


class DatabaseOperationException(AppException):
    def __init__(
        self,
        message: str,
        error_code: str = "UPDATE_OPERATION_FAILED",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message, status_code=400, error_code=error_code, details=details
        )


class DeviceNotFoundException(ObjectNotFoundException):
    def __init__(
        self, device_id: str, org_id: str, details: Optional[Dict[str, Any]] = None
    ):
        message = (
            f"Device with id '{device_id}' not found or does not belong to organization"
        )
        super().__init__(
            message=message,
            error_code="DEVICE_NOT_FOUND",
            details=details or {"device_id": device_id, "org_id": org_id},
        )


class InvalidSeverityException(ValidationException):
    def __init__(self, severity: str, details: Optional[Dict[str, Any]] = None):
        message = f"Invalid severity level: {severity}. Must be one of {', '.join(SeverityLevel.__members__)}"
        super().__init__(
            message=message,
            error_code="INVALID_SEVERITY",
            details=details
            or {
                "severity": severity,
                "valid_values": list(SeverityLevel.__members__.keys()),
            },
        )


class BatchDeviceValidationException(ValidationException):
    def __init__(
        self,
        invalid_devices: set[str],
        org_id: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        message = "Some devices were not found or do not belong to organization"
        super().__init__(
            message=message,
            error_code="INVALID_DEVICES_IN_BATCH",
            details=details
            or {"invalid_devices": list(invalid_devices), "org_id": org_id},
        )


class NoOrgActivityLogsFoundException(ObjectNotFoundException):
    def __init__(self, org_id: str, details: Optional[Dict[str, Any]] = None):
        message = "No activity logs found for organization"
        super().__init__(
            message=message,
            error_code="NO_ACTIVITY_LOGS_FOUND",
            details=details or {"org_id": org_id},
        )


class NoDevActivityLogsFoundException(ObjectNotFoundException):
    def __init__(self, org_id: str, details: Optional[Dict[str, Any]] = None):
        message = "No activity logs found for this device"
        super().__init__(
            message=message,
            error_code="NO_ACTIVITY_LOGS_FOUND",
            details=details or {"org_id": org_id},
        )
