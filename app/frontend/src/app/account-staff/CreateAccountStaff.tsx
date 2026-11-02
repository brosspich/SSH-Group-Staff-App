import AppbarBack from "@/components/appbar/appbarback";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  DynamicSystemItem,
  extractSystemKey,
  fetchAvailableCompanySystems,
} from "@/constants/attendanceConfig";
import { useResponsive } from "@/hooks/useResponsive";
import { apiClient } from "@/services/api";
import { StaffUser, userService } from "@/services/userService";
import { hashPassword } from "@/utils/passwordUtils";
import { hasAdminOrOwnerRole, isOwnerRole } from "@/utils/roleUtils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s-]{6,16}$/;

const COMMON_POSITIONS = [
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

const AVAILABLE_ROLES = ["staff", "admin"] as const;

export default function CreateAccountStaff() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();

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
  const [joinedDate, setJoinedDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
  });

  // UI / Submission state
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [suggestedIdLoading, setSuggestedIdLoading] = useState(false);
  const [availableSystems, setAvailableSystems] = useState<DynamicSystemItem[]>(
    [{ id: "system-0001" }, { id: "system-0002" }],
  );

  // Load current user and check authorization
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

          // If user is Owner, dynamically query all registered company/branch systems
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

  // Whenever the active systemKey changes (e.g. Owner selects another system), recalculate next System ID
  useEffect(() => {
    if (systemKey) {
      generateNextSystemId(systemKey);
    }
  }, [systemKey]);

  // Query database to suggest the next sequential System ID for the system (e.g. system-0001-0004)
  const generateNextSystemId = async (targetSystem: string) => {
    setSuggestedIdLoading(true);
    try {
      const normalizedTarget = targetSystem.trim().toLowerCase();
      const data = await apiClient.get<any[]>("/users-query").catch(() => []);
      const error = null;

      if (!error && data && data.length > 0) {
        let maxSuffix = 0;
        const prefix = `${normalizedTarget}-`;

        data.forEach((row: any) => {
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
        setSystemId(`${normalizedTarget}-${formattedSuffix}`);
      } else {
        setSystemId(`${normalizedTarget}-0001`);
      }
    } catch (e) {
      console.warn("Error generating next system_id:", e);
      setSystemId(`${targetSystem.trim().toLowerCase()}-0001`);
    } finally {
      setSuggestedIdLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) {
        // Keep at least one role
        return;
      }
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

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanId = staffId.trim();
    const cleanSystemId = systemId.trim();
    const cleanPosition = position.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    // Validations
    if (!cleanName) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (!cleanUsername) {
      setErrorMessage("Username is required.");
      return;
    }
    if (!USERNAME_REGEX.test(cleanUsername)) {
      setErrorMessage(
        "Username must be 3-20 alphanumeric characters (letters, numbers, _, -).",
      );
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (!cleanId) {
      setErrorMessage("Staff ID is required (e.g. ID-0010).");
      return;
    }
    if (!cleanSystemId) {
      setErrorMessage("System ID could not be generated. Please try again.");
      return;
    }
    if (!cleanPosition) {
      setErrorMessage("Position is required.");
      return;
    }
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    setSaving(true);
    try {
      // 1. Check duplicate username in ssh_group_staff_users via Backend API
      const matchingUsers = await apiClient
        .get<any[]>("/users-query", { params: { username: cleanUsername } })
        .catch(() => []);

      const existingUser = matchingUsers?.[0] || null;
      if (existingUser) {
        setErrorMessage(
          "This username is already taken. Please choose another.",
        );
        setSaving(false);
        return;
      }

      // 2. Check duplicate staff ID via Backend API
      const existingId = await apiClient
        .get<any>(`/users-query/${cleanId}`)
        .catch(() => null);

      if (existingId) {
        setErrorMessage(
          `Staff ID "${cleanId}" already exists. Please assign a different ID.`,
        );
        setSaving(false);
        return;
      }

      // 3. Check duplicate system ID
      const existingSys = null;

      if (existingSys) {
        await generateNextSystemId(systemKey);
        setErrorMessage(
          `System ID "${cleanSystemId}" was already assigned. A fresh System ID has been generated. Please tap Create again.`,
        );
        setSaving(false);
        return;
      }

      // 4. Hash password using secure password utility (with random fallback)
      const hashedPassword = hashPassword(cleanPassword);

      // 4. Insert into ssh_group_staff_users
      const newStaffRow = {
        id: cleanId,
        system_id: cleanSystemId,
        name: cleanName,
        username: cleanUsername,
        password: hashedPassword,
        position: cleanPosition,
        role: selectedRoles,
        email: cleanEmail || null,
        phone: cleanPhone || null,
        is_active: isActive,
        joined: joinedDate.trim(),
        // created_at: new Date().toISOString(),
        devices: [],
        attendance: [],
        request_attendance_rules: [],
      };

      await apiClient.post("/users-query", newStaffRow);

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

  if (checkingAuth) {
    return (
      //   <View style={styles.centerContainer}>
      //     <ActivityIndicator size="large" color={AppColors.primary} />
      //     <Text style={styles.loadingText}>Checking permissions...</Text>
      //   </View>
      <>
        <Loading />
      </>
    );
  }

  if (!isAuthorized) {
    return (
      <View style={styles.safe}>
        <AppbarBack
          Title="Create Account Staff"
          fallbackRoute="/(tabs)/setting"
        />
        <View style={styles.centerContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={64}
            color={AppColors.grey}
          />
          <Text style={styles.deniedTitle}>Access Restricted</Text>
          <Text style={styles.deniedSub}>
            Only users with Admin or Owner privileges can access this feature.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/(tabs)/setting")}
          >
            <Text style={styles.backBtnText}>Return to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isOwner = isOwnerRole(currentUser?.role);

  return (
    <View style={styles.safe}>
      <AppbarBack
        Title="Create Account Staff"
        fallbackRoute="/(tabs)/setting"
      />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 40 : 120}
        enableResetScrollToCoords={false}
      >
        <View
          style={[
            styles.containerWrapper,
            { maxWidth: isMobile ? "100%" : 650 },
          ]}
        >
          {/* Header info badge */}
          <View style={styles.systemHeaderCard}>
            <View style={styles.systemHeaderLeft}>
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={AppColors.primary}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.systemHeaderTitle}>
                  {isOwner ? "Owner Administrator" : "Branch Admin"}
                </Text>
                <Text style={styles.systemHeaderSub}>
                  Managing System:{" "}
                  <Text style={{ fontWeight: "700", color: AppColors.primary }}>
                    {systemKey.toUpperCase()}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Owner can toggle systems dynamically */}
            {isOwner && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
                contentContainerStyle={styles.systemPickerRow}
              >
                {availableSystems.map((sysItem) => {
                  const sys = sysItem.id;
                  const isSelected =
                    systemKey.toLowerCase() === sys.toLowerCase();
                  return (
                    <Pressable
                      key={sys}
                      onPress={() => {
                        setSystemKey(sys);
                        generateNextSystemId(sys);
                      }}
                      style={[
                        styles.sysChip,
                        isSelected && styles.sysChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sysChipText,
                          isSelected && styles.sysChipTextSelected,
                        ]}
                      >
                        {sys.toUpperCase()}
                        {sysItem.companyName ? ` • ${sysItem.companyName}` : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Error Message banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={AppColors.red} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* ── Section: Identification ── */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Staff Identification</Text>

            {/* Staff ID & System ID */}
            <View style={styles.rowFields}>
              <View style={{ flex: 1.2, marginRight: 6 }}>
                <Text style={styles.label}>
                  Staff ID <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={staffId}
                    onChangeText={setStaffId}
                    placeholder="e.g. ID-0010"
                    placeholderTextColor={AppColors.grey}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={{ flex: 1.5, marginLeft: 6 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.label}>System ID (Auto)</Text>
                  {suggestedIdLoading && (
                    <ActivityIndicator
                      size="small"
                      color={AppColors.primary}
                      style={{ marginBottom: 4 }}
                    />
                  )}
                </View>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: "#E5E7EB" },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: "#374151", fontSize: 13, fontWeight: "600" },
                    ]}
                    value={systemId}
                    editable={false}
                    placeholder="e.g. system-0001-0004"
                    placeholderTextColor={AppColors.grey}
                  />
                </View>
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={AppColors.grey}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter full name"
                  placeholderTextColor={AppColors.grey}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Position */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Position <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="badge"
                  size={20}
                  color={AppColors.grey}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={position}
                  onChangeText={setPosition}
                  placeholder="e.g. Barista, Manager, Staff"
                  placeholderTextColor={AppColors.grey}
                  autoCapitalize="words"
                />
              </View>

              {/* Common positions quick chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
              >
                {COMMON_POSITIONS.map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    onPress={() => setPosition(pos)}
                    style={[
                      styles.quickChip,
                      position.toLowerCase() === pos.toLowerCase() &&
                        styles.quickChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        position.toLowerCase() === pos.toLowerCase() &&
                          styles.quickChipTextSelected,
                      ]}
                    >
                      {pos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* ── Section: Login Credentials ── */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Account Credentials</Text>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Username <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="at"
                  size={20}
                  color={AppColors.grey}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={username}
                  onChangeText={(val) =>
                    setUsername(val.toLowerCase().replace(/\s/g, ""))
                  }
                  placeholder="lowercase username, no spaces"
                  placeholderTextColor={AppColors.grey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={AppColors.grey}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={AppColors.grey}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={AppColors.grey}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Section: Role & Status ── */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Role & Account Status</Text>

            {/* Roles */}
            <Text style={styles.label}>Assigned Roles</Text>
            <View style={styles.rolesRow}>
              {AVAILABLE_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role);
                return (
                  <TouchableOpacity
                    key={role}
                    onPress={() => toggleRole(role)}
                    style={[
                      styles.roleBadgeBtn,
                      isSelected && styles.roleBadgeBtnActive,
                    ]}
                  >
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={18}
                      color={
                        isSelected ? AppColors.background2 : AppColors.grey
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.roleBadgeText,
                        isSelected && styles.roleBadgeTextActive,
                      ]}
                    >
                      {role.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Active Switch */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Active Account</Text>
                <Text style={styles.switchSub}>
                  Staff can log in and record attendance
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#D1D5DB", true: AppColors.primary }}
                thumbColor={AppColors.background2}
              />
            </View>

            {/* Joined Date */}
            <View style={[styles.fieldGroup, { marginTop: 14 }]}>
              <Text style={styles.label}>Joined Date (YYYY/MM/DD)</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={AppColors.grey}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={joinedDate}
                  onChangeText={setJoinedDate}
                  placeholder="YYYY/MM/DD"
                  placeholderTextColor={AppColors.grey}
                />
              </View>
            </View>
          </View>

          {/* ── Section: Optional Contact Info ── */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>
              Contact Information (Optional)
            </Text>

            {/* Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={AppColors.grey}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. +855 12 345 678"
                  placeholderTextColor={AppColors.grey}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={AppColors.grey}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="staff@company.com"
                  placeholderTextColor={AppColors.grey}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.createBtn, saving && styles.createBtnDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <View style={styles.btnLoadingRow}>
                <ActivityIndicator size="small" color={AppColors.background2} />
                <Text style={styles.createBtnText}>Creating Staff...</Text>
              </View>
            ) : (
              <View style={styles.btnLoadingRow}>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color={AppColors.background2}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.createBtnText}>Create Staff Account</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* ── Success Confirmation Modal ── */}
      {successModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalSuccessIcon}>
              <Ionicons
                name="checkmark"
                size={40}
                color={AppColors.background2}
              />
            </View>
            <Text style={styles.modalTitle}>Staff Account Created!</Text>
            <Text style={styles.modalSub}>
              Account for <Text style={{ fontWeight: "700" }}>{name}</Text> has
              been successfully created under {systemKey.toUpperCase()}.
            </Text>

            <View style={styles.modalMetaBox}>
              <Text style={styles.modalMetaLine}>
                ID: <Text style={{ fontWeight: "700" }}>{staffId}</Text>
              </Text>
              <Text style={styles.modalMetaLine}>
                Username: <Text style={{ fontWeight: "700" }}>{username}</Text>
              </Text>
              <Text style={styles.modalMetaLine}>
                System ID: <Text style={{ fontWeight: "700" }}>{systemId}</Text>
              </Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => {
                  setSuccessModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalSecondaryBtnText}>Create Another</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  setSuccessModalVisible(false);
                  router.push("/account-staff/ChangeInfoAccountStaff");
                }}
              >
                <Text style={styles.modalPrimaryBtnText}>View Staff List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: AppColors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginTop: 16,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  deniedSub: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    fontFamily: AppFonts.regular,
    maxWidth: 300,
    includeFontPadding: false,
  },
  backBtn: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: AppColors.background2,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  scrollContent: {
    padding: 16,
    alignItems: "center",
  },
  containerWrapper: {
    width: "100%",
  },
  systemHeaderCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  systemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  systemHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  systemHeaderSub: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  systemPickerRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  sysChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sysChipSelected: {
    backgroundColor: `${AppColors.primary}18`,
    borderColor: AppColors.primary,
  },
  sysChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textSecondary,
  },
  sysChipTextSelected: {
    color: AppColors.primary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorBannerText: {
    marginLeft: 8,
    fontSize: 13,
    color: AppColors.red,
    flex: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 14,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  rowFields: {
    flexDirection: "row",
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    marginBottom: 6,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  requiredStar: {
    color: AppColors.red,
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    paddingVertical: 10,
    includeFontPadding: false,
  },
  eyeBtn: {
    padding: 6,
  },
  chipsScroll: {
    marginTop: 8,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickChipSelected: {
    backgroundColor: `${AppColors.primary}20`,
    borderColor: AppColors.primary,
  },
  quickChipText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  quickChipTextSelected: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  rolesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  roleBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  roleBadgeBtnActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.textSecondary,
  },
  roleBadgeTextActive: {
    color: AppColors.background2,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  switchSub: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  createBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: AppColors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  btnLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  createBtnText: {
    color: AppColors.background2,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  modalSuccessIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    // fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    textAlign: "center",
  },
  modalSub: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  modalMetaBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    width: "100%",
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalMetaLine: {
    fontSize: 13,
    color: AppColors.textPrimary,
    marginBottom: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalSecondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  modalPrimaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: "center",
  },
  modalPrimaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.background2,
  },
});
