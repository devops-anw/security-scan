import DeviceDetail from "@/components/device-monitor/DeviceDetail";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import Breadcrumb from "@/components/common/BreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Device Details – MemCrypt",
  description: "Device Details",
};

export default function DeviceDetailsPage({
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
              label: "Device Details",
              href: `/device-monitor/${params.deviceId}/device-details`,
            },
          ]}
        />
      </div>
      <DeviceDetail deviceId={params.deviceId} />
    </ProtectedRoute>
  );
}
