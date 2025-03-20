import DeviceList from "@/components/device-monitor/DeviceList";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Device Monitor – MemCrypt",
  description: "Device Monitor",
};

export default async function DeviceMonitor() {
  return (
    <ProtectedRoute>
      <DeviceList></DeviceList>
    </ProtectedRoute>
  );
}
