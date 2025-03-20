import { useSession } from "next-auth/react";

export function useAuthSession() {
  const { data: session, status } = useSession();

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    accessToken: session?.accessToken,
    user: session?.user,
    type: session?.user.type,
  };
}
