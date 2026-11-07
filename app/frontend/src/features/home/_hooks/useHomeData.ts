import {
  calculateAttendanceType,
  fetchOfficialAttendanceConfig,
  getTimeWindowDisplay,
} from "@/shared/constants/attendanceConfig";
import { apiClient } from "@/shared/services/api";
import { StaffUser, userService } from "@/shared/services/userService";
import { useCallback, useEffect, useRef, useState } from "react";
import { AttendanceRecord, AttendanceType } from "../_types/home.types";
import { formatDateYMD } from "../_utils/homeUtils";

export function useHomeData() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [officialQrList, setOfficialQrList] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState<string>("SSH Group");
  const [timeInConfig, setTimeInConfig] = useState<string>("08:00:00");
  const [timeOutConfig, setTimeOutConfig] = useState<string>("17:00:00");
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Clock interval (updates every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch official QR and time windows
  const loadOfficialConfig = useCallback(async (sysId?: string) => {
    try {
      const config = await fetchOfficialAttendanceConfig(false, sysId);
      if (!isMountedRef.current) return;
      setOfficialQrList(config.qrCodes);
      setCompanyName(config.companyName);
      if (config.timeIn) setTimeInConfig(config.timeIn);
      if (config.timeOut) setTimeOutConfig(config.timeOut);
    } catch (e) {
      console.warn("Failed to load official attendance config:", e);
    }
  }, []);

  // Fetch user profile and attendance logs
  const fetchUserData = useCallback(async () => {
    try {
      const u = await userService.get();
      if (!isMountedRef.current) return;
      if (u?.id) {
        setUser(u);

        // Fetch fresh user row from backend API
        const dbUser = await apiClient
          .get<StaffUser>(`/users-query/${u.id}`)
          .catch(() => null);

        if (!isMountedRef.current) return;
        const activeUser = dbUser || u;
        setUser(activeUser);
        await userService.save(activeUser);

        // Parse attendance records
        let list: AttendanceRecord[] = [];
        if (Array.isArray(activeUser.attendance)) {
          list = activeUser.attendance;
        } else if (typeof activeUser.attendance === "string") {
          try {
            list = JSON.parse(activeUser.attendance);
          } catch {}
        }

        // Sort newest first
        list.sort((a, b) => {
          const tA = new Date(
            a.timestamp || a.createdAt || a.date || 0,
          ).getTime();
          const tB = new Date(
            b.timestamp || b.createdAt || b.date || 0,
          ).getTime();
          return tB - tA;
        });

        if (!isMountedRef.current) return;
        setAttendanceList(list);

        // Load config for user's system
        await loadOfficialConfig(activeUser.system_id);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [loadOfficialConfig]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, [fetchUserData]);

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
    setUser,
    loading,
    refreshing,
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
    fetchUserData,
  };
}
