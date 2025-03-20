import { inject, injectable } from "inversify";
import { UserService } from "@/services/userService";
import { OrganizationService } from "@/services/organizationService";
import { NotificationService } from "@/services/notificationService";
import {
  CreateOrgWithAdminInput,
  CreateOrgWithAdminResult,
  User,
  UserWithOrg,
} from "@/types/keycloak";
import { PaginationQuery, PaginatedResult } from "@/types/pagination";
import { KeycloakError } from "@/utils/errorHandler";
import logger from "@/utils/logger";
import OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";

@injectable()
export class KeycloakService {
  constructor(
    @inject(UserService) private userService: UserService,
    @inject(OrganizationService)
    private organizationService: OrganizationService,
    @inject(NotificationService)
    private notificationService: NotificationService
  ) {}

  public async createOrganizationAndUser(
    input: CreateOrgWithAdminInput
  ): Promise<CreateOrgWithAdminResult> {
    this.validateInput(input);

    let org: OrganizationRepresentation | undefined;
    let user: User | undefined;

    try {
      const errorDetails: { field: string; message: string }[] = [];

      const existingOrg = await this.organizationService.findOrganizationByName(
        input.orgName
      );
      if (existingOrg) {
        errorDetails.push({
          field: "orgName",
          message: `Organization with name "${input.orgName}" already exists`,
        });
      }
      const existingUser = await this.userService.findUserByUsernameOrEmail(
        input.adminUser.username,
        input.adminUser.email
      );

      if (existingUser) {
        if (existingUser.username === input.adminUser.username) {
          errorDetails.push({
            field: "username",
            message: `User with username "${input.adminUser.username}" already exists`,
          });
        }

        if (existingUser.email === input.adminUser.email) {
          errorDetails.push({
            field: "email",
            message: `User with email "${input.adminUser.email}" already exists`,
          });
        }
      }

      if (errorDetails.length > 0) {
        logger.error({
          msg: "Attempt to create duplicate organization or user",
          orgName: input.orgName,
          username: input.adminUser.username,
          email: input.adminUser.email,
          details: errorDetails,
        });

        throw new KeycloakError("Error in organization or user creation", {
          code: "USER_EXISTS",
          details: errorDetails,
        });
      }
      org = await this.organizationService.createOrganization(input.orgName);
      user = await this.userService.createUser(input.adminUser);
      await this.organizationService.assignUserToOrganization(
        org.id!,
        user.id!
      );
      await this.notificationService.sendAdminNotification(user, input.orgName);
      await this.notificationService.sendUserVerificationEmail(
        user,
        input.orgName,
        user.attributes.verificationToken[0]
      );

      logger.info({
        msg: "Organization and user created successfully",
        orgId: org.id,
        userId: user.id,
        orgName: input.orgName,
      });

      return {
        tenant: { id: org.id!, name: org.name! },
        adminUser: user,
      };
    } catch (error) {
      logger.error({
        msg: "Error in createOrganizationAndUser",
        error: error instanceof Error ? error.message : String(error),
        orgName: input.orgName,
        username: input.adminUser.username,
      });
      if (error instanceof KeycloakError && error.code === "USER_EXISTS") {
        throw error;
      }
      await this.rollbackCreation(org?.id, user?.id);

      if (!org?.id) {
        throw new KeycloakError("Failed to create organization");
      } else {
        throw new KeycloakError("Failed to create user");
      }
    }
  }

  public async approveUser(userId: string): Promise<void> {
    if (!userId || userId.trim().length === 0) {
      throw new KeycloakError("User ID is required", {
        code: "INVALID_USER_ID",
      });
    }
    await this.updateUserApprovalStatus(userId, "approved", true);
  }
  public async rejectUser(userId: string): Promise<void> {
    await this.updateUserApprovalStatus(userId, "rejected", false);
  }

  private async updateUserApprovalStatus(
    userId: string,
    status: "approved" | "rejected",
    isEnabled: boolean
  ): Promise<void> {
    try {
      const user = await this.validateUserForApproval(userId);
      await this.userService.updateUserStatus(userId, status, isEnabled);
      await this.notificationService.sendStatusUpdateEmail(user, status);

      logger.info({
        msg: `User ${status} successfully`,
        userId: userId,
      });
    } catch (error) {
      this.handleError(error, `Failed to ${status} user`, userId);
    }
  }

  private async validateUserForApproval(userId: string) {
    const user = await this.userService.getUser(userId);
    if (!user) {
      throw new KeycloakError("User not found");
    }
    if (user.attributes.status[0] !== "pending") {
      throw new KeycloakError("User is not pending approval");
    }
    return user;
  }

  private handleError(error: unknown, message: string, userId: string): never {
    if (error instanceof KeycloakError) {
      // If it's already a KeycloakError, rethrow it
      throw error;
    }

    logger.error({
      msg: message,
      error: error instanceof Error ? error.message : String(error),
      userId: userId,
    });

    throw new KeycloakError(message);
  }

  public async getPendingUsers(): Promise<UserWithOrg[]> {
    try {
      const users = await this.userService.getPendingUsers();
      logger.info({
        msg: "Pending users fetched successfully",
        count: users.length,
      });
      return users;
    } catch (error) {
      logger.error({
        msg: "Error in getPendingUsers",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new KeycloakError("Failed to fetch pending users");
    }
  }

  public async getUsersWithOrgInfo(
    query: PaginationQuery
  ): Promise<PaginatedResult<UserWithOrg>> {
    try {
      const users = await this.userService.getUsersWithPagination(query);
      const orgIds = users.data
        .map((user) => user.attributes["kc.org"]?.[0])
        .filter(Boolean);
      const orgsInfo = await this.organizationService.getOrganizationsInfo(
        orgIds
      );

      const usersWithOrgs: UserWithOrg[] = users.data.map((user) => ({
        ...user,
        organization: user.attributes["kc.org"]?.[0]
          ? orgsInfo.get(user.attributes["kc.org"][0]) || null
          : null,
      }));

      logger.info({
        msg: "Users with organization info fetched successfully",
        count: usersWithOrgs.length,
        page: query.page,
        pageSize: query.pageSize,
      });

      return {
        ...users,
        data: usersWithOrgs,
      };
    } catch (error) {
      logger.error({
        msg: "Error in getUsersWithOrgInfo",
        error: error instanceof Error ? error.message : String(error),
        query: query,
      });
      throw new KeycloakError("Failed to fetch users with organization info");
    }
  }

  public async verifyEmail(token: string): Promise<void> {
    try {
      await this.userService.verifyEmail(token);
      logger.info({
        msg: "Email verified successfully",
        token: token,
      });
    } catch (error) {
      logger.error({
        msg: "Error in verifyEmail",
        error: error instanceof Error ? error.message : String(error),
        token: token,
      });
      throw new KeycloakError("Failed to verify email");
    }
  }

  public async updateUser(
    userId: string,
    updateData: Partial<User>
  ): Promise<User> {
    try {
      const updatedUser = await this.userService.updateUser(userId, updateData);
      logger.info({
        msg: "User updated successfully",
        userId: userId,
        updatedFields: Object.keys(updateData),
      });
      return updatedUser;
    } catch (error) {
      logger.error({
        msg: "Error in updateUser",
        error: error instanceof Error ? error.message : String(error),
        userId: userId,
        updateData: updateData,
      });
      throw new KeycloakError("Failed to update user");
    }
  }

  public async getUser(userId: string): Promise<UserWithOrg> {
    try {
      const user = await this.userService.getUser(userId);
      const orgId = user.attributes["kc.org"]?.[0];
      let organization = null;

      if (orgId) {
        const orgsInfo = await this.organizationService.getOrganizationsInfo([
          orgId,
        ]);
        organization = orgsInfo.get(orgId) || null;
      }

      logger.info({
        msg: "User fetched successfully",
        userId: userId,
        hasOrganization: !!organization,
      });

      return {
        ...user,
        organization,
      };
    } catch (error) {
      logger.error({
        msg: "Error in getUser",
        error: error instanceof Error ? error.message : String(error),
        userId: userId,
      });
      throw new KeycloakError("Failed to fetch user");
    }
  }

  private validateInput(input: CreateOrgWithAdminInput): void {
    if (!input.orgName || input.orgName.trim().length === 0) {
      throw new KeycloakError("Organization name is required");
    }
    if (
      !input.adminUser.username ||
      input.adminUser.username.trim().length === 0
    ) {
      throw new KeycloakError("Username is required");
    }
    if (
      !input.adminUser.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.adminUser.email)
    ) {
      throw new KeycloakError("Valid email is required");
    }
    if (!input.adminUser.password || input.adminUser.password.length < 8) {
      throw new KeycloakError("Password must be at least 8 characters long");
    }
  }

  private async rollbackCreation(
    orgId?: string,
    userId?: string
  ): Promise<void> {
    if (userId) {
      try {
        await this.userService.deleteUser(userId);
        logger.info({
          msg: "User deleted during rollback",
          userId: userId,
        });
      } catch (error) {
        logger.error({
          msg: "Error deleting user during rollback",
          error: error instanceof Error ? error.message : String(error),
          userId: userId,
        });
      }
    }
    if (orgId) {
      try {
        await this.organizationService.deleteOrganization(orgId);
        logger.info({
          msg: "Organization deleted during rollback",
          orgId: orgId,
        });
      } catch (error) {
        logger.error({
          msg: "Error deleting organization during rollback",
          error: error instanceof Error ? error.message : String(error),
          orgId: orgId,
        });
      }
    }
  }
}
