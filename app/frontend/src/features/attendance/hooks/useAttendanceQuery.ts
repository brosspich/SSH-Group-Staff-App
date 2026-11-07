import { apiClient } from "@/shared/services/api";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AttendanceRecord } from "../_types/attendance.types";
import { useAttendanceStore } from "../store/useAttendanceStore";

/**
 * TanStack Query Hook: Server data caching for Staff Attendance Logs via Backend API
 */
export function useStaffAttendanceLogsQuery(userId?: string) {
  const setRecords = useAttendanceStore((state) => state.setRecords);

  const query = useQuery({
    queryKey: queryKeys.attendance.records(userId || ""),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      if (!userId) return [];
      try {
        const data = await apiClient.get<any>(`/users-query/${userId}`);
        let list: AttendanceRecord[] = [];
        if (Array.isArray(data?.attendance)) {
          list = data.attendance;
        } else if (typeof data?.attendance === "string") {
          try {
            list = JSON.parse(data.attendance);
          } catch (e) {}
        }
        return list;
      } catch (err: any) {
        if (err?.statusCode === 404) return [];
        throw new Error(err?.message || "Failed to load attendance logs");
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes fresh in cache
    gcTime: 1000 * 60 * 15,
  });

  useEffect(() => {
    if (query.data) {
      setRecords(query.data as any);
    }
  }, [query.data, setRecords]);

  return query;
}

/**
 * TanStack Query Mutation: Record Attendance with Automatic Cache Invalidation via Backend API
 */
export function useSaveAttendanceMutation() {
  const queryClient = useQueryClient();
  const addRecord = useAttendanceStore((state) => state.addRecord);

  return useMutation({
    mutationFn: async ({
      userId,
      newRecord,
      updatedList,
    }: {
      userId: string;
      newRecord: AttendanceRecord;
      updatedList: AttendanceRecord[];
    }) => {
      const data = await apiClient.put(`/users-query/${userId}`, {
        attendance: updatedList,
      });
      return { data, newRecord };
    },
    onSuccess: (_, variables) => {
      addRecord(variables.newRecord as any);
      queryClient.invalidateQueries({
        queryKey: queryKeys.attendance.records(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.staff.detail(variables.userId),
      });
    },
  });
}
