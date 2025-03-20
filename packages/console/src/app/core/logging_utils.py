import json
import logging
import re
from typing import List


class SanitizingFormatter(logging.Formatter):
    def __init__(
        self, fmt: str = None, datefmt: str = None, sensitive_fields: List[str] = None
    ):
        super().__init__(fmt, datefmt)
        self.sensitive_fields = sensitive_fields or ["password", "credit_card", "ssn"]

    def format(self, record: logging.LogRecord) -> str:
        message = super().format(record)
        for field in self.sensitive_fields:
            message = re.sub(
                f"{field}=.*?(&|$)", f"{field}=*****\\1", message, flags=re.IGNORECASE
            )
        return message


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "name": record.name,
            "level": record.levelname,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)


def get_sanitizing_formatter(
    fmt: str = None, datefmt: str = None, sensitive_fields: List[str] = None
) -> SanitizingFormatter:
    return SanitizingFormatter(fmt, datefmt, sensitive_fields)


def get_json_formatter() -> JsonFormatter:
    return JsonFormatter()
