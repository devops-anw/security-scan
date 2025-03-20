import os
import json
import logging
from app.config.settings import get_settings


def get_all_versions():
    """
    Retrieve all versions from the versions file.

    Returns:
        dict: A dictionary containing all versions and their associated files.
    """
    try:
        settings = get_settings()
        versions_file_path = os.path.join(
            settings.UPLOAD_DIRECTORY, settings.VERSIONS_FILE
        )
        logging.debug(f"Reading versions from {versions_file_path}")
        if not os.path.exists(versions_file_path):
            logging.debug("Versions file does not exist")
            return {}
        with open(versions_file_path, "r") as f:
            versions = json.load(f)
        logging.debug(f"Versions loaded: {versions}")
        return versions
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error while getting versions: {e}")
        return {}  # Return an empty dictionary if there's a JSON decoding error
    except Exception as e:
        logging.error(f"Unexpected error while getting versions: {e}")
        return {}


def update_versions_file(version, filename):
    """
    Update the versions file with a new version and filename.

    Args:
        version (str): The version identifier.
        filename (str): The name of the file to be associated with the version.
    """
    try:
        settings = get_settings()
        versions = get_all_versions()
        if version in versions:
            versions[version].append(filename)
        else:
            versions[version] = [filename]

        versions_file_path = os.path.join(
            settings.UPLOAD_DIRECTORY, settings.VERSIONS_FILE
        )
        logging.debug(f"Updating versions file at {versions_file_path}")

        with open(versions_file_path, "w") as f:
            json.dump(versions, f, indent=4)  # Use indent for better readability

        logging.debug(f"Versions file updated: {versions}")
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding error while updating versions file: {e}")
    except OSError as e:
        logging.error(f"OS error while updating versions file: {e}")
    except Exception as e:
        logging.error(f"Unexpected error while updating versions file: {e}")


# Example usage of the utility functions
if __name__ == "__main__":
    # Example to test the functions
    update_versions_file("20230101010101", "example_file.txt")
    print(get_all_versions())
