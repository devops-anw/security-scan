from typing import List, Optional

from app.core.exceptions import NotFoundException
from app.models.file_recovery import FileRecovery
from app.repositories.device import DeviceRepository
from app.repositories.file_recovery import FileRecoveryRepository
from app.schemas.file_recovery import (
    FileRecoveryCreate,
    FileRecoveryListResponse,
    FileRecoveryResponse,
    FileRecoveryUpdate,
)
from app.validators.devices import DeviceValidator


class FileRecoveryService:
    def __init__(
        self,
        file_recovery_repository: FileRecoveryRepository,
        device_repository: DeviceRepository,
    ):
        self.repository = file_recovery_repository
        self.validator = DeviceValidator(device_repository)

    def create_file_recovery(
        self, recoveries_data: List[FileRecoveryCreate], org_id: str
    ) -> List[FileRecoveryResponse]:
        for recovery_data in recoveries_data:
            self.validator.validate_device_access(recovery_data.device_id)
        recoveries_with_names = self.repository.create_file_recoveries(
            recoveries_data, org_id
        )

        return [
            FileRecoveryResponse(
                id=recovery.id,
                org_id=recovery.org_id,
                device_id=recovery.device_id,
                device_name=device_name,
                file_name=recovery.file_name,
                status=recovery.status,
                recovery_method=recovery.recovery_method,
                file_size=recovery.file_size,
                created_at=recovery.created_at,
                updated_at=recovery.updated_at,
            )
            for recovery, device_name in recoveries_with_names
        ]

    def get_file_recovery_by_device(
        self,
        device_id: str,
        org_id: str,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
    ) -> FileRecoveryListResponse:
        self.validator.validate_device_access(device_id)
        recoveries_data = self.repository.get_file_recovereies_by_device(
            device_id, org_id, search=search, status=status, skip=skip, limit=limit
        )

        total_count = self.repository.count_file_recoveries_by_device(
            device_id, org_id, search, status
        )

        converted_recoveries = [
            FileRecoveryResponse(
                id=recovery.id,
                org_id=recovery.org_id,
                device_id=recovery.device_id,
                device_name=device_name,
                file_name=recovery.file_name,
                status=recovery.status,
                recovery_method=recovery.recovery_method,
                file_size=recovery.file_size,
                created_at=recovery.created_at,
                updated_at=recovery.updated_at,
            )
            for recovery, device_name in recoveries_data
        ]

        return FileRecoveryListResponse(
            recoveries=converted_recoveries,
            message=(
                "No file recoveries found for device {device_id}"
                if not recoveries_data
                else None
            ),
            total_count=total_count,
        )

    def get_file_recoveries_with_filters(
        self,
        org_id: str,
        search: Optional[str] = None,
        device_name: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> FileRecoveryListResponse:
        recoveries, total_count = self.repository.get_file_recoveries_by_filters(
            org_id=org_id,
            search=search,
            device_name=device_name,
            status=status,
            skip=skip,
            limit=limit,
        )
        converted_recoveries = [
            FileRecoveryResponse(
                id=recovery.id,
                org_id=recovery.org_id,
                device_id=recovery.device_id,
                device_name=device_name,
                file_name=recovery.file_name,
                status=recovery.status,
                recovery_method=recovery.recovery_method,
                file_size=recovery.file_size,
                created_at=recovery.created_at,
                updated_at=recovery.updated_at,
            )
            for recovery, device_name in recoveries
        ]

        return FileRecoveryListResponse(
            recoveries=converted_recoveries,
            message=(
                "No recoveries found for the organization" if not recoveries else None
            ),
            total_count=total_count,
        )

    def update_file_recovery(
        self, recovery_id: int, recovery_data: FileRecoveryUpdate, org_id: str
    ) -> Optional[FileRecoveryResponse]:
        recovery = self.repository.get_by_id(recovery_id)
        if not recovery:
            return None

        if recovery.org_id != org_id:
            raise NotFoundException(
                f"Recovery {recovery_id} does not belong to organization {org_id}"
            )
        updated_recovery = self.repository.update_file_recovery(
            recovery_id, recovery_data
        )
        return self._convert_to_response(updated_recovery) if updated_recovery else None

    @staticmethod
    def _convert_to_response(file_recovery: FileRecovery) -> FileRecoveryResponse:
        return FileRecoveryResponse(
            id=file_recovery.id,
            org_id=file_recovery.org_id,
            device_id=file_recovery.device_id,
            file_name=file_recovery.file_name,
            status=file_recovery.status,
            recovery_method=file_recovery.recovery_method,
            file_size=file_recovery.file_size,
            created_at=file_recovery.created_at,
            updated_at=file_recovery.updated_at,
        )
