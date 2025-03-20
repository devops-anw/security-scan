import DeviceConfig from "@/components/device-monitor/DeviceConfig";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import Breadcrumb from "@/components/common/BreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Device Configuration – MemCrypt",
  description: "Device Configuration",
};

export default function DeviceConfigPage({
  params,
}: {
  params: { deviceId: string };
}) {
  return (
    <ProtectedRoute>
      <div className="pt-8 pl-2 space-y-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Device Monitor", href: "/device-monitor" },
            {
              label: "Device Config",
              href: `/device-monitor/${params.deviceId}/device-config`,
            },
          ]}
        />
      </div>
      <DeviceConfig deviceId={params.deviceId} />
    </ProtectedRoute>
  );
}
