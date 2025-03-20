import { inject, injectable } from "inversify";
import { KeycloakAdminClientManager } from "@/lib/keycloakAdminClient";
import { User, UserWithOrg } from "@/types/keycloak";
import { KeycloakError } from "@/utils/errorHandler";
import logger from "@/utils/logger";
import { OrganizationService } from "@/services/organizationService";
import crypto from "crypto";
import { PaginatedResult, PaginationQuery } from "@/types/pagination";

@injectable()
export class UserService {
  constructor(
    @inject(KeycloakAdminClientManager)
    private keycloakAdminClientManager: KeycloakAdminClientManager,
    @inject(OrganizationService)
    private organizationService: OrganizationService
  ) {}

  public async findUserByUsernameOrEmail(
    username: string,
    email: string
  ): Promise<User | null> {
    const kcAdminClient = await this.keycloakAdminClientManager.getClient();
    try {
      const usernameUsers = await kcAdminClient.users.find({
        username: username,
        exact: true,
      });
      const emailUsers = await kcAdminClient.users.find({
        email: email,
        exact: true,
      });

      const existingUser = usernameUsers[0] || emailUsers[0];

      if (existingUser) {
        logger.info({
          msg: "Existing user found during creation check",
          username: username,
          email: email,
        });
        return this.mapKeycloakUserToUser(existingUser);
      }

      return null;
    } catch (error) {
      logger.error({
        msg: "Error checking for existing user",
        error: error instanceof Error ? error.message : String(error),
        username: username,
        email: email,
      });
      throw new KeycloakError("Failed to check for existing user");
    }
  }
  public async createUser(adminUser: any): Promise<User> {
    const kcAdminClient = await this.keycloakAdminClientManager.getClient();
    try {
      const verificationToken = this.generateVerificationToken();

      const createdUser = await kcAdminClient.users.create({
        username: adminUser.username,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        enabled: false,
        attributes: {
          status: ["pending"],
          verificationToken: [verificationToken],
        },
        credentials: [
          {
            type: "password",
            value: adminUser.password,
            temporary: false,
          },
        ],
      });

      if (!createdUser.id) {
        throw new KeycloakError("User created without an ID");
      }

      // Add the realm role to the user
      try {
        const roles = await kcAdminClient.roles.find({
          realm: kcAdminClient.realmName,
        });
        const orgAdminRole = roles.find((role) => role.name === "ORG_ADMIN");

        if (!orgAdminRole) {
          throw new KeycloakError("ORG_ADMIN role not found in the realm");
        }

        await kcAdminClient.users.addRealmRoleMappings({
          id: createdUser.id,
          roles: [
            {
              id: orgAdminRole.id!,
              name: orgAdminRole.name!,
            },
          ],
        });

        logger.info({
          msg: "ORG_ADMIN role assigned to user successfully",
          userId: createdUser.id,
          roleName: "ORG_ADMIN",
        });
      } catch (roleError) {
        logger.error({
          msg: "Error assigning ORG_ADMIN role to user",
          error:
            roleError instanceof Error ? roleError.message : String(roleError),
          userId: createdUser.id,
        });

        // delete the user if role assignment fails
        await kcAdminClient.users.del({ id: createdUser.id });
        throw new KeycloakError("Failed to assign ORG_ADMIN role to user");
      }

      const user: User = await this.getUser(createdUser.id);
      logger.info({
        msg: "User created successfully",
        userId: user.id,
        username: user.username,
      });
      return this.mapKeycloakUserToUser(user);
    } catch (error) {
      logger.error({
        msg: "Error creating user",
        error: error instanceof Error ? error.message : String(error),
        username: adminUser.username,
      });
      throw new KeycloakError("Failed to create user");
    }
  }

  public async updateUserStatus(
    userId: string,
    status: string,
    enabled: boolean
  ): Promise<void> {
    const kcAdminClient = await this.keycloakAdminClientManager.getClient();
    try {
      const currentUser = await kcAdminClient.users.findOne({ id: userId });

      if (!currentUser) {
        throw new KeycloakError("User not found");
      }

      const updateData = {
        ...currentUser,
        enabled: enabled,
        attributes: {
          ...currentUser.attributes,
          status: [status],
        },
      };

      await kcAdminClient.users.update({ id: userId }, updateData);
      logger.info({
        msg: "User status updated successfully",
        userId,
        newStatus: status,
        enabled,
      });
    } catch (error) {
      logger.error({
        msg: `Error updating user status`,
        error: error instanceof Error ? error.message : String(error),
        userId,
        newStatus: status,
        enabled,
      });
      throw new KeycloakError(`Failed to update user status to ${status}`);
    }
  }

  public async getPendingUsers(): Promise<UserWithOrg[]> {
    const kcAdminClient = await this.keycloakAdminClientManager.getClient();
    try {
      const pendingUsers = await kcAdminClient.users.find({
        max: 1000,
        enabled: false,
        exact: true,
        q: `status:pending`,
      });

      pendingUsers.sort((a, b) => {
        const dateA = new Date(a.createdTimestamp || 0);
        const dateB = new Date(b.createdTimestamp || 0);
        return dateB.getTime() - dateA.getTime();
      });

      const orgIds = Array.from(
        new Set(
          pendingUsers
            .map((user) => user.attributes?.["kc.org"]?.[0])
            .filter(Boolean)
        )
      );

      const orgMap = await this.organizationService.getOrganizationsInfo(
        orgIds
      );

      const usersWithOrg = pendingUsers.map((user) => {
        const orgId = user.attributes?.["kc.org"]?.[0];
        const org = orgId ? orgMap.get(orgId) : null;
        return {
          ...this.mapKeycloakUserToUser(user),
          organization: org ? { ...org } : null,
        };
      });

      logger.info({
        msg: "Pending users fetched successfully",
        count: usersWithOrg.length,
      });

      return usersWithOrg;
    } catch (error) {
      logger.error({
        msg: "Error fetching pending users",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new KeycloakError("Failed to fetch pending users");
    }
  }

  public async getUser(userId: string): Promise<User> {
    const kcAdminClient = await this.keycloakAdminClientManager.getClient();
    try {
      const user = await kcAdminClient.users.findOne({ id: userId });
      if (!user) {
        throw new KeycloakError("User not found");
      }
      logger.info({
        msg: "User fetched successfully",
        userId,
      });
      return this.mapKeycloakUserToUser(user);
    } catch (error) {
      logger.error({
        msg: "Error fetching user",
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
      throw new KeycloakError("Failed to fetch user");
    }
  }

  public async getUsersWithPagination(
    query: PaginationQuery
  ): Promise<PaginatedResult<User>> {
    const kcAdminClient = await this.keycloakAdminClientManager.getClient();
    try {
      const users = await kcAdminClient.users.find({
        max: query.pageSize,
        first: (query.page - 1) * query.pageSize,
      });

      users.sort((a, b) => {
        const dateA = new Date(a.createdTimestamp || 0);
        const dateB = new Date(b.createdTimestamp || 0);
        return dateB.getTime() - dateA.getTime();
      });

      const totalCount = await kcAdminClient.users.count();

      const result = {
        data: users.map(this.mapKeycloakUserToUser),
        totalCount,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(totalCount / query.pageSize),
      };

      logger.info({
        msg: "Users fetched successfully with pagination",
        page: query.page,
        pageSize: query.pageSize,
        totalCount,
      });

      return result;
    } catch (error) {
      logger.error({
        msg: "Error fetching users with pagination",
        error: error instanceof Error ? error.message : String(error),
        page: query.page,
        pageSize: query.pageSize,
      });
      throw new KeycloakError("Failed to fetch users");
    }
  }

  public async verifyEmail(token: string): Promise<void> {
    const kcAdminClient = await this.keycloakAdminClientManager.getClient();
    try {
      const users = await kcAdminClient.users.find({
        max: 1,
        exact: true,
        q: `verificationToken:${token}`,
      });

      if (users.length === 0) {
        throw new KeycloakError("Invalid or expired verification token");
      }

      const user = users[0];

      await kcAdminClient.users.update(
        { id: user.id! },
        {
          ...user,
          emailVerified: true,
          attributes: {
            ...user.attributes,
            verificationToken: undefined,
          },
        }
      );

      logger.info({
        msg: "Email verified successfully",
        userId: user.id,
      });
    } catch (error) {
      logger.error({
        msg: "Error verifying email",
        error: error instanceof Error ? error.message : String(error),
        token,
      });
      throw new KeycloakError("Failed to verify email");
    }
  }

  public async updateUser(
    userId: string,
    updateData: Partial<User>
  ): Promise<User> {
    const kcAdminClient = await this.keycloakAdminClientManager.getClient();
    try {
      const currentUser = await kcAdminClient.users.findOne({ id: userId });
      if (!currentUser) {
        throw new KeycloakError("User not found");
      }

      const updatedUser = {
        ...currentUser,
        ...updateData,
      };

      await kcAdminClient.users.update({ id: userId }, updatedUser);

      logger.info({
        msg: "User updated successfully",
        userId,
        updatedFields: Object.keys(updateData),
      });

      return this.mapKeycloakUserToUser(updatedUser);
    } catch (error) {
      logger.error({
        msg: "Error updating user",
        error: error instanceof Error ? error.message : String(error),
        userId,
        updateData: Object.keys(updateData),
      });
      throw new KeycloakError("Failed to update user");
    }
  }

  public async deleteUser(userId: string): Promise<void> {
    const kcAdminClient = await this.keycloakAdminClientManager.getClient();
    try {
      await kcAdminClient.users.del({ id: userId });
      logger.info({
        msg: "User deleted successfully",
        userId,
      });
    } catch (error) {
      logger.error({
        msg: "Error deleting user",
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
      throw new KeycloakError("Failed to delete user");
    }
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  private mapKeycloakUserToUser(keycloakUser: any): User {
    return {
      id: keycloakUser.id!,
      username: keycloakUser.username!,
      email: keycloakUser.email!,
      firstName: keycloakUser.firstName,
      lastName: keycloakUser.lastName,
      enabled: keycloakUser.enabled!,
      attributes: { ...keycloakUser.attributes },
    };
  }
}
