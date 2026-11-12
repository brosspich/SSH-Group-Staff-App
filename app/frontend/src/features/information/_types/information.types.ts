import type { StaffUser } from "@/shared/services/userService";
import type { KeyboardTypeOptions } from "react-native";

export type FieldKey =
  | "name"
  | "username"
  | "password"
  | "email"
  | "phone"
  | "position"
  | "joined"
  | "dob";

export interface FieldConfigItem {
  title: string;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  stripSpaces?: boolean;
  formatInput?: (v: string, prev: string) => string;
  validate: (v: string) => string | null;
}

export interface InformationState {
  user: StaffUser | null;
  loading: boolean;
  refreshing: boolean;
  editingField: FieldKey | null;
  logoutModalVisible: boolean;
}
