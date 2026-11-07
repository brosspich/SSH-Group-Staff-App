import { theme } from "@/shared/styles/theme";
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
                { color: todayTimeIn ? "#0022ff" : theme.colors.grey },
              ]}
            >
              {todayTimeIn ? todayTimeIn.time : "None"}
            </Text>
          </View>
        </View>

        {/* Time-Out */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconBox, { backgroundColor: "#fedbdb" }]}>
            <Feather name="log-out" size={20} color={theme.colors.error} />
          </View>
          <View>
            <Text style={styles.summaryLabel}>
              TIME-OUT ({timeOutWindow.target})
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: todayTimeOut ? theme.colors.error : theme.colors.grey,
                },
              ]}
            >
              {todayTimeOut ? todayTimeOut.time : "None"}
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
                  color: todayOtherCount > 0 ? "#7e22ce" : theme.colors.grey,
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
    marginTop: theme.spacing.xl,
  },
  bgConSummary: {
    backgroundColor: theme.colors.background,
    height: 55,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopRightRadius: theme.borderRadius.md,
    borderTopLeftRadius: theme.borderRadius.md,
  },
  summaryRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    minWidth: 95,
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.grey + 70,
  },
  summaryIconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    lineHeight: 14,
  },
  summaryValue: {
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
