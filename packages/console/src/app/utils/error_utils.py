import re
from typing import Dict

# from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError


def extract_error_details(error_message: str) -> Dict[str, str]:
    db_error_match = re.search(r"psycopg2\.errors\.(\w+)", error_message)
    db_error_type = db_error_match.group(1) if db_error_match else "Unknown"

    detail_match = re.search(r"DETAIL:\s*(.*?)(?:\n|$)", error_message)
    detail = detail_match.group(1) if detail_match else "No detail provided"

    return {"error_type": db_error_type, "detail": detail}
