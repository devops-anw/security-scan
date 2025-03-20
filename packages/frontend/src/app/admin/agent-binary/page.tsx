import AgentBinary from "@/components/agent-binary/AgentBinary";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Binary – MemCrypt",
  description: "Agent Binary",
};

export default function AgentManagementPage() {
  return (
    <ProtectedRoute>
      <AgentBinary />
    </ProtectedRoute>
  );
}
