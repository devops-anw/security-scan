import AgentDownloadComponent from "@/components/agent-download/AgentDownload";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Download – MemCrypt",
  description: "Agent Download",
};

const AgentDownload = () => {
  return (
    <ProtectedRoute>
      <AgentDownloadComponent />
    </ProtectedRoute>
  );
};

export default AgentDownload;
