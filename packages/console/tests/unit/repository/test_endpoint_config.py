from unittest.mock import Mock, patch

import pytest

from app.models.endpoint_config import EndpointConfig
from app.schemas.endpoint_config import EndpointConfigCreate, EndpointConfigUpdate


@pytest.fixture
def sample_endpoint_config():
    return {
        "id": "endpoint_123456",
        "org_id": "org_123456",
        "name": "Test Endpoint",
        "type": "Windows",
        "config": {
            "MemcryptLog": {
                "POST_IP": "localhost",
                "PORT": 8888,
                "LOCAL_LOG_LOCATION": "C:\\Windows\\Detect\\Temp\\",
                "DEBUG": False,
            },
            "Analysis": {
                "dir_to_analyse": "",
                "key": "",
                "nonce": "",
                "ipaddress": "localhost",
                "port": 8888,
                "remote": True,
                "parallel": False,
                "bulk": False,
            },
        },
    }


def test_endpoint_config_repository_create(
    endpoint_config_repository, mock_db, sample_endpoint_config
):
    config = EndpointConfigCreate(**sample_endpoint_config)

    with patch("app.repositories.endpoint_config.EndpointConfig") as MockEndpointConfig:
        mock_instance = Mock()
        mock_instance.id = config.id
        mock_instance.org_id = config.org_id
        mock_instance.name = config.name
        mock_instance.type = config.type
        mock_instance.config = config.config
        MockEndpointConfig.return_value = mock_instance

        result = endpoint_config_repository.create(config)

        assert isinstance(result, EndpointConfig)
        assert result.id == config.id
        assert result.org_id == config.org_id
        assert result.name == config.name
        assert result.type == config.type
        assert result.config == config.config
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()


def test_endpoint_config_repository_get(
    endpoint_config_repository, mock_db, sample_endpoint_config
):
    endpoint_id = sample_endpoint_config["id"]
    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_instance = Mock(spec=EndpointConfig)
    mock_instance.id = endpoint_id
    mock_instance.org_id = sample_endpoint_config["org_id"]
    mock_instance.name = sample_endpoint_config["name"]
    mock_instance.type = sample_endpoint_config["type"]
    mock_instance.config = sample_endpoint_config["config"]
    mock_query.filter.return_value.first.return_value = mock_instance

    result = endpoint_config_repository.get(endpoint_id)

    assert isinstance(result, EndpointConfig)
    assert result.id == endpoint_id
    assert result.org_id == sample_endpoint_config["org_id"]
    assert result.name == sample_endpoint_config["name"]
    assert result.type == sample_endpoint_config["type"]
    assert result.config == sample_endpoint_config["config"]
    mock_db.query.assert_called_once_with(EndpointConfig)
    mock_query.filter.assert_called_once()


def test_endpoint_config_repository_update(
    endpoint_config_repository, mock_db, sample_endpoint_config
):
    endpoint_id = sample_endpoint_config["id"]
    update_data = EndpointConfigUpdate(
        name="Updated Endpoint",
        type="Linux",
        config={"MemcryptLog": {"POST_IP": "127.0.0.1", "PORT": 9999, "DEBUG": True}},
    )
    existing_config = Mock(spec=EndpointConfig)
    existing_config.id = endpoint_id
    existing_config.org_id = sample_endpoint_config["org_id"]
    existing_config.name = sample_endpoint_config["name"]
    existing_config.type = sample_endpoint_config["type"]
    existing_config.config = sample_endpoint_config["config"]

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value.first.return_value = existing_config

    result = endpoint_config_repository.update(endpoint_id, update_data.model_dump())

    assert isinstance(result, EndpointConfig)
    assert result.id == endpoint_id
    assert result.name == update_data.name
    assert result.type == update_data.type
    assert result.config["MemcryptLog"] == update_data.config["MemcryptLog"]
    assert "Analysis" in result.config  # Ensure old config sections are retained
    mock_db.add.assert_called_once_with(existing_config)
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(existing_config)


def test_endpoint_config_repository_delete(
    endpoint_config_repository, mock_db, sample_endpoint_config
):
    endpoint_id = sample_endpoint_config["id"]
    existing_config = Mock(spec=EndpointConfig)
    existing_config.id = endpoint_id
    existing_config.org_id = sample_endpoint_config["org_id"]
    existing_config.name = sample_endpoint_config["name"]
    existing_config.type = sample_endpoint_config["type"]
    existing_config.config = sample_endpoint_config["config"]

    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_query.filter.return_value.first.return_value = existing_config

    result = endpoint_config_repository.delete(endpoint_id)

    assert isinstance(result, EndpointConfig)
    assert result.id == endpoint_id
    assert result.org_id == sample_endpoint_config["org_id"]
    assert result.name == sample_endpoint_config["name"]
    assert result.type == sample_endpoint_config["type"]
    assert result.config == sample_endpoint_config["config"]
    mock_db.delete.assert_called_once_with(existing_config)
    mock_db.commit.assert_called_once()


def test_endpoint_config_repository_get_by_org_id(
    endpoint_config_repository, mock_db, sample_endpoint_config
):
    org_id = sample_endpoint_config["org_id"]
    mock_query = Mock()
    mock_db.query.return_value = mock_query
    mock_instance = Mock(spec=EndpointConfig)
    mock_instance.id = sample_endpoint_config["id"]
    mock_instance.org_id = org_id
    mock_instance.name = sample_endpoint_config["name"]
    mock_instance.type = sample_endpoint_config["type"]
    mock_instance.config = sample_endpoint_config["config"]
    mock_query.filter.return_value.offset.return_value.limit.return_value.all.return_value = [
        mock_instance
    ]

    result = endpoint_config_repository.get_by_org_id(org_id)

    assert isinstance(result, list)
    assert len(result) == 1
    assert isinstance(result[0], EndpointConfig)
    assert result[0].org_id == org_id
    mock_db.query.assert_called_once_with(EndpointConfig)
    mock_query.filter.assert_called_once()
    mock_query.filter.return_value.offset.assert_called_once_with(0)
    mock_query.filter.return_value.offset.return_value.limit.assert_called_once_with(
        100
    )
