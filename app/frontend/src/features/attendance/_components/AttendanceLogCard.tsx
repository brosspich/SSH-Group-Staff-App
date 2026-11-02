import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
  const badgeColor = isTimeIn ? "#0022ff" : isTimeOut ? "#ff0000" : "#7e22ce";

  return (
    <View style={styles.historyCard}>
      {/* Top Details */}
      <View style={styles.historyCardBody}>
        <View style={styles.historyLeftCol}>
          <Text style={styles.historyTimeText}>{record.time}</Text>
          <Text style={styles.historyDateText}>{record.date}</Text>
        </View>

        <View style={styles.historyRightCol}>
          <Text style={styles.historyStaffName}>{record.name}</Text>
          <Text style={styles.historyStaffId}>Staff ID: {record.staff_id}</Text>
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
    backgroundColor: AppColors.background2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.grey + 40,
    overflow: "hidden",
  },
  historyCardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  historyLeftCol: {},
  historyTimeText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyDateText: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  historyRightCol: {
    alignItems: "flex-end",
  },
  historyStaffName: {
    fontSize: 13.5,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyStaffId: {
    fontSize: 11.5,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  historyFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  historyQrText: {
    fontSize: 11,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
