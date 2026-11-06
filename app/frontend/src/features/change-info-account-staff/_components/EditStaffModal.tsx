import { theme } from "@/shared/styles/theme";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { apiClient } from "@/shared/services/api";
import { StaffUser, userService } from "@/shared/services/userService";
import { hashPassword } from "@/utils/passwordUtils";
import { formatRolesList, isOwnerRole } from "@/utils/roleUtils";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
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

const AVAILABLE_ROLES = ["staff", "admin", "leave"] as const;

interface EditStaffModalProps {
  visible: boolean;
  staff: StaffUser | null;
  currentUser: StaffUser | null;
  onClose: () => void;
  onSaved: (updatedStaff: StaffUser) => void;
}

export default function EditStaffModal({
  visible,
  staff,
  currentUser,
  onClose,
  onSaved,
}: EditStaffModalProps) {
  const { isMobile } = useResponsive();
  const isOwner = isOwnerRole(currentUser?.role);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Keyboard height state for adaptive resizing
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Form states
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editSystemId, setEditSystemId] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editJoined, setEditJoined] = useState("");
  const [editRoles, setEditRoles] = useState<string[]>(["staff"]);
  const [editIsActive, setEditIsActive] = useState(true);

  // Password Reset state
  const [wantResetPassword, setWantResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & error
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (staff && visible) {
      setEditName(staff.name || "");
      setEditUsername(staff.username || "");
      setEditPosition(staff.position || "");
      setEditSystemId(staff.system_id || "");
      setEditEmail(staff.email || "");
      setEditPhone(staff.phone || "");
      setEditJoined(staff.joined || "");
      setEditRoles(formatRolesList(staff.role));
      setEditIsActive(staff.is_active !== false);

      setWantResetPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setEditError(null);
    }
  }, [staff, visible]);

  const toggleEditRole = (role: string) => {
    if (editRoles.includes(role)) {
      if (editRoles.length === 1) return; // Keep at least one role
      setEditRoles(editRoles.filter((r) => r !== role));
    } else {
      setEditRoles([...editRoles, role]);
    }
  };

  const handleSaveEdit = async () => {
    if (!staff) return;
    setEditError(null);

    const cleanName = editName.trim();
    const cleanUsername = editUsername.trim().toLowerCase();
    const cleanPosition = editPosition.trim();
    const cleanSystemId = editSystemId.trim();
    const cleanEmail = editEmail.trim();
    const cleanPhone = editPhone.trim();

    // Validations
    if (!cleanName) {
      setEditError("Full name is required.");
      return;
    }
    if (!cleanUsername) {
      setEditError("Username is required.");
      return;
    }
    if (!USERNAME_REGEX.test(cleanUsername)) {
      setEditError(
        "Username must be 3-20 alphanumeric characters (letters, numbers, _, -).",
      );
      return;
    }
    if (!cleanPosition) {
      setEditError("Position is required.");
      return;
    }
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      setEditError("Please enter a valid email address.");
      return;
    }
    if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
      setEditError("Please enter a valid phone number.");
      return;
    }

    if (wantResetPassword) {
      const cleanPw = newPassword.trim();
      if (!cleanPw || cleanPw.length < 6) {
        setEditError("New password must be at least 6 characters.");
        return;
      }
      if (cleanPw !== confirmPassword.trim()) {
        setEditError("New passwords do not match.");
        return;
      }
    }

    setSavingEdit(true);
    try {
      // 1. Uniqueness check for username if changed via Backend API
      if (cleanUsername !== (staff.username || "").toLowerCase().trim()) {
        const matches = await apiClient
          .get<any[]>("/users-query", { params: { username: cleanUsername } })
          .catch(() => []);

        const existingUser = matches.find((u: any) => u.id !== staff.id);
        if (existingUser) {
          setEditError("This username is already taken by another account.");
          setSavingEdit(false);
          return;
        }
      }

      // 2. Prepare payload
      const updatePayload: Record<string, any> = {
        name: cleanName,
        username: cleanUsername,
        position: cleanPosition,
        system_id: cleanSystemId || staff.system_id,
        role: editRoles,
        is_active: editIsActive,
        phone: cleanPhone || null,
        email: cleanEmail || null,
        joined: editJoined.trim() || null,
      };

      // 3. Hash password if requested
      if (wantResetPassword && newPassword.trim()) {
        updatePayload.password = hashPassword(newPassword.trim());
      }

      // 4. Update in Backend API
      const updatedData = await apiClient.put<any>(
        `/users-query/${staff.id}`,
        updatePayload,
      );

      // 5. If updating currently logged in user, refresh local user storage
      if (currentUser?.id === staff.id && updatedData) {
        const { password: _p, ...safeUser } = updatedData;
        await userService.save(safeUser as StaffUser);
      }

      const finalUpdatedUser: StaffUser = {
        ...staff,
        ...updatePayload,
      };

      onSaved(finalUpdatedUser);
      onClose();
    } catch (err: any) {
      console.warn("Failed saving staff info:", err);
      setEditError(
        err?.message || "Failed to update staff info. Please try again.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const isKeyboardOpen = keyboardHeight > 0;
  // Maximum height available above keyboard to prevent the modal from clipping off screen
  const maxAvailableHeight = windowHeight - keyboardHeight - insets.top - 16;
  const normalHeight = windowHeight * (isMobile ? 0.85 : 0.8);
  const containerHeight = isKeyboardOpen
    ? Math.min(normalHeight, maxAvailableHeight)
    : normalHeight;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop press to dismiss keyboard or close modal */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (isKeyboardOpen) {
              Keyboard.dismiss();
            } else {
              onClose();
            }
          }}
        />

        <View
          style={[
            styles.modalContainer,
            {
              maxWidth: isMobile ? "100%" : 600,
              height: containerHeight,
              maxHeight: maxAvailableHeight,
              marginBottom: keyboardHeight,
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Edit Staff Account</Text>
              <Text style={styles.modalSub}>
                ID: {staff?.id} • @{staff?.username}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={30}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Error Banner inside modal */}
          {editError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.red} />
              <Text style={styles.errorBannerText}>{editError}</Text>
            </View>
          )}

          {/* Keyboard-aware scrollable form */}
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingVertical: 10,
              paddingHorizontal: 15,
              paddingBottom: 24,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={Platform.OS === "ios" ? 40 : 80}
            enableResetScrollToCoords={false}
          >
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Full name"
                placeholderTextColor={theme.colors.grey}
              />
            </View>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={editUsername}
                onChangeText={(v) =>
                  setEditUsername(v.toLowerCase().replace(/\s/g, ""))
                }
                placeholder="Username"
                placeholderTextColor={theme.colors.grey}
                autoCapitalize="none"
              />
            </View>

            {/* Position */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Position</Text>
              <TextInput
                style={styles.input}
                value={editPosition}
                onChangeText={setEditPosition}
                placeholder="Position"
                placeholderTextColor={theme.colors.grey}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 6 }}
              >
                {COMMON_POSITIONS.map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    onPress={() => setEditPosition(pos)}
                    style={[
                      styles.quickChip,
                      editPosition.toLowerCase() === pos.toLowerCase() &&
                        styles.quickChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        editPosition.toLowerCase() === pos.toLowerCase() &&
                          styles.quickChipTextSelected,
                      ]}
                    >
                      {pos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* System ID */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>System ID</Text>
              <TextInput
                style={[
                  styles.input,
                  !isOwner && {
                    backgroundColor: "#E5E7EB",
                    color: "#6B7280",
                  },
                ]}
                value={editSystemId}
                onChangeText={setEditSystemId}
                editable={isOwner}
                placeholder="System ID"
                placeholderTextColor={theme.colors.grey}
              />
            </View>

            {/* Roles */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Assigned Roles</Text>
              <View style={styles.rolesRow}>
                {AVAILABLE_ROLES.map((r) => {
                  const isSelected = editRoles.includes(r);
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => toggleEditRole(r)}
                      style={[
                        styles.roleBadgeBtn,
                        isSelected && styles.roleBadgeBtnActive,
                      ]}
                    >
                      <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={18}
                        color={
                          isSelected ? theme.colors.background2 : theme.colors.grey
                        }
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.roleBadgeText,
                          isSelected && styles.roleBadgeTextActive,
                        ]}
                      >
                        {r.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Active Account Switch */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Active Account</Text>
                <Text style={styles.switchSub}>
                  Account active and allowed to record attendance
                </Text>
              </View>
              <Switch
                value={editIsActive}
                onValueChange={setEditIsActive}
                trackColor={{ false: "#D1D5DB", true: theme.colors.primary }}
                thumbColor={theme.colors.background2}
              />
            </View>

            {/* Contact: Phone & Email */}
            <View style={styles.rowFields}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Phone"
                  placeholderTextColor={theme.colors.grey}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Email"
                  placeholderTextColor={theme.colors.grey}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Joined Date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Joined Date (YYYY/MM/DD)</Text>
              <TextInput
                style={styles.input}
                value={editJoined}
                onChangeText={setEditJoined}
                placeholder="YYYY/MM/DD"
                placeholderTextColor={theme.colors.grey}
              />
            </View>

            {/* ── Reset Password Section ── */}
            <View style={styles.resetPasswordCard}>
              <TouchableOpacity
                style={styles.resetPasswordHeader}
                onPress={() => setWantResetPassword(!wantResetPassword)}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color={
                      wantResetPassword ? theme.colors.primary : theme.colors.grey
                    }
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.resetPasswordTitle,
                      wantResetPassword && { color: theme.colors.primary },
                    ]}
                  >
                    Reset Staff Password
                  </Text>
                </View>
                <Ionicons
                  name={wantResetPassword ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.grey}
                />
              </TouchableOpacity>

              {wantResetPassword && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.fieldLabel}>New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Min 6 characters"
                      placeholderTextColor={theme.colors.grey}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={{ padding: 6 }}
                    >
                      <Ionicons
                        name={
                          showNewPassword ? "eye-off-outline" : "eye-outline"
                        }
                        size={20}
                        color={theme.colors.grey}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.fieldLabel, { marginTop: 10 }]}>
                    Confirm New Password
                  </Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter password"
                      placeholderTextColor={theme.colors.grey}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>

          {/* Modal Actions - pinned above keyboard */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={savingEdit}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, savingEdit && { opacity: 0.6 }]}
              onPress={handleSaveEdit}
              disabled={savingEdit}
            >
              {savingEdit ? (
                <ActivityIndicator size="small" color={theme.colors.background2} />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: theme.colors.background2,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.grey + 70,
    paddingBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  modalTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  modalSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  rowFields: {
    flexDirection: "row",
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 0.5,
    borderColor: theme.colors.grey + 70,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: "#F3F4F6",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickChipSelected: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  quickChipText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  quickChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  rolesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  roleBadgeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleBadgeText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  roleBadgeTextActive: {
    color: theme.colors.background2,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  switchSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: theme.borderRadius.md,
    padding: 10,
    marginBottom: 12,
    marginHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorBannerText: {
    marginLeft: 6,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.red,
    flex: 1,
  },
  resetPasswordCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: theme.colors.grey + 70,
  },
  resetPasswordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resetPasswordTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background2,
    borderWidth: 0.5,
    borderColor: theme.colors.grey + 70,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.grey + 70,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
