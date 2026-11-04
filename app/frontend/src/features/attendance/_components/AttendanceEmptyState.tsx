import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
        <Ionicons name="calendar-outline" size={44} color={AppColors.grey} />
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
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
  },
  emptyTitle: {
    fontSize: 16,
    color: AppColors.textPrimary,
    marginTop: 12,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: 12.5,
    color: AppColors.grey,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
