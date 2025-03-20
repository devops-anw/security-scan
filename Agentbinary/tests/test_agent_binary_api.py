import pytest
from fastapi.testclient import TestClient
from fastapi import Request
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

# Mock JWT token
MOCK_JWT_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmYWtla2V5In0.eyJleHAiOjE2MjYyMzY4MDAsImlhdCI6MTYyNjIzNjIwMCwianRpIjoiZmFrZS1qd3QtaWQiLCJpc3MiOiJodHRwczovL2Zha2Uta2V5Y2xvYWsvYXV0aC9yZWFsbXMvZmFrZS1yZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJmYWtlLXN1YiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImZha2UtY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6ImZha2Utc2Vzc2lvbi1zdGF0ZSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiUExBVEZPUk1fQURNSU4iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50Il19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJmYWtlLXVzZXIifQ.fake-signature"


@pytest.fixture
def mock_request():
    request = MagicMock(spec=Request)
    request.state = MagicMock()
    request.state.user = {
        "realm_access": {"roles": ["PLATFORM_ADMIN"]},
        "preferred_username": "fake-user",
    }
    return request


@pytest.fixture
def mock_verify_token():
    with patch("app.core.security.verify_token") as mock:
        mock.return_value = {
            "realm_access": {"roles": ["PLATFORM_ADMIN"]},
            "preferred_username": "fake-user",
        }
        yield mock


@pytest.fixture
def mock_get_all_versions():
    with patch("app.api.routers.agentbinary.get_all_versions") as mock:
        mock.return_value = {
            "20230101000000": ["file1_20230101000000.zip"],
            "20230102000000": ["file2_20230102000000.zip"],
        }
        yield mock


@pytest.fixture
def mock_get_no_versions():
    with patch("app.core.utils.get_all_versions") as mock:
        mock.return_value = {}
        yield mock


@pytest.fixture
def mock_update_versions_file():
    with patch("app.core.utils.update_versions_file") as mock:
        yield mock


@pytest.fixture
def mock_latest_versions():
    with patch("app.api.routers.agentbinary.get_all_versions") as mock:
        mock.return_value = {
            "20230101000000": ["file1_20230101000000.zip"],
            "20230102000000": ["file2_20230102000000.zip"],
            "20230103000000": ["file3_20230103000000.zip"],
        }
        yield mock


def test_upload_agentbinary_success(
    mock_verify_token, mock_update_versions_file, mock_request
):
    with patch("builtins.open", MagicMock()):
        response = client.post(
            "/agentbinary/v1.0/",
            files={"file": ("test.zip", b"file_content", "application/zip")},
            headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
        )
    assert response.status_code == 200
    assert "filename" in response.json()
    assert "version" in response.json()
    assert response.json()["status"] == "uploaded successfully"


def test_upload_agentbinary_empty_file(mock_verify_token, mock_request):
    response = client.post(
        "/agentbinary/v1.0/",
        files={"file": ("empty.zip", b"", "application/zip")},
        headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Empty files are not allowed"


def test_upload_agentbinary_small_file(
    mock_verify_token, mock_update_versions_file, mock_request
):
    small_content = b"small file content"
    with patch("builtins.open", MagicMock()):
        response = client.post(
            "/agentbinary/v1.0/",
            files={"file": ("small.zip", small_content, "application/zip")},
            headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
        )
    assert response.status_code == 200
    assert "filename" in response.json()
    assert "version" in response.json()
    assert response.json()["status"] == "uploaded successfully"


def test_upload_agentbinary_large_file(mock_verify_token, mock_request):
    large_content = b"0" * (100 * 1024 * 1024 + 1)  # 100 MB + 1 byte
    response = client.post(
        "/agentbinary/v1.0/",
        files={"file": ("large.zip", large_content, "application/zip")},
        headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "File size too large"


# test to check for file content
def test_upload_agentbinary_file_content(
    mock_verify_token, mock_update_versions_file, mock_request
):
    file_content = b"test file content"
    mock_open = MagicMock()
    mock_file = MagicMock()
    mock_open.return_value.__enter__.return_value = mock_file

    with patch("builtins.open", mock_open):
        response = client.post(
            "/agentbinary/v1.0/",
            files={"file": ("test.zip", file_content, "application/zip")},
            headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
        )

    assert response.status_code == 200

    # Check if any write call matches the expected content
    matching_calls = [
        call for call in mock_file.write.call_args_list if call == call(file_content)
    ]
    assert (
        len(matching_calls) == 1
    ), f"Expected one write call with file content, found {len(matching_calls)}"

    # Check if the file content was written
    assert any(
        call == call(file_content) for call in mock_file.write.call_args_list
    ), "File content was not written"

    # Check if other write operations occurred (metadata, versions file update, etc.)
    assert mock_file.write.call_count > 1, "Expected multiple write operations"

    assert "filename" in response.json()
    assert "version" in response.json()
    assert response.json()["status"] == "uploaded successfully"


def test_upload_agentbinary_invalid_file_type(
    mock_verify_token, mock_update_versions_file, mock_request
):
    # file_content = b"test file content"
    response = client.post(
        "/agentbinary/v1.0/",
        files={"file": ("test.txt", b"test file content", "text/plain")},
        headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid file type text/plain"


def test_upload_multiple_files_fails(mock_verify_token, mock_request):
    """Test that multiple file uploads are rejected."""
    response = client.post(
        "/agentbinary/v1.0/",
        files=[
            ("file", ("test1.zip", b"content1", "application/zip")),
            ("file", ("test2.zip", b"content2", "application/zip")),
        ],
        headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
    )

    assert response.status_code == 400
    assert "Multiple file upload" in response.json()["detail"]


def test_list_agentbinaries(mock_verify_token, mock_get_all_versions):
    response = client.get(
        "/agentbinary/v1.0/", headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"}
    )
    assert response.status_code == 200
    assert "versions" in response.json()
    assert len(response.json()["versions"]) == 2


def test_list_agentbinaries_no_versions(mock_verify_token, mock_get_no_versions):
    response = client.get(
        "/agentbinary/v1.0/", headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "No versions available"


def test_list_latest_agentbinary(mock_verify_token, mock_latest_versions):
    """Test the latest version endpoint."""
    response = client.get(
        "/agentbinary/v1.0/latest",
        headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
    )

    assert response.status_code == 200
    assert "file_details" in response.json()

    latest_file = response.json()["file_details"]
    assert latest_file["filename"] == "file3_20230103000000.zip"
    assert latest_file["version"] == "20230103000000"
    assert "download_link" in latest_file


def test_list_latest_no_versions(mock_verify_token, mock_get_no_versions):
    """Test latest version endpoint when no versions exist."""
    response = client.get(
        "/agentbinary/v1.0/latest",
        headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
    )

    assert response.status_code == 200
    assert response.json() == {"versions": [], "message": "No versions available"}


def test_delete_agentbinary_success(mock_verify_token, mock_get_all_versions):
    with patch("os.path.isfile", return_value=True), patch("os.remove"), patch(
        "builtins.open", MagicMock()
    ):
        response = client.delete(
            "/agentbinary/v1.0/file1_20230101000000.zip",
            headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
        )
    assert response.status_code == 204


def test_delete_agentbinary_file_not_found(mock_verify_token):
    with patch("os.path.isfile", return_value=False):
        response = client.delete(
            "/agentbinary/v1.0/nonexistent.zip",
            headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
        )
    assert response.status_code == 404
    assert response.json()["detail"] == "File not found"


def test_upload_agentbinary_unauthorized():
    """Test upload endpoint without authentication."""
    response = client.post(
        "/agentbinary/v1.0/",
        files={"file": ("test.zip", b"file_content", "application/zip")},
    )
    assert response.status_code == 403  # Changed from 401 to 403


def test_upload_agentbinary_forbidden(mock_verify_token):
    """Test upload with non-admin user."""
    NON_ADMIN_JWT_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmYWtla2V5In0.eyJleHAiOjE2MjYyMzY4MDAsImlhdCI6MTYyNjIzNjIwMCwianRpIjoiZmFrZS1qd3QtaWQiLCJpc3MiOiJodHRwczovL2Zha2Uta2V5Y2xvYWsvYXV0aC9yZWFsbXMvZmFrZS1yZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJmYWtlLXN1YiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImZha2UtY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6ImZha2Utc2Vzc2lvbi1zdGF0ZSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiVVNFUiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InJlZ3VsYXItdXNlciJ9.fake-signature"

    mock_verify_token.return_value = {
        "realm_access": {"roles": ["USER"]},
        "preferred_username": "regular-user",
    }
    response = client.post(
        "/agentbinary/v1.0/",
        files={"file": ("test.zip", b"file_content", "application/zip")},
        headers={"Authorization": f"Bearer {NON_ADMIN_JWT_TOKEN}"},
    )
    assert response.status_code == 403  # Forbidden


def test_list_agentbinaries_versioned_order(mock_verify_token, mock_latest_versions):
    """Test that versions are sorted correctly."""
    response = client.get(
        "/agentbinary/v1.0/", headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"}
    )

    assert response.status_code == 200
    versions = response.json()["versions"]

    # Check versions are in descending order
    version_keys = list(versions.keys())
    assert version_keys == sorted(version_keys, reverse=True)


def test_download_file_not_found(mock_verify_token):
    """Test downloading a non-existent file."""
    with patch("os.path.isfile", return_value=False), patch(
        "app.config.settings.get_settings"
    ) as mock_settings:
        mock_settings.return_value.UPLOAD_DIRECTORY = "/fake/upload/dir"

        response = client.get(
            "/agentbinary/v1.0/download/nonexistent.zip",
            headers={"Authorization": f"Bearer {MOCK_JWT_TOKEN}"},
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "File not found"


def test_heartbeat():
    response = client.get("/agentbinary/v1.0/heartbeat")
    assert response.status_code == 200
    assert response.json() == {"status": "alive"}
