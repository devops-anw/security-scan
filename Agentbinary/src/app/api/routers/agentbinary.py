import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.params import Depends
from fastapi.responses import JSONResponse, FileResponse
from app.core.utils import get_all_versions, update_versions_file
from app.core.security import get_current_user
from app.config.settings import get_settings
import os
import logging
from datetime import datetime

# Create a router for versioned endpoints
router_v1 = APIRouter(prefix="/agentbinary/v1.0")


# Endpoint for admin to upload a new agent binary version
@router_v1.post("/", status_code=201)
async def upload_agentbinary(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a new agent binary version. Only accessible by admin users.
    """
    form = await request.form()
    if len(form.multi_items()) > 1:
        logging.warning(
            f"Multiple file uploads attempted by user: {current_user.get('preferred_username')}"
        )
        raise HTTPException(
            status_code=400,
            detail="Multiple file upload is not allowed. Please upload only one file at a time.",
        )

    if file.content_type not in [
        "application/octet-stream",  # Generic binary
        "application/x-binary",  # Generic binary
        "application/zip",  # Standard zip format
        "application/x-zip-compressed",  # Windows zip format
        "application/x-msdownload",  # .exe format (for Windows binaries)
        "application/x-tar",  # Tar format
        "application/x-ms-dos-executable",
        "application/x-msdos-program",
    ]:
        file_content = await file.read()
        logging.warning(
            f"Writing file content of type {type(file_content)} and length {len(file_content)}"
        )
        raise HTTPException(
            status_code=400, detail=f"Invalid file type {file.content_type}"
        )

    # Read the file content to check its size
    file_content = await file.read()
    logging.debug(
        f"Writing file content of type {type(file_content)} and length {len(file_content)}"
    )

    if len(file_content) == 0:
        logging.warning(
            f"Empty file uploaded by user: {current_user.get('preferred_username')}"
        )
        raise HTTPException(status_code=400, detail="Empty files are not allowed")

    max_file_size = get_settings().AB_UPLOAD_MAX_FILE_SIZE
    if len(file_content) > max_file_size:
        logging.warning(
            f"File size too large uploaded by user: {current_user.get('preferred_username')}"
        )
        raise HTTPException(status_code=400, detail="File size too large")

    try:
        # Generate a timestamp for the version
        version = datetime.now().strftime("%Y%m%d%H%M%S")

        # Append the version (timestamp) to the filename
        filename_with_version = f"{os.path.splitext(file.filename)[0]}_{version}{os.path.splitext(file.filename)[1]}"
        file_path = os.path.join(get_settings().UPLOAD_DIRECTORY, filename_with_version)

        with open(file_path, "wb") as buffer:
            buffer.write(file_content)

        # Update the versions file
        update_versions_file(version, filename_with_version)

        logging.info(
            f"File uploaded successfully by user: {current_user.get('preferred_username')}, filename: {filename_with_version}"
        )
        return JSONResponse(
            content={
                "filename": filename_with_version,
                "version": version,
                "status": "uploaded successfully",
            }
        )
    except Exception as e:
        logging.error(f"Error while uploading file: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Endpoint to list all available agent binary versions and their files
@router_v1.get("/")
async def list_agentbinaries(current_user: dict = Depends(get_current_user)):
    """
    List all available agent binary versions and their files.
    """
    try:
        logging.debug("Listing all versions")
        versions = get_all_versions()
        if not versions:
            raise HTTPException(status_code=404, detail="No versions available")

        # Sort versions by timestamp in descending order
        sorted_versions = dict(
            sorted(versions.items(), key=lambda item: item[0], reverse=True)
        )

        # Create a dictionary with download links for each file
        versions_with_links = {
            version: [
                {"filename": filename, "download_link": f"/download/{filename}"}
                for filename in filenames
            ]
            for version, filenames in sorted_versions.items()
        }

        return JSONResponse(content={"versions": versions_with_links})
    except HTTPException as e:
        logging.error(f"HTTP error while listing versions: {e.detail}")
        raise
    except Exception as e:
        logging.error(f"Unexpected error while listing versions: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Endpoint to delete a specified agent binary file
@router_v1.delete("/{filename}", status_code=204)
async def delete_agentbinary(
    request: Request, filename: str, current_user: dict = Depends(get_current_user)
):
    """
    Delete the specified agent binary file. Only accessible by admin users.
    """

    try:
        file_path = os.path.join(get_settings().UPLOAD_DIRECTORY, filename)

        if not os.path.isfile(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        os.remove(file_path)

        # Update the versions file to remove the deleted file
        versions = get_all_versions()
        for version, filenames in versions.items():
            if filename in filenames:
                filenames.remove(filename)
                if not filenames:
                    del versions[version]
                break

        # Save the updated versions file
        versions_file_path = os.path.join(
            get_settings().UPLOAD_DIRECTORY, get_settings().VERSIONS_FILE
        )
        with open(versions_file_path, "w") as f:
            json.dump(versions, f, indent=4)

        logging.info(
            f"File deleted successfully by user: {current_user.get('preferred_username')}, filename: {filename}"
        )
        return JSONResponse(status_code=204, content={"status": "deleted successfully"})
    except HTTPException as e:
        logging.error(f"HTTP error while deleting file: {e.detail}")
        raise
    except Exception as e:
        logging.error(f"Error while deleting file: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Endpoint to retrieve the latest agent binary file based on the timestamp
@router_v1.get("/latest")
async def list_latest_agentbinary(current_user: dict = Depends(get_current_user)):
    """
    Retrieve the latest agent binary file based on the timestamp.
    """
    try:
        versions = get_all_versions()
        if not versions:
            return {"versions": [], "message": "No versions available"}

        # Find the latest version based on the timestamp
        latest_version = max(versions.keys())
        latest_files = versions[latest_version]
        if not latest_files:
            return {
                "latestFiles": [],
                "message": "No files found in the latest version directory",
            }

        # Return JSON response with file details and download link
        file_details = {
            "filename": latest_files[0],
            "version": latest_version,
            "download_link": f"/download/{latest_files[0]}",
        }
        return JSONResponse(content={"file_details": file_details})
    except Exception as e:
        logging.error(f"Error while downloading latest file: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Endpoint to download the specified agent binary file
@router_v1.get("/download/{filename}")
async def download_agentbinary(
    filename: str, current_user: dict = Depends(get_current_user)
):
    """
    Download the specified agent binary file.
    """
    try:
        file_path = os.path.join(get_settings().UPLOAD_DIRECTORY, filename)

        versions = get_all_versions()
        file_exists_in_versions = any(
            filename in filenames for filenames in versions.values()
        )

        if not os.path.isfile(file_path) or not file_exists_in_versions:
            raise HTTPException(status_code=404, detail="File not found")

        return FileResponse(file_path, filename=filename)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error while downloading file: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Heartbeat endpoint
@router_v1.get("/heartbeat")
async def heartbeat():
    """
    Heartbeat endpoint to check if the API is alive.
    """
    return JSONResponse(content={"status": "alive"})
