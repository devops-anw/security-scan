import { KeycloakTokenParsed } from "keycloak-js";

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    type: string;
    tenantId: string;
    image?: string;
  };
}

export const BACKEND_USER_TYPES = ["PLATFORM_ADMIN", "ORG_ADMIN"] as const;

export const FRONTEND_USER_TYPES = ["Platform Admin", "Org Admin"] as const;

// Create types from these arrays
export type BackendUserType = (typeof BACKEND_USER_TYPES)[number];
export type FrontendUserType = (typeof FRONTEND_USER_TYPES)[number];

// Create a type-safe mapping object
export const USER_TYPE_MAPPING: Record<BackendUserType, FrontendUserType> = {
  PLATFORM_ADMIN: "Platform Admin",
  ORG_ADMIN: "Org Admin",
};

export interface CustomTokenParsed extends KeycloakTokenParsed {
  org_id?: string;
  realm_access: {
    roles: string[];
  };
  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };
}
