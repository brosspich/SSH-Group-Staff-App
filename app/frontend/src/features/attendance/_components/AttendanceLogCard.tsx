import { theme } from "@/shared/styles/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AttendanceRecord } from "../_types/attendance.types";

interface AttendanceLogCardProps {
  record: AttendanceRecord;
}

export const AttendanceLogCard: React.FC<AttendanceLogCardProps> = ({
  record,
}) => {
  const isTimeIn = record.type === "time-in";
  const isTimeOut = record.type === "time-out";

  const badgeBg = isTimeIn ? "#dce0fc" : isTimeOut ? "#fedbdb" : "#f3e8ff";
  const badgeColor = isTimeIn ? "#0022ff" : isTimeOut ? theme.colors.error : "#7e22ce";

  const displayTime =
    record.time ||
    (record as any).scanTime ||
    (record.timestamp ? record.timestamp.split("T")[1]?.slice(0, 8) : "");
  const displayDate =
    record.date ||
    (record as any).scanDate ||
    (record.timestamp ? record.timestamp.split("T")[0] : "");
  const displayStaffId =
    record.staff_id || (record as any).userId || (record as any).staffId || "";
  const displayName = record.name || "";

  return (
    <View style={styles.historyCard}>
      {/* Top Details */}
      <View style={styles.historyCardBody}>
        <View style={styles.historyLeftCol}>
          <Text style={styles.historyTimeText}>{displayTime}</Text>
          <Text style={styles.historyDateText}>{displayDate}</Text>
        </View>

        <View style={styles.historyRightCol}>
          <Text style={styles.historyStaffName}>{displayName}</Text>
          <Text style={styles.historyStaffId}>Staff ID: {displayStaffId}</Text>
        </View>
      </View>

      {/* Bottom Status Banner */}
      {record.type && (
        <View style={[styles.historyFooter, { backgroundColor: badgeBg }]}>
          <Text
            style={[styles.historyQrText, { color: badgeColor }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            Status :{" "}
            {record.type != null ? String(record.type).toUpperCase() : ""}
          </Text>
          <Text
            style={[styles.historyQrText, { color: badgeColor }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {record.id != null ? String(record.id).toUpperCase() : ""}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.grey + 40,
    overflow: "hidden",
    marginHorizontal: theme.spacing.md,
  },
  historyCardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  historyLeftCol: {},
  historyTimeText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  historyDateText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  historyRightCol: {
    alignItems: "flex-end",
  },
  historyStaffName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  historyStaffId: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  historyFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  historyQrText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
