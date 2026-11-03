import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DeviceSession } from "../_types/devices.types";
import DeviceOSIcon from "./DeviceOSIcon";

interface ThisDeviceSectionProps {
  thisDevice?: DeviceSession;
  activeSessionsCount: number;
  onSelectDevice: (device: DeviceSession) => void;
  onTerminateOtherSessions: () => void;
}

export default function ThisDeviceSection({
  thisDevice,
  activeSessionsCount,
  onSelectDevice,
  onTerminateOtherSessions,
}: ThisDeviceSectionProps) {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>This device</Text>
        {thisDevice ? (
          <>
            <View style={styles.divider} />
            <Pressable
              style={({ pressed }) => [
                styles.sessionItem,
                {
                  backgroundColor: pressed
                    ? `${AppColors.grey}33`
                    : AppColors.transparent,
                },
              ]}
              onPress={() => onSelectDevice(thisDevice)}
            >
              <DeviceOSIcon
                os={thisDevice.os}
                isLarge={false}
                deviceType={thisDevice.device_type}
              />
              <View style={styles.sessionDetails}>
                <Text style={styles.deviceNameText}>
                  {thisDevice.device_name}
                </Text>
                <Text style={styles.sessionSubtext}>
                  {`SSH Group POS ${thisDevice.device_type === "web" || thisDevice.os === "Web" ? "Web" : thisDevice.os} ${thisDevice.app_version}`}
                </Text>
                <Text style={styles.locationStatusText}>
                  {`${thisDevice.location} • `}
                  <Text style={styles.onlineColor}>online</Text>
                </Text>
              </View>
            </Pressable>
          </>
        ) : (
          <View style={styles.emptySession}>
            <Text style={styles.emptyText}>
              Loading current device details...
            </Text>
          </View>
        )}

        {activeSessionsCount > 0 && (
          <>
            <View style={styles.divider} />
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                {
                  backgroundColor: pressed
                    ? `${AppColors.grey}33`
                    : AppColors.transparent,
                },
              ]}
              onPress={onTerminateOtherSessions}
            >
              <Ionicons
                name="hand-left-outline"
                size={22}
                color={AppColors.red}
              />
              <Text style={styles.terminateOtherText}>
                Terminate All Other Sessions
              </Text>
            </Pressable>
          </>
        )}
      </View>
      <Text style={styles.helpText}>
        Logs out all devices except for this one.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
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
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  terminateOtherText: {
    fontSize: 15,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    color: AppColors.red,
    marginLeft: 14,
  },
  helpText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 4,
  },
});
