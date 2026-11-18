import { useLanguage } from "@/features/language";
import { apiClient } from "@/shared/services/api";
import type { StaffUser } from "@/shared/services/userService";
import { hashPassword } from "@/utils/passwordUtils";
import { formatRolesList } from "@/utils/roleUtils";
import { useEffect, useState } from "react";
import type { EditStaffFormData } from "../_types/editStaff.types";
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  USERNAME_REGEX,
} from "../_utils/editStaffConstants";
import { useUpdateStaffMutation } from "./useUpdateStaffMutation";

interface UseEditStaffFormProps {
  visible: boolean;
  staff: StaffUser | null;
  onSaved: (updatedStaff: StaffUser) => void;
  onClose: () => void;
}

export function useEditStaffForm({
  visible,
  staff,
  onSaved,
  onClose,
}: UseEditStaffFormProps) {
  const { t } = useLanguage();
  const updateStaffMutation = useUpdateStaffMutation();

  // Form State
  const [formData, setFormData] = useState<EditStaffFormData>({
    name: "",
    username: "",
    position: "",
    systemId: "",
    email: "",
    phone: "",
    joined: "",
    dob: "",
    roles: ["staff"],
    isActive: true,
  });

  // Password Reset State
  const [wantResetPassword, setWantResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Error
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Synchronize when staff or visibility changes
  useEffect(() => {
    if (staff && visible) {
      setFormData({
        name: staff.name || "",
        username: staff.username || "",
        position: staff.position || "",
        systemId: staff.system_id || "",
        email: staff.email || "",
        phone: staff.phone || "",
        joined: staff.joined || "",
        dob: staff.dob || "",
        roles: formatRolesList(staff.role),
        isActive: staff.is_active !== false,
      });

      setWantResetPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setEditError(null);
    }
  }, [staff, visible]);

  // Update specific field helper
  const updateField = <K extends keyof EditStaffFormData>(
    field: K,
    value: EditStaffFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle assigned roles
  const toggleRole = (role: string) => {
    const cleanRole = role.toLowerCase().trim();
    if (formData.roles.includes(cleanRole)) {
      if (formData.roles.length === 1) return; // Keep at least one role
      updateField(
        "roles",
        formData.roles.filter((r) => r !== cleanRole),
      );
    } else {
      updateField("roles", [cleanRole]);
    }
  };

  // Validation
  const validate = (): boolean => {
    const cleanName = formData.name.trim();
    const cleanUsername = formData.username.trim().toLowerCase();
    const cleanPosition = formData.position.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhone = formData.phone.trim();

    if (!cleanName) {
      setEditError(
        t("changeInfoStaff.errNameRequired", "Full name is required."),
      );
      return false;
    }
    if (!cleanUsername) {
      setEditError(
        t("changeInfoStaff.errUsernameRequired", "Username is required."),
      );
      return false;
    }
    if (!USERNAME_REGEX.test(cleanUsername)) {
      setEditError(
        t(
          "changeInfoStaff.errUsernameFormat",
          "Username must be 3-20 alphanumeric characters (letters, numbers, _, -).",
        ),
      );
      return false;
    }
    if (!cleanPosition) {
      setEditError(
        t("changeInfoStaff.errPositionRequired", "Position is required."),
      );
      return false;
    }
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      setEditError(
        t(
          "changeInfoStaff.errValidEmail",
          "Please enter a valid email address.",
        ),
      );
      return false;
    }
    if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
      setEditError(
        t(
          "changeInfoStaff.errValidPhone",
          "Please enter a valid phone number.",
        ),
      );
      return false;
    }

    if (wantResetPassword) {
      const cleanPw = newPassword.trim();
      if (!cleanPw || cleanPw.length < 6) {
        setEditError(
          t(
            "changeInfoStaff.errPasswordLength",
            "New password must be at least 6 characters.",
          ),
        );
        return false;
      }
      if (cleanPw !== confirmPassword.trim()) {
        setEditError(
          t("changeInfoStaff.errPasswordMatch", "New passwords do not match."),
        );
        return false;
      }
    }

    return true;
  };

  // Submit Handler
  const handleSave = async () => {
    if (!staff) return;
    setEditError(null);

    if (!validate()) return;

    const cleanUsername = formData.username.trim().toLowerCase();
    setSavingEdit(true);

    try {
      // 1. Uniqueness check for username globally across all systems/companies
      if (cleanUsername !== (staff.username || "").toLowerCase().trim()) {
        const matches = await apiClient
          .get<any[]>("/users-query", {
            params: { username: cleanUsername },
          })
          .catch(() => []);

        const existingUser = matches.find((u: any) => {
          if (
            u.id === staff.id ||
            u.systemId === (staff.systemId || staff.system_id)
          ) {
            return false;
          }
          return (u.username || "").toLowerCase().trim() === cleanUsername;
        });

        if (existingUser) {
          setEditError(
            t(
              "changeInfoStaff.errUsernameTaken",
              "This username is already taken. Please choose another.",
            ),
          );
          setSavingEdit(false);
          return;
        }
      }

      // 2. Prepare payload
      const cleanRoles = Array.from(
        new Set(
          formData.roles.map((r) => r.toLowerCase().trim()).filter(Boolean),
        ),
      );

      const updatePayload: Record<string, any> = {
        name: formData.name.trim(),
        username: cleanUsername,
        position: formData.position.trim(),
        system_id: formData.systemId.trim() || staff.system_id,
        role: cleanRoles.length > 0 ? cleanRoles[0] : "staff",
        is_active: formData.isActive,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        joined: formData.joined.trim() || null,
        dob: formData.dob.trim() || null,
      };

      // 3. Hash password if requested
      if (wantResetPassword && newPassword.trim()) {
        updatePayload.password = hashPassword(newPassword.trim());
      }

      // 4. Update in Backend API using TanStack Query mutation
      await updateStaffMutation.mutateAsync({
        id: staff.id,
        payload: updatePayload,
      });

      const finalUpdatedUser: StaffUser = {
        ...staff,
        ...updatePayload,
      };

      onSaved(finalUpdatedUser);
      onClose();
    } catch (err: any) {
      console.warn("Failed saving staff info:", err);
      setEditError(
        err?.message ||
          t(
            "changeInfoStaff.errUpdateFailed",
            "Failed to update staff info. Please try again.",
          ),
      );
    } finally {
      setSavingEdit(false);
    }
  };

  return {
    formData,
    updateField,
    toggleRole,
    wantResetPassword,
    setWantResetPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    savingEdit,
    editError,
    handleSave,
  };
}
