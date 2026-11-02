import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
          colors={[AppColors.primary, AppColors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scanBtn}
        >
          <View style={styles.scanBtnIconCircle}>
            {verifyingSecurity ? (
              <ActivityIndicator size="small" color={AppColors.background2} />
            ) : (
              <Ionicons
                name="qr-code-outline"
                size={28}
                color={AppColors.background2}
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
            color={AppColors.background2}
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
          colors={[AppColors.primary, AppColors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.requestBtn}
        >
          <View style={styles.requestBtnIconCircle}>
            <Ionicons
              name="calendar-outline"
              size={28}
              color={AppColors.background2}
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
            color={AppColors.background2}
          />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  scanBtnContainer: {
    marginBottom: 15,
    marginTop: 20,
    paddingHorizontal: 15,
  },
  scanBtn: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  scanBtnIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanBtnTextCol: {
    flex: 1,
  },
  scanBtnTitle: {
    fontSize: 17,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  scanBtnSub: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.85)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },

  requestBtnContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  requestBtn: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  requestBtnIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  requestBtnTextCol: {
    flex: 1,
  },
  requestBtnTitle: {
    fontSize: 17,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  requestBtnSub: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.85)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
});
