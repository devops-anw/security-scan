import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

const requiredEnvVars = [
  "FE_KEYCLOAK_URL",
  "FE_KEYCLOAK_REALM",
  "FE_KEYCLOAK_BACKEND_CLIENT_ID",
  "FE_KEYCLOAK_BACKEND_CLIENT_SECRET",
];

requiredEnvVars.forEach((varName) => {
  if (typeof process.env[varName] !== "string") {
    throw new Error(
      `Missing required environment variable for tests: ${varName}`
    );
  }
});
