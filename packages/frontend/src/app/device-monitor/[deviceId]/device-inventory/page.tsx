import DeviceInventory from "@/components/device-monitor/DeviceInventory";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";
import { getAccessToken } from "@/lib/authToken";
import Breadcrumb from "@/components/common/BreadCrumb";

export const metadata: Metadata = {
  title: "Device Inventory – MemCrypt",
  description: "Device Inventory",
};

export default async function DeviceInventoryPage({
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
              label: "Device Application Inventory",
              href: `/device-monitor/${params.deviceId}/device-inventory`,
            },
          ]}
        />
      </div>
      <DeviceInventory deviceId={params.deviceId} token={token} />
    </ProtectedRoute>
  );
}
