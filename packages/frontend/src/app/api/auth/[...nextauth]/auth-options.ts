import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { jwtDecode } from "jwt-decode";
import { USER_TYPE_MAPPING } from "@/types/login";
import refreshAccessToken from "./refresh-acccess-token";
import logger from "@/utils/logger";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      jwks_endpoint: `${process.env.FE_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}/protocol/openid-connect/certs`,
      wellKnown: undefined,
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
      issuer: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}`,
      authorization: {
        url: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}/protocol/openid-connect/auth`,
        params: {
          scope: "openid email profile",
          response_type: "code",
          code_challenge_method: "S256",
        },
      },
      token: `${process.env.FE_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}/protocol/openid-connect/token`,
      userinfo: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}/protocol/openid-connect/userinfo`,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          realm_access: profile.realm_access,
          org_id: profile.org_id,
        };
      },

      clientSecret: "dummy_secret",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      const nowTimeStamp = Math.floor(Date.now() / 1000);
      if (account?.access_token) {
        const decoded: any = jwtDecode(account.access_token);
        token.accessToken = account.access_token;
        token.id = decoded.sub;
        token.preferred_username = decoded.preferred_username;
        token.realm_access = decoded.realm_access;
        token.org_id = decoded.org_id;
        token.expires_at = decoded.exp;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        return token;
      } else if (nowTimeStamp < (token.expires_at as number)) {
        // token has not expired yet, return it
        return token;
      } else {
        // token is expired, try to refresh it
        console.info("Token has expired. Will refresh...");
        logger.info("Token has expired. Will refresh...");
        try {
          const refreshedToken = await refreshAccessToken(token);
          console.info("Token is refreshed.");
          logger.info("Token is refreshed.");
          return refreshedToken;
        } catch (error) {
          console.error("Error refreshing access token", error);
          logger.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
    },
    async session({ session, token }) {
      if (token && session.user) {
        const roles = token.realm_access
          ?.roles as (keyof typeof USER_TYPE_MAPPING)[];
        const matchingRole = roles?.find((role) => USER_TYPE_MAPPING[role]);
        session.user.id = token.id;
        session.user.name = token.preferred_username;
        session.user.tenantId = token.org_id;
        session.user.type = matchingRole ? USER_TYPE_MAPPING[matchingRole] : "";
      }
      session.accessToken = token.accessToken; // To Do : Encrypt the token in the session
      session.idToken = token.idToken as string;
      session.error = token.error as string;
      return session;
    },
  },
  session: {
    strategy: "jwt", // To Do : Use Database for session storage
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    error: "/auth/error",
  },
  logger: {
    error: (code, metadata) => {
      console.error(code, metadata);
    },
    warn: (code) => {
      console.warn(code);
    },
    debug: (code, metadata) => {
      console.log(code, metadata);
    },
  },
};
