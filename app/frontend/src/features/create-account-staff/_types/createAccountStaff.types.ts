export type AvailableRole = "staff" | "admin";

export interface CreateStaffFormData {
  name: string;
  username: string;
  password: string;
  staffId: string;
  systemKey: string;
  systemId: string;
  position: string;
  email: string;
  phone: string;
  selectedRoles: string[];
  isActive: boolean;
  joinedDate: string;
}

export interface CreateStaffPayload {
  id: string;
  system_id: string;
  company_id?: string;
  name: string;
  username: string;
  password: string;
  position: string;
  role: string[];
  email: string | null;
  phone: string | null;
  is_active: boolean;
  joined: string;
  devices: any[];
  attendance: any[];
  request_attendance_rules: any[];
}
