// renderPrintModal.tsx
import {
  DEFAULT_SETTINGS,
  ReceiptSettings,
  STORAGE_KEY,
} from "@/app/create/custom_receipt";
import { PrinterSelectorModal } from "@/components/printer/PrinterSelectorModal";
import { AppColors } from "@/constants/appcolors";
import {
  DiscoveredPrinter,
  getPrinterIcon,
  loadReceiptSettings,
} from "@/hooks/usePrinter";
import { printReceiptOnWeb } from "@/hooks/webPrint";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import { styles } from "../../styles/auth.styles";
import { renderAlertModal } from "../alert/alert";
import CustomReceiptPaper from "./CustomReceiptPaper";
import { OrderData } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RenderPrintModalProps {
  visible: boolean;
  lastOrder: OrderData | null;
  numPaper: string;
  selectedPrinter: DiscoveredPrinter | null;
  printers: DiscoveredPrinter[];
  isDiscovering: boolean;
  isPrinting: boolean;
  onNumPaperChange: (value: string) => void;
  onClose: () => void;
  onPrint: (imageUri?: string) => void | Promise<void>;
  onSelectPrinter: (printer: DiscoveredPrinter | null) => void | Promise<void>;
  onRefreshPrinters: () => void;
  onTestPrint: () => Promise<void>;
  // Optional: force-releases usePrinter's internal print lock/spinner so a
  // retry after the watchdog fires actually runs instead of silently
  // no-op'ing against a still-locked previous attempt. Pass usePrinter()'s
  // `cancelPrinting`. If omitted, the watchdog still shows the alert and
  // re-enables the button locally, but a retry may no-op until the
  // original call's own internal timeout (~20-35s) finally releases it.
  onCancelPrinting?: () => void;
  isMobile?: boolean;
}

// ─── Web helpers ──────────────────────────────────────────────────────────────

const printOnWeb = (html: string) => {
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
};

// How long we let a print attempt spin before assuming it's stuck. Rendering
// PDF to raster bytes + transmitting over Bluetooth/USB takes ~2-10s depending
// on printer/device speed, so 15s comfortably prevents false error alerts.
const PRINT_WATCHDOG_MS = 15000;

// ─── useReceiptSettings hook ──────────────────────────────────────────────────

function useReceiptSettings(visible: boolean): ReceiptSettings {
  const [settings, setSettings] = useState<ReceiptSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        else setSettings(DEFAULT_SETTINGS);
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    })();
  }, [visible]);

  return settings;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const RenderPrintModal: React.FC<RenderPrintModalProps> = ({
  visible,
  lastOrder,
  numPaper,
  selectedPrinter,
  printers,
  isDiscovering,
  isPrinting,
  onNumPaperChange,
  onClose,
  onPrint,
  onSelectPrinter,
  onRefreshPrinters,
  onTestPrint,
  onCancelPrinting,
  isMobile = false,
}) => {
  const receipt = useReceiptSettings(visible);
  const viewShotRef = useRef<any>(null);

  const [printerModalVisible, setPrinterModalVisible] = useState(false);

  // Set true once the print watchdog fires — lets the Print button be
  // pressed again even though the parent's `isPrinting` prop may still be
  // stuck true from a hung attempt.
  const [printStuck, setPrintStuck] = useState(false);
  const printWatchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");

  const showAlert = (title: string, body: string) => {
    setAlertTitle(title);
    setAlertBody(body);
    setAlertVisible(true);
  };

  const clearPrintWatchdog = () => {
    if (printWatchdogTimer.current) {
      clearTimeout(printWatchdogTimer.current);
      printWatchdogTimer.current = null;
    }
  };

  // Belt-and-suspenders cleanup if the modal unmounts mid-print.
  useEffect(() => clearPrintWatchdog, []);

  useEffect(() => {
    if (!visible) return;
    onNumPaperChange(String(receipt.copies));
  }, [visible, receipt.copies]);

  // ── handlePrint ────────────────────────────────────────────────────
  const handlePrint = async () => {
    setPrintStuck(false);
    clearPrintWatchdog();
    printWatchdogTimer.current = setTimeout(() => {
      // Still going after 15s — assume it's stuck rather than making the
      // person wait out the full native timeout chain.
      onCancelPrinting?.();
      setPrintStuck(true);
      showAlert(
        "Printing Error",
        "Print timed out. Please check printer connection and try again.",
      );
    }, PRINT_WATCHDOG_MS);

    try {
      if (Platform.OS === "web") {
        if (!lastOrder) return;
        const settings = await loadReceiptSettings();
        await printReceiptOnWeb(lastOrder, settings);
        return;
      }
      await onPrint();
    } finally {
      clearPrintWatchdog();
    }
  };

  const handleTestPrint = async () => {
    if (!selectedPrinter) {
      showAlert("No Printer", "Select a printer first.");
      return;
    }
    try {
      await onTestPrint();
    } catch (e: any) {
      showAlert(
        "Test Print Failed",
        e?.message ?? "Could not send test print.",
      );
    }
  };

  const insets = useSafeAreaInsets();

  // On native, the button is disabled while genuinely printing — unless the
  // watchdog already fired, in which case we let the person try again even
  // if the parent's isPrinting hasn't flipped back yet.
  const printDisabled =
    Platform.OS !== "web" && (!selectedPrinter || (isPrinting && !printStuck));

  return (
    <>
      <Modal
        visible={visible}
        statusBarTranslucent
        animationType={isMobile ? "slide" : "fade"}
        transparent
        onRequestClose={onClose}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              justifyContent: !isMobile ? "center" : "flex-end",
              alignItems: !isMobile ? "center" : "stretch",
            },
          ]}
        >
          <View
            style={[
              styles.modalContainer,
              {
                maxHeight: !isMobile ? "85%" : "87%",
                height: !isMobile ? "85%" : "87%",
                maxWidth: !isMobile ? 450 : "100%",
                width: !isMobile ? 450 : "100%",
                borderBottomLeftRadius: !isMobile ? 20 : 0,
                borderBottomRightRadius: !isMobile ? 20 : 0,
              },
              isMobile && { paddingBottom: 24 + insets.bottom },
            ]}
          >
            {/* ── Header ── */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Print Invoice</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* <ScrollView showsVerticalScrollIndicator={false}> */}
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps="handled"
              enableOnAndroid={true}
              extraScrollHeight={20}
              showsVerticalScrollIndicator={false}
            >
              {/* ── Success banner ── */}
              <View style={styles.successBanner}>
                <MaterialIcons
                  name="check-circle"
                  size={22}
                  color={AppColors.secondary}
                />
                <Text style={styles.successText}>
                  Order {lastOrder?.invoiceNumber} confirmed!
                </Text>
              </View>

              {/* ── Receipt settings summary ── */}
              <Text style={styles.sectionLabel}>Receipt Paper</Text>
              <TouchableOpacity style={styles.receiptSettingsCardStyle}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {receipt.logoUri ? (
                      <Image
                        source={{ uri: receipt.logoUri }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 4,
                          backgroundColor: "#ffffff",
                        }}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.logoPlaceholderStyle}>
                        <MaterialCommunityIcons
                          name="receipt"
                          size={18}
                          color={AppColors.secondary}
                        />
                      </View>
                    )}
                    <View>
                      <Text
                        style={{
                          color: AppColors.textPrimary,
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        {receipt.companyName}
                      </Text>
                      <Text
                        style={{
                          color: AppColors.grey,
                          fontSize: 11,
                          marginTop: 1,
                        }}
                      >
                        {receipt.paperSize} · {receipt.copies}{" "}
                        {receipt.copies === 1 ? "copy" : "copies"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* ── Receipt Preview ── */}
              <Text
                style={[
                  styles.sectionLabel,
                  { marginTop: 8, marginBottom: 12 },
                ]}
              >
                Receipt Preview
              </Text>
              <View
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                }}
              >
                {lastOrder ? (
                  <ViewShot
                    ref={viewShotRef}
                    options={{ format: "png", quality: 1.0 }}
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <CustomReceiptPaper settings={receipt} order={lastOrder} />
                  </ViewShot>
                ) : (
                  <ActivityIndicator color={AppColors.secondary} />
                )}
              </View>

              {/* ── Printer selection — native only ── */}
              {Platform.OS !== "web" ? (
                <>
                  <Text style={styles.sectionLabel}>Printer Selection</Text>
                  <TouchableOpacity
                    style={[
                      styles.printInput,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      },
                    ]}
                    onPress={() => setPrinterModalVisible(true)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <MaterialIcons
                        // name="bluetooth"
                        name={getPrinterIcon(selectedPrinter)}
                        size={18}
                        color={
                          selectedPrinter ? AppColors.secondary : AppColors.grey
                        }
                      />
                      <Text
                        style={{
                          color: selectedPrinter
                            ? AppColors.textPrimary
                            : AppColors.grey,
                        }}
                      >
                        {selectedPrinter?.deviceName || "Select Printer"}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color={AppColors.grey}
                    />
                  </TouchableOpacity>

                  {/* ── Number of copies — native only ── */}
                  <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
                    Number of Copies
                  </Text>
                  <View style={{ marginBottom: 8, position: "relative" }}>
                    <TextInput
                      style={[
                        styles.printInput,
                        { fontSize: 16, paddingLeft: 42 },
                      ]}
                      value={numPaper}
                      onChangeText={onNumPaperChange}
                      placeholder={String(receipt.copies)}
                      placeholderTextColor={AppColors.grey}
                      keyboardType="number-pad"
                    />
                    <Ionicons
                      name="copy-outline"
                      size={20}
                      color={AppColors.grey}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: [{ translateY: -10 }],
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: AppColors.grey,
                      marginBottom: 4,
                    }}
                  >
                    Default from receipt settings: {receipt.copies}
                  </Text>
                </>
              ) : (
                /* ── Web: browser print hint ── */
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 2,
                  }}
                >
                  <MaterialIcons
                    name="info-outline"
                    size={14}
                    color={AppColors.grey}
                  />
                  <Text
                    style={{ fontSize: 12, color: AppColors.grey, flex: 1 }}
                  >
                    {
                      "Your browser's print dialog will handle printer selection"
                    }
                  </Text>
                </View>
              )}
              {/* </ScrollView> */}
            </KeyboardAwareScrollView>

            {/* ── Footer ── */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearBtn} onPress={onClose}>
                <Text style={styles.clearBtnText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.checkoutBtn,
                  styles.pdfBtn,
                  printDisabled && styles.checkoutBtnDisabled,
                ]}
                onPress={handlePrint}
                disabled={printDisabled}
              >
                {isPrinting && !printStuck ? (
                  <ActivityIndicator
                    color={AppColors.background2}
                    size="small"
                  />
                ) : (
                  <>
                    <MaterialIcons
                      name="print"
                      size={17}
                      color={AppColors.background2}
                    />
                    <Text style={[styles.checkoutBtnText, { marginLeft: 5 }]}>
                      Print
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Printer selector — native only */}
      {Platform.OS !== "web" && (
        <PrinterSelectorModal
          visible={printerModalVisible}
          printers={printers}
          isDiscovering={isDiscovering}
          selectedPrinter={selectedPrinter}
          onSelectPrinter={onSelectPrinter}
          onClose={() => setPrinterModalVisible(false)}
          onRefresh={onRefreshPrinters}
          isMobile={isMobile}
        />
      )}

      {renderAlertModal({
        isMobile,
        alertModalVisible: alertVisible,
        setAlertModalVisible: setAlertVisible,
        title: alertTitle,
        bodyTxt: alertBody,
      })}
    </>
  );
};
