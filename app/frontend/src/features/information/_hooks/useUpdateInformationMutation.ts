import { queryKeys } from "@/shared/services/api/queryKeys";
import { StaffUser, userService } from "@/shared/services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserFieldApi } from "../_api/informationApi";
import { useInformationStore } from "../_store/useInformationStore";

export interface UpdateUserFieldInput {
  userId: string;
  fieldKey: string;
  value: any;
}

export function useUpdateInformationMutation() {
  const queryClient = useQueryClient();
  const setUser = useInformationStore((state) => state.setUser);

  return useMutation<StaffUser, Error, UpdateUserFieldInput>({
    mutationFn: async ({ userId, fieldKey, value }) => {
      const updated = await updateUserFieldApi(userId, fieldKey, value);
      await userService.save(updated);
      return updated;
    },
    onSuccess: (updatedUser, variables) => {
      setUser(updatedUser);
      // Invalidate relevant queries across features
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.detail(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.detail("current"),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.home.all,
      });
    },
  });
}
