import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, PUT } from "@/app/api/users/[userId]/route";
import { KeycloakService } from "@/services/keycloakService";
import { bindMock } from "@/utils/containerUtils";

vi.mock("@/services/keycloakService");

vi.mock("@/utils/logger", () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("User API Endpoints", () => {
  let mockKeycloakService: any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockKeycloakService = {
      getUser: vi.fn(),
      updateUser: vi.fn(),
    };
    vi.mocked(KeycloakService).mockImplementation(() => mockKeycloakService);
    bindMock(KeycloakService, mockKeycloakService);
  });

  describe("GET /api/users/[id]", () => {
    it("should return user successfully", async () => {
      const mockUser = {
        id: "user123",
        username: "testuser",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      };
      mockKeycloakService.getUser.mockResolvedValue(mockUser);

      const req = new NextRequest("http://localhost:3000/api/users/user123");
      const { params } = { params: { userId: "user123" } };

      const response = await GET(req, { params });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockUser);
      expect(mockKeycloakService.getUser).toHaveBeenCalledWith("user123");
    });

    it("should return 500 if getting user fails", async () => {
      mockKeycloakService.getUser.mockRejectedValue(new Error("Fetch failed"));

      const req = new NextRequest("http://localhost:3000/api/users/user123");
      const { params } = { params: { userId: "user123" } };

      const response = await GET(req, { params });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("PUT /api/users/[id]", () => {
    it("should update user successfully", async () => {
      const mockUpdatedUser = {
        id: "user123",
        username: "testuser",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      };
      mockKeycloakService.updateUser.mockResolvedValue(mockUpdatedUser);

      const req = new NextRequest("http://localhost:3000/api/users/user123", {
        method: "PUT",
        body: JSON.stringify({ firstName: "John", lastName: "Doe" }),
      });
      const { params } = { params: { userId: "user123" } };

      const response = await PUT(req, { params });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockUpdatedUser);
      expect(mockKeycloakService.updateUser).toHaveBeenCalledWith("user123", {
        firstName: "John",
        lastName: "Doe",
      });
    });

    it("should return 400 if trying to update invalid fields", async () => {
      const req = new NextRequest("http://localhost:3000/api/users/user123", {
        method: "PUT",
        body: JSON.stringify({ email: "newemail@example.com" }),
      });
      const { params } = { params: { userId: "user123" } };

      const response = await PUT(req, { params });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error:
          "Invalid fields: email. Only firstName and lastName can be updated.",
      });
      expect(mockKeycloakService.updateUser).not.toHaveBeenCalled();
    });

    it("should return 400 if firstName or lastName is empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/users/user123", {
        method: "PUT",
        body: JSON.stringify({ firstName: "" }),
      });
      const { params } = { params: { userId: "user123" } };

      const response = await PUT(req, { params });
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: "firstName must be a non-empty string",
      });
      expect(mockKeycloakService.updateUser).not.toHaveBeenCalled();
    });

    it("should return 500 if updating user fails", async () => {
      mockKeycloakService.updateUser.mockRejectedValue(
        new Error("Update failed")
      );

      const req = new NextRequest("http://localhost:3000/api/users/user123", {
        method: "PUT",
        body: JSON.stringify({ firstName: "John", lastName: "Doe" }),
      });
      const { params } = { params: { userId: "user123" } };

      const response = await PUT(req, { params });
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: "Internal Server Error" });
    });
  });
});
