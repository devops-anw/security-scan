import logging
import sys
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from pathlib import Path

from app.config import settings
from app.core.logging_utils import get_json_formatter, get_sanitizing_formatter


def setup_logging():
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Set up root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Sanitizing formatter for console output
    sanitizing_formatter = get_sanitizing_formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # JSON formatter for file output
    json_formatter = get_json_formatter()

    # File handler (size-based rotation)
    file_handler = RotatingFileHandler(
        log_dir / "app.log", maxBytes=10 * 1024 * 1024, backupCount=5  # 10MB
    )
    file_handler.setFormatter(json_formatter)
    file_handler.setLevel(logging.INFO)

    # Time-based rotating file handler (daily rotation)
    daily_handler = TimedRotatingFileHandler(
        log_dir / "daily.log", when="midnight", interval=1, backupCount=30
    )
    daily_handler.setFormatter(json_formatter)
    daily_handler.setLevel(logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(sanitizing_formatter)
    console_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    # Add handlers to the logger
    logger.addHandler(file_handler)
    logger.addHandler(daily_handler)
    logger.addHandler(console_handler)

    return logger


# Create a global logger instance
logger = setup_logging()
