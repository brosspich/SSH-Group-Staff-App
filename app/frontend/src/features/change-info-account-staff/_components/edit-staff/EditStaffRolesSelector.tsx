import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { AVAILABLE_ROLES } from "../../_utils/editStaffConstants";
import { editStaffStyles as styles } from "./EditStaffStyles";

interface EditStaffRolesSelectorProps {
  roles: string[];
  toggleRole: (role: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

export const EditStaffRolesSelector: React.FC<EditStaffRolesSelectorProps> = ({
  roles,
  toggleRole,
  isActive,
  setIsActive,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Assigned Roles */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {t("changeInfoStaff.assignedRoles", "Assigned Roles")}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rolesRow}
          style={styles.rolesScrollView}
        >
          {AVAILABLE_ROLES.map((r) => {
            const isSelected = roles.includes(r);
            return (
              <TouchableOpacity
                key={r}
                onPress={() => toggleRole(r)}
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
        </ScrollView>
      </View>

      {/* Active Account Switch */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.switchLabel}>
            {t("changeInfoStaff.activeAccount", "Active Account")}
          </Text>
          <Text style={styles.switchSub}>
            {t(
              "changeInfoStaff.activeAccountDesc",
              "Account active and allowed to record attendance",
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
    </>
  );
};
