import {
  calculateAttendanceType,
  getTimeWindowDisplay,
} from "@/shared/constants/attendanceConfig";
import { useUser } from "@/shared/contexts/UserContext";
import { useCallback, useEffect, useState } from "react";
import { useHomeStore } from "../_store/useHomeStore";
import { AttendanceRecord, AttendanceType } from "../_types/home.types";
import { formatDateYMD } from "../_utils/homeUtils";
import { useHomeQuery } from "./useHomeQuery";

export function useHomeData() {
  const { user: contextUser } = useUser();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 1. Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. TanStack Query + Zustand Cache
  const targetId = contextUser?.id;
  const { data: queryData, isLoading, isRefetching, refetch } = useHomeQuery(targetId);

  // Store data (Zustand Cache)
  const cachedUser = useHomeStore((state) => state.user);
  const cachedAttendanceList = useHomeStore((state) => state.attendanceList);
  const cachedOfficialQrList = useHomeStore((state) => state.officialQrList);
  const cachedCompanyName = useHomeStore((state) => state.companyName);
  const cachedTimeInConfig = useHomeStore((state) => state.timeInConfig);
  const cachedTimeOutConfig = useHomeStore((state) => state.timeOutConfig);
  const setAttendanceList = useHomeStore((state) => state.setAttendanceList);

  const user = queryData?.user || cachedUser || contextUser;
  const attendanceList = queryData?.attendanceList || cachedAttendanceList;
  const officialQrList = queryData?.officialQrList || cachedOfficialQrList;
  const companyName = queryData?.companyName || cachedCompanyName;
  const timeInConfig = queryData?.timeInConfig || cachedTimeInConfig;
  const timeOutConfig = queryData?.timeOutConfig || cachedTimeOutConfig;

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Dynamic time windows
  const timeInWindow = getTimeWindowDisplay(timeInConfig, "08:00:00");
  const timeOutWindow = getTimeWindowDisplay(timeOutConfig, "17:00:00");
  const currentType: AttendanceType = calculateAttendanceType(
    currentTime,
    timeInConfig,
    timeOutConfig,
  );

  // Today's records and badges calculation
  const todayStr = formatDateYMD(currentTime);
  const todayRecords = attendanceList.filter((r) => {
    const rDate =
      r.date ||
      (r as any).scanDate ||
      (r.timestamp ? String(r.timestamp).split("T")[0] : "");
    return rDate === todayStr;
  });

  const normalizeAttType = (t?: string) =>
    (t || "").toLowerCase().replace(/_/g, "-");

  const todayTimeIn = todayRecords.find(
    (r) => normalizeAttType(r.type) === "time-in",
  );
  const todayTimeOut = todayRecords.find(
    (r) => normalizeAttType(r.type) === "time-out",
  );
  const todayOtherCount = todayRecords.filter(
    (r) => normalizeAttType(r.type) === "time-other",
  ).length;

  return {
    user,
    setUser: () => {},
    loading: isLoading && !user,
    refreshing: isRefetching,
    currentTime,
    attendanceList,
    setAttendanceList,
    officialQrList,
    companyName,
    timeInWindow,
    timeOutWindow,
    currentType,
    todayTimeIn,
    todayTimeOut,
    todayOtherCount,
    onRefresh,
    fetchUserData: refetch,
  };
}
