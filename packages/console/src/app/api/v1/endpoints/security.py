from fastapi import Security
from fastapi.security import APIKeyHeader

from app.core.exceptions import ForbiddenException

api_key_header = APIKeyHeader(name="X-Org-Key", auto_error=False)


async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header is None:
        raise ForbiddenException(message="X-Org-Key header is required")
    return api_key_header
