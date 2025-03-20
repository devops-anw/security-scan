import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/verify-email/route";
import { KeycloakService } from "@/services/keycloakService";
import { KeycloakError } from "@/utils/errorHandler";
import { NextRequest } from "next/server";
import { bindMock, resetContainer } from "@/utils/containerUtils";
import logger from "@/utils/logger";

vi.mock("@/services/keycloakService");

// Mock the logger for default export
vi.mock("@/utils/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Email Verification API Route", () => {
  let mockKeycloakService: any;

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    resetContainer();

    mockKeycloakService = {
      verifyEmail: vi.fn(),
    };
    bindMock(KeycloakService, mockKeycloakService);
  });

  describe("POST /api/auth/verify-email", () => {
    it("should verify email successfully", async () => {
      const mockRequestBody = {
        token: "valid-token",
      };

      const mockResult = { message: "Email verified successfully" };

      mockKeycloakService.verifyEmail.mockResolvedValue(mockResult);

      const request = new NextRequest(
        "http://localhost/api/auth/verify-email",
        {
          method: "POST",
          body: JSON.stringify(mockRequestBody),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual(mockResult);
      expect(mockKeycloakService.verifyEmail).toHaveBeenCalledWith(
        mockRequestBody.token
      );
      expect(logger.info).toHaveBeenCalledWith({
        msg: "User email verified successfully",
        token: "valid-token",
      });
    });

    it("should return 400 if token is missing", async () => {
      const request = new NextRequest(
        "http://localhost/api/auth/verify-email",
        {
          method: "POST",
          body: JSON.stringify({}), // Missing token
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.error).toEqual("Verification token is required");
      expect(logger.warn).toHaveBeenCalledWith({
        msg: "Email verification attempted without token",
      });
    });

    it("should return 400 for KeycloakError", async () => {
      const errorMessage = "Invalid or expired verification token";
      mockKeycloakService.verifyEmail.mockRejectedValue(
        new KeycloakError(errorMessage)
      );

      const mockRequestBody = {
        token: "invalid-token",
      };

      const request = new NextRequest(
        "http://localhost/api/auth/verify-email",
        {
          method: "POST",
          body: JSON.stringify(mockRequestBody),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody.error).toEqual(errorMessage);

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "Failed to verify email",
          error: new KeycloakError(errorMessage),
          token: "invalid-token",
        })
      );
    });

    it("should return 500 for unexpected errors", async () => {
      mockKeycloakService.verifyEmail.mockRejectedValue(
        new Error("An unexpected error occurred during email verification")
      );

      const mockRequestBody = {
        token: "valid-token",
      };

      const request = new NextRequest(
        "http://localhost/api/auth/verify-email",
        {
          method: "POST",
          body: JSON.stringify(mockRequestBody),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        code: "OTHER",
        error: "An unexpected error occurred during email verification",
      });

      expect(logger.error).toHaveBeenCalledWith({
        msg: "Unexpected error during email verification",
        error: new Error(
          "An unexpected error occurred during email verification"
        ),
        token: "valid-token",
      });
    });
  });
});
