import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types/auth";
import { rbacMiddleware } from "@/middleware/rbac";

describe("RBAC Middleware", () => {
  let mockRequest: NextRequest;
  let mockAuthResponse: NextResponse;

  beforeEach(() => {
    vi.resetAllMocks();

    mockRequest = new NextRequest("http://localhost:3000/api/users", {
      method: "GET",
    } as NextRequest);

    mockAuthResponse = NextResponse.next();
    mockAuthResponse.headers.set("X-User-ID", "mockUserId");
    mockAuthResponse.headers.set(
      "X-User-Roles",
      JSON.stringify([UserRole.ORG_ADMIN])
    );
    mockAuthResponse.headers.set("X-User-Org", "mockOrgId");
  });

  it("should return 403 if user information is missing", async () => {
    mockAuthResponse.headers.delete("X-User-ID");
    const response = rbacMiddleware(mockRequest, mockAuthResponse);

    expect(response.status).toBe(403);

    await expect(response.json()).resolves.toEqual({
      error: "User information not found",
    });
  });

  it("should return 403 if user does not have required role", async () => {
    mockRequest = new NextRequest("http://localhost:3000/api/users/pending", {
      method: "GET",
    });
    const response = rbacMiddleware(mockRequest, mockAuthResponse);

    expect(response.status).toBe(403);

    await expect(response.json()).resolves.toEqual({
      error: "Insufficient permissions",
    });
  });

  it("should allow access if user has required role", async () => {
    mockAuthResponse.headers.set(
      "X-User-Roles",
      JSON.stringify([UserRole.PLATFORM_ADMIN])
    );
    const response = rbacMiddleware(mockRequest, mockAuthResponse);

    await expect(response).toBe(mockAuthResponse);
  });

  it("should run checkFunction for specific routes", async () => {
    mockRequest = new NextRequest(
      "http://localhost:3000/api/users/mockUserId",
      { method: "GET" } as NextRequest
    );
    const response = rbacMiddleware(mockRequest, mockAuthResponse);

    await expect(response).toBe(mockAuthResponse);
  });

  it("should deny access if checkFunction returns false", async () => {
    mockRequest = new NextRequest(
      "http://localhost:3000/api/users/anotherUserId",
      { method: "GET" } as NextRequest
    );
    const response = rbacMiddleware(mockRequest, mockAuthResponse);

    expect(response.status).toBe(403);

    await expect(response.json()).resolves.toEqual({
      error: "Insufficient permissions",
    });
  });
});
