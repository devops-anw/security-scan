import os
import uuid

import pytest
import requests

BASE_URL = "http://localhost:8001/console/v1.0"

KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8081")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "memcrypt")
KEYCLOAK_ADMIN_USERNAME = os.getenv("KEYCLOAK_ADMIN_USERNAME", "platformadmin")
KEYCLOAK_ADMIN_PASSWORD = os.getenv("KEYCLOAK_ADMIN_PASSWORD", "platformadmin123")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "memcrypt-backend")
KEYCLOAK_CLIENT_SECRET = os.getenv(
    "KEYCLOAK_CLIENT_SECRET", "trQqSAPGH4GVcNCtPbEh5NsmsMv8nWY5"
)


@pytest.fixture(scope="module")
def api_client():
    return requests.Session()


def get_admin_token():
    token_url = (
        f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"
    )
    data = {
        "grant_type": "password",
        "client_id": "memcrypt-frontend",
        "username": KEYCLOAK_ADMIN_USERNAME,
        "password": KEYCLOAK_ADMIN_PASSWORD,
    }
    response = requests.post(token_url, data=data)
    response.raise_for_status()
    return response.json()["access_token"]


def get_client_token():
    token_url = (
        f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"
    )
    data = {
        "grant_type": "client_credentials",
        "client_id": KEYCLOAK_CLIENT_ID,
        "client_secret": KEYCLOAK_CLIENT_SECRET,
    }
    response = requests.post(token_url, data=data)
    response.raise_for_status()
    return response.json()["access_token"]


def create_organization(token, org_name):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    org_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{KEYCLOAK_REALM}/organizations"
    payload = {
        "name": org_name,
        "domains": [
            {
                "name": org_name.lower().replace(" ", "") + ".com",
                "verified": True,
            },
        ],
    }
    response = requests.post(org_url, json=payload, headers=headers)
    response.raise_for_status()
    return get_organization_by_org_name(token, org_name)


def get_organization_by_org_name(token, org_name):
    headers = {"Authorization": f"Bearer {token}"}
    org_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{KEYCLOAK_REALM}/organizations"
    response = requests.get(org_url, headers=headers)
    response.raise_for_status()
    organizations = response.json()
    return next(org for org in organizations if org["name"] == org_name)


def delete_organization(token, org_id):
    headers = {"Authorization": f"Bearer {token}"}
    org_url = (
        f"{KEYCLOAK_SERVER_URL}/admin/realms/{KEYCLOAK_REALM}/organizations/{org_id}"
    )
    response = requests.delete(org_url, headers=headers)
    if response.status_code not in (200, 204):
        response.raise_for_status()


def create_user(token, username, password, email, first_name, last_name):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    users_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{KEYCLOAK_REALM}/users"
    payload = {
        "username": username,
        "enabled": True,
        "firstName": first_name,
        "lastName": last_name,
        "email": email,
        "credentials": [{"type": "password", "value": password, "temporary": False}],
    }
    response = requests.post(users_url, json=payload, headers=headers)
    response.raise_for_status()
    return get_user_by_username(token, username)


def get_user_by_username(token, username):
    headers = {"Authorization": f"Bearer {token}"}
    users_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{KEYCLOAK_REALM}/users"
    response = requests.get(users_url, headers=headers, params={"username": username})
    response.raise_for_status()
    users = response.json()
    return next(user for user in users if user["username"] == username)


def assign_user_to_organization(token, user_id, org_id):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    assign_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{KEYCLOAK_REALM}/organizations/{org_id}/members"
    response = requests.post(assign_url, headers=headers, data=user_id)
    response.raise_for_status()


def get_user_token(username, password):
    token_url = (
        f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"
    )
    data = {
        "grant_type": "password",
        "client_id": "memcrypt-frontend",
        "username": username,
        "password": password,
    }
    response = requests.post(token_url, data=data)
    response.raise_for_status()
    return response.json()["access_token"]


def delete_user(token, user_id):
    headers = {"Authorization": f"Bearer {token}"}
    user_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{KEYCLOAK_REALM}/users/{user_id}"
    response = requests.delete(user_url, headers=headers)
    if response.status_code not in (200, 204):
        response.raise_for_status()


@pytest.fixture(scope="module")
def test_org_and_user():
    client_token = get_client_token()
    org_name = f"test-org-{uuid.uuid4()}"
    username = f"testuser-{uuid.uuid4()}"
    password = "testpassword123"
    email = f"{username}@example.com"

    org = create_organization(client_token, org_name)
    user = create_user(client_token, username, password, email, "Test", "User")
    assign_user_to_organization(client_token, user["id"], org["id"])

    user_token = get_user_token(username, password)

    yield {"org_id": org["id"], "user_id": user["id"], "user_token": user_token}

    # Cleanup
    try:
        delete_organization(client_token, org["id"])
    except Exception as e:
        print(f"Error deleting organization: {e}")

    try:
        delete_user(client_token, user["id"])
    except Exception as e:
        print(f"Error deleting user: {e}")


@pytest.fixture(scope="module")
def jwt_token(test_org_and_user):
    return test_org_and_user["user_token"]


@pytest.fixture(scope="module")
def test_org_id(test_org_and_user):
    return test_org_and_user["org_id"]
