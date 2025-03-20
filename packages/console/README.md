# Console Service Setup Guide

This guide will help you set up the Python environment for the console service, a FastAPI application within the detect-saas project.

## Prerequisites

- Python 3.12 or later
- Poetry (installation instructions: https://python-poetry.org/docs/#installation)
- PostgreSQL (for production database)
- SQLite (for testing)

## Setup Steps

1. Navigate to the console service directory:

   ```
   cd detect-saas/packages/console
   ```

2. Create and activate a virtual environment:

   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   ```

3. Install Poetry in the virtual environment:

   ```
   pip install poetry
   ```

4. Install project dependencies:

   ```
   poetry install
   ```

5. Set up the PostgreSQL database:

   - Create a new PostgreSQL database for the project
   - Update the database connection string in your configuration file (e.g., `.env` or `config.py`)

6. Run database migrations:

   ```
   poetry run alembic upgrade head
   ```

7. You're all set! You can now run the FastAPI server:
   ```
   poetry run uvicorn app.main:app --reload --port 8001
   ```

## Environment Variables

Create a `.env` file in the `console` directory with the following variables:

```
CONSOLE_DATABASE_URL=postgresql://username:password@localhost/dbname
```

Replace `username`, `password`, and `dbname` with your PostgreSQL credentials.

## Running Tests

Tests use SQLite as the database. To run tests:

```
poetry run pytest
```

## API Documentation

Once the server is running, you can access the API documentation:

- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Troubleshooting

If you encounter any issues:

1. Ensure you're in the correct directory: `detect-saas/packages/console`
2. Check that you're using Python 3.12 or later: `python --version`
3. Verify Poetry is installed and up to date: `poetry --version`
4. Confirm PostgreSQL is running and accessible
5. Check your `.env` file for correct database URLs
6. If problems persist, try removing the `.venv` directory and starting over from step 2 in the Setup Steps

For more help, please contact the project maintainers or open an issue in the project repository.

## Note on Project Structure

This setup is specific to the console service (FastAPI application) within the larger detect-saas project. Ensure you're in the correct directory (`detect-saas/packages/console`) when following these instructions.
