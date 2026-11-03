import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DeviceSession } from "../_types/devices.types";
import { formatListLastActive } from "../_utils/devicesDateUtils";
import DeviceOSIcon from "./DeviceOSIcon";

interface ActiveSessionsSectionProps {
  activeSessions: DeviceSession[];
  onSelectDevice: (device: DeviceSession) => void;
}

export default function ActiveSessionsSection({
  activeSessions,
  onSelectDevice,
}: ActiveSessionsSectionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionHeader}>Active sessions</Text>
      <View style={styles.divider} />
      {activeSessions.length > 0 ? (
        activeSessions.map((session, index) => {
          const lastActiveText = formatListLastActive(session.last_active);
          return (
            <React.Fragment key={session.id}>
              {index > 0 && <View style={styles.divider} />}
              <Pressable
                style={({ pressed }) => [
                  styles.sessionItem,
                  {
                    backgroundColor: pressed
                      ? `${AppColors.grey}33`
                      : AppColors.transparent,
                  },
                ]}
                onPress={() => onSelectDevice(session)}
              >
                <DeviceOSIcon
                  os={session.os}
                  isLarge={false}
                  deviceType={session.device_type}
                />
                <View style={styles.sessionDetails}>
                  <Text style={styles.deviceNameText}>
                    {session.device_name}
                  </Text>
                  <Text style={styles.sessionSubtext}>
                    {`SSH Group POS ${session.device_type === "web" || session.os === "Web" ? "Web" : session.os} ${session.app_version}`}
                  </Text>
                  <Text style={styles.locationStatusText}>
                    {`${session.location} • `}
                    {lastActiveText === "online" ? (
                      <Text style={styles.onlineColor}>online</Text>
                    ) : (
                      lastActiveText
                    )}
                  </Text>
                </View>
              </Pressable>
            </React.Fragment>
          );
        })
      ) : (
        <View style={styles.emptySession}>
          <Text style={styles.emptyText}>No other active sessions</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  sectionHeader: {
    fontSize: 14,
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  deviceNameText: {
    fontSize: 15,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    color: AppColors.textPrimary,
  },
  sessionSubtext: {
    fontSize: 13,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  locationStatusText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  onlineColor: {
    color: "#00c853",
    fontWeight: "600",
  },
  emptySession: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
