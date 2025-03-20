import { inject, injectable } from "inversify";
import { KeycloakAdminClientManager } from "@/lib/keycloakAdminClient";
import { KeycloakError } from "@/utils/errorHandler";
import logger from "@/utils/logger";
import OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { Tenant } from "@/types/keycloak";

@injectable()
export class OrganizationService {
    constructor(
        @inject(KeycloakAdminClientManager) private keycloakAdminClientManager: KeycloakAdminClientManager
    ) {}

    public async createOrganization(orgName: string): Promise<OrganizationRepresentation> {
        const kcAdminClient = await this.keycloakAdminClientManager.getClient();
        try {
            return await kcAdminClient.organizations.create({
                name: orgName,
                domains: [
                    {
                        name: orgName.toLowerCase().replace(/\s/g, "") + ".com",
                        verified: true,
                    },
                ],
            });
        } catch (error) {
            logger.error({
                msg: "Failed to create organization",
                error,
                orgName
            });
            throw new KeycloakError(`Failed to create organization: ${orgName}`);
        }
    }

    public async assignUserToOrganization(organizationId: string, userId: string): Promise<void> {
        const kcAdminClient = await this.keycloakAdminClientManager.getClient();
        try {
            await kcAdminClient.organizations.addMember({
                orgId: organizationId,
                userId: userId,
            });
        } catch (error) {
            logger.error({
                msg: "Failed to assign user to organization",
                error,
                organizationId,
                userId
            });
            throw new KeycloakError(`Failed to assign user (${userId}) to organization (${organizationId})`);
        }
    }

    public async getOrganizationsInfo(orgIds: string[]): Promise<Map<string, Tenant>> {
        const kcAdminClient = await this.keycloakAdminClientManager.getClient();
        try {
            const keycloakOrgs = await Promise.all(
                orgIds.map((orgId) =>
                    kcAdminClient.organizations.findOne({ id: orgId })
                )
            );

            return new Map(
                keycloakOrgs.map((org) => [
                    org.id!,
                    {
                        id: org.id!,
                        name: org.name!,
                    },
                ])
            );
        } catch (error) {
            logger.error({
                msg: "Failed to fetch organizations info",
                error,
                orgIds
            });
            throw new KeycloakError(`Failed to fetch information for organizations: ${orgIds.join(', ')}`);
        }
    }

    public async deleteOrganization(orgId: string): Promise<void> {
        const kcAdminClient = await this.keycloakAdminClientManager.getClient();
        try {
            await kcAdminClient.organizations.delById({ id: orgId });
        } catch (error) {
            logger.error({
                msg: "Failed to delete organization",
                error,
                orgId
            });
            throw new KeycloakError(`Failed to delete organization: ${orgId}`);
        }
    }
    public async findOrganizationByName(orgName: string): Promise<OrganizationRepresentation | undefined> {
        const kcAdminClient = await this.keycloakAdminClientManager.getClient();
        try {
            const organizations = await kcAdminClient.organizations.find();
            return organizations.find((org) => org.name === orgName);
        } catch (error) {
            logger.error({
                msg: "Failed to find organization by name",
                error,
                orgName
            });
            throw new KeycloakError(`Failed to find organization with name: ${orgName}`);
        }
    }
}