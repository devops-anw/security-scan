import "reflect-metadata";
import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";
import { KeycloakService } from "@/services/keycloakService";
import { UserService } from "@/services/userService";
import { OrganizationService } from "@/services/organizationService";
import { NotificationService } from "@/services/notificationService";
import { KeycloakError } from "@/utils/errorHandler";
import { User, UserWithOrg } from "@/types/keycloak";

vi.mock("@/utils/logger", () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("KeycloakService", () => {
  let keycloakService: KeycloakService;
  let mockUserService: UserService;
  let mockOrganizationService: OrganizationService;
  let mockNotificationService: NotificationService;

  beforeEach(() => {
    mockUserService = {
      createUser: vi.fn(),
      updateUserStatus: vi.fn(),
      findOrganizationByName: vi.fn(),
      findUserByUsernameOrEmail: vi.fn(),
      getUser: vi.fn(),
      getPendingUsers: vi.fn(),
      getUsersWithPagination: vi.fn(),
      verifyEmail: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
    } as unknown as UserService;
    mockOrganizationService = {
      createOrganization: vi.fn(),
      findOrganizationByName: vi.fn(),
      findUserByUsernameOrEmail: vi.fn(),
      assignUserToOrganization: vi.fn(),
      getOrganizationsInfo: vi.fn(),
      deleteOrganization: vi.fn(),
    } as unknown as OrganizationService;
    mockNotificationService = {
      sendAdminNotification: vi.fn(),
      sendUserVerificationEmail: vi.fn(),
      sendStatusUpdateEmail: vi.fn(),
    } as unknown as NotificationService;
    keycloakService = new KeycloakService(
      mockUserService,
      mockOrganizationService,
      mockNotificationService
    );
  });

  describe("createOrganizationAndUser", () => {
    const validInput = {
      orgName: "Test Org",
      adminUser: {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      },
    };

    it("should create an organization and user successfully", async () => {
      vi.mocked(mockOrganizationService.createOrganization).mockResolvedValue({
        id: "org1",
        name: "Test Org",
      });
      vi.mocked(mockUserService.createUser).mockResolvedValue({
        id: "user1",
        username: "testuser",
        email: "test@example.com",
        attributes: { verificationToken: ["token123"] },
      } as unknown as User);
      vi.mocked(
        mockOrganizationService.findOrganizationByName
      ).mockResolvedValue(undefined);
      vi.mocked(mockUserService.findUserByUsernameOrEmail).mockResolvedValue(
        null
      );

      const result = await keycloakService.createOrganizationAndUser(
        validInput
      );

      expect(result).toEqual({
        tenant: { id: "org1", name: "Test Org" },
        adminUser: {
          id: "user1",
          username: "testuser",
          email: "test@example.com",
          attributes: { verificationToken: ["token123"] },
        },
      });
      expect(mockOrganizationService.createOrganization).toHaveBeenCalledWith(
        "Test Org"
      );
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        validInput.adminUser
      );
      expect(
        mockOrganizationService.assignUserToOrganization
      ).toHaveBeenCalledWith("org1", "user1");
      expect(mockNotificationService.sendAdminNotification).toHaveBeenCalled();
      expect(
        mockNotificationService.sendUserVerificationEmail
      ).toHaveBeenCalled();
    });

    it("should throw an error and rollback if organization creation fails", async () => {
      vi.mocked(mockOrganizationService.createOrganization).mockRejectedValue(
        new Error("Org creation failed")
      );

      await expect(
        keycloakService.createOrganizationAndUser(validInput)
      ).rejects.toThrow(KeycloakError);
      expect(mockOrganizationService.createOrganization).toHaveBeenCalledWith(
        "Test Org"
      );
      expect(mockUserService.createUser).not.toHaveBeenCalled();
      expect(
        mockOrganizationService.assignUserToOrganization
      ).not.toHaveBeenCalled();
    });

    it("should throw an error and rollback if user creation fails", async () => {
      vi.mocked(mockOrganizationService.createOrganization).mockResolvedValue({
        id: "org1",
        name: "Test Org",
      });
      vi.mocked(mockUserService.createUser).mockRejectedValue(
        new Error("User creation failed")
      );

      await expect(
        keycloakService.createOrganizationAndUser(validInput)
      ).rejects.toThrow(KeycloakError);
      expect(mockOrganizationService.createOrganization).toHaveBeenCalledWith(
        "Test Org"
      );
      expect(mockUserService.createUser).toHaveBeenCalled();
      expect(
        mockOrganizationService.assignUserToOrganization
      ).not.toHaveBeenCalled();
      expect(mockOrganizationService.deleteOrganization).toHaveBeenCalledWith(
        "org1"
      );
    });

    it("should throw an error for invalid input", async () => {
      const invalidInput = {
        orgName: "",
        adminUser: {
          username: "",
          email: "invalid-email",
          password: "short",
          firstName: "Test",
          lastName: "User",
        },
      };

      await expect(
        keycloakService.createOrganizationAndUser(invalidInput)
      ).rejects.toThrow(KeycloakError);
      expect(mockOrganizationService.createOrganization).not.toHaveBeenCalled();
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });
  });

  describe("approveUser", () => {
    it("should approve a user successfully", async () => {
      const userId = "user1";
      const user = {
        id: userId,
        email: "user@example.com",
        attributes: { status: ["pending"] },
      } as unknown as User;
      vi.mocked(mockUserService.getUser).mockResolvedValue(user);

      await keycloakService.approveUser(userId);

      expect(mockUserService.updateUserStatus).toHaveBeenCalledWith(
        userId,
        "approved",
        true
      );
      expect(
        mockNotificationService.sendStatusUpdateEmail
      ).toHaveBeenCalledWith(user, "approved");
    });

    it("should throw an error if user approval fails", async () => {
      const userId = "user1";
      vi.mocked(mockUserService.updateUserStatus).mockRejectedValue(
        new Error("Approval failed")
      );

      await expect(keycloakService.approveUser(userId)).rejects.toThrow(
        KeycloakError
      );
    });
  });

  describe("rejectUser", () => {
    it("should reject a user successfully", async () => {
      const userId = "user1";
      const user = {
        id: userId,
        email: "user@example.com",
        attributes: { status: ["pending"] },
      } as unknown as User;
      vi.mocked(mockUserService.getUser).mockResolvedValue(user);

      await keycloakService.rejectUser(userId);

      expect(mockUserService.updateUserStatus).toHaveBeenCalledWith(
        userId,
        "rejected",
        false
      );
      expect(
        mockNotificationService.sendStatusUpdateEmail
      ).toHaveBeenCalledWith(user, "rejected");
    });

    it("should throw an error if user rejection fails", async () => {
      const userId = "user1";
      vi.mocked(mockUserService.updateUserStatus).mockRejectedValue(
        new Error("Rejection failed")
      );

      await expect(keycloakService.rejectUser(userId)).rejects.toThrow(
        KeycloakError
      );
    });
  });

  describe("getPendingUsers", () => {
    it("should return pending users successfully", async () => {
      const pendingUsers = [
        { id: "user1", username: "pending1" },
        { id: "user2", username: "pending2" },
      ] as UserWithOrg[];
      vi.mocked(mockUserService.getPendingUsers).mockResolvedValue(
        pendingUsers
      );

      const result = await keycloakService.getPendingUsers();

      expect(result).toEqual(pendingUsers);
      expect(mockUserService.getPendingUsers).toHaveBeenCalled();
    });

    it("should throw an error if fetching pending users fails", async () => {
      vi.mocked(mockUserService.getPendingUsers).mockRejectedValue(
        new Error("Fetch failed")
      );

      await expect(keycloakService.getPendingUsers()).rejects.toThrow(
        KeycloakError
      );
    });
  });

  describe("getUsersWithOrgInfo", () => {
    it("should return users with organization info successfully", async () => {
      const paginationQuery = { page: 1, pageSize: 10 };
      const users = {
        data: [
          { id: "user1", attributes: { "kc.org": ["org1"] } },
          { id: "user2", attributes: { "kc.org": ["org2"] } },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      } as any;
      const orgsInfo = new Map([
        ["org1", { id: "org1", name: "Org 1" }],
        ["org2", { id: "org2", name: "Org 2" }],
      ]);

      vi.mocked(mockUserService.getUsersWithPagination).mockResolvedValue(
        users
      );
      vi.mocked(mockOrganizationService.getOrganizationsInfo).mockResolvedValue(
        orgsInfo
      );

      const result = await keycloakService.getUsersWithOrgInfo(paginationQuery);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].organization).toEqual({
        id: "org1",
        name: "Org 1",
      });
      expect(result.data[1].organization).toEqual({
        id: "org2",
        name: "Org 2",
      });
    });

    it("should handle users without organization info", async () => {
      const paginationQuery = { page: 1, pageSize: 10 };
      const users = {
        data: [
          { id: "user1", attributes: {} },
          { id: "user2", attributes: { "kc.org": ["org2"] } },
        ],
        totalCount: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      } as any;
      const orgsInfo = new Map([["org2", { id: "org2", name: "Org 2" }]]);

      vi.mocked(mockUserService.getUsersWithPagination).mockResolvedValue(
        users
      );
      vi.mocked(mockOrganizationService.getOrganizationsInfo).mockResolvedValue(
        orgsInfo
      );

      const result = await keycloakService.getUsersWithOrgInfo(paginationQuery);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].organization).toBeNull();
      expect(result.data[1].organization).toEqual({
        id: "org2",
        name: "Org 2",
      });
    });

    it("should throw an error if fetching users with org info fails", async () => {
      const paginationQuery = { page: 1, pageSize: 10 };
      vi.mocked(mockUserService.getUsersWithPagination).mockRejectedValue(
        new Error("Fetch failed")
      );

      await expect(
        keycloakService.getUsersWithOrgInfo(paginationQuery)
      ).rejects.toThrow(KeycloakError);
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      const token = "valid-token";

      await keycloakService.verifyEmail(token);

      expect(mockUserService.verifyEmail).toHaveBeenCalledWith(token);
    });

    it("should throw an error if email verification fails", async () => {
      const token = "invalid-token";
      vi.mocked(mockUserService.verifyEmail).mockRejectedValue(
        new Error("Verification failed")
      );

      await expect(keycloakService.verifyEmail(token)).rejects.toThrow(
        KeycloakError
      );
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const userId = "user1";
      const updateData = { firstName: "Updated", lastName: "User" };
      const updatedUser = { id: userId, ...updateData } as User;
      vi.mocked(mockUserService.updateUser).mockResolvedValue(updatedUser);

      const result = await keycloakService.updateUser(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        userId,
        updateData
      );
    });

    it("should throw an error if user update fails", async () => {
      const userId = "user1";
      const updateData = { firstName: "Updated", lastName: "User" };
      vi.mocked(mockUserService.updateUser).mockRejectedValue(
        new Error("Update failed")
      );

      await expect(
        keycloakService.updateUser(userId, updateData)
      ).rejects.toThrow(KeycloakError);
    });
  });

  describe("getUser", () => {
    it("should get user with organization info successfully", async () => {
      const userId = "user1";
      const user = {
        id: userId,
        attributes: { "kc.org": ["org1"] },
      } as unknown as User;
      const orgInfo = new Map([["org1", { id: "org1", name: "Org 1" }]]);
      vi.mocked(mockUserService.getUser).mockResolvedValue(user);
      vi.mocked(mockOrganizationService.getOrganizationsInfo).mockResolvedValue(
        orgInfo
      );

      const result = await keycloakService.getUser(userId);

      expect(result).toEqual({
        ...user,
        organization: { id: "org1", name: "Org 1" },
      });
    });

    it("should handle user without organization info", async () => {
      const userId = "user1";
      const user = { id: userId, attributes: {} } as unknown as User;
      vi.mocked(mockUserService.getUser).mockResolvedValue(user);

      const result = await keycloakService.getUser(userId);

      expect(result).toEqual({ ...user, organization: null });
    });

    it("should throw an error if getting user fails", async () => {
      const userId = "user1";
      vi.mocked(mockUserService.getUser).mockRejectedValue(
        new Error("Fetch failed")
      );

      await expect(keycloakService.getUser(userId)).rejects.toThrow(
        KeycloakError
      );
    });
  });
});
