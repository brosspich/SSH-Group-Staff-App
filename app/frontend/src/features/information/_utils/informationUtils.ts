import type { StaffUser } from "@/services/userService";
import { parseDateString } from "@/utils/formatters";
import type { FieldConfigItem, FieldKey } from "../_types/information.types";

export const USERNAME_REGEX = /^[a-zA-Z0-9]{3,20}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[0-9]{6,15}$/;

export function getInitialFieldValue(
  user: StaffUser | null,
  fieldKey: FieldKey | null,
): string {
  if (!user || !fieldKey) return "";
  if (fieldKey === "password") return "";
  if (fieldKey === "joined") {
    const raw = user.joined || user.created_at || "";
    const parsed = parseDateString(raw);
    if (parsed) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`;
    }
    return raw;
  }
  return (user as any)[fieldKey] ?? "";
}

export function formatJoinedDateInput(
  input: string,
  prevInput: string,
): string {
  const isDeleting = input.length < prevInput.length;
  const digits = input.replace(/\D/g, "").slice(0, 8);

  if (!digits) return "";

  if (isDeleting) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
    return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
  }

  if (digits.length < 4) return digits;
  if (digits.length === 4) return `${digits}/`;
  if (digits.length < 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  if (digits.length === 6) {
    return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/`;
  }
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}

export const FIELD_CONFIG: Record<FieldKey, FieldConfigItem> = {
  name: {
    title: "Edit Full Name",
    placeholder: "Full name",
    autoCapitalize: "words",
    validate: (v) => (!v.trim() ? "Full name is required" : null),
  },
  username: {
    title: "Edit Username",
    placeholder: "Username",
    autoCapitalize: "none",
    stripSpaces: true,
    validate: (v) => {
      if (!v.trim()) return "Username is required";
      if (!USERNAME_REGEX.test(v)) {
        return "Only letters and numbers, 3–20 characters, no spaces or symbols";
      }
      return null;
    },
  },
  password: {
    title: "Edit Password",
    placeholder: "Enter new password",
    autoCapitalize: "none",
    validate: (v) => {
      if (!v.trim()) return "Password is required";
      if (v.trim().length < 6) return "Password must be at least 6 characters";
      return null;
    },
  },
  position: {
    title: "Edit Position",
    placeholder: "Position",
    autoCapitalize: "words",
    validate: (v) => (!v.trim() ? "Position is required" : null),
  },
  email: {
    title: "Edit Email",
    placeholder: "Email",
    keyboardType: "email-address",
    autoCapitalize: "none",
    validate: (v) => {
      if (!v.trim()) return "Email is required";
      if (!EMAIL_REGEX.test(v)) return "Enter a valid email address";
      return null;
    },
  },
  phone: {
    title: "Edit Phone",
    placeholder: "Phone",
    keyboardType: "phone-pad",
    validate: (v) => {
      if (!v.trim()) return "Phone is required";
      if (!PHONE_REGEX.test(v.replace(/\s/g, ""))) {
        return "Enter a valid phone number";
      }
      return null;
    },
  },
  joined: {
    title: "Edit Joined Date",
    placeholder: "yyyy/mm/dd",
    keyboardType: "number-pad",
    formatInput: (v, prev) => formatJoinedDateInput(v, prev),
    validate: (v) => {
      if (!v.trim()) return "Joined date is required";
      const parsed = parseDateString(v);
      if (!parsed) return "Enter a valid date (e.g. yyyy/mm/dd or yyyy-mm-dd)";
      return null;
    },
  },
};
