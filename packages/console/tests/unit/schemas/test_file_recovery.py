import pytest
from datetime import datetime
from pydantic import ValidationError
from app.models.file_recovery import RecoveryMethod, RecoveryStatus

from app.schemas.file_recovery import (
    FileRecoveryBase,
    FileRecoveryCreate,
    FileRecoveryUpdate,
    FileRecoveryInDB,
    FileRecoveryResponse,
    FileRecoveryListResponse,
    FileRecoveryBatchCreate,
)


def test_file_recovery_base():
    data = {
        "device_id": "device123",
        "file_name": "file.txt",
        "status": RecoveryStatus.PENDING,
        "recovery_method": RecoveryMethod.SHADOW_COPY,  # Use correct enum value
        "file_size": 123.45,
    }
    file_recovery = FileRecoveryBase(**data)
    assert file_recovery.device_id == "device123"
    assert file_recovery.file_name == "file.txt"
    assert file_recovery.status == RecoveryStatus.PENDING
    assert file_recovery.recovery_method == RecoveryMethod.SHADOW_COPY
    assert file_recovery.file_size == 123.45

    with pytest.raises(ValidationError):
        FileRecoveryBase(**{**data, "device_id": ""})


def test_file_recovery_create():
    data = {
        "device_id": "device123",
        "file_name": "file.txt",
        "status": RecoveryStatus.PENDING,
        "recovery_method": RecoveryMethod.SHADOW_COPY,  # Use correct enum value
        "file_size": 123.45,
    }
    file_recovery_create = FileRecoveryCreate(**data)
    assert file_recovery_create.device_id == "device123"


def test_file_recovery_update():
    data = {
        "status": RecoveryStatus.COMPLETED,
        "recovery_method": RecoveryMethod.BACKUP_RESTORE,  # Use correct enum value
    }
    file_recovery_update = FileRecoveryUpdate(**data)
    assert file_recovery_update.status == RecoveryStatus.COMPLETED
    assert file_recovery_update.recovery_method == RecoveryMethod.BACKUP_RESTORE


def test_file_recovery_in_db():
    data = {
        "device_id": "device123",
        "file_name": "file.txt",
        "status": RecoveryStatus.PENDING,
        "recovery_method": RecoveryMethod.SHADOW_COPY,  # Use correct enum value
        "file_size": 123.45,
        "id": 1,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    file_recovery_in_db = FileRecoveryInDB(**data)
    assert file_recovery_in_db.id == 1


def test_file_recovery_response():
    data = {
        "device_id": "device123",
        "file_name": "file.txt",
        "status": RecoveryStatus.PENDING,
        "recovery_method": RecoveryMethod.SHADOW_COPY,  # Use correct enum value
        "file_size": 123.45,
        "id": 1,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "org_id": "org123",
    }
    file_recovery_response = FileRecoveryResponse(**data)
    assert file_recovery_response.org_id == "org123"


def test_file_recovery_list_response():
    data = {
        "recoveries": [
            {
                "device_id": "device123",
                "file_name": "file.txt",
                "status": RecoveryStatus.PENDING,
                "recovery_method": RecoveryMethod.SHADOW_COPY,  # Use correct enum value
                "file_size": 123.45,
                "id": 1,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "org_id": "org123",
            }
        ],
        "message": "Success",
        "total_count": 1,
    }
    file_recovery_list_response = FileRecoveryListResponse(**data)
    assert file_recovery_list_response.total_count == 1


def test_file_recovery_batch_create():
    data = {
        "recoveries": [
            {
                "device_id": "device123",
                "file_name": "file.txt",
                "status": RecoveryStatus.PENDING,
                "recovery_method": RecoveryMethod.SHADOW_COPY,  # Use correct enum value
                "file_size": 123.45,
            }
        ]
    }
    file_recovery_batch_create = FileRecoveryBatchCreate(**data)
    assert len(file_recovery_batch_create.recoveries) == 1
