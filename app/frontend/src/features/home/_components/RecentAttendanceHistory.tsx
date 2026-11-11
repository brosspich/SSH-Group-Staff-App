import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AttendanceRecord } from "../_types/home.types";

interface RecentAttendanceHistoryProps {
  attendanceList: AttendanceRecord[];
  onViewAll: () => void;
}

export const RecentAttendanceHistory: React.FC<
  RecentAttendanceHistoryProps
> = ({ attendanceList, onViewAll }) => {
  const { t } = useLanguage();

  return (
    <>
      {/* ── Recent History Section ── */}
      <View style={styles.historyHeaderRow}>
        <Text style={styles.sectionTitle}>
          {t("home.recentAttendanceLogs")}
        </Text>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>
            {`${t("home.viewAll")} (${attendanceList.length})`}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Recent History List (First 4) */}
      {!Array.isArray(attendanceList) || attendanceList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="calendar-outline"
            size={42}
            color={theme.colors.grey}
          />
          <Text style={styles.emptyTitle}>{t("home.noRecords")}</Text>
          <Text style={styles.emptySub}>{t("home.noRecordsDesc")}</Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {[...attendanceList]
            .sort((a, b) => {
              const tA = new Date(
                a.timestamp || a.createdAt || a.date || 0,
              ).getTime();
              const tB = new Date(
                b.timestamp || b.createdAt || b.date || 0,
              ).getTime();
              return tB - tA;
            })
            .slice(0, 4)
            .map((item, index) => {
              if (!item || typeof item !== "object") return null;

              const itemType = String(item.type || "")
                .toLowerCase()
                .replace(/_/g, "-");
              const isTimeIn = itemType === "time-in";
              const isTimeOut = itemType === "time-out";

              const badgeBg = isTimeIn
                ? `${theme.colors.primary}15`
                : isTimeOut
                  ? `${theme.colors.error}15`
                  : `${theme.colors.secondary}15`;
              const badgeColor = isTimeIn
                ? theme.colors.primary
                : isTimeOut
                  ? theme.colors.error
                  : theme.colors.secondary;

              const rawTime =
                item.time ||
                (item as any).scanTime ||
                (typeof item.timestamp === "string"
                  ? item.timestamp.split("T")[1]?.slice(0, 8)
                  : "");
              const displayTime =
                typeof rawTime === "object"
                  ? JSON.stringify(rawTime)
                  : String(rawTime || "—");

              const rawDate =
                item.date ||
                (item as any).scanDate ||
                (typeof item.timestamp === "string"
                  ? item.timestamp.split("T")[0]
                  : "");
              const displayDate =
                typeof rawDate === "object"
                  ? JSON.stringify(rawDate)
                  : String(rawDate || "—");

              const rawStaffId =
                item.staff_id ||
                (item as any).userId ||
                (item as any).staffId ||
                "";
              const displayStaffId =
                typeof rawStaffId === "object"
                  ? JSON.stringify(rawStaffId)
                  : String(rawStaffId || "—");

              const rawName = item.name || "";
              const displayName =
                typeof rawName === "object"
                  ? (rawName as any)?.name || JSON.stringify(rawName)
                  : String(rawName || "—");

              const itemKey = `${item.id || "att"}_${item.timestamp || ""}_${index}`;

              return (
                <View key={itemKey} style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <View
                      style={[
                        styles.historyBadge,
                        { backgroundColor: badgeBg },
                      ]}
                    >
                      <Text
                        style={[styles.historyBadgeText, { color: badgeColor }]}
                      >
                        {String(item.type || "time-in").toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.historyItemTime}>{displayTime}</Text>
                      <Text style={styles.historyItemDate}>{displayDate}</Text>
                    </View>
                  </View>

                  <View style={styles.historyItemRight}>
                    <Text style={styles.historyStaffName}>{displayName}</Text>
                    <Text style={styles.historyStaffId}>
                      ID: {displayStaffId}
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  viewAllText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  historyList: {
    gap: theme.spacing.sm,
  },
  historyItem: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.grey + 40,
    marginHorizontal: theme.spacing.md,
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  historyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  historyBadgeText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  historyItemTime: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  historyItemDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  historyItemRight: {
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
  emptyCard: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.grey,
    textAlign: "center",
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
