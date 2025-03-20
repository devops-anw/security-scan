import ComingSoon from "@/components/common/ComingSoon";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools – MemCrypt",
  description: "Tools",
};

const Tools = () => {
  return (
    <ProtectedRoute>
      <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tools</h2>
        <ComingSoon />{" "}
      </div>
    </ProtectedRoute>
  );
};

export default Tools;
