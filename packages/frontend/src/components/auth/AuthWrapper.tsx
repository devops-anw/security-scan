"use client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingIndicator from "../common/LoadingIndicator";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, type, status } = useAuthSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== "loading") {
      if (pathname === "/") {
        if (isAuthenticated) {
          if (type === "Platform Admin") {
            router.replace("/admin/approval-signup-request");
          } else {
            router.replace("/dashboard");
          }
        } else {
          router.replace("/login");
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [pathname, isAuthenticated, type, status, router]);

  if (isLoading || status === "loading") {
    return <LoadingIndicator />;
  }

  return <>{children}</>;
}
