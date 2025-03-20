from typing import List

from fastapi import Depends

from ..core.exceptions import ForbiddenException
from ..schemas.common import OrgData, TokenData
from .dependencies import get_org_from_api_key, get_token_data


def role_checker(allowed_roles: List[str]):
    async def check_roles(token_data: TokenData = Depends(get_token_data)):
        if not any(role in token_data.roles for role in allowed_roles):
            raise ForbiddenException(message="Insufficient permissions")
        return token_data

    return check_roles


async def get_current_user(token_data: TokenData = Depends(get_token_data)):
    return token_data


async def jwt_required(token_data: TokenData = Depends(get_token_data)):
    return token_data.org_id


async def api_key_required(org_data: OrgData = Depends(get_org_from_api_key)):
    return org_data.org_id
