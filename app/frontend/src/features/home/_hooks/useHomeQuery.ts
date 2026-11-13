import { fetchOfficialAttendanceConfig } from "@/shared/constants/attendanceConfig";
import { apiClient } from "@/shared/services/api";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { StaffUser, userService } from "@/shared/services/userService";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useHomeStore } from "../_store/useHomeStore";
import type { AttendanceRecord } from "../_types/home.types";

/**
 * TanStack Query Hook: Fetches fresh Home dashboard data (User profile + Attendance logs + Config)
 * Automatically syncs with Zustand client cache (useHomeStore)
 */
export function useHomeQuery(userId?: string) {
  const setHomeData = useHomeStore((state) => state.setHomeData);
  const setError = useHomeStore((state) => state.setError);

  const query = useQuery({
    queryKey: queryKeys.home.data(userId),
    queryFn: async () => {
      const localUser = await userService.get();
      const targetId = userId || localUser?.id;

      if (!targetId) return null;

      // 1. Fetch fresh user row from backend
      const dbUser = await apiClient
        .get<StaffUser>(`/users-query/${targetId}`)
        .catch(() => null);

      const activeUser = dbUser || localUser;
      if (activeUser) {
        await userService.save(activeUser);
      }

      // 2. Parse attendance logs
      let list: AttendanceRecord[] = [];
      if (activeUser?.attendance) {
        if (Array.isArray(activeUser.attendance)) {
          list = activeUser.attendance;
        } else if (typeof activeUser.attendance === "string") {
          try {
            list = JSON.parse(activeUser.attendance);
          } catch {}
        }
      }

      // 3. Fetch attendance configuration
      const config = await fetchOfficialAttendanceConfig(
        false,
        activeUser?.companyId || (activeUser as any)?.system_id,
      );

      return {
        user: activeUser,
        attendanceList: list,
        officialQrList: config.qrCodes || [],
        companyName: config.companyName || "SSH Group",
        timeInConfig: config.timeIn || "08:00:00",
        timeOutConfig: config.timeOut || "17:00:00",
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes fresh cache
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  useEffect(() => {
    if (query.data) {
      setHomeData(query.data);
    } else if (query.error) {
      setError(
        query.error instanceof Error
          ? query.error.message
          : "Failed to load home data",
      );
    }
  }, [query.data, query.error, setHomeData, setError]);

  return query;
}
