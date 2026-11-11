import { useLanguage } from "@/features/language";
import { Typography } from "@/shared/components/ui/Typography";
import { theme } from "@/shared/styles/theme";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { AuditActionType } from "../types/audit.types";

export interface LogFilterBarProps {
  selectedAction?: AuditActionType;
  onSelectAction: (action?: AuditActionType) => void;
}

export const LogFilterBar: React.FC<LogFilterBarProps> = ({
  selectedAction,
  onSelectAction,
}) => {
  const { t } = useLanguage();

  const actions: Array<{ label: string; value?: AuditActionType }> = [
    { label: t("auditLogs.allActions", "All") },
    { label: t("auditLogs.keysFilter", "Keys"), value: "KEY_UPLOADED" },
    { label: t("auditLogs.loginsFilter", "Logins"), value: "USER_LOGIN" },
    {
      label: t("auditLogs.attendanceFilter", "Attendance"),
      value: "ATTENDANCE_CHECKIN",
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
    >
      <View style={styles.container}>
        {actions.map((item) => {
          const isSelected = selectedAction === item.value;
          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => onSelectAction(item.value)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Typography
                variant="caption"
                color={
                  isSelected
                    ? theme.colors.background2
                    : theme.colors.textPrimary
                }
                weight="medium"
              >
                {item.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginVertical: theme.spacing.sm,
  },
  container: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
  },
});
