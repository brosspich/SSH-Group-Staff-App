import EditStaffModal from "@/features/change-info-account-staff/_components/EditStaffModal";
import { useLanguage } from "@/features/language";
import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChangeInfoFilterBar } from "./_components/ChangeInfoFilterBar";
import { ChangeInfoSearchBar } from "./_components/ChangeInfoSearchBar";
import { ChangeInfoStaffCard } from "./_components/ChangeInfoStaffCard";
import { ChangeInfoUnauthorized } from "./_components/ChangeInfoUnauthorized";
import { useChangeInfoStaff } from "./_hooks/useChangeInfoStaff";

export default function ChangeInfoAccountStaffScr() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const {
    currentUser,
    checkingAuth,
    isAuthorized,
    isOwner,
    filteredStaff,
    loadingStaff,
    refreshing,
    onRefresh,
    searchQuery,
    isSearching,
    setSearchQuery,
    selectedSystemFilter,
    setSelectedSystemFilter,
    statusFilter,
    setStatusFilter,
    editingStaff,
    setEditingStaff,
    toastMessage,
    availableSystems,
    handleStaffSaved,
  } = useChangeInfoStaff();

  if (checkingAuth) {
    return <Loading />;
  }

  if (!isAuthorized) {
    return <ChangeInfoUnauthorized />;
  }

  return (
    <View style={styles.safe}>
      <AppbarBack
        Title={t("changeInfoStaff.title", "Change Info Account Staff")}
        fallbackRoute="/(tabs)/setting"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastBox}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.background2}
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Top Search & Filter Bar */}
      <ChangeInfoSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        staffCount={filteredStaff.length}
        isSearching={isSearching}
      />

      <ChangeInfoFilterBar
        isOwner={isOwner}
        selectedSystemFilter={selectedSystemFilter}
        setSelectedSystemFilter={setSelectedSystemFilter}
        availableSystems={availableSystems}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Staff List & Empty States */}
      {loadingStaff ? (
        <Loading />
      ) : filteredStaff.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={54} color={theme.colors.grey} />
          <Text style={styles.noStaffTitle}>
            {t("changeInfoStaff.noStaffFound", "No Staff Accounts Found")}
          </Text>
          <Text style={styles.noStaffSub}>
            {searchQuery
              ? t("changeInfoStaff.noStaffMatching", {
                  query: searchQuery,
                  defaultValue: `No accounts matching "${searchQuery}"`,
                })
              : t(
                  "changeInfoStaff.noStaffInSystem",
                  "No staff registered in this system.",
                )}
          </Text>
          <TouchableOpacity
            style={styles.createBtnSecondary}
            onPress={() => router.push("/account-staff/CreateAccountStaff")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add"
              size={18}
              color={theme.colors.background2}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.createBtnSecondaryText}>
              {t("changeInfoStaff.createNewStaff", "Create New Staff")}
            </Text>
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
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: insets.bottom + 40 },
          ]}
          renderItem={({ item }) => (
            <ChangeInfoStaffCard item={item} onEdit={setEditingStaff} />
          )}
        />
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <EditStaffModal
          visible={!!editingStaff}
          staff={editingStaff}
          currentUser={currentUser}
          onClose={() => setEditingStaff(null)}
          onSaved={handleStaffSaved}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  toastBox: {
    position: "absolute",
    top: 56,
    left: 20,
    right: 20,
    zIndex: 99,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.sm,
    // fontWeight: "600",
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  noStaffTitle: {
    fontSize: theme.fontSizes.lg,
    // fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 14,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  noStaffSub: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  createBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
  },
  createBtnSecondaryText: {
    color: theme.colors.background2,
    // fontWeight: "700",
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
