import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { CameraView, type BarcodeSettings } from "expo-camera";
import React, { memo, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ScannerModalProps {
  visible: boolean;
  onClose: () => void;
  torchOn: boolean;
  setTorchOn: React.Dispatch<React.SetStateAction<boolean>>;
  scanned: boolean;
  onBarcodeScanned: (scanningResult: any) => void;
}

// Stable reference so CameraView never reinitializes its scanner engine on re-renders
const BARCODE_SCANNER_SETTINGS: BarcodeSettings = {
  barcodeTypes: ["qr"],
};

function ScannerModal({
  visible,
  onClose,
  torchOn,
  setTorchOn,
  scanned,
  onBarcodeScanned,
}: ScannerModalProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  // Smooth breathing in-and-out pulse animation for scanFrame
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      // Reset to neutral so next open starts clean
      pulseAnim.setValue(1);
      scanLineAnim.setValue(0);
      return;
    }

    // ── Symmetric breathing pulse: 1.0 → 1.03 → 1.0 (never below 1) ──
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          easing: Easing.inOut(Easing.sin), // smoother than generic ease
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    // ── Scan line: linear sweep down, linear sweep up (no stutter at edges) ──
    const scanLineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    scanLineLoop.start();

    return () => {
      pulseLoop.stop();
      scanLineLoop.stop();
    };
  }, [visible, pulseAnim, scanLineAnim]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 236],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.container}>
        {/* ── 1. Full-screen Camera Preview (Rendered FIRST as the background) ── */}
        {Platform.OS === "web" ? (
          <View style={styles.webFallbackContainer}>
            <Ionicons
              name="camera-outline"
              size={60}
              color={theme.colors.grey}
            />
            <Text style={styles.webFallbackTitle}>Web Camera Preview</Text>
            <Text style={styles.webFallbackSub}>
              Camera QR scanning requires an iOS or Android device.
            </Text>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            autofocus="on"
            enableTorch={torchOn}
            onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
            barcodeScannerSettings={BARCODE_SCANNER_SETTINGS}
          />
        )}

        {/* ── 2. Scan Reticle Overlay in the Center with In/Out Animation ── */}
        <View
          style={[styles.overlayCenter, StyleSheet.absoluteFill]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.scanFrame,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Laser scanning beam line moving in and out */}
            {/* <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{ translateY: scanLineTranslateY }],
              },
            ]}
          /> */}
          </Animated.View>
          <Text style={styles.scanInstruction}>
            {t("home.scannerSubtitle")}
          </Text>
        </View>

        {/* ── 3. Header with backdrop BlurView (Translucent frosted glass over live camera) ── */}
        <BlurView
          intensity={0}
          style={[
            styles.modalHeader,
            { height: 65 + insets.top, paddingTop: insets.top },
          ]}
        >
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={theme.colors.background2} />
          </TouchableOpacity>

          <Text style={styles.modalHeaderTitle}>{t("home.scannerTitle")}</Text>

          <TouchableOpacity
            style={styles.torchBtn}
            onPress={() => setTorchOn((t) => !t)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={torchOn ? "flash" : "flash-outline"}
              size={22}
              color={torchOn ? theme.colors.warning : theme.colors.background2}
            />
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
}

export default memo(ScannerModal);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.textPrimary,
  },
  modalHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    overflow: "hidden",
  },
  modalHeaderTitle: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  modalCloseBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  torchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  overlayCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: "relative",
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: theme.colors.secondary,
    borderRadius: 2,
  },
  corner: {
    width: 30,
    height: 30,
    borderColor: theme.colors.background2,
    position: "absolute",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: theme.borderRadius.lg,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: theme.borderRadius.lg,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: theme.borderRadius.lg,
  },
  scanInstruction: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.lg,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    backgroundColor: "rgba(255, 255, 255, 0.17)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  webFallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.textPrimary,
  },
  webFallbackTitle: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.lg,
    // fontWeight: "bold",
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  webFallbackSub: {
    color: theme.colors.grey,
    fontSize: theme.fontSizes.xs,
    textAlign: "center",
    marginTop: theme.spacing.xs,
    lineHeight: 18,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
});
