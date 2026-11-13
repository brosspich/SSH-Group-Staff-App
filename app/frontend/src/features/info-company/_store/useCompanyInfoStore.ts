import { create } from "zustand";
import type { CompanyInfo } from "../_types/infoCompany.types";

export interface CompanyInfoStoreState {
  company: CompanyInfo | null;
  selectedSystemId: string;
  selectedCompanyId: string;
  lastSyncTimestamp: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface CompanyInfoStoreActions {
  setCompany: (company: CompanyInfo | null) => void;
  setSelectedSystemId: (id: string) => void;
  setSelectedCompanyId: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export type CompanyInfoStore = CompanyInfoStoreState & CompanyInfoStoreActions;

export const useCompanyInfoStore = create<CompanyInfoStore>((set) => ({
  company: null,
  selectedSystemId: "system-0001",
  selectedCompanyId: "system-0001",
  lastSyncTimestamp: null,
  isLoading: false,
  error: null,

  setCompany: (company) =>
    set({
      company,
      lastSyncTimestamp: Date.now(),
      isLoading: false,
      error: null,
    }),
  setSelectedSystemId: (id) =>
    set({ selectedSystemId: id.toLowerCase(), selectedCompanyId: id.toLowerCase() }),
  setSelectedCompanyId: (id) =>
    set({ selectedSystemId: id.toLowerCase(), selectedCompanyId: id.toLowerCase() }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () =>
    set({
      company: null,
      lastSyncTimestamp: null,
      isLoading: false,
      error: null,
    }),
}));
