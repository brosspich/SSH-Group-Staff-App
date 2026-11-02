import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
            <Ionicons name="camera-outline" size={60} color={AppColors.grey} />
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
            Align Attendance QR Code inside the frame
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
            <Ionicons name="close" size={24} color={AppColors.background2} />
          </TouchableOpacity>

          <Text style={styles.modalHeaderTitle}>Scan Attendance</Text>

          <TouchableOpacity
            style={styles.torchBtn}
            onPress={() => setTorchOn((t) => !t)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={torchOn ? "flash" : "flash-outline"}
              size={22}
              color={torchOn ? "#FACC15" : AppColors.background2}
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
    backgroundColor: "#000",
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
    paddingHorizontal: 16,
    paddingBottom: 8,
    overflow: "hidden",
    // borderBottomWidth: 0.5,
    // borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  modalHeaderTitle: {
    color: AppColors.background2,
    fontSize: 18,
    fontFamily: AppFonts.bold,
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
    backgroundColor: AppColors.secondary,
    borderRadius: 2,
  },
  corner: {
    width: 30,
    height: 30,
    borderColor: AppColors.background2,
    position: "absolute",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 15,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 15,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 15,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 15,
  },
  scanInstruction: {
    color: AppColors.background2,
    fontSize: 13,
    marginTop: 20,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    backgroundColor: "rgba(255, 255, 255, 0.17)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  webFallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#111827",
  },
  webFallbackTitle: {
    color: AppColors.background2,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    fontFamily: AppFonts.bold,
  },
  webFallbackSub: {
    color: AppColors.grey,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    fontFamily: AppFonts.regular,
  },
});
