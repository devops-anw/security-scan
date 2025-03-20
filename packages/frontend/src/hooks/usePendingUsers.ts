import { UserWithOrg } from "@/types/keycloak";
import apiClient from "@/utils/apiClient";
import { useQuery } from "@tanstack/react-query";

const fetchPendingUsers = async () => {
  const response = await apiClient.get("/users/pending");
  return response.data;
};

export const usePendingUsers = () => {
  return useQuery<UserWithOrg[], Error>({
    queryKey: ["users", "pending"],
    queryFn: async () => fetchPendingUsers(),
  });
};
