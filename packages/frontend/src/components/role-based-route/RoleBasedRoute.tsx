"use client";

import { FrontendUserType } from "@/types/login";
import { ReactNode, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Import a Skeleton component for loading state
import { useAuthSession } from "@/hooks/useAuthSession";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: FrontendUserType[];
}

const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { status, user, type } = useAuthSession();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user) {
      const userType = type as FrontendUserType;
      const access = allowedRoles.includes(userType);
      setHasAccess(access);
    }
  }, [user, type, allowedRoles]);

  if (status === "loading") {
    return <Skeleton className="w-full h-12" />;
  }

  if (status === "unauthenticated" || !hasAccess) {
    return null;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
