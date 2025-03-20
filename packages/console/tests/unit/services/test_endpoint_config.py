from app.core.context import set_org_id
from app.models.endpoint_config import EndpointConfig
from app.schemas.endpoint_config import EndpointConfigCreate, EndpointConfigUpdate


def test_endpoint_config_service_create(
    endpoint_config_service, mock_endpoint_config_repository
):
    config = EndpointConfigCreate(
        id="test-endpoint-id",
        org_id="test-org-id",
        name="Test Endpoint",
        type="Windows",
        config={"MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False}},
    )
    mock_endpoint_config_repository.create.return_value = EndpointConfig(
        id="test-endpoint-id",
        org_id="test-org-id",
        name="Test Endpoint",
        type="Windows",
        config={"MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False}},
    )

    result = endpoint_config_service.create_endpoint_config(config)

    assert isinstance(result, EndpointConfig)
    assert result.id == "test-endpoint-id"
    assert result.org_id == "test-org-id"
    assert result.name == "Test Endpoint"
    assert result.type == "Windows"
    assert result.config == {
        "MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False}
    }
    mock_endpoint_config_repository.create.assert_called_once_with(config)


def test_endpoint_config_service_get(
    endpoint_config_service, mock_endpoint_config_repository
):
    id = "test-endpoint-id"
    mock_endpoint_config_repository.get.return_value = EndpointConfig(
        id=id,
        org_id="test-org-id",
        name="Test Endpoint",
        type="Windows",
        config={"MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False}},
    )
    set_org_id("test-org-id")

    result = endpoint_config_service.get_endpoint_by_id(id)

    assert isinstance(result, EndpointConfig)
    assert result.id == id
    assert result.org_id == "test-org-id"
    assert result.name == "Test Endpoint"
    assert result.type == "Windows"
    assert result.config == {
        "MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False}
    }


def test_endpoint_config_service_update(
    endpoint_config_service, mock_endpoint_config_repository
):
    id = "test-endpoint-id"
    update_data = EndpointConfigUpdate(
        name="Updated Endpoint",
        type="Linux",
        config={"MemcryptLog": {"POST_IP": "127.0.0.1", "PORT": 9999, "DEBUG": True}},
    )
    mock_endpoint_config_repository.get.return_value = EndpointConfig(
        id=id,
        org_id="test-org-id",
        name="Test Endpoint",
        type="Windows",
        config={"MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False}},
    )
    mock_endpoint_config_repository.update.return_value = EndpointConfig(
        id=id,
        org_id="test-org-id",
        name="Updated Endpoint",
        type="Linux",
        config={"MemcryptLog": {"POST_IP": "127.0.0.1", "PORT": 9999, "DEBUG": True}},
    )
    set_org_id("test-org-id")

    result = endpoint_config_service.update_endpoint_config(id, update_data)

    assert isinstance(result, EndpointConfig)
    assert result.id == id
    assert result.name == "Updated Endpoint"
    assert result.type == "Linux"
    assert result.config == {
        "MemcryptLog": {"POST_IP": "127.0.0.1", "PORT": 9999, "DEBUG": True}
    }
    mock_endpoint_config_repository.update.assert_called_once_with(
        id, update_data.model_dump()
    )


def test_endpoint_config_service_get_by_org(
    endpoint_config_service, mock_endpoint_config_repository
):
    org_id = "test-org-id"
    mock_endpoint_config_repository.get_by_org_id.return_value = [
        EndpointConfig(
            id="test-endpoint-1",
            org_id=org_id,
            name="Endpoint 1",
            type="Windows",
            config={"MemcryptLog": {"POST_IP": "localhost"}},
        ),
        EndpointConfig(
            id="test-endpoint-2",
            org_id=org_id,
            name="Endpoint 2",
            type="Linux",
            config={"MemcryptLog": {"POST_IP": "127.0.0.1"}},
        ),
    ]

    result = endpoint_config_service.get_endpoints_by_org(org_id)

    assert isinstance(result, list)
    assert len(result) == 2
    assert all(isinstance(item, EndpointConfig) for item in result)
    assert all(item.org_id == org_id for item in result)
    mock_endpoint_config_repository.get_by_org_id.assert_called_once_with(
        org_id, skip=0, limit=100
    )


def test_endpoint_config_service_update_config_section(
    endpoint_config_service, mock_endpoint_config_repository
):
    id = "test-endpoint-id"
    section = "MemcryptLog"
    values = {"POST_IP": "192.168.1.1", "PORT": 7777}

    mock_endpoint_config_repository.get.return_value = EndpointConfig(
        id=id,
        org_id="test-org-id",
        name="Test Endpoint",
        type="Windows",
        config={"MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False}},
    )

    set_org_id("test-org-id")

    mock_endpoint_config_repository.update.return_value = EndpointConfig(
        id=id,
        org_id="test-org-id",
        name="Test Endpoint",
        type="Windows",
        config={
            "MemcryptLog": {"POST_IP": "192.168.1.1", "PORT": 7777, "DEBUG": False}
        },
    )

    result = endpoint_config_service.update_config_section(id, section, values)

    assert isinstance(result, EndpointConfig)
    assert result.id == id
    assert result.config["MemcryptLog"]["POST_IP"] == "192.168.1.1"
    assert result.config["MemcryptLog"]["PORT"] == 7777
    assert result.config["MemcryptLog"]["DEBUG"] is False
    mock_endpoint_config_repository.update.assert_called_once()


def test_endpoint_config_service_update_config_section_new_section(
    endpoint_config_service, mock_endpoint_config_repository
):
    id = "test-endpoint-id"
    section = "NewSection"
    values = {"key1": "value1", "key2": "value2"}

    mock_endpoint_config_repository.get.return_value = EndpointConfig(
        id=id,
        org_id="test-org-id",
        name="Test Endpoint",
        type="Windows",
        config={"MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False}},
    )

    mock_endpoint_config_repository.update.return_value = EndpointConfig(
        id=id,
        org_id="test-org-id",
        name="Test Endpoint",
        type="Windows",
        config={
            "MemcryptLog": {"POST_IP": "localhost", "PORT": 8888, "DEBUG": False},
            "NewSection": {"key1": "value1", "key2": "value2"},
        },
    )

    result = endpoint_config_service.update_config_section(id, section, values)

    assert isinstance(result, EndpointConfig)
    assert result.id == id
    assert "NewSection" in result.config
    assert result.config["NewSection"] == values
    mock_endpoint_config_repository.update.assert_called_once()
