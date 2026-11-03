import type { StaffUser } from "@/services/userService";

export interface AccountState {
  user: StaffUser | null;
  loading: boolean;
  refreshing: boolean;
  logoutModalVisible: boolean;
}
