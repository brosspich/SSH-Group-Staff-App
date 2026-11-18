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
] as const;

export const AVAILABLE_ROLES = [
  "staff",
  "admin",
  "user",
  "member",
  "leave",
] as const;
