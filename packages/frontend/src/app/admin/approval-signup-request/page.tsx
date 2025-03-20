import { PendingApproval } from "@/components/pending-approval/PendingApproval";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approval Requests – MemCrypt",
  description: "Organizations Pending Approval",
};

const ApprovalSignupRequest = () => {
  return (
    <ProtectedRoute>
      <PendingApproval></PendingApproval>
    </ProtectedRoute>
  );
};

export default ApprovalSignupRequest;
