import { StaffUser } from "@/shared/services/userService";
import { create } from "zustand";
import type { StaffStatusFilter } from "../_types/changeInfoStaff.types";

export interface StaffDirectoryStoreState {
  staffList: StaffUser[];
  searchQuery: string;
  selectedSystemFilter: string;
  statusFilter: StaffStatusFilter;
  editingStaff: StaffUser | null;
  lastSyncTimestamp: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface StaffDirectoryStoreActions {
  setStaffList: (list: StaffUser[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedSystemFilter: (sys: string) => void;
  setStatusFilter: (status: StaffStatusFilter) => void;
  setEditingStaff: (staff: StaffUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export type StaffDirectoryStore = StaffDirectoryStoreState &
  StaffDirectoryStoreActions;

export const useStaffDirectoryStore = create<StaffDirectoryStore>((set) => ({
  staffList: [],
  searchQuery: "",
  selectedSystemFilter: "all",
  statusFilter: "all",
  editingStaff: null,
  lastSyncTimestamp: null,
  isLoading: false,
  error: null,

  setStaffList: (staffList) =>
    set({
      staffList,
      lastSyncTimestamp: Date.now(),
      isLoading: false,
      error: null,
    }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedSystemFilter: (selectedSystemFilter) =>
    set({ selectedSystemFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setEditingStaff: (editingStaff) => set({ editingStaff }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () =>
    set({
      staffList: [],
      editingStaff: null,
      lastSyncTimestamp: null,
      isLoading: false,
      error: null,
    }),
}));
