import DeviceActivityLogs from "@/components/device-monitor/DeviceActivityLogs";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";
import { getAccessToken } from "@/lib/authToken";
import Breadcrumb from "@/components/common/BreadCrumb";

export const metadata: Metadata = {
  title: "Activity Logs – MemCrypt",
  description: "Activity Logs",
};

export default async function DeviceActivityLogsPage({
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
              label: "Device Activity Logs",
              href: `/device-monitor/${params.deviceId}/device-logs`,
            },
          ]}
        />
      </div>
      <DeviceActivityLogs deviceId={params.deviceId} token={token} />
    </ProtectedRoute>
  );
}
