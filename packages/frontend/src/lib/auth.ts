import { jwtVerify, createRemoteJWKSet } from "jose";
import logger from "@/utils/logger";
import { JWTPayload, UserRole } from "@/types/auth";

const JWKS_URI = `${process.env.FE_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}/protocol/openid-connect/certs`;

let JWKS: ReturnType<typeof createRemoteJWKSet>;

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    if (!JWKS) {
      JWKS = createRemoteJWKSet(new URL(JWKS_URI));
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}`,
    });

    // Additional check for the intended audience
    if (payload.azp !== process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID) {
      logger.error("Token not intended for this client");
      return null;
    }

    return payload as unknown as JWTPayload;
  } catch (error) {
    logger.error({ msg: "Token verification failed", error });
    return null;
  }
}

export function hasRole(
  requiredRoles: UserRole[],
  userRoles: UserRole[]
): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}
