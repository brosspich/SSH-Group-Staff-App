import { theme } from "@/shared/styles/theme";
import { StaffUser } from "@/shared/services/userService";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AttendanceType } from "../_types/home.types";
import { formatTime12h } from "../_utils/homeUtils";

interface HomeWelcomeBannerProps {
  user: StaffUser | null;
  currentTime: Date;
  currentType: AttendanceType;
}

export const HomeWelcomeBanner: React.FC<HomeWelcomeBannerProps> = ({
  user,
  currentTime,
  currentType,
}) => {
  return (
    <View style={styles.bannerTop}>
      <View style={styles.bannerUserInfo}>
        <Text style={styles.bannerGreeting}>Welcome back!</Text>
        <Text style={styles.bannerName} numberOfLines={1}>
          {user?.name ?? "Staff Member"}
        </Text>
        <View style={styles.bannerBotton}>
          <View style={styles.bannerMetaRow}>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>ID : {user?.id ?? "—"}</Text>
            </View>
            <View style={styles.bannerBadge}>
              <Text
                style={styles.bannerBadgeText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.position ?? "-"}
              </Text>
            </View>
          </View>
          <View style={styles.clockBox}>
            <Text style={styles.clockTime}>{formatTime12h(currentTime)}</Text>
            <Text style={styles.clockDate}>
              {currentTime.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
            <View style={styles.shiftBadge}>
              <View
                style={[
                  styles.shiftDot,
                  currentType === "time-in"
                    ? { backgroundColor: theme.colors.success }
                    : currentType === "time-out"
                      ? { backgroundColor: theme.colors.error }
                      : { backgroundColor: theme.colors.secondary },
                ]}
              />
              <Text style={styles.shiftBadgeText}>
                Current: {currentType.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerTop: {
    paddingHorizontal: theme.spacing.lg,
  },
  bannerUserInfo: {
    width: "100%",
  },
  bannerGreeting: {
    fontSize: theme.fontSizes.xs,
    color: "rgba(255,255,255,0.85)",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  bannerName: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    marginVertical: theme.spacing.xs,
  },
  bannerBotton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: theme.spacing.sm,
  },
  bannerMetaRow: {
    width: "50%",
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
  },
  bannerBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  bannerBadgeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  clockBox: {
    width: "50%",
    alignItems: "flex-end",
    paddingLeft: theme.spacing.xs,
  },
  clockTime: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    textAlign: "right",
  },
  clockDate: {
    fontSize: theme.fontSizes.xs,
    color: "rgba(255,255,255,0.85)",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
    textAlign: "right",
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.xs,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
    alignSelf: "flex-end",
  },
  shiftDot: {
    width: 6,
    height: 6,
    borderRadius: theme.borderRadius.xs,
    backgroundColor: theme.colors.success,
  },
  shiftBadgeText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
