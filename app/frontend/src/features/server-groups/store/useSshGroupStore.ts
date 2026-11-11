import { create } from "zustand";
import { SshGroup } from "../types/sshGroup.types";

export interface SshGroupStoreState {
  groups: SshGroup[];
  activeGroupId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SshGroupStoreActions {
  setGroups: (groups: SshGroup[]) => void;
  setActiveGroupId: (id: string | null) => void;
  addGroup: (group: SshGroup) => void;
  updateGroupInStore: (id: string, partial: Partial<SshGroup>) => void;
  removeGroupFromStore: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type SshGroupStore = SshGroupStoreState & SshGroupStoreActions;

export const useSshGroupStore = create<SshGroupStore>((set) => ({
  groups: [],
  activeGroupId: null,
  isLoading: false,
  error: null,

  setGroups: (groups) => set({ groups, isLoading: false, error: null }),
  setActiveGroupId: (activeGroupId) => set({ activeGroupId }),
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
  updateGroupInStore: (id, partial) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...partial } : g)),
    })),
  removeGroupFromStore: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
      activeGroupId: state.activeGroupId === id ? null : state.activeGroupId,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
