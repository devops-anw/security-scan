import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  displayName?: string;
  country?: string;
  organization?: string;
  email?: string;
}

const updateProfile = async (userId: string, data: UpdateProfileData) => {
  const response = await apiClient.put(`/users/${userId}`, data);
  return response.data;
};

export const useUpdateProfile = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(userId, data),
    onSuccess: () => {
      // Invalidate and refetch the user profile
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};
