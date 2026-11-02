import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { StaffUser, userService } from "@/services/userService";
import { apiClient } from "@/services/api";

/**
 * TanStack Query Hook: Server data caching for Staff User Profile via Backend API
 */
export function useStaffUserQuery(userId?: string) {
  const query = useQuery({
    queryKey: queryKeys.staff.detail(userId || ""),
    queryFn: async (): Promise<StaffUser | null> => {
      if (!userId) return null;
      try {
        const data = await apiClient.get<StaffUser>(`/users-query/${userId}`);
        return data || null;
      } catch (err: any) {
        if (err?.statusCode === 404) return null;
        throw new Error(err?.message || "Failed to fetch staff user");
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  useEffect(() => {
    if (query.data) {
      userService.save(query.data);
    }
  }, [query.data]);

  return query;
}

/**
 * TanStack Query Mutation: Update Staff Devices Session via Backend API
 */
export function useUpdateStaffDevicesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      devices,
    }: {
      userId: string;
      devices: any[];
    }) => {
      return await apiClient.put(`/users-query/${userId}`, {
        devices,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.detail(variables.userId),
      });
    },
  });
}
