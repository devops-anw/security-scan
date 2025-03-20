import { describe, it, expect, vi, beforeEach } from "vitest";

import logger from "@/utils/logger";

import { NextRequest } from "next/server";
import { POST } from "@/app/api/users/[userId]/approve/route";

import { bindMock, resetContainer } from "@/utils/containerUtils";
import { KeycloakService } from "@/services/keycloakService";

vi.mock("@/utils/apiUtils");
vi.mock("@/utils/logger");
vi.mock("@/lib/authToken");
vi.mock("../../path/to/keycloakService", () => ({
  rejectUser: vi.fn(),
  approveUser: vi.fn(),
}));

describe("POST /api/users/[userId]/approve", () => {
  let mockKeycloakService: any;

  beforeEach(() => {
    vi.resetAllMocks();
    resetContainer();

    mockKeycloakService = {
      approveUser: vi.fn(),
      rejectUser: vi.fn(),
    };
    bindMock(KeycloakService, mockKeycloakService);
  });

  it("should approve user successfully", async () => {
    const userId = "test-user-id";
    mockKeycloakService.approveUser.mockResolvedValue(undefined);

    const request = new NextRequest(
      "http://localhost/api/users/test-user-id/approve",
      {
        method: "POST",
      }
    );

    const response = await POST(request, { params: { userId } });

    expect(mockKeycloakService.approveUser).toHaveBeenCalledWith(userId);
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ message: "User approved successfully" });
  });

  it("should return 500 if approveUser throws an error", async () => {
    const userId = "test-user-id";
    mockKeycloakService.approveUser.mockRejectedValue(
      new Error("approve failed")
    );

    const request = new NextRequest(
      "http://localhost/api/users/test-user-id/approve",
      {
        method: "POST",
      }
    );

    const response = await POST(request, { params: { userId } });

    expect(mockKeycloakService.approveUser).toHaveBeenCalledWith(userId);
    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error: "An unexpected error occurred. Please try again later.",
    });
  });

  it("should return 400 if userId is missing", async () => {
    const request = { params: { userId: "" } } as unknown as NextRequest;
    const response = await POST(request, { params: { userId: "" } });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "User ID is required",
      details: [
        { field: "userId", message: "A valid user ID must be provided" },
      ],
    });
    expect(logger.warn).toHaveBeenCalledWith(expect.anything());
  });

  it("should return 400 if userId is invalid (e.g., '/')", async () => {
    const request = { params: { userId: "/" } } as unknown as NextRequest;
    const response = await POST(request, { params: { userId: "/" } });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "User ID is required",
      details: [
        { field: "userId", message: "A valid user ID must be provided" },
      ],
    });
    expect(logger.warn).toHaveBeenCalledWith(expect.anything());
  });
});
