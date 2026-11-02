import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AttendanceRecord } from "../_types/home.types";

interface TodayAttendanceSummaryProps {
  timeInWindow: { target: string; start: string; end: string };
  timeOutWindow: { target: string; start: string; end: string };
  todayTimeIn: AttendanceRecord | undefined;
  todayTimeOut: AttendanceRecord | undefined;
  todayOtherCount: number;
}

export const TodayAttendanceSummary: React.FC<TodayAttendanceSummaryProps> = ({
  timeInWindow,
  timeOutWindow,
  todayTimeIn,
  todayTimeOut,
  todayOtherCount,
}) => {
  return (
    <View style={styles.conSummary}>
      <View style={styles.bgConSummary} />
      <View style={styles.summaryRow}>
        {/* Time-In */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconBox, { backgroundColor: "#dce0fc" }]}>
            <Feather name="log-in" size={20} color="#0022ff" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>
              TIME-IN ({timeInWindow.target})
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: todayTimeIn ? "#0022ff" : AppColors.grey },
              ]}
            >
              {todayTimeIn ? todayTimeIn.time : "Not Scanned"}
            </Text>
          </View>
        </View>

        {/* Time-Out */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconBox, { backgroundColor: "#fedbdb" }]}>
            <Feather name="log-out" size={20} color="#ff0000" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>
              TIME-OUT ({timeOutWindow.target})
            </Text>
            <Text
              style={[
                styles.summaryValue,
                { color: todayTimeOut ? "#ff0000" : AppColors.grey },
              ]}
            >
              {todayTimeOut ? todayTimeOut.time : "Not Scanned"}
            </Text>
          </View>
        </View>

        {/* Time-Other */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconBox, { backgroundColor: "#f3e8ff" }]}>
            <MaterialCommunityIcons
              name="clock-time-four-outline"
              size={20}
              color="#7e22ce"
            />
          </View>
          <View>
            <Text style={styles.summaryLabel}>TIME-OTHER</Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: todayOtherCount > 0 ? "#7e22ce" : AppColors.grey,
                },
              ]}
            >
              {todayOtherCount > 0 ? `${todayOtherCount} Record(s)` : "None"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  conSummary: {
    marginTop: 30,
  },
  bgConSummary: {
    backgroundColor: AppColors.background,
    height: 55,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    paddingHorizontal: 20,
  },
  summaryCard: {
    flex: 1,
    minWidth: 95,
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    padding: 12,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1.5,
    borderColor: AppColors.grey + 70,
  },
  summaryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 9.5,
    color: AppColors.grey,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    lineHeight: 12,
  },
  summaryValue: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
