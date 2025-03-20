import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "@/services/userService";
import { KeycloakAdminClientManager } from "@/lib/keycloakAdminClient";
import { KeycloakError } from "@/utils/errorHandler";
import { OrganizationService } from "@/services/organizationService";

describe("UserService", () => {
  let userService: UserService;
  let mockKeycloakAdminClientManager: KeycloakAdminClientManager;
  let mockOrganizationService: OrganizationService;
  let mockKeycloakClient: any;

  beforeEach(() => {
    mockKeycloakAdminClientManager = {
      getClient: vi.fn(),
    } as unknown as KeycloakAdminClientManager;
    mockOrganizationService = {
      getOrganizationsInfo: vi.fn().mockResolvedValue(new Map()),
    } as unknown as OrganizationService;

    mockKeycloakClient = {
      users: {
        create: vi.fn(),
        update: vi.fn(),
        findOne: vi.fn(),
        find: vi.fn(),
        count: vi.fn(),
        del: vi.fn(),
        addRealmRoleMappings: vi.fn(),
      },
      roles: {
        find: vi.fn(),
      },
    };
    vi.mocked(mockKeycloakAdminClientManager.getClient).mockResolvedValue(
      mockKeycloakClient
    );

    userService = new UserService(
      mockKeycloakAdminClientManager,
      mockOrganizationService
    );
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      mockKeycloakClient.users.create.mockResolvedValue({ id: "user1" });
      mockKeycloakClient.users.findOne.mockResolvedValue({
        id: "user1",
        attributes: {},
      });

      mockKeycloakClient.roles.find.mockResolvedValue([
        { id: "role1", name: "ORG_ADMIN" },
      ]);

      mockKeycloakClient.users.addRealmRoleMappings.mockResolvedValue({});

      const adminUser = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      };

      const result = await userService.createUser(adminUser);

      expect(result).toHaveProperty("id", "user1");
      expect(mockKeycloakClient.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "testuser",
          email: "test@example.com",
        })
      );
      expect(mockKeycloakClient.roles.find).toHaveBeenCalledWith({
        realm: mockKeycloakClient.realmName,
      });
      expect(
        mockKeycloakClient.users.addRealmRoleMappings
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user1",
          roles: expect.arrayContaining([
            expect.objectContaining({ name: "ORG_ADMIN" }),
          ]),
        })
      );
    });

    it("should throw an error if user creation fails", async () => {
      mockKeycloakClient.users.create.mockRejectedValue(
        new Error("User creation failed")
      );

      const adminUser = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      };

      await expect(userService.createUser(adminUser)).rejects.toThrow(
        KeycloakError
      );
    });
    it("should throw an error and delete the user if role assignment fails", async () => {
      // Mock user creation response
      mockKeycloakClient.users.create.mockResolvedValue({ id: "user1" });
      mockKeycloakClient.users.findOne.mockResolvedValue({
        id: "user1",
        attributes: {},
      });

      // Mock role retrieval response
      mockKeycloakClient.roles.find.mockResolvedValue([
        { id: "role1", name: "ORG_ADMIN" },
      ]);

      // Mock role assignment failure
      mockKeycloakClient.users.addRealmRoleMappings.mockRejectedValue(
        new Error("Role assignment failed")
      );

      // Mock user deletion response
      mockKeycloakClient.users.del.mockResolvedValue({});

      const adminUser = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      };

      await expect(userService.createUser(adminUser)).rejects.toThrow(
        KeycloakError
      );
      expect(mockKeycloakClient.users.del).toHaveBeenCalledWith({
        id: "user1",
      });
    });
  });

  describe("updateUserStatus", () => {
    it("should update user status successfully", async () => {
      mockKeycloakClient.users.findOne.mockResolvedValue({
        id: "user1",
        attributes: {},
      });
      mockKeycloakClient.users.update.mockResolvedValue(undefined);

      await userService.updateUserStatus("user1", "active", true);

      expect(mockKeycloakClient.users.update).toHaveBeenCalledWith(
        { id: "user1" },
        expect.objectContaining({
          enabled: true,
          attributes: { status: ["active"] },
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      mockKeycloakClient.users.findOne.mockResolvedValue(null);

      await expect(
        userService.updateUserStatus("user1", "active", true)
      ).rejects.toThrow(KeycloakError);
    });
  });

  describe("getPendingUsers", () => {
    it("should return pending users with organization info", async () => {
      const mockPendingUsers = [
        { id: "user1", attributes: { "kc.org": ["org1"] } },
        { id: "user2", attributes: { "kc.org": ["org2"] } },
      ];
      mockKeycloakClient.users.find.mockResolvedValue(mockPendingUsers);
      vi.mocked(mockOrganizationService.getOrganizationsInfo).mockResolvedValue(
        new Map([
          ["org1", { id: "org1", name: "Org 1" }],
          ["org2", { id: "org2", name: "Org 2" }],
        ])
      );

      const result = await userService.getPendingUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("organization", {
        id: "org1",
        name: "Org 1",
      });
      expect(result[1]).toHaveProperty("organization", {
        id: "org2",
        name: "Org 2",
      });
    });
  });

  describe("getUser", () => {
    it("should return a user by ID", async () => {
      const mockUser = {
        id: "user1",
        username: "testuser",
        email: "test@example.com",
      };
      mockKeycloakClient.users.findOne.mockResolvedValue(mockUser);

      const result = await userService.getUser("user1");

      expect(result).toEqual(
        expect.objectContaining({
          id: "user1",
          username: "testuser",
          email: "test@example.com",
        })
      );
    });

    it("should throw an error if user is not found", async () => {
      mockKeycloakClient.users.findOne.mockResolvedValue(null);

      await expect(userService.getUser("user1")).rejects.toThrow(KeycloakError);
    });
  });

  describe("getUsersWithPagination", () => {
    it("should return paginated users", async () => {
      const mockUsers = [
        { id: "user1", username: "user1" },
        { id: "user2", username: "user2" },
      ];
      mockKeycloakClient.users.find.mockResolvedValue(mockUsers);
      mockKeycloakClient.users.count.mockResolvedValue(10);

      const result = await userService.getUsersWithPagination({
        page: 1,
        pageSize: 2,
      });

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({ id: "user1" }),
          expect.objectContaining({ id: "user2" }),
        ]),
        totalCount: 10,
        page: 1,
        pageSize: 2,
        totalPages: 5,
      });
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      const mockUser = {
        id: "user1",
        attributes: { verificationToken: ["token123"] },
      };
      mockKeycloakClient.users.find.mockResolvedValue([mockUser]);

      await userService.verifyEmail("token123");

      expect(mockKeycloakClient.users.update).toHaveBeenCalledWith(
        { id: "user1" },
        expect.objectContaining({
          emailVerified: true,
          attributes: expect.not.objectContaining({
            verificationToken: expect.anything(),
          }),
        })
      );
    });

    it("should throw an error for invalid verification token", async () => {
      mockKeycloakClient.users.find.mockResolvedValue([]);

      await expect(userService.verifyEmail("invalidtoken")).rejects.toThrow(
        KeycloakError
      );
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const mockUser = { id: "user1", username: "oldusername" };
      mockKeycloakClient.users.findOne.mockResolvedValue(mockUser);

      const updateData = { username: "newusername" };
      await userService.updateUser("user1", updateData);

      expect(mockKeycloakClient.users.update).toHaveBeenCalledWith(
        { id: "user1" },
        expect.objectContaining({ username: "newusername" })
      );
    });

    it("should throw an error if user is not found", async () => {
      mockKeycloakClient.users.findOne.mockResolvedValue(null);

      await expect(
        userService.updateUser("user1", { username: "newusername" })
      ).rejects.toThrow(KeycloakError);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockKeycloakClient.users.del.mockResolvedValue(undefined);

      await userService.deleteUser("user1");

      expect(mockKeycloakClient.users.del).toHaveBeenCalledWith({
        id: "user1",
      });
    });

    it("should throw an error if deletion fails", async () => {
      mockKeycloakClient.users.del.mockRejectedValue(
        new Error("Deletion failed")
      );

      await expect(userService.deleteUser("user1")).rejects.toThrow(
        KeycloakError
      );
    });
  });
});
