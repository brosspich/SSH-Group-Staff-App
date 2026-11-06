import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HomeActionButtonsProps {
  onScanPress: () => void;
  onRequestPress: () => void;
  verifyingSecurity: boolean;
}

export const HomeActionButtons: React.FC<HomeActionButtonsProps> = ({
  onScanPress,
  onRequestPress,
  verifyingSecurity,
}) => {
  return (
    <>
      {/* ── Main Action: Scan Attendance Button ── */}
      <TouchableOpacity
        style={styles.scanBtnContainer}
        onPress={onScanPress}
        disabled={verifyingSecurity}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scanBtn}
        >
          <View style={styles.scanBtnIconCircle}>
            {verifyingSecurity ? (
              <ActivityIndicator size="small" color={theme.colors.background2} />
            ) : (
              <Ionicons
                name="qr-code-outline"
                size={28}
                color={theme.colors.background2}
              />
            )}
          </View>
          <View style={styles.scanBtnTextCol}>
            <Text style={styles.scanBtnTitle}>
              {verifyingSecurity
                ? "Verifying Location & Security..."
                : "Scan Attendance QR Code"}
            </Text>
            <Text style={styles.scanBtnSub}>
              {verifyingSecurity
                ? "Checking GPS location & VPN status"
                : "Tap to open camera scanner"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={theme.colors.background2}
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Core Action: Request Attendance Rule Button ── */}
      <TouchableOpacity
        style={styles.requestBtnContainer}
        onPress={onRequestPress}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.requestBtn}
        >
          <View style={styles.requestBtnIconCircle}>
            <Ionicons
              name="calendar-outline"
              size={28}
              color={theme.colors.background2}
            />
          </View>
          <View style={styles.requestBtnTextCol}>
            <Text style={styles.requestBtnTitle}>Request Attendance Rules</Text>
            <Text style={styles.requestBtnSub}>
              Tap to open for request rules
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={theme.colors.background2}
          />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  scanBtnContainer: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  scanBtn: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  scanBtnIconCircle: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanBtnTextCol: {
    flex: 1,
  },
  scanBtnTitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  scanBtnSub: {
    fontSize: theme.fontSizes.xs,
    color: "rgba(255,255,255,0.85)",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },

  requestBtnContainer: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  requestBtn: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  requestBtnIconCircle: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  requestBtnTextCol: {
    flex: 1,
  },
  requestBtnTitle: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  requestBtnSub: {
    fontSize: theme.fontSizes.xs,
    color: "rgba(255,255,255,0.85)",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
});
