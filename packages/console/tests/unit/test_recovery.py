import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.recovery import Recovery, RecoveryMethod, RecoveryStatus


# Setup an in-memory SQLite database for testing
@pytest.fixture(scope="module")
def engine():
    return create_engine("sqlite:///:memory:")


@pytest.fixture(scope="module")
def tables(engine):
    Recovery.__table__.create(engine)
    yield
    Recovery.__table__.drop(engine)


@pytest.fixture(scope="function")
def dbsession(engine, tables):
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    yield session
    session.close()
    transaction.rollback()
    connection.close()


def test_recovery_creation(dbsession):
    recovery = Recovery(
        device_id="device123",
        name="Test Recovery",
        status=RecoveryStatus.PENDING,
        method=RecoveryMethod.DEFAULT,
    )
    dbsession.add(recovery)
    dbsession.commit()
    assert recovery.id is not None
    assert recovery.status == RecoveryStatus.PENDING
    assert recovery.method == RecoveryMethod.DEFAULT


def test_recovery_status_update(dbsession):
    recovery = Recovery(
        device_id="device123",
        name="Test Recovery",
        status=RecoveryStatus.PENDING,
        method=RecoveryMethod.DEFAULT,
    )
    dbsession.add(recovery)
    dbsession.commit()

    recovery.status = RecoveryStatus.COMPLETED
    dbsession.commit()

    updated_recovery = dbsession.query(Recovery).filter_by(id=recovery.id).first()
    assert updated_recovery.status == RecoveryStatus.COMPLETED


def test_recovery_method_update(dbsession):
    recovery = Recovery(
        device_id="device123",
        name="Test Recovery",
        status=RecoveryStatus.PENDING,
        method=RecoveryMethod.DEFAULT,
    )
    dbsession.add(recovery)
    dbsession.commit()

    recovery.method = RecoveryMethod.BR
    dbsession.commit()

    updated_recovery = dbsession.query(Recovery).filter_by(id=recovery.id).first()
    assert updated_recovery.method == RecoveryMethod.BR
