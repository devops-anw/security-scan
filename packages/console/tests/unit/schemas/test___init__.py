import pytest  # noqa: F401

from app.schemas import activity_log


def test_activity_log():
    assert activity_log() is None
