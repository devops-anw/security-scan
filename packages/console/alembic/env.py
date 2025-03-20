import os
from logging.config import fileConfig

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from alembic import context
from app.core.database import Base

# Determine the directory containing the script
script_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the path to the .env file (in the same directory as alembic.ini)
dotenv_path = os.path.join(script_dir, "..", ".env")

# Load the .env file
load_dotenv(dotenv_path)

# Print out the CONSOLE_DATABASE_URL for debugging
print(f"CONSOLE_DATABASE_URL: {os.getenv('CONSOLE_DATABASE_URL')}")

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support

# from app.models import device, file_recovery  # Import all your models here

target_metadata = Base.metadata


# Get the database URL from an environment variable
def get_url():
    url = os.getenv("CONSOLE_DATABASE_URL")
    if url is None:
        raise ValueError(
            "CONSOLE_DATABASE_URL environment variable is not set. "
            "Please set it to your database connection string."
        )
    return url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
