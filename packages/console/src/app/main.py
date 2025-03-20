from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.api.error_handler import app_exception_handler, validation_exception_handler
from app.api.v1.endpoints import (
    activity_log,
    devices,
    endpoint_config,
    file_recovery,
    inventory,
)
from app.config import settings
from app.core.exceptions import AppException

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/console/openapi.json",
    docs_url="/console/docs",
    redoc_url=None,
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)


@app.exception_handler(AppException)
async def global_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return await app_exception_handler(request, exc)


app.include_router(
    devices.router, prefix=f"{settings.API_V1_STR}/devices", tags=["devices"]
)
app.include_router(
    endpoint_config.router,
    prefix=f"{settings.API_V1_STR}/endpoint-config",
    tags=["endpoint-config"],
)
app.include_router(
    inventory.router,
    prefix=f"{settings.API_V1_STR}",
    tags=["Applications / Inventory"],
)
app.include_router(
    activity_log.router,
    prefix=f"{settings.API_V1_STR}",
    tags=["activity-logs"],
)
app.include_router(
    file_recovery.router,
    prefix=f"{settings.API_V1_STR}",
    tags=["file-recovery"],
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
