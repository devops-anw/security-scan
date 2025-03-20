# Agent Binary Management API

This project is a Agent Binary Management API built using FastAPI. It provides endpoints for uploading, listing, and downloading Agent SW versions, along with basic user authentication and logging.

## Features

- Upload new Agent SW versions
- List all available versions and their Agent SWs
- Download the latest Agent SW version
- Download a specific Agent SW version
- Heartbeat endpoint to check the service status
- Basic user authentication for admin operations

## Requirements

- Python 3.12+
- FastAPI
- Docker
- Docker Compose

## Setup

### Running the Application

1. **Clone the repository**:

   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Build and start the services**:

   ```sh
   docker-compose up -d
   ```

3. **Access the API documentation**:

   Open your browser and navigate to `http://localhost:8000/docs` to view the interactive API documentation provided by FastAPI.

## Endpoints

### Upload a New Agent SW Version

- **URL**: `/Agentbinary/upload`
- **Method**: `POST`
- **Authentication**: Admin
- **Description**: Upload a new Agent SW version.
- **Request**:
  - `Agent SW`: The Agent SW to be uploaded.

### List All Versions

- **URL**: `/agentbinary/versions`
- **Method**: `GET`
- **Description**: List all available versions and their Agent SWs.

### Download the Latest Agent SW Version

- **URL**: `/agentbinary/latest`
- **Method**: `GET`
- **Description**: Download the latest Agent SW version.

### Download a Specific Agent SW Version

- **URL**: `/agentbinary/download/{version}`
- **Method**: `GET`
- **Description**: Download the first Agent SW in the specified version directory.
- **Path Parameters**:
  - `version`: The version of the Agent SW to be downloaded.

### Heartbeat

- **URL**: `/heartbeat`
- **Method**: `GET`
- **Description**: Check the service status.

### Hello Message

- **URL**: `/`
- **Method**: `GET`
- **Description**: Display a hello message with API information.

## Logging

The application logs are configured to write to both a file (`app.log`) and the console. The logging level is set to `DEBUG`.

## Development

### Install Dependencies

1. **Create a virtual environment**:

   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

2. **Install poetry**:

   ```sh
   pip install poetry
   ```
   
3 **Install the required packages**:

   ```sh
   poetry install
   ```

### Run the Application Locally

1. **Start the FastAPI application**:

   ```sh
   uvicorn app.main:app --reload
   ```

2. **Access the API documentation**:

   Open your browser and navigate to `http://localhost:8000/docs`.

## Docker Compose Configuration

The `docker-compose.yml` file is used to define and run multi-container Docker applications.

## Bringing Down the Services

To stop and remove all services, networks, images, and volumes, use the following command:

```sh
docker-compose down -v
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

Author: Memcrypt

This README provides an overview of the Agent SW Management API, including setup instructions, endpoint details, and development guidelines. For more information, refer to the source code and the API documentation.
