#!/bin/bash

# Activate your virtual environment if needed
# source /path/to/your/venv/bin/activate

# Set environment variables
export API_BASE_URL="http://localhost:8001/api/v1.0"
export API_KEY="your-test-api-key-if-needed"

# Run the tests
pytest tests/integration -v

# Deactivate virtual environment if activated earlier
# deactivate