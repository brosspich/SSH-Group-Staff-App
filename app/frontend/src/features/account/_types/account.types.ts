import type { StaffUser } from "@/shared/services/userService";

export interface AccountState {
  user: StaffUser | null;
  loading: boolean;
  refreshing: boolean;
  logoutModalVisible: boolean;
}
