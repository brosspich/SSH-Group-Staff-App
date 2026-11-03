import type { CreateStaffFormData } from "../_types/createAccountStaff.types";

export const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,20}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[0-9\s-]{6,16}$/;

export const COMMON_POSITIONS = [
  "Staff",
  "Cashier",
  "Manager",
  "Supervisor",
  "Developer",
  "IT Support",
  "Accountant",
  "HR",
  "Security",
];

export const AVAILABLE_ROLES = ["staff", "admin"] as const;

export function getTodayFormattedDate(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

export function validateCreateStaffInput(
  data: CreateStaffFormData,
): string | null {
  const cleanName = data.name.trim();
  const cleanUsername = data.username.trim().toLowerCase();
  const cleanPassword = data.password.trim();
  const cleanId = data.staffId.trim();
  const cleanSystemId = data.systemId.trim();
  const cleanPosition = data.position.trim();
  const cleanEmail = data.email.trim();
  const cleanPhone = data.phone.trim();

  if (!cleanName) return "Full Name is required.";
  if (!cleanUsername) return "Username is required.";
  if (!USERNAME_REGEX.test(cleanUsername)) {
    return "Username must be 3-20 alphanumeric characters (letters, numbers, _, -).";
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (!cleanId) return "Staff ID is required (e.g. ID-0010).";
  if (!cleanSystemId)
    return "System ID could not be generated. Please try again.";
  if (!cleanPosition) return "Position is required.";
  if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
    return "Please enter a valid email address.";
  }
  if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
    return "Please enter a valid phone number.";
  }
  if (data.selectedRoles.length === 0) {
    return "At least one role must be selected.";
  }

  return null;
}

export function calculateNextSequentialSystemId(
  targetSystem: string,
  existingUsers: any[],
): string {
  const normalizedTarget = targetSystem.trim().toLowerCase();
  if (!existingUsers || existingUsers.length === 0) {
    return `${normalizedTarget}-0001`;
  }

  let maxSuffix = 0;
  const prefix = `${normalizedTarget}-`;

  existingUsers.forEach((row: any) => {
    const rawSys = String(row.system_id || "")
      .trim()
      .toLowerCase();
    if (rawSys.startsWith(prefix)) {
      const remainder = rawSys.slice(prefix.length);
      const numMatch = remainder.match(/^(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        if (!isNaN(num) && num > maxSuffix) {
          maxSuffix = num;
        }
      }
    }
  });

  const nextNum = maxSuffix + 1;
  const formattedSuffix = String(nextNum).padStart(4, "0");
  return `${normalizedTarget}-${formattedSuffix}`;
}
