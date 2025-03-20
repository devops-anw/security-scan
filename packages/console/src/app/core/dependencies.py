from typing import Optional

from fastapi import Depends, Header
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer

from app.config import settings
from app.core.context import set_org_id
from app.core.database import SessionLocal
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.jwt_utils import verify_token
from app.core.keycloak_client import KeycloakClient
from app.schemas.common import OrgData, TokenData


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.CONSOLE_PUBLIC_KEYCLOAK_URL}/realms/{settings.CONSOLE_KEYCLOAK_REALM}/protocol/openid-connect/token",
)

api_key_header = APIKeyHeader(name="X-Org-Key")


def get_keycloak_client():
    return KeycloakClient()


async def get_token_data(token: str = Depends(oauth2_scheme)) -> TokenData:
    token_data = verify_token(token)
    set_org_id(token_data.org_id)
    return token_data


async def get_org_from_api_key(
    api_key: str = Depends(api_key_header),
    keycloak_client: KeycloakClient = Depends(get_keycloak_client),
) -> OrgData:
    if not keycloak_client.validate_org_access(api_key):
        raise ForbiddenException(message="Invalid API key")
    set_org_id(api_key)
    return OrgData(org_id=api_key)


async def get_current_org(
    authorization: Optional[str] = Header(None), x_org_key: Optional[str] = Header(None)
):
    if authorization:
        token_data = await get_token_data(authorization.split()[1])
        return token_data.org_id
    elif x_org_key:
        org_data = await get_org_from_api_key(x_org_key)
        return org_data.org_id
    else:
        raise UnauthorizedException(message="Authentication required")
