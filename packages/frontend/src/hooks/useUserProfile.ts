import { UserWithOrg } from "@/types/keycloak";
import apiClient from "@/utils/apiClient";
import { useQuery } from "@tanstack/react-query";
import logger from "@/utils/logger";

const fetchUserProfile = async (userId: string) => {
  const { data } = await apiClient.get(`users/${userId}`);
  logger.info(data);
  return data;
};

export const useUserProfile = (userId: string) => {
  return useQuery<UserWithOrg, Error>({
    queryKey: ["userProfile", userId],
    queryFn: async () => fetchUserProfile(userId),
  });
};
