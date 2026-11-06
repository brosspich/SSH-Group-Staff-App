import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AttendanceEmptyStateProps {
  searchQuery: string;
}

export const AttendanceEmptyState: React.FC<AttendanceEmptyStateProps> = React.memo(
  ({ searchQuery }) => {
    return (
      <View style={styles.emptyCard}>
        <Ionicons name="calendar-outline" size={44} color={theme.colors.grey} />
        <Text style={styles.emptyTitle}>No Logs Found</Text>
        <Text style={styles.emptySub}>
          {searchQuery
            ? `No attendance records matching "${searchQuery}".`
            : "Scan an official QR code to record attendance."}
        </Text>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    textAlign: "center",
    marginTop: theme.spacing.xs,
    lineHeight: 18,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
