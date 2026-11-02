import EditStaffModal from "@/components/account-staff/EditStaffModal";
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
import { StaffUser, userService } from "@/services/userService";
import { getTwoInitials } from "@/utils/formatters";
import {
  formatRolesList,
  hasAdminOrOwnerRole,
  isLeaveRole,
  isOwnerRole,
} from "@/utils/roleUtils";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangeInfoAccountStaff() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();

  // Access Control & Current User
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Staff Data
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystemFilter, setSelectedSystemFilter] =
    useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "admin"
  >("all");

  // Edit Modal State
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [availableSystems, setAvailableSystems] = useState<DynamicSystemItem[]>(
    [{ id: "system-0001" }, { id: "system-0002" }],
  );

  // Check auth
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
          const owner = isOwnerRole(u.role);
          setSelectedSystemFilter(owner ? "all" : sys);
          await fetchStaffList(owner ? "all" : sys);

          if (owner) {
            const systems = await fetchAvailableCompanySystems();
            if (mounted && systems.length > 0) {
              setAvailableSystems(systems);
            }
          }
        }
      } catch (e) {
        console.warn("Failed checking user auth in change info:", e);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchStaffList = async (_systemFilter?: string) => {
    setLoadingStaff(true);
    try {
      const { data, error } = await supabase
        .from("ssh_group_staff_users")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setStaffList((data as StaffUser[]) || []);
    } catch (e) {
      console.warn("Error fetching staff list:", e);
    } finally {
      setLoadingStaff(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStaffList();
  }, []);

  const isOwner = isOwnerRole(currentUser?.role);
  const currentAdminSystem = extractSystemKey(currentUser?.system_id);

  // Filtered staff records
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      // 1. System isolation:
      // If not owner, admin can ONLY view staff in their own system key
      const staffSys = extractSystemKey(staff.system_id);
      if (!isOwner && staffSys !== currentAdminSystem) {
        return false;
      }

      // If owner and a specific system filter is selected
      if (
        isOwner &&
        selectedSystemFilter !== "all" &&
        staffSys !== selectedSystemFilter
      ) {
        return false;
      }

      // 2. Status filter
      if (statusFilter === "active" && staff.is_active === false) return false;
      if (statusFilter === "inactive" && staff.is_active !== false)
        return false;
      if (statusFilter === "admin") {
        const roles = formatRolesList(staff.role);
        if (!roles.includes("admin") && !roles.includes("owner")) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (staff.name || "").toLowerCase().includes(query);
        const usernameMatch = (staff.username || "")
          .toLowerCase()
          .includes(query);
        const idMatch = (staff.id || "").toLowerCase().includes(query);
        const posMatch = (staff.position || "").toLowerCase().includes(query);
        const sysMatch = (staff.system_id || "").toLowerCase().includes(query);
        if (
          !nameMatch &&
          !usernameMatch &&
          !idMatch &&
          !posMatch &&
          !sysMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    staffList,
    isOwner,
    currentAdminSystem,
    selectedSystemFilter,
    statusFilter,
    searchQuery,
  ]);

  // Open Edit Modal for a given staff member
  const handleOpenEdit = (staff: StaffUser) => {
    setEditingStaff(staff);
  };

  const handleCloseEdit = () => {
    setEditingStaff(null);
  };

  const handleStaffSaved = (updatedStaff: StaffUser) => {
    if (currentUser?.id === updatedStaff.id) {
      setCurrentUser(updatedStaff);
    }
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === updatedStaff.id ? { ...s, ...updatedStaff } : s,
      ),
    );
    setEditingStaff(null);
    showToast(`Updated account for ${updatedStaff.name}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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
          Title="Change Info Account Staff"
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

  return (
    <View style={styles.safe}>
      <AppbarBack
        Title="Change Info Account Staff"
        fallbackRoute="/(tabs)/setting"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastBox}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={AppColors.background2}
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Top Controls & Search Bar */}
      <View style={styles.topControlSection}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={AppColors.grey}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff name, ID, username..."
            placeholderTextColor={AppColors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ padding: 4 }}
            >
              <Ionicons name="close-circle" size={18} color={AppColors.grey} />
            </TouchableOpacity>
          )}
        </View>

        {/* System Filter for Owner */}
        {isOwner && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterChipScroll}
          >
            {[
              { label: "All Systems", value: "all" },
              ...availableSystems.map((s) => ({
                label: s.companyName
                  ? `${s.id.toUpperCase()} • ${s.companyName}`
                  : s.id.toUpperCase(),
                value: s.id,
              })),
            ].map((item) => {
              const active = selectedSystemFilter === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setSelectedSystemFilter(item.value)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Status Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterChipScroll}
        >
          {[
            { label: "All Staff", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Admins / Owners", value: "admin" },
          ].map((item) => {
            const active = statusFilter === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setStatusFilter(item.value as any)}
                style={[styles.statusChip, active && styles.statusChipActive]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    active && styles.statusChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing{" "}
            <Text style={{ fontWeight: "700" }}>{filteredStaff.length}</Text>{" "}
            staff member
            {filteredStaff.length === 1 ? "" : "s"}
          </Text>
          <TouchableOpacity
            style={styles.createShortcutBtn}
            onPress={() => router.push("/account-staff/CreateAccountStaff")}
          >
            <Ionicons name="person-add" size={14} color={AppColors.primary} />
            <Text style={styles.createShortcutText}>Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Staff List */}
      {loadingStaff ? (
        // <View style={styles.centerContainer}>
        //   <ActivityIndicator size="large" color={AppColors.primary} />
        //   <Text style={styles.loadingText}>Loading staff accounts...</Text>
        // </View>
        <>
          <Loading />
        </>
      ) : filteredStaff.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="people-outline" size={54} color={AppColors.grey} />
          <Text style={styles.noStaffTitle}>No Staff Accounts Found</Text>
          <Text style={styles.noStaffSub}>
            {searchQuery
              ? `No accounts matching "${searchQuery}"`
              : "No staff registered in this system."}
          </Text>
          <TouchableOpacity
            style={styles.createBtnSecondary}
            onPress={() => router.push("/account-staff/CreateAccountStaff")}
          >
            <Ionicons
              name="add"
              size={18}
              color={AppColors.background2}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.createBtnSecondaryText}>Create New Staff</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredStaff}
          keyExtractor={(item) => item.id || item.username}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[AppColors.primary]}
              tintColor={AppColors.primary}
            />
          }
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: insets.bottom + 40 },
          ]}
          renderItem={({ item }) => {
            const roles = formatRolesList(item.role);
            const isActive = item.is_active !== false;
            const isLeave = isLeaveRole(item.role);

            return (
              <View style={styles.staffCard}>
                <View style={styles.cardHeader}>
                  {/* Avatar */}
                  <LinearGradient
                    colors={
                      isActive
                        ? [AppColors.primary, AppColors.secondary]
                        : ["#9CA3AF", "#6B7280"]
                    }
                    style={styles.avatarCircle}
                  >
                    <Text style={styles.avatarInitials}>
                      {getTwoInitials(item.name)}
                    </Text>
                  </LinearGradient>

                  {/* Staff Info */}
                  <View style={styles.staffDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.staffName} numberOfLines={1}>
                        {item.name || "Staff Member"}
                      </Text>
                      {/* Active Status Badge */}
                      <View
                        style={[
                          styles.statusBadge,
                          isActive
                            ? styles.statusBadgeActive
                            : styles.statusBadgeInactive,
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor: isActive ? "#22c55e" : "#ef4444",
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isActive
                              ? styles.statusBadgeTextActive
                              : styles.statusBadgeTextInactive,
                          ]}
                        >
                          {isLeave ? "LEAVE" : isActive ? "ACTIVE" : "INACTIVE"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.staffUsername}>@{item.username}</Text>

                    {/* Metadata tags */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>ID: {item.id}</Text>
                      </View>
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>
                          {item.position || "Staff"}
                        </Text>
                      </View>
                      {item.system_id && (
                        <View style={styles.systemBadge}>
                          <Text style={styles.systemBadgeText}>
                            {extractSystemKey(item.system_id)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Role badges & Action Button */}
                <View style={styles.cardFooter}>
                  <View style={styles.rolesContainer}>
                    {roles.map((r) => (
                      <View
                        key={r}
                        style={[
                          styles.roleTag,
                          r === "admin"
                            ? styles.roleTagAdmin
                            : r === "owner"
                              ? styles.roleTagOwner
                              : styles.roleTagStaff,
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleTagText,
                            r === "admin"
                              ? styles.roleTagTextAdmin
                              : r === "owner"
                                ? styles.roleTagTextOwner
                                : styles.roleTagTextStaff,
                          ]}
                        >
                          {r.toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEdit(item)}
                  >
                    <Ionicons
                      name="create-outline"
                      size={16}
                      color={AppColors.primary}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.editBtnText}>Edit Info</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ── Edit Staff Modal Component ── */}
      <EditStaffModal
        visible={!!editingStaff}
        staff={editingStaff}
        currentUser={currentUser}
        onClose={handleCloseEdit}
        onSaved={handleStaffSaved}
      />
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
    includeFontPadding: false,
    maxWidth: 300,
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
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  toastBox: {
    position: "absolute",
    top: 90,
    alignSelf: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9999,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: AppColors.background2,
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 13,
  },
  topControlSection: {
    backgroundColor: AppColors.background2,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.grey + 70,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  filterChipScroll: {
    marginTop: 10,
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: AppColors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: AppColors.grey + 70,
  },
  filterChipActive: {
    backgroundColor: `${AppColors.primary}18`,
    borderColor: AppColors.primary,
  },
  filterChipText: {
    fontSize: 12,
    // fontWeight: "600",
    color: AppColors.textSecondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  filterChipTextActive: {
    color: AppColors.primary,
    // fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: AppColors.background,
    marginRight: 6,
    borderWidth: 1,
    borderColor: AppColors.grey + 70,
  },
  statusChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  statusChipText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    // fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  statusChipTextActive: {
    color: AppColors.background2,
    // fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingBottom: 4,
  },
  countText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  createShortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: `${AppColors.primary}15`,
  },
  createShortcutText: {
    fontSize: 12,
    // fontWeight: "600",
    color: AppColors.primary,
    marginLeft: 4,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  listContainer: {
    padding: 16,
  },
  staffCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.grey + 70,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarInitials: {
    color: AppColors.background2,
    fontSize: 16,
    // fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  staffDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  staffName: {
    fontSize: 16,
    // fontWeight: "700",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    flex: 1,
    marginRight: 8,
    includeFontPadding: false,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeInactive: {
    backgroundColor: "#FEE2E2",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusBadgeTextActive: {
    color: "#15803D",
  },
  statusBadgeTextInactive: {
    color: "#B91C1C",
  },
  staffUsername: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    marginTop: 2,
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  metaBadge: {
    backgroundColor: AppColors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 11,
    color: "#4B5563",
    // fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  systemBadge: {
    backgroundColor: `${AppColors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  systemBadgeText: {
    fontSize: 11,
    color: AppColors.primary,
    // fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: AppColors.grey + 70,
  },
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleTagStaff: {
    backgroundColor: AppColors.background,
  },
  roleTagAdmin: {
    backgroundColor: "#FEF3C7",
  },
  roleTagOwner: {
    backgroundColor: "#EDE9FE",
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  roleTagTextStaff: {
    color: "#4B5563",
  },
  roleTagTextAdmin: {
    color: "#B45309",
  },
  roleTagTextOwner: {
    color: "#6D28D9",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: `${AppColors.primary}12`,
    borderWidth: 1,
    borderColor: `${AppColors.primary}33`,
  },
  editBtnText: {
    fontSize: 12,
    // fontWeight: "600",
    color: AppColors.primary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  noStaffTitle: {
    fontSize: 18,
    // fontWeight: "700",
    color: AppColors.textPrimary,
    marginTop: 12,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  noStaffSub: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  createBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 18,
  },
  createBtnSecondaryText: {
    color: AppColors.background2,
    // fontWeight: "600",
    fontSize: 14,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
