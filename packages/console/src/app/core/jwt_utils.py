import base64
import json
from functools import lru_cache

import requests
from jose import JWTError, jwk, jwt
from jose.utils import base64url_decode

from ..config import settings
from ..schemas.common import TokenData
from .exceptions import UnauthorizedException


@lru_cache(maxsize=1)
def get_jwks():
    jwks_uri = f"{settings.CONSOLE_KEYCLOAK_URL}/realms/{settings.CONSOLE_KEYCLOAK_REALM}/protocol/openid-connect/certs"
    jwks_response = requests.get(jwks_uri)
    jwks_response.raise_for_status()
    return jwks_response.json()


def verify_token(token: str) -> TokenData:
    try:
        headers = jwt.get_unverified_headers(token)
        jwks = get_jwks()

        key = next((k for k in jwks["keys"] if k["kid"] == headers["kid"]), None)
        if not key:
            raise UnauthorizedException(message="Invalid token: Key not found")

        public_key = jwk.construct(key)
        message, encoded_sig = token.rsplit(".", 1)
        decoded_sig = base64url_decode(encoded_sig.encode())

        if not public_key.verify(message.encode(), decoded_sig):
            raise UnauthorizedException(message="Invalid token signature")

        payload = token.split(".")[1]
        payload += "=" * ((4 - len(payload) % 4) % 4)
        decoded_payload = base64.urlsafe_b64decode(payload)
        claims = json.loads(decoded_payload)

        if (
            claims["iss"]
            != f"{settings.CONSOLE_PUBLIC_KEYCLOAK_URL}/realms/{settings.CONSOLE_KEYCLOAK_REALM}"
        ):
            raise UnauthorizedException(message="Invalid token issuer")

        if claims["azp"] != settings.CONSOLE_PUBLIC_KEYCLOAK_CLIENT_ID:
            raise UnauthorizedException(message="Token not intended for this client")

        return TokenData(
            username=claims.get("preferred_username"),
            org_id=claims.get("org_id") if claims.get("org_id") else "",
            roles=claims.get("realm_access", {}).get("roles", []),
        )
    except JWTError:
        raise UnauthorizedException(message="Invalid authentication credentials")
