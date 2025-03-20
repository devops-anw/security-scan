from typing import Any, Dict, List

from app.models.endpoint_config import EndpointConfig
from app.repositories.endpoint_config import EndpointConfigRepository
from app.schemas.endpoint_config import (
    EndpointConfigCreate,
    EndpointConfigInDB,
    EndpointConfigUpdate,
)

from ..validators.endpoint_config import EndpointConfigValidator
from .base import BaseService


class EndpointConfigService(
    BaseService[EndpointConfig, EndpointConfigInDB, EndpointConfigCreate]
):
    def __init__(self, repository: EndpointConfigRepository):
        self.validator = EndpointConfigValidator(repository)
        super().__init__(repository)

    def create_endpoint_config(self, endpoint: EndpointConfigCreate) -> EndpointConfig:
        return self.repository.create(endpoint)

    def get_endpoints_by_org(
        self, org_id: str, skip: int = 0, limit: int = 100
    ) -> List[EndpointConfig]:
        return self.repository.get_by_org_id(org_id, skip=skip, limit=limit)

    def get_endpoint_by_id(self, endpoint_id: str) -> EndpointConfig:
        self.validator.validate_endpoint_config_access(endpoint_id)
        return self.repository.get(endpoint_id)

    def update_endpoint_config(
        self, endpoint_id: str, update_data: EndpointConfigUpdate
    ) -> EndpointConfig:
        self.validator.validate_endpoint_config_access(endpoint_id)
        return self.repository.update(endpoint_id, update_data.model_dump())

    def update_config_section(
        self, endpoint_id: str, section: str, values: Dict[str, Any]
    ) -> EndpointConfig:
        self.validator.validate_endpoint_config_access(endpoint_id)
        endpoint = self.get_endpoint_by_id(endpoint_id)
        if not endpoint:
            raise ValueError(f"Endpoint with id {endpoint_id} not found")

        if section not in endpoint.config:
            endpoint.config[section] = {}
        endpoint.config[section].update(values)

        return self.repository.update(endpoint_id, {"config": endpoint.config})
