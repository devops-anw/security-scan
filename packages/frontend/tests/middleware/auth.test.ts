import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { UserRole } from "@/types/auth";
import { authMiddleware } from "@/middleware/auth";

// Mock the verifyToken function
vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
  hasRole: vi.fn(),
}));

describe("Auth Middleware", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockRequest = new NextRequest("http://localhost:3000/api/users", {
      method: "GET",
      headers: new Headers({ Authorization: "Bearer mockToken" }),
    } as NextRequest);

    vi.mocked(verifyToken).mockResolvedValue({
      sub: "mockUserId",
      realm_access: { roles: [UserRole.ORG_ADMIN] },
      org_id: "mockOrgId",
      azp: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    } as any);
  });

  it("should return 401 if no token is provided", async () => {
    mockRequest.headers.delete("Authorization");
    const response = await authMiddleware(mockRequest);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "No token provided" });
  });

  it("should return 401 if token is invalid", async () => {
    vi.mocked(verifyToken).mockResolvedValue(null);
    const response = await authMiddleware(mockRequest);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Invalid token" });
  });

  it("should set user information in headers if token is valid", async () => {
    const response = await authMiddleware(mockRequest);

    expect(response.headers.get("X-User-ID")).toBe("mockUserId");
    expect(response.headers.get("X-User-Roles")).toBe(
      JSON.stringify([UserRole.ORG_ADMIN])
    );
    expect(response.headers.get("X-User-Org")).toBe("mockOrgId");
  });
});
