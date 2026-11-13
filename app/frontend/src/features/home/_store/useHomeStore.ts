import { StaffUser } from "@/shared/services/userService";
import { create } from "zustand";
import type { AttendanceRecord } from "../_types/home.types";

export interface HomeStoreState {
  user: StaffUser | null;
  attendanceList: AttendanceRecord[];
  officialQrList: string[];
  companyName: string;
  timeInConfig: string;
  timeOutConfig: string;
  lastSyncTimestamp: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface HomeStoreActions {
  setHomeData: (data: {
    user?: StaffUser | null;
    attendanceList?: AttendanceRecord[];
    officialQrList?: string[];
    companyName?: string;
    timeInConfig?: string;
    timeOutConfig?: string;
  }) => void;
  setAttendanceList: (
    listOrUpdater:
      | AttendanceRecord[]
      | ((prev: AttendanceRecord[]) => AttendanceRecord[]),
  ) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export type HomeStore = HomeStoreState & HomeStoreActions;

export const useHomeStore = create<HomeStore>((set) => ({
  user: null,
  attendanceList: [],
  officialQrList: [],
  companyName: "SSH Group",
  timeInConfig: "08:00:00",
  timeOutConfig: "17:00:00",
  lastSyncTimestamp: null,
  isLoading: false,
  error: null,

  setHomeData: (data) =>
    set((state) => ({
      ...state,
      ...data,
      lastSyncTimestamp: Date.now(),
      isLoading: false,
      error: null,
    })),

  setAttendanceList: (listOrUpdater) =>
    set((state) => ({
      attendanceList:
        typeof listOrUpdater === "function"
          ? listOrUpdater(state.attendanceList)
          : listOrUpdater,
      lastSyncTimestamp: Date.now(),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  clear: () =>
    set({
      user: null,
      attendanceList: [],
      officialQrList: [],
      lastSyncTimestamp: null,
      isLoading: false,
      error: null,
    }),
}));
