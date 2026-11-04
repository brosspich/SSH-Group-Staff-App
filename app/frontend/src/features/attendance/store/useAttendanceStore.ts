import { StaffUser } from "@/services/userService";
import { create } from "zustand";
import { AttendanceFilterType } from "../_types/attendance.types";
import { AttendanceSummary } from "../types/attendance.types";

export const ATTENDANCE_CACHE_TTL_MS = 60 * 1000; // 1 minute (60s)
export const ATTENDANCE_PAGE_SIZE = 10;

export interface AttendanceStoreState {
  records: any[];
  summary: AttendanceSummary | null;
  user: StaffUser | null;
  lastFetchedAt: number;
  isLoading: boolean;
  error: string | null;
  historyFilter: AttendanceFilterType;
  visibleCount: number;
  searchQuery: string;
}

export interface AttendanceStoreActions {
  setRecords: (records: any[]) => void;
  setSummary: (summary: AttendanceSummary | null) => void;
  addRecord: (record: any) => void;
  updateRecord: (record: any) => void;
  setError: (error: string | null) => void;
  setCachedData: (records: any[], user: StaffUser | null) => void;
  setVisibleCount: (updater: number | ((prev: number) => number)) => void;
  setHistoryFilter: (filter: AttendanceFilterType) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (isLoading: boolean) => void;
  isCacheValid: () => boolean;
  clearCache: () => void;
}

export type AttendanceStore = AttendanceStoreState & AttendanceStoreActions;

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  records: [],
  summary: null,
  user: null,
  lastFetchedAt: 0,
  isLoading: false,
  error: null,
  historyFilter: "today",
  visibleCount: ATTENDANCE_PAGE_SIZE,
  searchQuery: "",

  setRecords: (records) =>
    set({
      records,
      lastFetchedAt: Date.now(),
      isLoading: false,
      error: null,
    }),

  setSummary: (summary) => set({ summary }),

  addRecord: (record) =>
    set((state) => ({ records: [record, ...state.records] })),

  updateRecord: (record) =>
    set((state) => ({
      records: state.records.map((r) => (r.id === record.id ? record : r)),
    })),

  setError: (error) => set({ error, isLoading: false }),

  setCachedData: (records, user) =>
    set({
      records,
      user,
      lastFetchedAt: Date.now(),
      isLoading: false,
      error: null,
    }),

  setVisibleCount: (updater) =>
    set((state) => ({
      visibleCount:
        typeof updater === "function" ? updater(state.visibleCount) : updater,
    })),

  setHistoryFilter: (filter) =>
    set({
      historyFilter: filter,
      visibleCount: ATTENDANCE_PAGE_SIZE,
    }),

  setSearchQuery: (query) =>
    set({
      searchQuery: query,
      visibleCount: ATTENDANCE_PAGE_SIZE,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  isCacheValid: () => {
    const { lastFetchedAt, records } = get();
    return (
      Date.now() - lastFetchedAt < ATTENDANCE_CACHE_TTL_MS && records.length > 0
    );
  },

  clearCache: () =>
    set({
      records: [],
      summary: null,
      user: null,
      lastFetchedAt: 0,
      visibleCount: ATTENDANCE_PAGE_SIZE,
      error: null,
    }),
}));
