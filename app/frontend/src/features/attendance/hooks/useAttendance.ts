import { logger } from "@/services/logger";
import { useCallback, useEffect } from "react";
import { attendanceApi } from "../api/attendanceApi";
import { useAttendanceStore } from "../store/useAttendanceStore";
import { CheckInDTO } from "../types/attendance.types";

export function useAttendance(userId?: string) {
  const records = useAttendanceStore((state) => state.records);
  const summary = useAttendanceStore((state) => state.summary);
  const isLoading = useAttendanceStore((state) => state.isLoading);
  const error = useAttendanceStore((state) => state.error);

  const setRecords = useAttendanceStore((state) => state.setRecords);
  const setSummary = useAttendanceStore((state) => state.setSummary);
  const addRecord = useAttendanceStore((state) => state.addRecord);
  const updateRecord = useAttendanceStore((state) => state.updateRecord);
  const setLoading = useAttendanceStore((state) => state.setLoading);
  const setError = useAttendanceStore((state) => state.setError);

  const fetchAttendance = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [recData, sumData] = await Promise.all([
        attendanceApi.getRecords(userId),
        attendanceApi.getSummary(userId),
      ]);
      setRecords(recData);
      setSummary(sumData);
    } catch (err: any) {
      setError(err?.message || "Failed to load attendance records");
      logger.error("Failed to load attendance", err);
    }
  }, [userId, setLoading, setError, setRecords, setSummary]);

  const checkIn = useCallback(
    async (dto: CheckInDTO) => {
      try {
        const result = await attendanceApi.checkIn(dto);
        addRecord(result);
        return result;
      } catch (err: any) {
        logger.error("Failed check-in", err);
        throw err;
      }
    },
    [addRecord],
  );

  const checkOut = useCallback(
    async (dto: CheckInDTO) => {
      try {
        const result = await attendanceApi.checkOut(dto);
        updateRecord(result);
        return result;
      } catch (err: any) {
        logger.error("Failed check-out", err);
        throw err;
      }
    },
    [updateRecord],
  );

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return {
    records,
    summary,
    isLoading,
    error,
    refresh: fetchAttendance,
    checkIn,
    checkOut,
  };
}
