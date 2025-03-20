import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

import { KeycloakService } from "@/services/keycloakService";
import { KeycloakError } from "@/utils/errorHandler";
import { bindMock } from "@/utils/containerUtils";
import { GET, POST } from "@/app/api/users/pending/route";

vi.mock("@/services/keycloakService");

vi.mock("@/utils/logger", () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("POST /api/users/verify-email", () => {
  let mockKeycloakService: any;

  beforeEach(() => {
    mockKeycloakService = {
      rejectUser: vi.fn(),
    };

    bindMock(KeycloakService, mockKeycloakService);
  });

  it("should reject the user successfully", async () => {
    mockKeycloakService.rejectUser.mockResolvedValue({}); // Simulate successful user rejection

    const request = new NextRequest("http://localhost/api/users/reject/1", {
      method: "POST",
    });

    const response = await POST(request, { params: { userId: "1" } });

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ message: "User rejected successfully" });
  });

  it("should return 400 if KeycloakError is thrown", async () => {
    mockKeycloakService.rejectUser.mockRejectedValue(
      new KeycloakError("Failed to reject user")
    );

    const request = new NextRequest("http://localhost/api/users/reject/1", {
      method: "POST",
    });

    const response = await POST(request, { params: { userId: "1" } });

    expect(response.status).toBe(400);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ error: "Failed to reject user" });
  });

  it("should return 500 for unexpected errors", async () => {
    mockKeycloakService.rejectUser.mockRejectedValue(
      new Error("Unexpected error")
    );

    const request = new NextRequest("http://localhost/api/users/reject/1", {
      method: "POST",
    });

    const response = await POST(request, { params: { userId: "1" } });

    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error: "An unexpected error occurred while rejecting the user",
    });
  });
});

describe("GET /api/users/pending", () => {
  let mockKeycloakService: any;

  beforeEach(() => {
    mockKeycloakService = {
      getPendingUsers: vi.fn(),
    };

    bindMock(KeycloakService, mockKeycloakService);
  });

  it("should return pending users successfully", async () => {
    const mockPendingUsers = [
      {
        id: "1",
        username: "user1",
        email: "user1@example.com",
        firstName: "John",
        lastName: "Doe",
        createdTimestamp: 1234567890,
      },
      {
        id: "2",
        username: "user2",
        email: "user2@example.com",
        firstName: "Jane",
        lastName: "Doe",
        createdTimestamp: 1234567891,
      },
    ];

    mockKeycloakService.getPendingUsers.mockResolvedValue(mockPendingUsers);

    const request = new NextRequest("http://localhost/api/users/pending");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual(mockPendingUsers);
  });

  it("should return 400 if KeycloakError is thrown", async () => {
    mockKeycloakService.getPendingUsers.mockRejectedValue(
      new KeycloakError("Failed to fetch pending users")
    );

    const request = new NextRequest("http://localhost/api/users/pending");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ error: "Failed to fetch pending users" });
  });

  it("should return 500 for unexpected errors", async () => {
    mockKeycloakService.getPendingUsers.mockRejectedValue(
      new Error("Unexpected error")
    );

    const request = new NextRequest("http://localhost/api/users/pending");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error: "An unexpected error occurred while fetching pending users",
    });
  });
});
