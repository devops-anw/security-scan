import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    idToken: string;
    error: string;
    user: {
      id: string;
      name: string;
      email: string;
      tenantId: string;
      type: string;
      realm_access?: { roles: string[] };
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    id: string;
    preferred_username: string;
    realm_access?: { roles: string[] };
    org_id?: string;
  }
}
