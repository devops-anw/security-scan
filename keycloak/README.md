# Memcrypt SaaS Controlplane :Keycloak Setup - IAM/IDP

This REPO is the frontend application for a SaaS platform, utilizing Keycloak for authentication. Below are the instructions to set up and run only Keycloak, if you want to run the complete application, refer to the [Main README](../README.md).

## Prerequisites

- Docker and Docker Compose

## Setup Instructions

1. **Set variables to start Keycloak:**

   - Create `.env` from [.env.template](./.env.template) and set the variables.
   - Make sure you are in the keycloak directory.

2. **Build and Start:**

   - Run the following command to build and start the Keycloak and Postgres DB container:

   ```
   docker-compose -p memcrypt-keycloak up
   ```

3. **Verify Keycloak is running:**
   Open a web browser and go to `http://localhost:8081`. Login with the following credentials:

   - Username: {as per your env file}
   - Password: {as per your env file}

4. **Set up the Frontend:**

   - Please refer to the [Main README](../README.md).

## Troubleshooting

If you encounter any issues:

1. Ensure the Keycloak Docker container is running correctly.
2. Check if Keycloak is properly configured.
3. Check the console for any error messages during the build or run process.

## Directory Structure

The `keycloak` directory contains the following files:

- `docker-compose.yml:` Docker Compose configuration file for setting up Keycloak containers.
- `README.md:` This file, providing instructions for setting up and running Keycloak.
- `Dockerfile.keycloak:` Dockerfile for building the Keycloak image.
- `.env.template:` Variables template file.
- `themes/:` Directory containing custom Keycloak themes.
- `scripts/:` Keycloak config scripts.

