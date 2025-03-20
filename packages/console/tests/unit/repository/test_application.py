from datetime import datetime
from unittest.mock import Mock, patch
import pytest

from app.models import Application, ApprovalStatus
from app.schemas.application import ApplicationCreate


@pytest.fixture
def sample_application():
    return {
        "id": "app_123456",
        "name": "Test Application",
        "version": "1.0.0",
        "publisher": "Test Publisher",
        "hash": "abcdef123456",
        "organization_id": "org_123456",
    }


def test_application_repository_create(
    application_repository, mock_db, sample_application
):
    app_create = ApplicationCreate(**sample_application)

    with patch("app.repositories.application.Application") as MockApplication:
        mock_instance = Mock()
        mock_instance.id = sample_application["id"]
        mock_instance.name = app_create.name
        mock_instance.version = app_create.version
        mock_instance.publisher = app_create.publisher
        mock_instance.hash = app_create.hash
        mock_instance.organization_id = sample_application["organization_id"]
        MockApplication.return_value = mock_instance

        result = application_repository.create(app_create)

        assert isinstance(result, Application)
        assert result.id == sample_application["id"]
        assert result.name == app_create.name
        assert result.version == app_create.version
        assert result.publisher == app_create.publisher
        assert result.hash == app_create.hash
        assert result.organization_id == app_create.organization_id
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()


def test_application_repository_get(
    application_repository, mock_db, sample_application
):
    app_id = sample_application["id"]
    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_instance = Mock(spec=Application)
    mock_instance.id = app_id
    mock_instance.name = sample_application["name"]
    mock_instance.version = sample_application["version"]
    mock_instance.publisher = sample_application["publisher"]
    mock_instance.hash = sample_application["hash"]
    mock_instance.organization_id = sample_application["organization_id"]
    mock_query.filter.return_value.first.return_value = mock_instance

    result = application_repository.get(app_id)

    assert isinstance(result, Application)
    assert result.id == app_id
    assert result.name == sample_application["name"]
    assert result.version == sample_application["version"]
    assert result.publisher == sample_application["publisher"]
    assert result.hash == sample_application["hash"]
    assert result.organization_id == sample_application["organization_id"]
    mock_db.query.assert_called_once_with(Application)
    mock_query.filter.assert_called_once()


def test_application_repository_get_by_org(
    application_repository, mock_db, sample_application
):
    org_id = sample_application["organization_id"]
    mock_query = Mock()
    mock_db.query.return_value = mock_query

    mock_instance = Mock(spec=Application)
    mock_instance.id = sample_application["id"]
    mock_instance.name = sample_application["name"]
    mock_instance.version = sample_application["version"]
    mock_instance.publisher = sample_application["publisher"]
    mock_instance.hash = sample_application["hash"]
    mock_instance.organization_id = org_id

    mock_filter = Mock()
    mock_order = Mock()
    mock_offset = Mock()
    mock_limit = Mock()

    mock_query.filter.return_value = mock_filter
    mock_filter.count.return_value = 2
    mock_filter.order_by.return_value = mock_order
    mock_order.offset.return_value = mock_offset
    mock_offset.limit.return_value = mock_limit
    mock_limit.all.return_value = [mock_instance]

    result, total_filtered = application_repository.get_by_org(org_id)

    assert isinstance(result, list)
    assert len(result) == 1
    assert isinstance(result[0], Application)
    assert result[0].organization_id == org_id
    assert total_filtered == 2

    mock_db.query.assert_called_once_with(Application)
    mock_query.filter.assert_called_once()

    # Verify order_by was called
    mock_filter.order_by.assert_called_once()

    # Verify pagination
    mock_order.offset.assert_called_once_with(0)
    mock_offset.limit.assert_called_once_with(10000)
    mock_limit.all.assert_called_once()


def test_application_repository_update(
    application_repository, mock_db, sample_application
):
    app_id = sample_application["id"]
    update_data = ApplicationCreate(
        name="Updated Application",
        version="2.0.0",
        publisher="Updated Publisher",
        hash="updated_hash",
        organization_id=sample_application["organization_id"],
    )
    existing_app = Mock(spec=Application)
    existing_app.id = app_id
    existing_app.name = sample_application["name"]
    existing_app.version = sample_application["version"]
    existing_app.publisher = sample_application["publisher"]
    existing_app.hash = sample_application["hash"]
    existing_app.organization_id = sample_application["organization_id"]

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value.first.return_value = existing_app

    result = application_repository.update(app_id, update_data)

    assert isinstance(result, Application)
    assert result.id == app_id
    assert result.name == update_data.name
    assert result.version == update_data.version
    assert result.publisher == update_data.publisher
    assert result.hash == update_data.hash
    assert result.organization_id == sample_application["organization_id"]
    mock_db.add.assert_called_once_with(existing_app)
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(existing_app)


def test_application_repository_delete(
    application_repository, mock_db, sample_application
):
    app_id = sample_application["id"]
    existing_app = Mock(spec=Application)
    existing_app.id = app_id
    existing_app.name = sample_application["name"]
    existing_app.version = sample_application["version"]
    existing_app.publisher = sample_application["publisher"]
    existing_app.hash = sample_application["hash"]
    existing_app.organization_id = sample_application["organization_id"]

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value.first.return_value = existing_app

    result = application_repository.delete(app_id)

    assert isinstance(result, Application)
    assert result.id == app_id
    assert result.name == sample_application["name"]
    assert result.version == sample_application["version"]
    assert result.publisher == sample_application["publisher"]
    assert result.hash == sample_application["hash"]
    assert result.organization_id == sample_application["organization_id"]
    mock_db.delete.assert_called_once_with(existing_app)
    mock_db.commit.assert_called_once()


def test_application_repository_get_by_org_and_name(
    application_repository, mock_db, sample_application
):
    org_id = sample_application["organization_id"]
    name = sample_application["name"]
    version = sample_application["version"]

    mock_query = Mock()
    mock_db.query.return_value = mock_query

    # Create a Mock object for Application, but set the attribute values directly
    mock_instance = Mock(spec=Application)
    mock_instance.id = sample_application["id"]
    mock_instance.name = sample_application["name"]
    mock_instance.version = sample_application["version"]
    mock_instance.publisher = sample_application["publisher"]
    mock_instance.hash = sample_application["hash"]
    mock_instance.organization_id = sample_application["organization_id"]

    mock_query.filter.return_value.filter.return_value.filter.return_value.first.return_value = (
        mock_instance
    )

    result = application_repository.get_by_org_and_name(org_id, name, version)

    assert isinstance(result, Application)
    assert result.organization_id == org_id
    assert result.name == name
    assert result.version == version
    mock_db.query.assert_called_once_with(Application)


def test_application_repository_get_by_org_and_name_not_found(
    application_repository, mock_db, sample_application
):
    org_id = sample_application["organization_id"]
    name = "Nonexistent App"
    version = "1.0.0"

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value.filter.return_value.filter.return_value.first.return_value = (
        None
    )

    result = application_repository.get_by_org_and_name(org_id, name, version)

    assert result is None
    mock_db.query.assert_called_once_with(Application)


def test_application_repository_get_by_hash(
    application_repository, mock_db, sample_application
):
    org_id = sample_application["organization_id"]
    hash = sample_application["hash"]

    mock_query = Mock()
    mock_db.query.return_value = mock_query

    # Create a Mock object for Application, but set the attribute values directly
    mock_instance = Mock(spec=Application)
    mock_instance.id = sample_application["id"]
    mock_instance.name = sample_application["name"]
    mock_instance.version = sample_application["version"]
    mock_instance.publisher = sample_application["publisher"]
    mock_instance.hash = sample_application["hash"]
    mock_instance.organization_id = sample_application["organization_id"]

    mock_query.filter.return_value.filter.return_value.first.return_value = (
        mock_instance
    )
    result = application_repository.get_by_hash(org_id, hash)
    print(result)
    print(sample_application)
    assert isinstance(result, Application)
    assert result.organization_id == org_id
    assert result.hash == hash
    mock_db.query.assert_called_once_with(Application)


def test_application_repository_get_by_hash_not_found(
    application_repository, mock_db, sample_application
):
    org_id = sample_application["organization_id"]
    hash = "Nonexistent App hash"

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value.filter.return_value.first.return_value = None

    result = application_repository.get_by_hash(org_id, hash)

    assert result is None
    mock_db.query.assert_called_once_with(Application)


@patch("app.repositories.application.datetime")
def test_application_repository_approve_application(
    mock_datetime, application_repository, mock_db, sample_application
):
    app_id = sample_application["id"]
    mock_now = datetime.now()
    mock_datetime.now.return_value = mock_now

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_instance = Mock(spec=Application, **sample_application)
    mock_query.filter.return_value.first.return_value = mock_instance

    result = application_repository.approve_application(app_id)

    assert isinstance(result, Application)
    assert str(result.status) == str(ApprovalStatus.APPROVED)
    assert result.approved_at == mock_now
    mock_db.commit.assert_called_once()


@patch("app.repositories.application.datetime")
def test_application_repository_deny_application(
    mock_datetime, application_repository, mock_db, sample_application
):
    app_id = sample_application["id"]
    mock_now = datetime.now()
    mock_datetime.now.return_value = mock_now

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_instance = Mock(spec=Application, **sample_application)
    mock_query.filter.return_value.first.return_value = mock_instance

    result = application_repository.deny_application(app_id)

    assert isinstance(result, Application)
    assert str(result.status) == str(ApprovalStatus.DENIED)
    assert result.denied_at == mock_now
    mock_db.commit.assert_called_once()


def test_application_repository_approve_nonexistent_application(
    application_repository, mock_db
):
    app_id = "nonexistent_id"

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value.first.return_value = None

    result = application_repository.approve_application(app_id)

    assert result is None
    mock_db.commit.assert_not_called()


def test_application_repository_deny_nonexistent_application(
    application_repository, mock_db
):
    app_id = "nonexistent_id"

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value.first.return_value = None

    result = application_repository.deny_application(app_id)

    assert result is None
    mock_db.commit.assert_not_called()
