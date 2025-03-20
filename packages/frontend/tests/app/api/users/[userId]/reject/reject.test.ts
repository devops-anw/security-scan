import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/users/[userId]/reject/route";
import { KeycloakService } from "@/services/keycloakService";
import { KeycloakError } from "@/utils/errorHandler";
import { bindMock, resetContainer } from "@/utils/containerUtils";

// Mock the KeycloakService
vi.mock("@/services/keycloakService");

vi.mock("@/utils/logger", () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("POST /api/users/[userId]/reject", () => {
  let mockKeycloakService: any;

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    resetContainer();

    mockKeycloakService = {
      rejectUser: vi.fn(),
    };
    bindMock(KeycloakService, mockKeycloakService);
  });

  it("should reject user successfully", async () => {
    const userId = "test-user-id";
    mockKeycloakService.rejectUser.mockResolvedValue(undefined);

    const request = new NextRequest(
      "http://localhost/api/users/test-user-id/reject",
      {
        method: "POST",
      }
    );

    const response = await POST(request, { params: { userId } });

    expect(mockKeycloakService.rejectUser).toHaveBeenCalledWith(userId);
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ message: "User rejected successfully" });
  });

  it("should return 500 if rejectUser throws an error", async () => {
    const userId = "test-user-id";
    mockKeycloakService.rejectUser.mockRejectedValue(
      new Error("Rejection failed")
    );

    const request = new NextRequest(
      "http://localhost/api/users/test-user-id/reject",
      {
        method: "POST",
      }
    );

    const response = await POST(request, { params: { userId } });

    expect(mockKeycloakService.rejectUser).toHaveBeenCalledWith(userId);
    expect(response.status).toBe(500);
    const responseBody = await response.json();
    expect(responseBody).toEqual({
      error:
        "An error occurred while rejecting the user. Please try again later.",
    });
  });

  it("should return 400 if user is not found", async () => {
    const userId = "test-user-id";
    mockKeycloakService.rejectUser.mockRejectedValue(
      new KeycloakError("User not found")
    );

    const request = new NextRequest(
      "http://localhost/api/users/test-user-id/reject",
      {
        method: "POST",
      }
    );

    const response = await POST(request, { params: { userId } });

    expect(mockKeycloakService.rejectUser).toHaveBeenCalledWith(userId);
    expect(response.status).toBe(400);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ error: "User not found" });
  });
});
