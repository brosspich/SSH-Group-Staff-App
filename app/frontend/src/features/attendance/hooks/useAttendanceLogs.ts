import { userService } from "@/shared/services/userService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AttendanceFilterType } from "../_types/attendance.types";
import {
  ATTENDANCE_PAGE_SIZE,
  useAttendanceStore,
} from "../store/useAttendanceStore";
import {
  calculateAttendanceCounts,
  filterAttendanceRecords,
  formatDateYMD,
} from "../utils/attendanceFilter.utils";
import { useStaffAttendanceLogsQuery } from "./useAttendanceQuery";

export function useAttendanceLogs() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    userService.get().then((u) => {
      if (u?.id) setUserId(u.id);
    });
  }, []);

  const {
    records: attendanceList,
    historyFilter,
    visibleCount,
    searchQuery,
    setVisibleCount,
    setHistoryFilter,
    setSearchQuery,
  } = useAttendanceStore();

  const {
    data: queryLogs,
    isLoading: loadingQuery,
    isRefetching,
    refetch,
  } = useStaffAttendanceLogsQuery(userId);

  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (loadMoreTimerRef.current) clearTimeout(loadMoreTimerRef.current);
    };
  }, []);

  // 1. Manual Pull to Refresh
  const onRefresh = useCallback(async () => {
    setVisibleCount(ATTENDANCE_PAGE_SIZE);
    await refetch();
  }, [refetch, setVisibleCount]);

  // 2. Memoized Date & Stats Calculation (DRY)
  const todayStr = useMemo(() => formatDateYMD(new Date()), []);
  const activeRecords = (queryLogs as any) || attendanceList;

  const counts = useMemo(
    () => calculateAttendanceCounts(activeRecords, todayStr),
    [activeRecords, todayStr],
  );

  // 3. Memoized Filtered List
  const filteredList = useMemo(
    () =>
      filterAttendanceRecords(
        activeRecords,
        historyFilter,
        searchQuery,
        todayStr,
      ),
    [activeRecords, historyFilter, searchQuery, todayStr],
  );

  // 4. Paginated Items for Display
  const displayedList = useMemo(
    () => filteredList.slice(0, visibleCount),
    [filteredList, visibleCount],
  );

  const hasMore = visibleCount < filteredList.length;

  // 5. Infinite Scroll Load More
  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    if (loadMoreTimerRef.current) clearTimeout(loadMoreTimerRef.current);
    loadMoreTimerRef.current = setTimeout(() => {
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
    attendanceList: activeRecords,
    displayedList,
    filteredList,
    counts,
    loading: loadingQuery && activeRecords.length === 0,
    refreshing: isRefetching,
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
