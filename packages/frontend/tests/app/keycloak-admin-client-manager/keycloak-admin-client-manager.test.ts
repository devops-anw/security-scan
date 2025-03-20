import "reflect-metadata";
import KcAdminClient from "@keycloak/keycloak-admin-client";
import logger from "@/utils/logger";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { KeycloakAdminClientManager } from "@/lib/keycloakAdminClient";

vi.mock("@/utils/logger");
vi.mock("@keycloak/keycloak-admin-client");

describe("KeycloakAdminClientManager", () => {
  const mockEnv = {
    FE_KEYCLOAK_URL: "http://mock-keycloak-url",
    FE_KEYCLOAK_REALM: "mock-realm",
    FE_KEYCLOAK_BACKEND_CLIENT_ID: "mock-client-id",
    FE_KEYCLOAK_BACKEND_CLIENT_SECRET: "mock-client-secret",
    KEYCLOAK_AUTH_TIMEOUT: "58",
  };

  beforeAll(() => {
    process.env = { ...process.env, ...mockEnv };
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should instantiate the KeycloakAdminClient with correct config", () => {
    const manager = new KeycloakAdminClientManager();

    expect(KcAdminClient).toHaveBeenCalledWith({
      baseUrl: mockEnv.FE_KEYCLOAK_URL,
      realmName: mockEnv.FE_KEYCLOAK_REALM,
      requestOptions: { cache: "no-cache" },
    });
    expect(logger.info).toHaveBeenCalledWith(
      "Keycloak Admin Client instance created"
    );
  });

  it("should authenticate and set token expiration time", async () => {
    const mockAuth = vi.fn().mockResolvedValue({});
    (KcAdminClient.prototype.auth as any) = mockAuth;

    const manager = new KeycloakAdminClientManager();
    const initialTime = Date.now();

    await manager["authenticate"]();

    // Allow for a small tolerance (e.g., 100ms) due to timing differences
    expect(mockAuth).toHaveBeenCalledWith({
      grantType: "client_credentials",
      clientId: mockEnv.FE_KEYCLOAK_BACKEND_CLIENT_ID,
      clientSecret: mockEnv.FE_KEYCLOAK_BACKEND_CLIENT_SECRET,
    });

    // Compare with a tolerance of 100ms
    expect(manager["tokenExpirationTime"]).toBeGreaterThan(
      initialTime + 58000 - 100
    );

    expect(logger.info).toHaveBeenCalledWith(
      "Keycloak Admin Client authenticated"
    );
  });

  it("should not authenticate if token is not expired", async () => {
    const mockAuth = vi.fn();
    (KcAdminClient.prototype.auth as any) = mockAuth;

    const manager = new KeycloakAdminClientManager();
    manager["tokenExpirationTime"] = Date.now() + 10000; // Token valid for 10 more seconds

    await manager.getClient();

    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("should authenticate if token is expired", async () => {
    const mockAuth = vi.fn().mockResolvedValue({});
    (KcAdminClient.prototype.auth as any) = mockAuth;

    const manager = new KeycloakAdminClientManager();
    manager["tokenExpirationTime"] = Date.now() - 10000; // Token expired

    await manager.getClient();

    expect(mockAuth).toHaveBeenCalled();
  });

  it("should log and rethrow an error if authentication fails", async () => {
    const mockError = new Error("Authentication failed");
    const mockAuth = vi.fn().mockRejectedValue(mockError);
    (KcAdminClient.prototype.auth as any) = mockAuth;

    const manager = new KeycloakAdminClientManager();

    await expect(manager["authenticate"]()).rejects.toThrow(mockError);
    expect(logger.error).toHaveBeenCalledWith(
      "Failed to authenticate Keycloak Admin Client",
      mockError
    );
  });

  it("should throw an error if required environment variables are missing", () => {
    delete process.env.FE_KEYCLOAK_URL;

    expect(() => new KeycloakAdminClientManager()).toThrow(
      "Missing required environment variable: FE_KEYCLOAK_URL"
    );
  });
  it("should throw an error if required environment variables are missing", () => {
    delete process.env.FE_KEYCLOAK_URL;

    expect(() => new KeycloakAdminClientManager()).toThrow(
      "Missing required environment variable: FE_KEYCLOAK_URL"
    );
  });
});
