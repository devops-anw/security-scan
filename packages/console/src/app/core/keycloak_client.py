import requests

from app.config import settings
from app.core.exceptions import UnauthorizedException


class KeycloakClient:
    def __init__(self):
        self.server_url = settings.CONSOLE_KEYCLOAK_URL
        self.realm = settings.CONSOLE_KEYCLOAK_REALM
        self.client_id = settings.CONSOLE_KEYCLOAK_CLIENT_ID
        self.client_secret = settings.CONSOLE_KEYCLOAK_CLIENT_SECRET

    def get_token(self):
        data = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        response = requests.post(
            f"{self.server_url}/realms/{self.realm}/protocol/openid-connect/token",
            data=data,
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            raise UnauthorizedException(message="Failed to authenticate with Keycloak")

    def validate_org_access(self, org_key: str) -> bool:
        token = self.get_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        response = requests.get(
            f"{self.server_url}/admin/realms/{self.realm}/organizations/{org_key}",
            headers=headers,
        )
        return response.status_code == 200

    def get_user_roles(self, username: str) -> list:
        token = self.get_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        response = requests.get(
            f"{self.server_url}/admin/realms/{self.realm}/users/{username}/role-mappings/realm",
            headers=headers,
        )
        if response.status_code == 200:
            return [role["name"] for role in response.json()]
        else:
            raise UnauthorizedException(message="Failed to fetch user roles")
