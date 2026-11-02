import { create } from "zustand";
import { AttendanceRecord, AttendanceSummary } from "../types/attendance.types";

export interface AttendanceStoreState {
  records: AttendanceRecord[];
  summary: AttendanceSummary | null;
  isLoading: boolean;
  error: string | null;
}

export interface AttendanceStoreActions {
  setRecords: (records: AttendanceRecord[]) => void;
  setSummary: (summary: AttendanceSummary | null) => void;
  addRecord: (record: AttendanceRecord) => void;
  updateRecord: (record: AttendanceRecord) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type AttendanceStore = AttendanceStoreState & AttendanceStoreActions;

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  records: [],
  summary: null,
  isLoading: false,
  error: null,

  setRecords: (records) => set({ records, isLoading: false, error: null }),
  setSummary: (summary) => set({ summary }),
  addRecord: (record) =>
    set((state) => ({ records: [record, ...state.records] })),
  updateRecord: (record) =>
    set((state) => ({
      records: state.records.map((r) => (r.id === record.id ? record : r)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
