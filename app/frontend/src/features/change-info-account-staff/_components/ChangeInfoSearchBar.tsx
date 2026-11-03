import { AppColors } from "@/constants/appcolors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChangeInfoSearchBarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  staffCount: number;
}

export const ChangeInfoSearchBar: React.FC<ChangeInfoSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  staffCount,
}) => {
  return (
    <View style={styles.container}>
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

      <View style={styles.countRow}>
        <Text style={styles.countText}>
          Showing <Text style={{ fontWeight: "700" }}>{staffCount}</Text> staff
          member
          {staffCount === 1 ? "" : "s"}
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
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: `${AppColors.grey}25`,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  countText: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  createShortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: `${AppColors.primary}18`,
    gap: 4,
  },
  createShortcutText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.primary,
  },
});
