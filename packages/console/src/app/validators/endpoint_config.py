import logging

from app.core.context import get_org_id
from app.core.exceptions import ObjectNotFoundException, UnauthorizedException
from app.repositories.endpoint_config import EndpointConfigRepository

logger = logging.getLogger(__name__)


class EndpointConfigValidator:
    def __init__(self, endpoint_config_repository: EndpointConfigRepository):
        self.endpoint_config_repository = endpoint_config_repository

    def validate_endpoint_config_access(self, endpoint_id: str):
        org_id = get_org_id()
        if not org_id:
            raise UnauthorizedException("Organization ID not found in context")

        endpoint_config = self.endpoint_config_repository.get(endpoint_id)
        if not endpoint_config:
            logger.warning(
                f"Attempt to access non-existent endpoint config: {endpoint_id}"
            )
            raise ObjectNotFoundException(
                message=f"Endpoint configuration not found with the ID {endpoint_id}"
            )
        if endpoint_config.org_id != org_id:
            logger.warning(
                f"Unauthorized endpoint config access attempt: Endpoint {endpoint_id}, Org {org_id}"
            )
            raise ObjectNotFoundException(
                message=f"You do not have permission to access this endpoint configuration with the ID {endpoint_id}"
            )
        logger.info(
            f"Authorized access to endpoint config {endpoint_id} by org {org_id}"
        )
        return endpoint_config
