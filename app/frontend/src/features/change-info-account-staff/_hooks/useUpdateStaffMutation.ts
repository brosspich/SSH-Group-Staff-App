import { queryKeys } from "@/shared/services/api/queryKeys";
import { StaffUser, userService } from "@/shared/services/userService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStaffUserApi } from "../_api/changeInfoStaffApi";

export interface UpdateStaffInput {
  id: string;
  payload: Partial<StaffUser>;
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation<StaffUser, Error, UpdateStaffInput>({
    mutationFn: async ({ id, payload }) => {
      const updated = await updateStaffUserApi(id, payload);
      // If updating currently logged in user, sync local user storage
      const currentUser = await userService.get();
      if (currentUser && currentUser.id === id) {
        await userService.save({ ...currentUser, ...updated });
      }
      return updated;
    },
    onSuccess: () => {
      // Invalidate queries so staff list and home data refresh instantly
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
    },
  });
}
