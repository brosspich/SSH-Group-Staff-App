import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AVAILABLE_ROLES } from "../_utils/createAccountStaffUtils";

interface CreateAccountStaffRoleStatusProps {
  selectedRoles: string[];
  toggleRole: (role: string) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  joinedDate: string;
  setJoinedDate: (v: string) => void;
  dob?: string;
  setDob?: (v: string) => void;
}

export const CreateAccountStaffRoleStatus: React.FC<
  CreateAccountStaffRoleStatusProps
> = ({
  selectedRoles,
  toggleRole,
  isActive,
  setIsActive,
  joinedDate,
  setJoinedDate,
  dob = "",
  setDob,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>
        {t("createAccountStaff.roleAccountStatus", "Role & Account Status")}
      </Text>

      {/* Roles */}
      <Text style={styles.label}>
        {t("createAccountStaff.assignedRoles", "Assigned Roles")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rolesRow}
        style={styles.rolesScrollView}
      >
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
                {role.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active Switch */}
      <View style={styles.switchRow}>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.switchLabel}>
            {t("createAccountStaff.activeAccount", "Active Account")}
          </Text>
          <Text style={styles.switchSub}>
            {t(
              "createAccountStaff.activeAccountDesc",
              "Staff can log in and record attendance",
            )}
          </Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.background2}
        />
      </View>

      {/* Joined Date */}
      <View style={[styles.fieldGroup, { marginTop: 14 }]}>
        <Text style={styles.label}>
          {t("createAccountStaff.joinedDate", "Joined Date (YYYY/MM/DD)")}
        </Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.grey}
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.textInput}
            value={joinedDate}
            onChangeText={setJoinedDate}
            placeholder="YYYY/MM/DD"
            placeholderTextColor={theme.colors.grey}
          />
        </View>
      </View>

      {/* Date of Birth */}
      {setDob && (
        <View style={[styles.fieldGroup, { marginTop: 14 }]}>
          <Text style={styles.label}>
            {t("createAccountStaff.dob", "Date of Birth (YYYY/MM/DD)")}
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.grey}
              style={styles.fieldIcon}
            />
            <TextInput
              style={styles.textInput}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY/MM/DD"
              placeholderTextColor={theme.colors.grey}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}25`,
  },
  cardSectionTitle: {
    fontSize: theme.fontSizes.md,
    // fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 14,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    // fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 6,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
  rolesScrollView: {
    marginBottom: 16,
  },
  rolesRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 2,
  },
  roleBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.grey}15`,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
  },
  roleBadgeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleBadgeText: {
    fontSize: theme.fontSizes.sm,
    // fontWeight: "600",
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
  roleBadgeTextActive: {
    color: theme.colors.background2,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: `${theme.colors.grey}20`,
  },
  switchLabel: {
    fontSize: theme.fontSizes.sm,
    // fontWeight: "600",
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
  switchSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    flexShrink: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.grey}15`,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.grey}30`,
    paddingHorizontal: 12,
    height: 46,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
});
