import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import RecoveryListComponent from "@/components/recovery/RecoveryListComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recovery – MemCrypt",
  description: "Recovery",
};

const Recovery = () => {
  return (
    <ProtectedRoute>
      <RecoveryListComponent />
    </ProtectedRoute>
  );
};

export default Recovery;
