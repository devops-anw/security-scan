export interface Tenant {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | undefined;
  lastName: string | undefined;
  enabled: boolean;
  attributes: { [x: string]: any };
  roles?: string[];
}

export interface CreateOrgWithAdminInput {
  orgName: string;
  adminUser: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  };
}

export interface CreateOrgWithAdminResult {
  tenant: Tenant;
  adminUser: User;
}

export interface UserWithOrg extends User {
  organization: Tenant | null;
}
