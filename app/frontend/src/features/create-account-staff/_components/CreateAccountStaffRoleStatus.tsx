import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
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
}) => {
  return (
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
                color={isSelected ? "#fff" : theme.colors.grey}
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
          trackColor={{ false: "#D1D5DB", true: theme.colors.primary }}
          thumbColor="#fff"
        />
      </View>

      {/* Joined Date */}
      <View style={[styles.fieldGroup, { marginTop: 14 }]}>
        <Text style={styles.label}>Joined Date (YYYY/MM/DD)</Text>
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
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  rolesRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
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
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  roleBadgeTextActive: {
    color: "#fff",
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
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  switchSub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
