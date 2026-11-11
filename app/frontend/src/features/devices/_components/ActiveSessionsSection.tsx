import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
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
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionHeader}>{t("devices.activeSessions")}</Text>
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
                      ? `${theme.colors.grey}33`
                      : theme.colors.transparent,
                  },
                ]}
                onPress={() => onSelectDevice(session)}
              >
                <DeviceOSIcon
                  os={session.os}
                  deviceName={session.device_name}
                  modelName={session.model_name}
                  isLarge={false}
                  deviceType={session.device_type}
                />
                <View style={styles.sessionDetails}>
                  <Text style={styles.deviceNameText}>
                    {session.device_name}
                  </Text>
                  <Text style={styles.sessionSubtext}>
                    {`SSH Group POS ${session.device_type === "web" || session.os === "Web" ? "Web" : session.os} ${session.app_version || (session as any).appVersion || "1.0.1.10311"}`}
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
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  sectionHeader: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
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
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    color: theme.colors.textPrimary,
  },
  sessionSubtext: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  locationStatusText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  onlineColor: {
    color: theme.colors.success,
    fontFamily: theme.fonts.semibold,
    includeFontPadding: false,
  },
  emptySession: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
