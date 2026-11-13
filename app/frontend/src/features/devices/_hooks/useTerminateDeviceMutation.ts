import { queryKeys } from "@/shared/services/api/queryKeys";
import {
  terminateDeviceSession,
  terminateOtherDeviceSessions,
} from "@/utils/deviceSession";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface TerminateDeviceInput {
  userId: string;
  sessionId?: string;
  keepDeviceId?: string;
  terminateAllOthers?: boolean;
}

export function useTerminateDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, TerminateDeviceInput>({
    mutationFn: async ({ userId, sessionId, keepDeviceId, terminateAllOthers }) => {
      if (terminateAllOthers) {
        return await terminateOtherDeviceSessions(userId, keepDeviceId || "");
      }
      if (sessionId) {
        return await terminateDeviceSession(userId, sessionId);
      }
      return false;
    },
    onSuccess: (_data, variables) => {
      // Invalidate devices query to refresh list in real time
      queryClient.invalidateQueries({
        queryKey: queryKeys.devices.list(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.all,
      });
    },
  });
}
