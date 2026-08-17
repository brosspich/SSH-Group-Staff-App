import AppbarBack from "@/components/appbar/appbarback";
import Copyright from "@/components/copyright/copyright";
import Loading from "@/components/loading/loading";
import { renderLogoutModal } from "@/components/logout/logoutModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { StaffUser, userService } from "@/services/userService";
import { supabase } from "@/utils/supabase";
import { AntDesign, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { createElement, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardTypeOptions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Row item ─────────────────────────────────────────────────────────────────

function InfoRow({ iconName, icon, label, value, edit }: any) {
  return (
    <View style={styles.infoRow}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={styles.infoIconBox}>
          {createElement(icon, {
            name: iconName,
            size: 18,
            color: AppColors.secondary,
          })}
        </View>
        <View style={styles.infoText}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
      {edit && (
        <TouchableOpacity style={styles.edit} onPress={edit} hitSlop={8}>
          <MaterialIcons name="edit" size={18} color={AppColors.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Safe Date Parsing Helpers ───────────────────────────────────────────────

function parseDateString(dateStr?: string | null): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const clean = dateStr.trim();

  // Handle YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // General ISO or standard Date fallback
  const d = new Date(clean);
  if (!isNaN(d.getTime())) return d;

  return null;
}

function formatJoinedDisplay(rawJoinedDate?: string | null): string {
  if (!rawJoinedDate) return "—";
  const parsed = parseDateString(rawJoinedDate);
  if (parsed) {
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return rawJoinedDate;
}

function getInitialFieldValue(
  user: StaffUser | null,
  fieldKey: FieldKey | null,
): string {
  if (!user || !fieldKey) return "";
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

function formatJoinedDateInput(input: string, prevInput: string): string {
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
  if (digits.length === 6)
    return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/`;
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}

// ─── Field config ───────────────────────────────────────────────────────────

type FieldKey = "name" | "username" | "email" | "phone" | "position" | "joined";

const USERNAME_REGEX = /^[a-zA-Z0-9]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{6,15}$/;

const FIELD_CONFIG: Record<
  FieldKey,
  {
    title: string;
    placeholder: string;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    stripSpaces?: boolean;
    formatInput?: (v: string, prev: string) => string;
    validate: (v: string) => string | null;
  }
> = {
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
      if (!PHONE_REGEX.test(v.replace(/\s/g, "")))
        return "Enter a valid phone number";
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

// ─── Single Field Edit Modal ────────────────────────────────────────────────

function EditFieldModal({
  visible,
  fieldKey,
  onClose,
  user,
  onSaved,
}: {
  visible: boolean;
  fieldKey: FieldKey | null;
  onClose: () => void;
  user: StaffUser | null;
  onSaved: (updated: StaffUser) => void;
}) {
  const [value, setValue] = useState(() => {
    return getInitialFieldValue(user, fieldKey);
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const config = fieldKey ? FIELD_CONFIG[fieldKey] : null;

  const { isMobile } = useResponsive();

  const handleSave = async () => {
    if (!user || !fieldKey || !config) return;

    const trimmed = value.trim();
    const validationError = config.validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Uniqueness check only applies to username
      if (fieldKey === "username" && trimmed !== user.username) {
        const { data: existing, error: checkError } = await supabase
          .from("ssh_group_staff_users")
          .select("id")
          .eq("username", trimmed)
          .neq("id", user.id)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existing) {
          setError("This username is already taken");
          setSaving(false);
          return;
        }
      }

      const { data: updated, error: updateError } = await supabase
        .from("ssh_group_staff_users")
        .update({ [fieldKey]: trimmed })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      onSaved(updated as StaffUser);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!config) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View
          style={[
            modalStyles.container,
            {
              // maxHeight: isMobile ? "70%" : "70%",
              // height: isMobile ? "70%" : "70%",
              maxWidth: !isMobile ? 450 : "100%",
              width: !isMobile ? 450 : "100%",
            },
          ]}
        >
          <Text style={modalStyles.title}>{config.title}</Text>

          <View style={modalStyles.field}>
            <TextInput
              style={[modalStyles.input, error && modalStyles.inputError]}
              value={value}
              onChangeText={(v) => {
                let nextVal = v;
                if (config.formatInput) {
                  nextVal = config.formatInput(v, value);
                } else if (config.stripSpaces) {
                  nextVal = v.replace(/\s/g, "");
                }
                setValue(nextVal);
              }}
              placeholder={config.placeholder}
              placeholderTextColor={AppColors.grey}
              autoCapitalize={config.autoCapitalize ?? "sentences"}
              autoCorrect={false}
              keyboardType={config.keyboardType}
              autoFocus
            />
            {error && <Text style={modalStyles.errorText}>{error}</Text>}
          </View>

          <View style={modalStyles.actions}>
            <TouchableOpacity
              style={[modalStyles.btn, modalStyles.cancelBtn]}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.btn, modalStyles.saveBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={modalStyles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Account Screen ───────────────────────────────────────────────────────────

export default function Information() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const { isMobile } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    userService.get().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // 🔴 Real-time: keep this user row in sync with ssh_group_staff_users
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `ssh-group-staff-user-${user.id}`;

    const existing = supabase
      .getChannels()
      .find((ch) => ch.topic === `realtime:${channelName}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ssh_group_staff_users",
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            await userService.clear();
            setUser(null);
            return;
          }
          const { data: dbUser } = await supabase
            .from("ssh_group_staff_users")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (!dbUser) return;
          const updated = dbUser as StaffUser;
          await userService.save(updated);
          setUser(updated);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // 🔽 Pull-to-refresh: manually re-fetch the current user row from Supabase
  const onRefresh = useCallback(async () => {
    const current = await userService.get();
    if (!current?.id) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("ssh_group_staff_users")
        .select("*")
        .eq("id", current.id)
        .single();

      if (!error && data) {
        await userService.save(data as StaffUser);
        setUser(data as StaffUser);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={Platform.OS === "ios" ? ["top", "left", "right"] : undefined}
        style={{ flex: 1, backgroundColor: AppColors.background2 }}
      >
        <View style={styles.safe}>
          <View style={styles.centered}>
            <Loading />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Format joined or created_at date nicely
  const rawJoinedDate = user?.joined || user?.created_at;
  const joinedDate = formatJoinedDisplay(rawJoinedDate);

  return (
    <SafeAreaView
      edges={Platform.OS === "ios" ? ["top", "left", "right"] : undefined}
      style={{ flex: 1, backgroundColor: AppColors.background2 }}
    >
      <View style={styles.safe}>
        <AppbarBack Title={"Information"} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppColors.secondary}
              colors={[AppColors.secondary]}
            />
          }
        >
          <View
            style={[
              { flex: 1, width: "100%" },
              !isMobile && { maxWidth: "60%", alignSelf: "center" },
            ]}
          >
            {/* ── Account Info ── */}
            <View style={styles.section}>
              <View style={styles.card}>
                <InfoRow
                  icon={FontAwesome6}
                  iconName="contact-card"
                  label="Staff ID"
                  value={user?.id ?? "None"}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="badge"
                  label="Full Name"
                  value={user?.name ?? "None"}
                  edit={() => setEditingField("name")}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="person"
                  label="Username"
                  value={user?.username ?? "None"}
                  edit={() => setEditingField("username")}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="work"
                  label="Position"
                  value={user?.position ?? "None"}
                  edit={() => setEditingField("position")}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="email"
                  label="Email"
                  value={user?.email ?? "None"}
                  edit={() => setEditingField("email")}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="phone"
                  label="Phone"
                  value={user?.phone ?? "None"}
                  edit={() => setEditingField("phone")}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="event"
                  label="Joined"
                  value={joinedDate}
                  edit={() => setEditingField("joined")}
                />
              </View>
            </View>

            {/* ── Logout ── */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <AntDesign name="logout" size={20} color={AppColors.red} />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* ── Footer ── */}
            <Copyright />
          </View>
        </ScrollView>

        {renderLogoutModal({
          logoutModalVisible,
          setLogoutModalVisible,
          isMobile,
        })}

        <EditFieldModal
          key={editingField ?? "none"}
          visible={editingField !== null}
          fieldKey={editingField}
          onClose={() => setEditingField(null)}
          user={user}
          onSaved={(updated) => setUser(updated)}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: 12,
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.textSecondary ?? AppColors.grey,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowOffset: { width: 0, height: 2 },
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  infoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${AppColors.grey}22`,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: `${AppColors.secondary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    // flex: 1,
  },
  edit: {
    backgroundColor: `${AppColors.secondary}15`,
    padding: 7,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textSecondary ?? AppColors.grey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textPrimary,
    marginTop: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    paddingVertical: 12,
    borderColor: AppColors.red,
    borderWidth: 1.5,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowOffset: { width: 0, height: 3 },
        shadowColor: AppColors.background2,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  logoutText: {
    color: AppColors.red,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});

// ─── Edit Modal Styles ──────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    // maxWidth: 420,
    paddingHorizontal: 16,
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  field: {
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  inputError: {
    borderColor: AppColors.red,
  },
  errorText: {
    color: AppColors.red,
    fontSize: 12,
    marginTop: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
  },
  cancelText: {
    color: AppColors.secondary,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  saveBtn: {
    backgroundColor: AppColors.secondary,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
