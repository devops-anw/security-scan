import OrganizationDashboard from "@/components/dashboard/OrganizationDashboard";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – MemCrypt",
  description: "Dashboard",
};

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <OrganizationDashboard />
    </ProtectedRoute>
  );
};

export default Dashboard;
