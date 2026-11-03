import EditStaffModal from "@/components/account-staff/EditStaffModal";
import AppbarBack from "@/components/appbar/appbarback";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
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
        Title="Change Info Account Staff"
        fallbackRoute="/(tabs)/setting"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastBox}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Top Search & Filter Bar */}
      <ChangeInfoSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        staffCount={filteredStaff.length}
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
            activeOpacity={0.8}
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
    backgroundColor: AppColors.background,
  },
  toastBox: {
    position: "absolute",
    top: 56,
    left: 20,
    right: 20,
    zIndex: 99,
    backgroundColor: AppColors.primary,
    borderRadius: 10,
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
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.textPrimary,
    marginTop: 14,
  },
  noStaffSub: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  createBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  createBtnSecondaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
