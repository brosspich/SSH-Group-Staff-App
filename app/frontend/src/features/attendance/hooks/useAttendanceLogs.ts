import { apiClient } from "@/shared/services/api";
import { StaffUser, userService } from "@/shared/services/userService";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  AttendanceFilterType,
  AttendanceRecord,
} from "../_types/attendance.types";
import {
  ATTENDANCE_PAGE_SIZE,
  useAttendanceStore,
} from "../store/useAttendanceStore";
import {
  calculateAttendanceCounts,
  filterAttendanceRecords,
  formatDateYMD,
} from "../utils/attendanceFilter.utils";

export function useAttendanceLogs() {
  const {
    records: attendanceList,
    historyFilter,
    visibleCount,
    searchQuery,
    setCachedData,
    setVisibleCount,
    setHistoryFilter,
    setSearchQuery,
    isCacheValid,
  } = useAttendanceStore();

  const [loading, setLoading] = useState(!isCacheValid());
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // 1. Fetch Attendance Logs from Backend API & Save locally
  const fetchAttendanceLogs = useCallback(
    async (isForceRefresh = false) => {
      try {
        if (!isForceRefresh && isCacheValid()) {
          setLoading(false);
          return;
        }

        const u = await userService.get();
        if (u?.id) {
          const dbUser = await apiClient
            .get<StaffUser>(`/users-query/${u.id}`)
            .catch(() => null);

          const activeUser = dbUser || u;
          await userService.save(activeUser);

          let list: AttendanceRecord[] = [];
          if (Array.isArray(activeUser.attendance)) {
            list = activeUser.attendance;
          } else if (typeof activeUser.attendance === "string") {
            try {
              list = JSON.parse(activeUser.attendance);
            } catch (e) {}
          }

          setCachedData(list, activeUser);
        }
      } catch (err) {
        console.warn("Failed fetching attendance logs:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isCacheValid, setCachedData],
  );

  // 2. 1-minute Cache Validation on Screen Focus
  useFocusEffect(
    useCallback(() => {
      if (!isCacheValid()) {
        fetchAttendanceLogs(false);
      } else {
        setLoading(false);
      }
    }, [isCacheValid, fetchAttendanceLogs]),
  );

  // 3. Manual Pull to Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setVisibleCount(ATTENDANCE_PAGE_SIZE);
    fetchAttendanceLogs(true);
  }, [fetchAttendanceLogs, setVisibleCount]);

  // 4. Memoized Date & Stats Calculation (DRY)
  const todayStr = useMemo(() => formatDateYMD(new Date()), []);
  const counts = useMemo(
    () => calculateAttendanceCounts(attendanceList, todayStr),
    [attendanceList, todayStr],
  );

  // 5. Memoized Filtered List
  const filteredList = useMemo(
    () =>
      filterAttendanceRecords(
        attendanceList,
        historyFilter,
        searchQuery,
        todayStr,
      ),
    [attendanceList, historyFilter, searchQuery, todayStr],
  );

  // 6. Paginated Items for Display
  const displayedList = useMemo(
    () => filteredList.slice(0, visibleCount),
    [filteredList, visibleCount],
  );

  const hasMore = visibleCount < filteredList.length;

  // 7. Infinite Scroll Load More
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + ATTENDANCE_PAGE_SIZE, filteredList.length),
      );
      setLoadingMore(false);
    }, 450);
  }, [hasMore, loadingMore, filteredList.length, setVisibleCount]);

  const handleFilterChange = useCallback(
    (filter: AttendanceFilterType) => {
      setHistoryFilter(filter);
    },
    [setHistoryFilter],
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
    },
    [setSearchQuery],
  );

  return {
    attendanceList,
    displayedList,
    filteredList,
    counts,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    historyFilter,
    searchQuery,
    pageSize: ATTENDANCE_PAGE_SIZE,
    onRefresh,
    handleLoadMore,
    handleFilterChange,
    handleSearchChange,
  };
}
