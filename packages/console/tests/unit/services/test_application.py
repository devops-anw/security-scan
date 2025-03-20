# from unittest.mock import Mock

import pytest

from app.models import Application

# from app.repositories.application import ApplicationRepository
from app.schemas.application import (
    ApplicationCreate,
    ApprovalStatus,
    ApplicationListResponse,
    ApplicationResponse,
)

# from app.services.application import ApplicationService


@pytest.fixture
def sample_application():
    return Application(
        id="app_123",
        name="TestApp",
        version="1.0",
        publisher="TestPublisher",
        status=ApprovalStatus.PENDING,
        hash="abcdef123456",
        organization_id="org_123",
    )


@pytest.fixture
def sample_application_create():
    return ApplicationCreate(
        name="NewApp",
        version="2.0",
        publisher="NewPublisher",
        hash="newappehash123",
        organization_id="org_123",
    )


def test_get(application_service, mock_application_repository, sample_application):
    app_id = "app_123"
    mock_application_repository.get.return_value = sample_application

    result = application_service.get(app_id)

    mock_application_repository.get.assert_called_once_with(app_id)
    assert result == sample_application


def test_get_all(application_service, mock_application_repository, sample_application):
    mock_applications = [sample_application, sample_application]
    mock_application_repository.get_all.return_value = mock_applications

    result = application_service.get_all(skip=0, limit=10)

    mock_application_repository.get_all.assert_called_once_with(skip=0, limit=10)
    assert result == mock_applications


def test_create(
    application_service,
    mock_application_repository,
    sample_application_create,
    sample_application,
):
    mock_application_repository.create.return_value = sample_application

    result = application_service.create(sample_application_create)

    mock_application_repository.create.assert_called_once_with(
        sample_application_create
    )
    assert result == sample_application


def test_update(
    application_service,
    mock_application_repository,
    sample_application_create,
    sample_application,
):
    app_id = "app_123"
    mock_application_repository.update.return_value = sample_application

    result = application_service.update(app_id, sample_application_create)

    mock_application_repository.update.assert_called_once_with(
        app_id, sample_application_create
    )
    assert result == sample_application


def test_delete(application_service, mock_application_repository, sample_application):
    app_id = "app_123"
    mock_application_repository.delete.return_value = sample_application

    result = application_service.delete(app_id)

    mock_application_repository.delete.assert_called_once_with(app_id)
    assert result == sample_application


def test_get_by_org(
    application_service, mock_application_repository, sample_application
):
    org_id = "org_123"
    search = None
    total_count = 2
    status = ApprovalStatus.PENDING
    mock_applications = [
        ApplicationResponse(
            id=sample_application.id,
            name=sample_application.name,
            version=sample_application.version,
            publisher=sample_application.publisher,
            hash=sample_application.hash,
            status=sample_application.status,
            organization_id=sample_application.organization_id,
        ),
        ApplicationResponse(
            id=sample_application.id,
            name=sample_application.name,
            version=sample_application.version,
            publisher=sample_application.publisher,
            hash=sample_application.hash,
            status=sample_application.status,
            organization_id=sample_application.organization_id,
        ),
    ]
    mock_application_repository.get_by_org.return_value = (
        mock_applications,
        total_count,
    )

    result = application_service.get_by_org(org_id, search, status, skip=5, limit=20)

    mock_application_repository.get_by_org.assert_called_once_with(
        org_id=org_id, search=search, skip=5, limit=20, status=status
    )
    assert result == ApplicationListResponse(
        applications=mock_applications, message=None, total_count=total_count
    )


def test_get_by_org_default_params(
    application_service, mock_application_repository, sample_application
):
    org_id = "org_123"
    search = None
    status = ApprovalStatus.PENDING
    total_count = 2
    mock_applications = [
        ApplicationResponse(
            id=sample_application.id,
            name=sample_application.name,
            version=sample_application.version,
            publisher=sample_application.publisher,
            hash=sample_application.hash,
            status=sample_application.status,
            organization_id=sample_application.organization_id,
        ),
        ApplicationResponse(
            id=sample_application.id,
            name=sample_application.name,
            version=sample_application.version,
            publisher=sample_application.publisher,
            hash=sample_application.hash,
            status=sample_application.status,
            organization_id=sample_application.organization_id,
        ),
    ]

    mock_application_repository.get_by_org.return_value = (
        mock_applications,
        total_count,
    )
    application_service.get_by_org(org_id, search, status, skip=5, limit=20)
    mock_application_repository.get_by_org.assert_called_once_with(
        org_id=org_id, search=search, skip=5, limit=20, status=status
    )
