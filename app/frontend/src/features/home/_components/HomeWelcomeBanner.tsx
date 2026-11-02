import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { StaffUser } from "@/services/userService";
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
                    ? { backgroundColor: "#22c55e" }
                    : currentType === "time-out"
                      ? { backgroundColor: "#ef4444" }
                      : { backgroundColor: "#a855f7" },
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
    paddingHorizontal: 20,
  },
  bannerUserInfo: {
    width: "100%",
  },
  bannerGreeting: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.85)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  bannerName: {
    fontSize: 18,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    marginVertical: 3,
  },
  bannerBotton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 6,
  },
  bannerMetaRow: {
    width: "50%",
    gap: 7,
    paddingRight: 4,
  },
  bannerBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  bannerBadgeText: {
    fontSize: 11,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  clockBox: {
    width: "50%",
    alignItems: "flex-end",
    paddingLeft: 4,
  },
  clockTime: {
    fontSize: 18,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    textAlign: "right",
  },
  clockDate: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
    textAlign: "right",
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 6,
    gap: 5,
    alignSelf: "flex-end",
  },
  shiftDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  shiftBadgeText: {
    fontSize: 10,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
