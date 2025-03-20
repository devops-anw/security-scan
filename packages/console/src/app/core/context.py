from contextvars import ContextVar
from typing import Optional

_org_id_ctx_var: ContextVar[Optional[str]] = ContextVar("org_id", default=None)


def get_org_id() -> Optional[str]:
    return _org_id_ctx_var.get()


def set_org_id(org_id: str):
    _org_id_ctx_var.set(org_id)


def clear_org_id():
    _org_id_ctx_var.set(None)
