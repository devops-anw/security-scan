"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingIndicator from "../common/LoadingIndicator";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function SessionCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, status } = useAuthSession();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    if (session?.error === "RefreshAccessTokenError") {
      console.error("Session error: RefreshAccessTokenError");
      signOut({ callbackUrl: "/auth/error" }).catch((error) =>
        console.error("Sign out failed", error)
      );
    }
  }, [session, status, pathname]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return <>{children}</>;
}
