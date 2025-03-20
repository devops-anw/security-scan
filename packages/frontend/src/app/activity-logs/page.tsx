import ActivityLogsComponent from "@/components/activity-logs/ActivityLogsComponent";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity Logs – MemCrypt",
  description: "Activity Logs",
};

const ActivityLogs = () => {
  return (
    <ProtectedRoute>
      <ActivityLogsComponent />
    </ProtectedRoute>
  );
};

export default ActivityLogs;
