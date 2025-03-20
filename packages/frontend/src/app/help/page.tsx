import HelpSupport from "@/components/common/HelpSupport";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help – MemCrypt",
  description: "Help",
};

const Help = () => {
  return (
    <ProtectedRoute>
      <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Help</h2>
        <HelpSupport />{" "}
      </div>
    </ProtectedRoute>
  );
};

export default Help;
