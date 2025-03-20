import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import { UserList } from "@/components/users/UserList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users – MemCrypt",
  description: "Organization Users",
};

const Users = () => {
  return (
    <ProtectedRoute>
      <UserList />
    </ProtectedRoute>
  );
};

export default Users;
