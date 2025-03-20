from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.api.routers import agentbinary
from app.core.security import FlexibleAuthMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="Memcrypt AgentBinary API",
    lifespan=lifespan,
    openapi_url="/agentbinary/openapi.json",
    docs_url="/agentbinary/docs",
    redoc_url=None,
)

public_paths = [
    "/",
    "/agentbinary/docs",
    "/agentbinary/openapi.json",
    "/agentbinary/v1.0/heartbeat",
]
role_protected_operations = {
    "/agentbinary/v1.0": {"POST": ["PLATFORM_ADMIN"], "DELETE": ["PLATFORM_ADMIN"]}
}

app.add_middleware(
    FlexibleAuthMiddleware,
    public_paths=public_paths,
    role_protected_operations=role_protected_operations,
)

# Include the versioned routers in the main application
app.include_router(agentbinary.router_v1)


@app.get("/", include_in_schema=False)
async def root():
    """
    Root endpoint that provides basic API information and links.
    """
    return JSONResponse(
        {
            "name": "Memcrypt AgentBinary API",
            "version": "1.0.0",
            "description": "API for managing agent binary versions",
            "health_check": "/health",
            "documentation": "/docs",
            "openapi_schema": "/openapi.json",
        }
    )
