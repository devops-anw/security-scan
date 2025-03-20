import { injectable } from "inversify";
import KcAdminClient from "@keycloak/keycloak-admin-client";
import logger from "@/utils/logger";

@injectable()
export class KeycloakAdminClientManager {
  private readonly client: KcAdminClient;
  private tokenExpirationTime: number = 0;
  private readonly AUTH_TIMEOUT: number;
  private authPromise: Promise<void> | null = null;

  constructor() {
    this.AUTH_TIMEOUT = getEnvNumber("KEYCLOAK_AUTH_TIMEOUT", 58) * 1000;

    this.client = new KcAdminClient({
      baseUrl: getRequiredEnv("FE_KEYCLOAK_URL"),
      realmName: getRequiredEnv("FE_KEYCLOAK_REALM"),
      requestOptions: {
        cache: "no-cache",
      },
    });

    logger.info("Keycloak Admin Client instance created");
  }

  async getClient(): Promise<KcAdminClient> {
    if (this.isTokenExpired()) {
      await this.authenticate();
    }
    return this.client;
  }

  private async authenticate(): Promise<void> {
    if (!this.authPromise) {
      this.authPromise = this.performAuthentication();
    }
    await this.authPromise;
  }

  private async performAuthentication(): Promise<void> {
    try {
      const authResult = await this.client.auth({
        grantType: "client_credentials",
        clientId: getRequiredEnv("FE_KEYCLOAK_BACKEND_CLIENT_ID"),
        clientSecret: getRequiredEnv("FE_KEYCLOAK_BACKEND_CLIENT_SECRET"),
      });

      this.tokenExpirationTime = Date.now() + this.AUTH_TIMEOUT;
      logger.info("Keycloak Admin Client authenticated");
    } catch (error) {
      logger.error("Failed to authenticate Keycloak Admin Client", error);
      throw error;
    } finally {
      this.authPromise = null;
    }
  }

  private isTokenExpired(): boolean {
    return Date.now() > this.tokenExpirationTime;
  }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (typeof value !== "string") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getEnvNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    logger.warn(`Invalid value for ${name}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}
