import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";
import { getAccessToken } from "@/lib/authToken";
import Breadcrumb from "@/components/common/BreadCrumb";
import DeviceRecovery from "@/components/device-monitor/DeviceRecovery";

export const metadata: Metadata = {
  title: "Recovery List – MemCrypt",
  description: "Recovery List",
};

export default async function DeviceRecoveryPage({
  params,
}: {
  params: { deviceId: string };
}) {
  const token = await getAccessToken();
  return (
    <ProtectedRoute>
      <div className="pt-8 pl-2 space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Device Monitor", href: "/device-monitor" },
            {
              label: "Device Recovery List",
              href: `/device-monitor/${params.deviceId}/device-recovery`,
            },
          ]}
        />
      </div>
      <DeviceRecovery deviceId={params.deviceId} token={token} />
    </ProtectedRoute>
  );
}
