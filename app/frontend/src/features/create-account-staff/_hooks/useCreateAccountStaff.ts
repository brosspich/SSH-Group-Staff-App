import {
  DynamicSystemItem,
  extractSystemKey,
  fetchAvailableCompanySystems,
} from "@/constants/attendanceConfig";
import { StaffUser, userService } from "@/services/userService";
import { hashPassword } from "@/utils/passwordUtils";
import { hasAdminOrOwnerRole, isOwnerRole } from "@/utils/roleUtils";
import { useCallback, useEffect, useState } from "react";
import {
  checkStaffIdAvailability,
  checkUsernameAvailability,
  createStaffAccountApi,
  fetchAllUsers,
} from "../_api/createAccountStaffApi";
import type { CreateStaffFormData } from "../_types/createAccountStaff.types";
import {
  calculateNextSequentialSystemId,
  getTodayFormattedDate,
  validateCreateStaffInput,
} from "../_utils/createAccountStaffUtils";

export function useCreateAccountStaff() {
  // Authentication & Access Check
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [systemKey, setSystemKey] = useState("system-0001");
  const [systemId, setSystemId] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["staff"]);
  const [isActive, setIsActive] = useState(true);
  const [joinedDate, setJoinedDate] = useState(getTodayFormattedDate);

  // UI State
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [suggestedIdLoading, setSuggestedIdLoading] = useState(false);
  const [availableSystems, setAvailableSystems] = useState<DynamicSystemItem[]>(
    [{ id: "system-0001" }, { id: "system-0002" }],
  );

  const generateNextSystemId = useCallback(async (targetSystem: string) => {
    setSuggestedIdLoading(true);
    try {
      const users = await fetchAllUsers();
      const nextId = calculateNextSequentialSystemId(targetSystem, users);
      setSystemId(nextId);
    } catch {
      setSystemId(`${targetSystem.trim().toLowerCase()}-0001`);
    } finally {
      setSuggestedIdLoading(false);
    }
  }, []);

  // Check auth and initial setup
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await userService.get();
        if (!mounted) return;
        setCurrentUser(u);

        const authorized = hasAdminOrOwnerRole(u?.role);
        setIsAuthorized(authorized);

        if (authorized && u) {
          const sys = extractSystemKey(u.system_id);
          setSystemKey(sys);
          await generateNextSystemId(sys);

          if (isOwnerRole(u?.role)) {
            const systems = await fetchAvailableCompanySystems();
            if (mounted && systems.length > 0) {
              setAvailableSystems(systems);
            }
          }
        }
      } catch (e) {
        console.warn("Failed checking user auth:", e);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [generateNextSystemId]);

  // Recalculate next system ID when systemKey changes
  useEffect(() => {
    if (systemKey) {
      generateNextSystemId(systemKey);
    }
  }, [systemKey, generateNextSystemId]);

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) return; // Keep at least one
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const resetForm = () => {
    setName("");
    setUsername("");
    setPassword("");
    setStaffId("");
    setPosition("");
    setEmail("");
    setPhone("");
    setSelectedRoles(["staff"]);
    setIsActive(true);
    setErrorMessage(null);
    if (systemKey) {
      generateNextSystemId(systemKey);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const formData: CreateStaffFormData = {
      name,
      username,
      password,
      staffId,
      systemKey,
      systemId,
      position,
      email,
      phone,
      selectedRoles,
      isActive,
      joinedDate,
    };

    const validationError = validateCreateStaffInput(formData);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    try {
      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        setErrorMessage(
          "This username is already taken. Please choose another.",
        );
        setSaving(false);
        return;
      }

      const isStaffIdAvailable = await checkStaffIdAvailability(staffId);
      if (!isStaffIdAvailable) {
        setErrorMessage(
          `Staff ID "${staffId}" already exists. Please assign a different ID.`,
        );
        setSaving(false);
        return;
      }

      const hashedPassword = hashPassword(password.trim());

      await createStaffAccountApi({
        id: staffId.trim(),
        system_id: systemId.trim(),
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: hashedPassword,
        position: position.trim(),
        role: selectedRoles,
        email: email.trim() || null,
        phone: phone.trim() || null,
        is_active: isActive,
        joined: joinedDate.trim(),
        devices: [],
        attendance: [],
        request_attendance_rules: [],
      });

      setSuccessModalVisible(true);
    } catch (err: any) {
      console.warn("Failed creating staff account:", err);
      setErrorMessage(
        err?.message || "Failed to create staff account. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    currentUser,
    checkingAuth,
    isAuthorized,
    name,
    setName,
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    staffId,
    setStaffId,
    systemKey,
    setSystemKey,
    systemId,
    position,
    setPosition,
    email,
    setEmail,
    phone,
    setPhone,
    selectedRoles,
    toggleRole,
    isActive,
    setIsActive,
    joinedDate,
    setJoinedDate,
    saving,
    errorMessage,
    successModalVisible,
    setSuccessModalVisible,
    suggestedIdLoading,
    availableSystems,
    handleSubmit,
    resetForm,
  };
}
