import { useLanguage } from "@/features/language";
import {
  DynamicSystemItem,
  extractSystemKey,
  fetchAvailableCompanySystems,
} from "@/shared/constants/attendanceConfig";
import { StaffUser, userService } from "@/shared/services/userService";
import { hasAdminOrOwnerRole, isOwnerRole } from "@/utils/roleUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkUsernameAvailability,
  createStaffAccountApi,
  fetchNextSystemIdApi,
} from "../_api/createAccountStaffApi";
import type { CreateStaffFormData } from "../_types/createAccountStaff.types";
import {
  getTodayFormattedDate,
  validateCreateStaffInput,
} from "../_utils/createAccountStaffUtils";

export function useCreateAccountStaff() {
  const { t } = useLanguage();
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
  const [systemKey, setSystemKey] = useState("");
  const [systemId, setSystemId] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["staff"]);
  const [isActive, setIsActive] = useState(true);
  const [joinedDate, setJoinedDate] = useState(getTodayFormattedDate);
  const [dob, setDob] = useState("");

  // UI State
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [suggestedIdLoading, setSuggestedIdLoading] = useState(false);
  const [availableSystems, setAvailableSystems] = useState<DynamicSystemItem[]>(
    [{ id: "system-0001" }, { id: "system-0002" }],
  );

  const latestTargetSystemRef = useRef<string>("");

  const generateNextSystemId = useCallback(async (targetSystem: string) => {
    if (!targetSystem) return;
    const cleanSystem = targetSystem.trim().toLowerCase();
    latestTargetSystemRef.current = cleanSystem;
    setSuggestedIdLoading(true);
    try {
      const nextId = await fetchNextSystemIdApi(cleanSystem);
      if (latestTargetSystemRef.current === cleanSystem) {
        setSystemId(nextId);
      }
    } catch {
      if (latestTargetSystemRef.current === cleanSystem) {
        setSystemId(`${cleanSystem}-0001`);
      }
    } finally {
      if (latestTargetSystemRef.current === cleanSystem) {
        setSuggestedIdLoading(false);
      }
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
  }, []);

  // Recalculate next system ID when systemKey changes (and auth check is complete)
  useEffect(() => {
    if (systemKey && !checkingAuth) {
      generateNextSystemId(systemKey);
    }
  }, [systemKey, checkingAuth, generateNextSystemId]);

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
    setDob("");
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
      dob,
    };

    const validationError = validateCreateStaffInput(formData, t);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    try {
      // 1. Check username availability upfront for the selected system
      const targetSystem =
        systemKey.trim().toLowerCase() || systemId.trim().toLowerCase();
      const isAvailable = await checkUsernameAvailability(
        username,
        targetSystem,
      );
      if (!isAvailable) {
        setErrorMessage(
          t(
            "createAccountStaff.errUsernameTaken",
            "This username is already taken. Please choose another.",
          ),
        );
        setSaving(false);
        return;
      }

      // 2. Submit account creation payload to backend
      await createStaffAccountApi({
        id: staffId.trim(),
        system_id: systemId.trim(),
        company_id: systemKey.trim().toLowerCase(),
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim(),
        position: position.trim(),
        role: selectedRoles,
        email: email.trim() || null,
        phone: phone.trim() || null,
        is_active: isActive,
        joined: joinedDate.trim(),
        dob: dob.trim() || null,
        devices: [],
        attendance: [],
        request_attendance_rules: [],
      });

      setSuccessModalVisible(true);
    } catch (err: any) {
      console.warn("Failed creating staff account:", err);
      const rawMsg = String(err?.message || err?.details?.error?.message || "");

      if (
        rawMsg.toLowerCase().includes("username") &&
        rawMsg.toLowerCase().includes("already")
      ) {
        setErrorMessage(
          t(
            "createAccountStaff.errUsernameTaken",
            "This username is already taken. Please choose another.",
          ),
        );
      } else if (
        rawMsg.toLowerCase().includes("system id") &&
        rawMsg.toLowerCase().includes("already")
      ) {
        setErrorMessage(
          t(
            "createAccountStaff.errSystemIdFailed",
            "System ID could not be generated. Please try again.",
          ),
        );
      } else {
        setErrorMessage(
          rawMsg ||
            t(
              "createAccountStaff.errCreateFailed",
              "Failed to create staff account. Please try again.",
            ),
        );
      }
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
    dob,
    setDob,
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
