import { queryKeys } from "@/shared/services/api/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStaffAccountApi } from "../_api/createAccountStaffApi";
import type { CreateStaffPayload } from "../_types/createAccountStaff.types";

export function useCreateStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaffAccountApi(payload),
    onSuccess: () => {
      // Invalidate staff and home queries so new staff appears across app
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}
