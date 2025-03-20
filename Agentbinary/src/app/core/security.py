from fastapi import HTTPException, Depends
from jose import jwt, JWTError, jwk
from jose.utils import base64url_decode
import json
import requests
import logging
from app.config.settings import get_settings
import base64
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict


# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cache for JWKS
jwks_cache = None

security = HTTPBearer()


def get_jwks():
    jwks_uri = f"{get_settings().AB_KEYCLOAK_URL}/realms/{get_settings().AB_KEYCLOAK_REALM}/protocol/openid-connect/certs"
    global jwks_cache
    if not jwks_cache:
        try:
            jwks_response = requests.get(jwks_uri)
            jwks_response.raise_for_status()
            jwks_cache = jwks_response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to fetch JWKS: {str(e)}")
            raise HTTPException(
                status_code=500, detail="Authentication service unavailable"
            )
    return jwks_cache


def verify_token(token: str) -> dict:
    try:
        settings = get_settings()
        headers = jwt.get_unverified_headers(token)
        jwks = get_jwks()

        key = next((k for k in jwks["keys"] if k["kid"] == headers["kid"]), None)
        if not key:
            raise HTTPException(status_code=401, detail="Invalid token: Key not found")

        public_key = jwk.construct(key)
        message, encoded_sig = token.rsplit(".", 1)
        decoded_sig = base64url_decode(encoded_sig.encode())

        if not public_key.verify(message.encode(), decoded_sig):
            raise HTTPException(status_code=401, detail="Invalid token signature")

        payload = token.split(".")[1]

        # Ensure padding
        payload += "=" * ((4 - len(payload) % 4) % 4)

        # Decode payload
        decoded_payload = base64.urlsafe_b64decode(payload)

        # Parse JSON
        claims = json.loads(decoded_payload)

        # Verify issuer
        if (
            claims["iss"]
            != f"{settings.AB_PUBLIC_KEYCLOAK_URL}/realms/{settings.AB_KEYCLOAK_REALM}"
        ):
            raise HTTPException(status_code=401, detail="Invalid token issuer")

        # Verify audience
        if claims["azp"] != settings.AB_KEYCLOAK_CLIENT_ID:
            raise HTTPException(
                status_code=401, detail="Token not intended for this client"
            )

        return claims

    except JWTError as e:
        logger.error(f"JWT Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {str(e)}")
        raise HTTPException(status_code=401, detail="Token verification failed")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    claims = verify_token(token)
    return claims


class FlexibleAuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        public_paths: List[str],
        role_protected_operations: Dict[str, Dict[str, List[str]]],
    ):
        super().__init__(app)
        self.public_paths = public_paths
        self.role_protected_operations = role_protected_operations
        self.security = HTTPBearer()

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        method = request.method

        # Check if the path is public
        if self.is_public_path(path):
            return await call_next(request)

        # For all non-public paths, we need to verify the token
        try:
            credentials: HTTPAuthorizationCredentials = await self.security(request)
            claims = verify_token(credentials.credentials)

            # Add user claims to the request state for use in route handlers
            request.state.user = claims

            # Check if the path and method require specific roles
            required_roles = self.get_required_roles(path, method)
            if required_roles:
                user_roles = claims.get("realm_access", {}).get("roles", [])
                if not any(role in user_roles for role in required_roles):
                    raise HTTPException(
                        status_code=403,
                        detail="Permission denied. Required role not found.",
                    )

        except HTTPException as e:
            return Response(content=str(e.detail), status_code=e.status_code)

        response = await call_next(request)
        return response

    def is_public_path(self, path: str) -> bool:
        return path in self.public_paths or path.rstrip("/") in self.public_paths

    def get_required_roles(self, path: str, method: str) -> List[str]:
        for protected_path, operations in self.role_protected_operations.items():
            if path.startswith(protected_path):
                return operations.get(method, [])
        return []
