import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import axios from "axios";
import NextAuth, { Account, Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import refreshAccessToken from "@/app/api/auth/[...nextauth]/refresh-acccess-token";
import { jwtDecode } from "jwt-decode";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import { GET, POST } from "@/app/api/auth/[...nextauth]/route";

vi.mock("axios");
vi.mock("jwt-decode");
vi.mock("@/utils/logger");

// Mock the NextAuth handler
vi.mock("next-auth", () => ({
  ...vi.importActual("next-auth"),
  default: vi.fn().mockReturnValue(vi.fn()),
}));

beforeAll(() => {
  global.console.log = vi.fn();
  global.console.error = vi.fn();
  global.console.warn = vi.fn();
});

describe("NextAuth API route", () => {
  beforeAll(() => {
    // Set up necessary environment variables for the tests
    process.env.FE_KEYCLOAK_URL = "https://keycloak.example.com";
    process.env.NEXT_PUBLIC_APP_REALM = "test-realm";
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID = "test-client-id";
  });

  afterAll(() => {
    // Clean up after tests
    delete process.env.FE_KEYCLOAK_URL;
    delete process.env.NEXT_PUBLIC_APP_REALM;
    delete process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
  });

  it("should correctly set up the POST method", async () => {
    const mockNextAuthHandler = vi.fn();
    (NextAuth as ReturnType<typeof vi.fn>).mockReturnValue(mockNextAuthHandler);

    await POST({
      query: {},
      body: {},
      headers: {},
    });

    // Check if the handler was called
    expect(NextAuth).toHaveBeenCalledWith(authOptions);
  });

  it("should pass correct authOptions to NextAuth handler", async () => {
    // Mock NextAuth to return a handler
    const mockNextAuthHandler = vi.fn();
    (NextAuth as ReturnType<typeof vi.fn>).mockReturnValue(mockNextAuthHandler);

    await GET({
      query: {},
      body: {},
      headers: {},
    });

    expect(NextAuth).toHaveBeenCalledWith(authOptions);
  });
});

describe("authOptions callbacks", () => {
  beforeAll(() => {
    process.env.FE_KEYCLOAK_URL = "https://keycloak.example.com";
    process.env.NEXT_PUBLIC_APP_REALM = "test-realm";
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID = "test-client-id";
  });

  afterAll(() => {
    // Clean up after tests
    delete process.env.FE_KEYCLOAK_URL;
    delete process.env.NEXT_PUBLIC_APP_REALM;
    delete process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
  });

  describe("jwt callback", () => {
    it("should decode the access token and return the token with valid details", async () => {
      const decoded = {
        sub: "user-id",
        preferred_username: "user-name",
        realm_access: { roles: ["admin"] },
        org_id: "org-id",
        exp: Math.floor(Date.now() / 1000) + 3600, // Token valid for 1 hour
      };
      (jwtDecode as ReturnType<typeof vi.fn>).mockReturnValue(decoded);

      const account: Account = {
        access_token: "valid-access-token",
        refresh_token: "valid-refresh-token",
        id_token: "valid-id-token",
        providerAccountId: "",
        provider: "",
        type: "oauth",
      };
      const mockUser: AdapterUser = {
        id: "mock-user-id",
        name: "Mock User",
        email: "mockuser@example.com",
        emailVerified: null,
        image: null,
      };

      if (!authOptions?.callbacks?.jwt)
        throw new Error("JWT callback undefined");

      const token = await authOptions.callbacks.jwt({
        token: {} as JWT,
        account,
        user: mockUser,
      });

      expect(token.accessToken).toBe("valid-access-token");
      expect(token.expires_at).toBe(decoded.exp);
    });

    it("should return token when it is not expired", async () => {
      const now = Math.floor(Date.now() / 1000);
      const existingToken: JWT = {
        expires_at: now + 1000,
        accessToken: "valid-access-token",
        id: "",
        preferred_username: "",
      };

      const mockUser: AdapterUser = {
        id: "mock-user-id",
        name: "Mock User",
        email: "mockuser@example.com",
        emailVerified: null,
        image: null,
      };

      if (!authOptions?.callbacks?.jwt)
        throw new Error("JWT callback undefined");

      const token = await authOptions.callbacks.jwt({
        token: existingToken,
        user: mockUser,
        account: null,
      });

      expect(token).toBe(existingToken);
    });
  });

  describe("session callback", () => {
    it("should populate session correctly", async () => {
      const token: JWT = {
        id: "user-id",
        preferred_username: "user-name",
        org_id: "org-id",
        realm_access: { roles: ["admin"] },
        accessToken: "valid-access-token",
      };

      const session: Session = {
        user: {},
        expires: "2024-12-31T23:59:59Z",
        accessToken: "",
        idToken: "",
        error: "",
      };

      const mockUser: AdapterUser = {
        id: "mock-user-id",
        name: "Mock User",
        email: "mockuser@example.com",
        emailVerified: null,
        image: null,
      };

      if (!authOptions?.callbacks?.session)
        throw new Error("Session callback undefined");

      const updatedSession = await authOptions.callbacks.session({
        session,
        token,
        user: mockUser,
        newSession: undefined,
        trigger: "update",
      });

      expect(updatedSession.user.id).toBe("user-id");
      expect(updatedSession.user.name).toBe("user-name");
      expect(updatedSession.user.tenantId).toBe("org-id");
    });

    it("should handle missing user roles", async () => {
      const token: JWT = {
        realm_access: undefined,
        accessToken: "",
        id: "",
        preferred_username: "",
      };

      const session: Session = {
        user: {},
        expires: "2024-12-31T23:59:59Z",
        accessToken: "",
        idToken: "",
        error: "",
      };

      const mockUser: AdapterUser = {
        id: "mock-user-id",
        name: "Mock User",
        email: "mockuser@example.com",
        emailVerified: null,
        image: null,
      };

      if (!authOptions?.callbacks?.session)
        throw new Error("Session callback undefined");

      const updatedSession = await authOptions.callbacks.session({
        session,
        token,
        user: mockUser,
        newSession: undefined,
        trigger: "update",
      });

      expect(updatedSession.user.type).toBe("");
    });

    it("should handle missing user information", async () => {
      const token: JWT = {
        id: "",
        preferred_username: "",
        org_id: "",
        realm_access: { roles: [] },
        accessToken: "valid-access-token",
      };

      const session: Session = {
        user: {},
        expires: "2024-12-31T23:59:59Z",
        accessToken: "",
        idToken: "",
        error: "",
      };

      const mockUser: AdapterUser = {
        id: "mock-user-id",
        name: "Mock User",
        email: "mockuser@example.com",
        emailVerified: null,
        image: null,
      };

      if (!authOptions?.callbacks?.session)
        throw new Error("Session callback undefined");

      const updatedSession = await authOptions.callbacks.session({
        session,
        token,
        user: mockUser,
        newSession: undefined,
        trigger: "update",
      });

      expect(updatedSession.user.id).toBe("");
      expect(updatedSession.user.name).toBe("");
      expect(updatedSession.user.tenantId).toBe("");
    });
  });
});

describe("refreshAccessToken function", () => {
  it("should refresh the access token successfully", async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expires_in: 3600,
      },
    });

    const oldToken: JWT = {
      accessToken: "old-access-token",
      refreshToken: "valid-refresh-token",
      id: "",
      preferred_username: "",
    };

    const refreshedToken = await refreshAccessToken(oldToken);

    expect(refreshedToken.accessToken).toBe("new-access-token");
    expect(refreshedToken.refreshToken).toBe("new-refresh-token");
  });

  it("should handle errors when refreshing the access token", async () => {
    (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Token refresh failed")
    );

    const oldToken: JWT = {
      accessToken: "old-access-token",
      refreshToken: "valid-refresh-token",
      id: "",
      preferred_username: "",
    };

    const refreshedToken = await refreshAccessToken(oldToken);

    expect(refreshedToken.error).toBe("RefreshAccessTokenError");
  });

  it("should handle missing refresh token", async () => {
    const oldToken: JWT = {
      accessToken: "old-access-token",
      refreshToken: "",
      id: "",
      preferred_username: "",
    };

    const refreshedToken = await refreshAccessToken(oldToken);

    expect(refreshedToken.error).toBe("RefreshAccessTokenError");
  });
});
