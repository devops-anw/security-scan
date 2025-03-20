import Profile from "@/components/org-profile/Profile";
import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Profile – MemCrypt",
  description: "Organization Profile",
};

const OrgProfile = () => {
  return (
    <ProtectedRoute>
      <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Organization Profile
        </h2>
        <Profile />
      </div>
    </ProtectedRoute>
  );
};

export default OrgProfile;
