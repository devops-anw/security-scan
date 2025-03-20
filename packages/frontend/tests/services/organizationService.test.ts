import "reflect-metadata";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { OrganizationService } from "@/services/organizationService";
import { KeycloakAdminClientManager } from "@/lib/keycloakAdminClient";
import { KeycloakError } from "@/utils/errorHandler";

describe("OrganizationService", () => {
  let organizationService: OrganizationService;
  let mockKeycloakAdminClientManager: KeycloakAdminClientManager;
  let mockKeycloakClient: any;

  beforeEach(() => {
    mockKeycloakClient = {
      organizations: {
        create: vi.fn(),
        addMember: vi.fn(),
        findOne: vi.fn(),
        delById: vi.fn(),
      },
    };
    mockKeycloakAdminClientManager = {
      getClient: vi.fn().mockResolvedValue(mockKeycloakClient),
    } as unknown as KeycloakAdminClientManager;
    organizationService = new OrganizationService(
      mockKeycloakAdminClientManager
    );
  });

  describe("createOrganization", () => {
    it("should create an organization successfully", async () => {
      const orgName = "Test Org";
      const expectedOrg = { id: "org1", name: orgName };
      mockKeycloakClient.organizations.create.mockResolvedValue(expectedOrg);

      const result = await organizationService.createOrganization(orgName);

      expect(result).toEqual(expectedOrg);
      expect(mockKeycloakClient.organizations.create).toHaveBeenCalledWith({
        name: orgName,
        domains: [
          {
            name: "testorg.com",
            verified: true,
          },
        ],
      });
    });

    it("should throw KeycloakError if organization creation fails", async () => {
      mockKeycloakClient.organizations.create.mockRejectedValue(
        new Error("Org creation failed")
      );

      await expect(
        organizationService.createOrganization("Test Org")
      ).rejects.toThrow(KeycloakError);
    });
  });

  describe("assignUserToOrganization", () => {
    it("should assign user to organization successfully", async () => {
      const orgId = "org1";
      const userId = "user1";
      mockKeycloakClient.organizations.addMember.mockResolvedValue(undefined);

      await organizationService.assignUserToOrganization(orgId, userId);

      expect(mockKeycloakClient.organizations.addMember).toHaveBeenCalledWith({
        orgId,
        userId,
      });
    });

    it("should throw KeycloakError if user assignment fails", async () => {
      mockKeycloakClient.organizations.addMember.mockRejectedValue(
        new Error("Assignment failed")
      );

      await expect(
        organizationService.assignUserToOrganization("org1", "user1")
      ).rejects.toThrow(KeycloakError);
    });
  });

  describe("getOrganizationsInfo", () => {
    it("should fetch organizations info successfully", async () => {
      const orgIds = ["org1", "org2"];
      const mockOrgs = [
        { id: "org1", name: "Org 1" },
        { id: "org2", name: "Org 2" },
      ];
      mockKeycloakClient.organizations.findOne.mockImplementation(
        (params: { id: string }) =>
          Promise.resolve(mockOrgs.find((org) => org.id === params.id))
      );

      const result = await organizationService.getOrganizationsInfo(orgIds);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
      expect(result.get("org1")).toEqual({ id: "org1", name: "Org 1" });
      expect(result.get("org2")).toEqual({ id: "org2", name: "Org 2" });
      expect(mockKeycloakClient.organizations.findOne).toHaveBeenCalledTimes(2);
    });

    it("should throw KeycloakError if fetching organizations info fails", async () => {
      mockKeycloakClient.organizations.findOne.mockRejectedValue(
        new Error("Fetch failed")
      );

      await expect(
        organizationService.getOrganizationsInfo(["org1"])
      ).rejects.toThrow(KeycloakError);
    });
  });

  describe("deleteOrganization", () => {
    it("should delete organization successfully", async () => {
      const orgId = "org1";
      mockKeycloakClient.organizations.delById.mockResolvedValue(undefined);

      await organizationService.deleteOrganization(orgId);

      expect(mockKeycloakClient.organizations.delById).toHaveBeenCalledWith({
        id: orgId,
      });
    });

    it("should throw KeycloakError if organization deletion fails", async () => {
      mockKeycloakClient.organizations.delById.mockRejectedValue(
        new Error("Deletion failed")
      );

      await expect(
        organizationService.deleteOrganization("org1")
      ).rejects.toThrow(KeycloakError);
    });
  });
});
