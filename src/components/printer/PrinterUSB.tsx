import { AppColors } from "@/constants/appcolors";
import { clearAllSavedPrinters } from "@/hooks/usePrinter";
import { USBPrinter, type IUSBPrinter } from "@/utils/thermalPrinter";
import { MaterialIcons } from "@expo/vector-icons";

import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { renderAlertModal } from "../alert/alert";

const STORAGE_KEY = "selected_printer_usb";

interface DiscoveredPrinter {
  target: string; // "vendorId:productId"
  vendorId: string;
  productId: string;
  deviceName: string;
  connectionType: "usb";
  printerProtocol?: "escpos" | "ezpl";
}

type ScreenState = "idle" | "discovering" | "empty" | "found";

export default function PrinterUSB() {
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [printers, setPrinters] = useState<DiscoveredPrinter[]>([]);
  const [selectedPrinter, setSelectedPrinterState] =
    useState<DiscoveredPrinter | null>(null);
  const [savedPrinter, setSavedPrinter] = useState<DiscoveredPrinter | null>(
    null,
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedTarget, setConnectedTarget] = useState<string | null>(null);

  const isMounted = useRef(true);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");
  const { isMobile } = useResponsive();

  useEffect(() => {
    isMounted.current = true;
    if (Platform.OS !== "web" && USBPrinter) {
      USBPrinter.init().catch((e: any) =>
        console.warn("[PrinterUSB] init failed:", e),
      );
    }
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw && isMounted.current) {
        const p: DiscoveredPrinter = JSON.parse(raw);
        if (p.connectionType === "usb") {
          setSavedPrinter(p);
          setSelectedPrinterState(p);
          setConnectedTarget(p.target);
        }
      }
    });
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleScan = async () => {
    if (Platform.OS === "web") {
      // alert("USB printing is not supported on web");
      setAlertTitle("Error");
      setAlertBody("USB printing is not supported on web.");
      setAlertVisible(true);
      return;
    }
    if (!USBPrinter) {
      setAlertTitle("Error");
      setAlertBody("USB printing is not supported on iOS.");
      setAlertVisible(true);
      return;
    }
    if (isMounted.current) {
      setPrinters([]);
      setScreenState("discovering");
    }
    try {
      await USBPrinter.init();
      const list: any[] = await USBPrinter.getDeviceList();
      const mapped: DiscoveredPrinter[] = list.map((d) => ({
        target: `${d.vendor_id}:${d.product_id}`,
        vendorId: d.vendor_id,
        productId: d.product_id,
        deviceName: d.device_name ?? `USB Device ${d.vendor_id}`,
        connectionType: "usb",
      }));
      if (isMounted.current) {
        setPrinters(mapped);
        setScreenState(mapped.length > 0 ? "found" : "empty");
      }
    } catch (e: any) {
      console.warn("[PrinterUSB] scan error:", e);
      if (isMounted.current) setScreenState("empty");
    }
  };

  const handleConnect = async () => {
    if (!selectedPrinter || !USBPrinter) return;
    setIsConnecting(true);
    try {
      await USBPrinter.connectPrinter(
        selectedPrinter.vendorId,
        selectedPrinter.productId,
      );

      const isGodex =
        selectedPrinter.deviceName?.toLowerCase().includes("godex") ||
        selectedPrinter.deviceName?.toLowerCase().includes("mx") ||
        selectedPrinter.deviceName?.toLowerCase().includes("gd");
      const protocol = isGodex ? "ezpl" : "escpos";
      const toSave: DiscoveredPrinter = {
        ...selectedPrinter,
        connectionType: "usb",
        printerProtocol: protocol,
      };
      await clearAllSavedPrinters();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      if (isMounted.current) {
        setSavedPrinter(toSave);
        setConnectedTarget(toSave.target);
        setAlertTitle("Success");
        setAlertBody(`Printer saved: ${toSave.deviceName}`);
        setAlertVisible(true);
      }
    } catch (e: any) {
      try {
        await USBPrinter.closeConn();
      } catch (_) {}
      setAlertTitle("Error");
      setAlertBody(`Connection failed: ${e?.message ?? "Unknown error"}`);
      setAlertVisible(true);
    } finally {
      if (isMounted.current) setIsConnecting(false);
    }
  };

  const handleForget = async () => {
    await clearAllSavedPrinters();
    if (isMounted.current) {
      setSavedPrinter(null);
      setConnectedTarget(null);
      setSelectedPrinterState(null);
    }
  };

  const handleSelectPrinter = (printer: DiscoveredPrinter) =>
    setSelectedPrinterState((prev) =>
      prev?.target === printer.target ? null : printer,
    );

  return (
    <>
      <View style={styles.safe}>
        {savedPrinter && (
          <View style={styles.savedBar}>
            <MaterialIcons
              name="bookmark"
              size={15}
              color={AppColors.secondary}
            />
            <Text style={styles.savedBarText} numberOfLines={1}>
              Saved: {savedPrinter.deviceName}
            </Text>
            <TouchableOpacity onPress={handleForget} style={styles.forgetBtn}>
              <Text style={styles.forgetText}>Forget</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedPrinter && selectedPrinter.target !== connectedTarget && (
          <View style={styles.selectedBar}>
            <MaterialIcons name="usb" size={16} color={AppColors.secondary} />
            <Text style={styles.selectedBarText} numberOfLines={1}>
              {selectedPrinter.deviceName}
            </Text>
          </View>
        )}

        {screenState === "idle" && (
          <View style={styles.centerBox}>
            <MaterialIcons name="usb" size={56} color={AppColors.grey} />
            <Text style={styles.centerText}>Ready to scan</Text>
            <Text style={styles.centerSub}>
              Connect your USB printer, then tap "Scan"
            </Text>
          </View>
        )}

        {screenState === "discovering" && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={AppColors.secondary} />
            <Text style={styles.centerText}>Detecting USB devices...</Text>
            <Text style={styles.centerSub}>
              Make sure the cable is connected
            </Text>
          </View>
        )}

        {screenState === "empty" && (
          <View style={styles.centerBox}>
            <MaterialIcons name="usb-off" size={52} color={AppColors.grey} />
            <Text style={styles.centerText}>No USB devices found</Text>
            <Text style={styles.centerSub}>
              Check the cable connection and try again
            </Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={handleScan}>
              <MaterialIcons name="refresh" size={17} color="#fff" />
              <Text style={styles.refreshBtnText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {screenState === "found" && (
          <>
            <Text style={styles.sectionLabel}>
              {printers.length} device{printers.length !== 1 ? "s" : ""} found
            </Text>
            <FlatList
              data={printers}
              keyExtractor={(item) => item.target}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 120,
              }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedPrinter?.target === item.target;
                const isSaved = savedPrinter?.target === item.target;
                return (
                  <TouchableOpacity
                    style={[
                      styles.printerCard,
                      isSelected && styles.printerCardSelected,
                    ]}
                    onPress={() => handleSelectPrinter(item)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        isSelected && styles.iconWrapSelected,
                      ]}
                    >
                      <MaterialIcons
                        name="usb"
                        size={22}
                        color={
                          isSelected
                            ? AppColors.secondary
                            : AppColors.textSecondary
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Text
                          style={[
                            styles.printerName,
                            isSelected && styles.printerNameSelected,
                          ]}
                        >
                          {item.deviceName}
                        </Text>
                        {isSaved && (
                          <View style={styles.savedBadge}>
                            <Text style={styles.savedBadgeText}>SAVED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.printerTarget}>
                        VID: {item.vendorId} · PID: {item.productId}
                      </Text>
                    </View>
                    <MaterialIcons
                      name={
                        isSelected ? "check-circle" : "radio-button-unchecked"
                      }
                      size={22}
                      color={isSelected ? AppColors.secondary : AppColors.grey}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </>
        )}

        <View style={[styles.footer, { paddingBottom: 16 }]}>
          <TouchableOpacity
            style={styles.footerBtnOutline}
            onPress={handleScan}
          >
            <MaterialIcons name="usb" size={17} color={AppColors.secondary} />
            <Text style={styles.footerBtnOutlineText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.footerBtnPrimary,
              (!selectedPrinter || isConnecting) && styles.footerBtnDisabled,
            ]}
            disabled={!selectedPrinter || isConnecting}
            onPress={handleConnect}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="save" size={17} color="#fff" />
            )}
            <Text style={styles.footerBtnPrimaryText}>
              {isConnecting ? "Connecting..." : "Save Printer"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {renderAlertModal({
        isMobile: isMobile,
        alertModalVisible: alertVisible,
        setAlertModalVisible: setAlertVisible,
        title: alertTitle,
        bodyTxt: alertBody,
        onPress: () => setAlertVisible(false),
      })}
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },

  savedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: AppColors.secondary + "18",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  savedBarText: {
    fontSize: 13,
    color: AppColors.secondary,
    fontWeight: "500",
    flex: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  forgetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: AppColors.secondary + "28",
  },
  forgetText: {
    fontSize: 12,
    color: AppColors.secondary,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  selectedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: AppColors.background,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: AppColors.grey,
  },
  selectedBarText: {
    fontSize: 13,
    color: AppColors.textPrimary,
    fontWeight: "500",
    flex: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  centerText: {
    fontSize: 15,
    fontWeight: "500",
    color: AppColors.textSecondary,
    marginTop: 8,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  centerSub: {
    fontSize: 12,
    color: AppColors.grey,
    textAlign: "center",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  refreshBtnText: {
    color: AppColors.background2,
    fontWeight: "600",
    fontSize: 14,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  sectionLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  printerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: AppColors.background,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: AppColors.grey,
    padding: 14,
    marginBottom: 8,
  },
  printerCardSelected: {
    borderWidth: 2,
    borderColor: AppColors.secondary,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: AppColors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapSelected: {
    backgroundColor: AppColors.secondary + "18",
  },
  printerName: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  printerNameSelected: {
    color: AppColors.secondary,
  },
  printerTarget: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  savedBadge: {
    backgroundColor: AppColors.secondary + "22",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  savedBadgeText: {
    fontSize: 10,
    color: AppColors.secondary,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: AppColors.background2,
    borderTopWidth: 0.5,
    borderTopColor: AppColors.grey,
  },
  footerBtnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
  },
  footerBtnOutlineText: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.secondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  footerBtnPrimary: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: AppColors.secondary,
  },
  footerBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  footerBtnDisabled: {
    backgroundColor: AppColors.grey,
    opacity: 0.5,
  },
});
