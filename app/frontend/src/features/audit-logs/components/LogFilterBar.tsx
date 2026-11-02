import { Typography } from "@/components/ui/Typography";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { AuditActionType } from "../types/audit.types";

export interface LogFilterBarProps {
  selectedAction?: AuditActionType;
  onSelectAction: (action?: AuditActionType) => void;
}

const ACTIONS: Array<{ label: string; value?: AuditActionType }> = [
  { label: "All" },
  { label: "SSH Groups", value: "SSH_GROUP_CREATED" },
  { label: "Keys", value: "KEY_UPLOADED" },
  { label: "Logins", value: "USER_LOGIN" },
  { label: "Attendance", value: "ATTENDANCE_CHECKIN" },
];

export const LogFilterBar: React.FC<LogFilterBarProps> = ({
  selectedAction,
  onSelectAction,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
    >
      <View style={styles.container}>
        {ACTIONS.map((item) => {
          const isSelected = selectedAction === item.value;
          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => onSelectAction(item.value)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Typography
                variant="caption"
                color={isSelected ? "#FFFFFF" : "#333333"}
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
    marginVertical: 8,
  },
  container: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#E5E5EA",
  },
  chipActive: {
    backgroundColor: "#007AFF",
  },
});
