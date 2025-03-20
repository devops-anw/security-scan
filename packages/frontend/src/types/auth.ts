
export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN'
}

export interface JWTPayload {
  sub: string;
  realm_access: RealmAccess;
  org_id: string;
  azp: string;
}

export interface RealmAccess {
  roles: UserRole[];
}

