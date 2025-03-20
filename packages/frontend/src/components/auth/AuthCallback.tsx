"use client";

import LoadingIndicator from "@/components/common/LoadingIndicator";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { getDevices } from "@/lib/deviceMonitor";

const AuthCallback = () => {
  const { isAuthenticated, type, status } = useAuthSession();
  const router = useRouter();

  const checkDeviceRegistration = async () => {
    try {
      const { total } = await getDevices(0, 1);
      return total > 0;
    } catch (error) {
      console.error("Error checking device registration:", error);
      return false;
    }
  };

  useEffect(() => {
    const redirectUser = async () => {
      if (isAuthenticated) {
        if (type === "Platform Admin") {
          router.replace("/admin/approval-signup-request");
        } else {
          const deviceRegistered = await checkDeviceRegistration();
          if (deviceRegistered) {
            router.replace("/dashboard");
          } else {
            router.replace("/agent-download");
          }
        }
      } else if (status === "unauthenticated") {
        router.replace("/login");
      }
    };

    redirectUser();
  }, [isAuthenticated, type, status, router]);

  return <LoadingIndicator />;
};

export default AuthCallback;
