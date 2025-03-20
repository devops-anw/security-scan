"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { LoginResponse } from "@/types/login";
import { AuthContext, AuthContextType } from "./AuthContext";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import { ReactNode } from "react";
import logger from "@/utils/logger";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const updateUserInfo = useCallback(() => {
    if (session?.user) {
      const userInfo = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        tenantId: session.user.org_id,
        type: session.user.type,
      } as LoginResponse["user"];
      setUser(userInfo);
      return userInfo;
    }
    return null;
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      updateUserInfo();
    }
    setIsLoading(false);
  }, [status, updateUserInfo, pathname, router]);

  const login = useCallback(() => {
    signIn("keycloak", {
      callbackUrl: `${window.location.origin}/auth/callback`,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);

      // Clear the NextAuth session
      await signOut({ redirect: false });

      // Clear local state
      setUser(null);

      // Construct Keycloak logout URL
      const keycloakLogoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_APP_REALM}/protocol/openid-connect/logout`;
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
      const postLogoutRedirectUri = encodeURIComponent(
        `${window.location.origin}/login`
      );

      // Redirect to Keycloak logout URL with id_token_hint
      window.location.href = `${keycloakLogoutUrl}?client_id=${clientId}&post_logout_redirect_uri=${postLogoutRedirectUri}&id_token_hint=${session?.idToken}`;
    } catch (error) {
      logger.error("Logout failed", error);
      setIsLoggingOut(false);
      router.push("/login");
    }
  }, [router, session]);

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: status === "authenticated",
    error: null,
  };

  if (isLoading || isLoggingOut) {
    return <LoadingIndicator />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
