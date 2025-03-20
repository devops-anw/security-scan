# Memcrypt SaaS Controlplane Frontend

This a mono Repo for MemCrypyt SaaS Platform, comprising of various services.

### `Key Services:`

- Identity Service : [Keycloak](./keycloak/README.md)
- Dev Mail Service : `SMTP4DEV`
- Frontend Service - [Frontend](./packages/frontend/README.md)
- AgentBinary Service - [AgentBinary](./Agentbinary/README.md)
- Console Service - [Console](./packages/console/README.md)

To setup and start the application along with its dependencies as Docker contianers, pleae refer to the [Docker Build Section](#docker).

To start the frontend application standalone for development, refer to the [Manual](#manual) section.

## Docker:

1. `Prerequisites:`

   - Ensure you have Docker and Docker Compose Installed

2. `Set variables to start` Keycloak:\*\*
   
   Make sure you are in the REPO root directory.
      - Create `.env` from [.env.global.template](./.env.global.template) and set the variables.
      - **For AgentBinary:** Create `.env` from [AgentBinary/env.template](./agentbinary/.env.template) and set the variables.
   
   
   
3. `Build and Start:` We will start in two stages inital services and then app service

   - Run the following command to build and start `inital  services` :

   ```
   docker compose -p memcrypt-saas --profile initial-services up -d

4. `Set Variables for Console and Frontend`
   
   - **For Console :** 
     - Create `.env` from [console/env.template](./packages/console/.env.template) and set the variables.
     - Retrive the backend client secret from keycloak: http://localhost:8081/ and update the var CONSOLE_KEYCLOAK_CLIENT_SECRET in ./packages/console/.env file
   - **For Frontend :** 

     - Create `.env` from [frontend/env.template](./packages/frontend/.env.template) and set the variables.
     - Retrive the backend client secret from keycloak : http://localhost:8081/ and update the var FE_KEYCLOAK_BACKEND_CLIENT_SECRET in ./packages/frontend/.env file


   - and to start the `app service` run the following command from repo root location

   ```
   docker compose -p memcrypt-saas --profile app-services up -d

   ```

   - If you wish to start each Service separately, please refer to the respective service README and the docker-compose file:

     - [Keycloak](./keycloak/README.md) as Identity and Access Management
     - [Frontend APP](.packages/frontend/REDME.md) NextJS based Application

5. `Verify:`

   - KeyCloak: Open a web browser and go to `http://localhost:8081`. Login with the credentials specified in your `.env.global` file.
   - Application: Open a web browser and go to `http://localhost:3000`. Login with the credentials specified in your `.env.global` file.
   - To check mails, open smptp4dev web interface, `http://localhost:3001`
   - For Agent Binary Docs `http://localhost:8000/agentbinary/docs`
   - For Console API Docs `http://localhost:8001/console/docs`

6. `Cleanup:`

   To clean up Docker resources

- Run the cleanup script:

  ```bash
  sh docker-cleanup-script.sh
  ```

  This script will stop and remove all Docker containers, images, volumes, and networks, and remove dangling build cache.

## Manual

To start the application standalone for local development, follow these steps:

1. `Prerequisites:`

   - Ensure you have Docker and Docker Compose, Node.js and Yarn, and Git Bash (for Windows users) installed.

2. `Start Keycloak Service:`

- Refer to KeyCloak [README](./keycloak/README.md) to start service.

3. `Start SMTP Dev Service:`

4. `Global Packages:`

   - Install the following packages globally:

   ```bash
   yarn global add typescript @types/node tsx
   ```

5. `Set up the Frontend:`

   - Navigate to the `packages/frontend` folder and run the following commands:

   ```
   yarn
   yarn build
   ```

6. `Start the Frontend development server:`

   - In the `packages/frontend` folder, run the following command:

   ```
   yarn dev
   ```

7 `Verify:`

- KeyCloak: Open a web browser and go to `http://localhost:8081`. Login with the credentials specified in your `.env` file.
- Application: Open a web browser and go to `http://localhost:3000`. Login with the credentials specified in your `.env` file.

## Updating OpenAPI Specification

Whenever you make changes to your API contracts:

1. Update the relevant contract files in `src/contracts/`.
2. Run `yarn generate-openapi` to regenerate the OpenAPI specification.
3. Commit the updated `openapi.json` file along with your changes.

If you encounter issues with commands like `tsx` not being found:

- Ensure you've installed the global packages using Yarn as described in the "Global Packages" section.
- Check that the Yarn global bin directory is in your PATH. You can find this directory by running `yarn global bin`.
- If you've just added the directory to your PATH, remember to restart your terminal or run `source ~/.bashrc` (or equivalent for your shell) to apply the changes.

This command uses `tsx` to run the script at `src/scripts/openapi/generate-spec.ts`, which will create or update the `openapi.json` file in the `public` directory.
If you encounter any issues with the `tsx` command not being found, ensure that the Yarn global bin directory is in your PATH (see the Global Packages section above).

## Additional Information

- The project uses Next.js for the frontend, as evident from the `next.config.mjs` file.
- Tailwind CSS is used for styling, configured in `tailwind.config.ts`.
- The project includes TypeScript support, as seen from the `tsconfig.json` file.
- Testing is set up with files like `vite.config.ts` and the `tests` directory.

## Troubleshooting

If you encounter any issues:

1. Ensure the Keycloak Docker container is running correctly.
2. Check the mailing service is up
3. Check if Keycloak is properly configured.
4. Verify that all dependencies are installed in the frontend project.
5. Check the console for any error messages during the build or run process.
