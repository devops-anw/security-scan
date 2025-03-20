import ApplicationList from "@/components/application/ApplicationList";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications – MemCrypt",
  description: "Applications",
};

export default async function Application() {
  return (
    <ProtectedRoute>
      <ApplicationList></ApplicationList>
    </ProtectedRoute>
  );
}
