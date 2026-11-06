import type { DynamicSystemItem } from "@/shared/constants/attendanceConfig";
import type { StaffUser } from "@/shared/services/userService";

export type StaffStatusFilter = "all" | "active" | "inactive" | "admin";

export interface ChangeInfoStaffState {
  currentUser: StaffUser | null;
  checkingAuth: boolean;
  isAuthorized: boolean;
  staffList: StaffUser[];
  loadingStaff: boolean;
  refreshing: boolean;
  searchQuery: string;
  selectedSystemFilter: string;
  statusFilter: StaffStatusFilter;
  editingStaff: StaffUser | null;
  toastMessage: string | null;
  availableSystems: DynamicSystemItem[];
}
