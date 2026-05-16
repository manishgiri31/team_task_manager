"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from fastapi.exceptions import RequestValidationError
import logging

from app.config.settings import settings, get_cors_origins
from app.database import init_db
from app.startup.admin_bootstrap import ensure_default_admin
from app.middleware.error_handler import (
    integrity_error_handler,
    validation_exception_handler,   
    generic_exception_handler
)

# Import routes
from app.routes import auth, projects, tasks, dashboard, users

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Team Task Manager API with role-based access control",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(users.router)


@app.on_event("startup")
async def startup_event():
    """
    Application startup event.
    Initializes database tables (for development).
    """
    logger.info("Starting up application...")

    await init_db()
    logger.info("Database tables initialized")
    await ensure_default_admin()
    logger.info("Application started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdown event.
    Cleanup resources if needed.
    """
    logger.info("Shutting down application...")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Team Task Manager API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
