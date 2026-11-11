import { theme } from "@/shared/styles/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { ComponentType, createElement } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface InfoRowProps {
  iconName: string;
  icon: ComponentType<any>;
  label: string;
  value?: string | number | null;
  edit?: () => void;
  iconColor?: string;
}

export function InfoRow({
  iconName,
  icon,
  label,
  value,
  edit,
  iconColor = theme.colors.secondary,
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.leftContainer}>
        <View style={styles.infoIconBox}>
          {createElement(icon, {
            name: iconName,
            size: 18,
            color: iconColor,
          })}
        </View>
        <View style={styles.infoText}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue} numberOfLines={2}>
            {value ?? "—"}
          </Text>
        </View>
      </View>
      {edit ? (
        <TouchableOpacity style={styles.editBtn} onPress={edit} hitSlop={8}>
          <MaterialIcons name="edit" size={18} color={theme.colors.secondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: `${theme.colors.grey}30`,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.secondary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.medium,
    includeFontPadding: false,
  },
  editBtn: {
    padding: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.secondary}15`,
  },
});

export default InfoRow;
