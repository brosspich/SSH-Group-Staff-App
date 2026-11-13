import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
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
  isSearching?: boolean;
}

export const ChangeInfoSearchBar: React.FC<ChangeInfoSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  staffCount,
  isSearching = false,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        {isSearching ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{ marginRight: 8 }}
          />
        ) : (
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.grey}
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          style={styles.searchInput}
          placeholder={t(
            "changeInfoStaff.searchPlaceholder",
            "Search staff name, ID, username...",
          )}
          placeholderTextColor={theme.colors.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={{ padding: 4 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.grey} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {t("changeInfoStaff.showingCount", {
            count: staffCount,
            defaultValue: `Showing ${staffCount} staff member${staffCount === 1 ? "" : "s"}`,
          })}
        </Text>
        <TouchableOpacity
          style={styles.createShortcutBtn}
          onPress={() => router.push("/account-staff/CreateAccountStaff")}
        >
          <Ionicons name="person-add" size={14} color={theme.colors.primary} />
          <Text style={styles.createShortcutText}>
            {t("changeInfoStaff.addNew", "Add New")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    // paddingTop: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}25`,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  countText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  createShortcutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs2,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.primary}18`,
    gap: 4,
    borderColor: theme.colors.primary + 50,
    borderWidth: 0.5,
  },
  createShortcutText: {
    fontSize: theme.fontSizes.xs,
    // fontWeight: "700",
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
