import type { StaffUser } from "@/shared/services/userService";

export interface EditStaffFormData {
  name: string;
  username: string;
  position: string;
  systemId: string;
  email: string;
  phone: string;
  joined: string;
  dob: string;
  roles: string[];
  isActive: boolean;
}

export interface EditStaffModalProps {
  visible: boolean;
  staff: StaffUser | null;
  currentUser: StaffUser | null;
  onClose: () => void;
  onSaved: (updatedStaff: StaffUser) => void;
}
