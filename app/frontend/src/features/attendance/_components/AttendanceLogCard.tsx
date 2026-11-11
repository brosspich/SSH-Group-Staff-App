import { useLanguage } from "@/features/language";
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
  const { t } = useLanguage();
  const isTimeIn = record.type === "time-in";
  const isTimeOut = record.type === "time-out";

  const badgeBg = isTimeIn
    ? theme.colors.timeInBg
    : isTimeOut
      ? theme.colors.timeOutBg
      : theme.colors.timeOtherBg;
  const badgeColor = isTimeIn
    ? theme.colors.timeIn
    : isTimeOut
      ? theme.colors.timeOut
      : theme.colors.timeOther;

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
          <Text style={styles.historyStaffId}>
            {t("attendance.staffId", "Staff ID")}: {displayStaffId}
          </Text>
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
            {t("attendance.statusLabel", "Status")} :{" "}
            {record.type != null ? String(record.type).toUpperCase() : ""}
          </Text>
          <Text
            style={[styles.historyQrText, { color: badgeColor }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {t("attendance.id", "ID Record")} :{" "}
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
    // flexDirection: "row",
    // justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  historyQrText: {
    flex: 1,
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    flexShrink: 1,
  },
});
