from fastapi import Request

# from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    AppException,
    DatabaseOperationException,
    NoDevActivityLogsFoundException,
    NoOrgActivityLogsFoundException,
    ObjectNotFoundException,
)
from app.core.logging import logger


async def app_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, AppException):
        logger.error(
            f"AppException occurred: {exc.error_code} - {exc.message}", exc_info=True
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.message,
                "code": exc.error_code,
                "details": exc.details,
            },
        )
    elif isinstance(exc, DatabaseOperationException):
        logger.error(
            f"DatabaseOperationException occurred: {exc.error_code} - {exc.message}",
            exc_info=True,
        )
        error_code = (
            "USER_EXISTS" if "already exists" in exc.message.lower() else "OTHER"
        )
        return JSONResponse(
            status_code=400,
            content={
                "error": {
                    "code": error_code,
                    "message": exc.message,
                    "details": exc.details,
                }
            },
        )
    else:
        logger.error(f"Unexpected exception occurred: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred.",
                    "details": {"error": str(exc)},
                }
            },
        )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = ".".join(map(str, error["loc"]))
        error_detail = {
            "field": field,
            "message": error["msg"],
        }
        errors.append(error_detail)

    logger.error(f"Validation error occurred: {errors}", exc_info=True)
    return JSONResponse(
        status_code=400,
        content={
            "error": "Validation error",
            "code": "INVALID_INPUT",
            "details": errors,
        },
    )


async def activity_logs_not_found_handler(
    request: Request, exc: ObjectNotFoundException
):
    if isinstance(exc, NoOrgActivityLogsFoundException):
        error_message = "No activity logs found for the organization."
    elif isinstance(exc, NoDevActivityLogsFoundException):
        error_message = "No activity logs found for the specified device."
    else:
        error_message = exc.message

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "message": error_message,
            "error_code": exc.error_code,
            "details": exc.details,
        },
    )
