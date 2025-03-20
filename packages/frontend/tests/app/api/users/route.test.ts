import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, DELETE } from "@/app/api/users/route";
import { KeycloakService } from "@/services/keycloakService";
import { KeycloakError } from "@/utils/errorHandler";
import { NextRequest } from "next/server";
import { PaginatedResult } from "@/types/pagination";
import { UserWithOrg } from "@/types/keycloak";
import { bindMock } from "@/utils/containerUtils";

// Mock the KeycloakService
vi.mock("@/services/keycloakService");
vi.mock("@/utils/logger");

describe("Users API Route", () => {
  let mockKeycloakService: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockKeycloakService = {
      createOrganizationAndUser: vi.fn(),
      getUsersWithOrgInfo: vi.fn(),
    };
    bindMock(KeycloakService, mockKeycloakService);
  });

  describe("GET /api/users", () => {
    it("should return paginated users with organization info", async () => {
      const mockResult: PaginatedResult<UserWithOrg> = {
        data: [
          {
            id: "user1",
            username: "user1",
            organization: { id: "org1", name: "Org 1" },
          } as UserWithOrg,
          {
            id: "user2",
            username: "user2",
            organization: { id: "org2", name: "Org 2" },
          } as UserWithOrg,
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      mockKeycloakService.getUsersWithOrgInfo.mockResolvedValue(mockResult);

      const request = new NextRequest(
        "http://localhost/api/users?page=1&pageSize=10"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual(mockResult);
      expect(mockKeycloakService.getUsersWithOrgInfo).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
      });
    });

    it("should use default pagination values when not provided", async () => {
      const request = new NextRequest("http://localhost/api/users");
      await GET(request);

      expect(mockKeycloakService.getUsersWithOrgInfo).toHaveBeenCalledWith({
        page: 1,
        pageSize: 1000,
      });
    });

    it("should handle KeycloakError", async () => {
      const errorMessage = "Failed to fetch users";
      mockKeycloakService.getUsersWithOrgInfo.mockRejectedValue(
        new KeycloakError(errorMessage)
      );

      const request = new NextRequest("http://localhost/api/users");
      const response = await GET(request);

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({ error: errorMessage });
    });

    it("should handle unexpected errors", async () => {
      mockKeycloakService.getUsersWithOrgInfo.mockRejectedValue(
        new Error("Unexpected error")
      );

      const request = new NextRequest("http://localhost/api/users");
      const response = await GET(request);

      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error:
          "An unexpected error occurred while fetching users. Please try again later.",
      });
    });

    it("should parse pagination parameters correctly", async () => {
      const request = new NextRequest(
        "http://localhost/api/users?page=2&pageSize=20"
      );
      await GET(request);

      expect(mockKeycloakService.getUsersWithOrgInfo).toHaveBeenCalledWith({
        page: 2,
        pageSize: 20,
      });
    });
    it("should return empty user list when no users found", async () => {
      const emptyResult: PaginatedResult<UserWithOrg> = {
        data: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };

      mockKeycloakService.getUsersWithOrgInfo.mockResolvedValue(emptyResult);

      const request = new NextRequest(
        "http://localhost/api/users?page=1&pageSize=10"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual(emptyResult);
    });
  });

  describe("DELETE /api/users", () => {
    it("should return 501 Not Implemented", async () => {
      const response = await DELETE();

      expect(response.status).toBe(501);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: "DELETE method not implemented",
      });
    });
  });
});
