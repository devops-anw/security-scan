import pytest
from fastapi import FastAPI, Request, HTTPException
from fastapi.testclient import TestClient
from app.core.security import FlexibleAuthMiddleware, verify_token
from unittest.mock import patch, MagicMock


@pytest.fixture
def test_app():
    app = FastAPI()
    app.add_middleware(
        FlexibleAuthMiddleware,
        public_paths=["/public"],
        role_protected_operations={
            "/admin": {"POST": ["PLATFORM_ADMIN"], "DELETE": ["PLATFORM_ADMIN"]}
        },
    )

    @app.get("/public")
    async def public_endpoint():
        return {"message": "Public access"}

    @app.get("/jwt")
    async def jwt_endpoint(request: Request):
        return {"message": "JWT authenticated", "user": request.state.user}

    @app.post("/admin")
    async def admin_endpoint(request: Request):
        return {"message": "Admin access granted", "user": request.state.user}

    return app


@pytest.fixture
def test_client(test_app):
    return TestClient(test_app)


def test_public_endpoint(test_client):
    response = test_client.get("/public")
    assert response.status_code == 200
    assert response.json() == {"message": "Public access"}


def test_jwt_endpoint_valid_token(test_client):
    with patch("app.core.security.verify_token") as mock_verify:
        mock_verify.return_value = {"sub": "user123", "realm_access": {"roles": []}}
        response = test_client.get(
            "/jwt", headers={"Authorization": "Bearer valid_token"}
        )
    assert response.status_code == 200
    assert response.json()["message"] == "JWT authenticated"


def test_jwt_endpoint_invalid_token(test_client):
    with patch(
        "app.core.security.verify_token",
        side_effect=HTTPException(status_code=401, detail="Invalid token"),
    ):
        response = test_client.get(
            "/jwt", headers={"Authorization": "Bearer invalid_token"}
        )
    assert response.status_code == 401


def test_admin_endpoint_valid_token_and_role(test_client):
    with patch("app.core.security.verify_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "admin123",
            "realm_access": {"roles": ["PLATFORM_ADMIN"]},
        }
        response = test_client.post(
            "/admin", headers={"Authorization": "Bearer valid_admin_token"}
        )
    assert response.status_code == 200
    assert response.json()["message"] == "Admin access granted"


def test_admin_endpoint_valid_token_invalid_role(test_client):
    with patch("app.core.security.verify_token") as mock_verify:
        mock_verify.return_value = {
            "sub": "user123",
            "realm_access": {"roles": ["USER"]},
        }
        response = test_client.post(
            "/admin", headers={"Authorization": "Bearer valid_user_token"}
        )
    assert response.status_code == 403


@pytest.mark.parametrize(
    "token,expected_claims,expected_exception",
    [
        (
            "invalid_issuer",
            {"iss": "https://wrong-issuer", "azp": "test-client-id"},
            HTTPException,
        ),
        (
            "invalid_audience",
            {
                "iss": "https://test-keycloak-url/realms/test-realm",
                "azp": "wrong-client",
            },
            HTTPException,
        ),
    ],
)
def test_verify_token(token, expected_claims, expected_exception):
    with patch("app.core.security.jwt.get_unverified_headers") as mock_headers, patch(
        "app.core.security.get_jwks"
    ) as mock_get_jwks, patch("app.core.security.jwk.construct") as mock_construct:
        mock_headers.return_value = {"kid": "fakekey"}
        mock_get_jwks.return_value = {
            "keys": [{"kid": "fakekey", "kty": "RSA", "n": "fake_n", "e": "fake_e"}]
        }
        mock_public_key = MagicMock()
        mock_public_key.verify.return_value = True
        mock_construct.return_value = mock_public_key

        if expected_exception:
            with pytest.raises(expected_exception):
                verify_token(token)
        else:
            result = verify_token(token)
            assert result["iss"] == expected_claims["iss"]
            assert result["azp"] == expected_claims["azp"]
