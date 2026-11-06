import { extractSystemKey } from "@/shared/constants/attendanceConfig";
import { useUser } from "@/shared/contexts/UserContext";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { StaffUser } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { isLeaveRole } from "@/utils/roleUtils";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function getStaffSystemKey(st?: StaffUser | null): string {
  if (!st) return "system-0001";

  const lowerId = String(st.id || "")
    .toLowerCase()
    .trim();
  const lowerStaffId = String(st.staff_id || "")
    .toLowerCase()
    .trim();
  const lowerUsername = String(st.username || "")
    .toLowerCase()
    .trim();
  const rawSys = String(st.system_id || "")
    .toLowerCase()
    .trim();

  // 1. Explicit BPAK identifier anywhere in id, staff_id, username, or system_id is strictly system-0002
  if (
    lowerId.startsWith("bpak") ||
    lowerStaffId.startsWith("bpak") ||
    lowerUsername.startsWith("bpak") ||
    rawSys.includes("bpak")
  ) {
    return "system-0002";
  }

  // 2. Check for any explicit dynamic system code in system_id (e.g. system-0001, system-0002, system-0003, ...)
  const matchSys = rawSys.match(/^(system-\d+)/i);
  if (matchSys) {
    return matchSys[1].toLowerCase();
  }

  // 3. Check for dynamic system pattern in user ID (e.g. system-0001-xxxx, system-0002-xxxx, system-0003-xxxx)
  const matchId = lowerId.match(/^(system-\d+)/i);
  if (matchId) {
    return matchId[1].toLowerCase();
  }

  // 4. Default company (SSH Group: 0001, 0021, 0022, 0024, 0025, etc.) is system-0001
  return "system-0001";
}

function matchesSystem(st: StaffUser, targetSystemKey: string): boolean {
  if (!targetSystemKey) return true;
  const target = targetSystemKey.trim().toLowerCase();
  const staffSystem = getStaffSystemKey(st);
  return staffSystem === target;
}

interface StaffPickerModalProps {
  visible: boolean;
  staffList: StaffUser[];
  selectedStaffId: string | null;
  onClose: () => void;
  onSelect: (staffId: string) => void;
  systemId?: string;
}

export function StaffPickerModal({
  visible,
  staffList,
  selectedStaffId,
  onClose,
  onSelect,
  systemId,
}: StaffPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const { user: loggedInUser } = useUser();

  // Determine target system:
  // 1. Explicit prop `systemId`
  // 2. Selected staff member's system
  // 3. Logged-in user's system
  const selectedStaff = staffList.find((s) => s.id === selectedStaffId);
  const selectedStaffSystem = selectedStaff
    ? getStaffSystemKey(selectedStaff)
    : "";

  const loggedInUserSystem = loggedInUser
    ? getStaffSystemKey(loggedInUser)
    : "";

  const effectiveSystemKey =
    (systemId ? extractSystemKey(systemId) : "") ||
    selectedStaffSystem ||
    loggedInUserSystem ||
    "system-0001";

  // Filter staff strictly by current system (system-0001, system-0002, system-0003, etc.) and active status (not on leave)
  const activeStaff = staffList.filter((st) => {
    if (isLeaveRole(st.role)) return false;
    return matchesSystem(st, effectiveSystemKey);
  });

  // Sort staff list by staff_id ascending (e.g. 0001, 0002, 0003...)
  const sortedStaff = [...activeStaff].sort((a, b) =>
    (a.id || "").localeCompare(b.id || "", undefined, { numeric: true }),
  );

  const filteredStaff = sortedStaff.filter((st) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (st.name && st.name.toLowerCase().includes(q)) ||
      (st.id && st.id.toLowerCase().includes(q)) ||
      (st.position && st.position.toLowerCase().includes(q)) ||
      (st.username && st.username.toLowerCase().includes(q))
    );
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isMobile ? "slide" : "fade"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          s.backdrop,
          {
            justifyContent: !isMobile ? "center" : "flex-end",
            alignItems: !isMobile ? "center" : "stretch",
            padding: !isMobile ? 16 : 0,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            s.sheet,
            {
              maxWidth: !isMobile ? 450 : "100%",
              width: !isMobile ? 450 : "100%",
              borderRadius: !isMobile ? 24 : undefined,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>Select Staff Member</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <MaterialIcons
                name="close"
                size={28}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={s.searchBox}>
            <Ionicons name="search" size={18} color={theme.colors.grey} />
            <TextInput
              style={s.searchInput}
              placeholder="Search staff name, ID, or position..."
              placeholderTextColor={theme.colors.grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.grey}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Staff List */}
          <ScrollView
            style={s.scrollList}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredStaff.length === 0 ? (
              <View style={s.emptyBox}>
                <Ionicons
                  name="people-outline"
                  size={36}
                  color={theme.colors.grey}
                />
                <Text style={s.emptyText}>No staff members found</Text>
              </View>
            ) : (
              filteredStaff.map((item) => {
                const isSelected = item.id === selectedStaffId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[s.staffCard, isSelected && s.staffCardSelected]}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(item.id);
                      onClose();
                    }}
                  >
                    <View
                      style={[s.avatarBg, isSelected && s.avatarBgSelected]}
                    >
                      <Ionicons
                        name="person"
                        size={20}
                        color={
                          isSelected
                            ? theme.colors.background2
                            : theme.colors.primary
                        }
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[s.staffName, isSelected && s.staffNameSelected]}
                      >
                        {item.name}
                      </Text>
                      <Text style={s.staffSub}>
                        ID: {item.id} • {item.position || "Staff Member"}
                      </Text>
                    </View>

                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.secondary}
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.grey}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.colors.background,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: `${theme.colors.grey}70`,
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  closeBtn: { padding: 0 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 12,
    marginHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    ...(Platform.OS === "web" &&
      ({ outlineStyle: "none", outlineWidth: 0 } as any)),
  },

  scrollList: {
    maxHeight: 400,
    paddingHorizontal: 15,
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 20,
  },

  staffCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.background2,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  staffCardSelected: {
    borderColor: theme.colors.secondary,
    backgroundColor: `${theme.colors.secondary}0D`,
  },
  avatarBg: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBgSelected: {
    backgroundColor: theme.colors.secondary,
  },
  staffName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  staffNameSelected: {
    color: theme.colors.secondary,
  },
  staffSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },

  emptyBox: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.grey,
    marginTop: 8,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
