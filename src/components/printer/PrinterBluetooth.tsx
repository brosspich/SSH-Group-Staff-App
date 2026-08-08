import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  connectAndDiscoverBleGatt,
  disconnectBleGatt,
  useBLEScanner,
} from "@/hooks/useBLEScanner";
import {
  PRINTER_STORAGE_KEYS,
  clearAllSavedPrinters,
  type DiscoveredPrinter,
} from "@/hooks/usePrinter";
import { useResponsive } from "@/hooks/useResponsive";
import { BLEPrinter } from "@/utils/thermalPrinter";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { renderAlertModal } from "../alert/alert";

const isBLEAvailable = (): boolean => BLEPrinter !== null;

type ScreenState = "idle" | "discovering" | "empty" | "found" | "unavailable";

export default function PrinterBluetooth() {
  const [screenState, setScreenState] = useState<ScreenState>(
    isBLEAvailable() ? "idle" : "unavailable",
  );
  const [classicPrinters, setClassicPrinters] = useState<DiscoveredPrinter[]>(
    [],
  );
  const [isClassicScanning, setIsClassicScanning] = useState(false);
  const ble = useBLEScanner();

  const printers: DiscoveredPrinter[] = useMemo(
    () => [
      ...classicPrinters,
      ...ble.devices.map((d) => ({
        target: d.id,
        deviceName: d.name,
        connectionType: "ble" as const,
      })),
    ],
    [classicPrinters, ble.devices],
  );

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

    (async () => {
      const rawBle = await AsyncStorage.getItem(PRINTER_STORAGE_KEYS.ble);
      const rawBt = await AsyncStorage.getItem(PRINTER_STORAGE_KEYS.bluetooth);
      const raw = rawBle ?? rawBt;
      if (raw && isMounted.current) {
        const p: DiscoveredPrinter = JSON.parse(raw);
        setSavedPrinter(p);
        setSelectedPrinterState(p);
        setConnectedTarget(p.target);
      }
    })();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Derive screen state from both scan sources.
  useEffect(() => {
    const scanning = isClassicScanning || ble.isScanning;
    if (scanning) {
      setScreenState("discovering");
    } else if (printers.length > 0) {
      setScreenState("found");
    } else {
      setScreenState((prev) => (prev === "discovering" ? "empty" : prev));
    }
  }, [isClassicScanning, ble.isScanning, printers.length]);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== "android") return true;
    if (Platform.Version >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED,
      );
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleScan = async () => {
    if (Platform.OS === "web") {
      // alert("Bluetooth not supported on web");
      setAlertTitle("Error");
      setAlertBody("Bluetooth not supported on web");
      setAlertVisible(true);
      return;
    }
    const granted = await requestPermissions();
    if (!granted) {
      // alert("Bluetooth permission denied");
      setAlertTitle("Error");
      setAlertBody("Bluetooth permission denied");
      setAlertVisible(true);
      return;
    }

    setClassicPrinters([]);
    setScreenState("discovering");

    ble.startScan(8000); // BLE GATT (GoDEX etc.) — runs for 8s

    if (isBLEAvailable()) {
      setIsClassicScanning(true);
      try {
        await BLEPrinter.init();
        const list = await BLEPrinter.getDeviceList();
        const mapped: DiscoveredPrinter[] = (list as any[]).map((d) => ({
          target: d.inner_mac_address,
          deviceName: d.device_name,
          connectionType: "bluetooth" as const,
        }));
        if (isMounted.current) setClassicPrinters(mapped);
      } catch (e: any) {
        // console.warn("[PrinterBluetooth] classic scan error:", e);
        setAlertTitle("PrinterBluetooth");
        setAlertBody("classic scan error: " + `${e}`);
        setAlertVisible(true);
        const msg: string = e?.message ?? "";
        if (
          msg.toLowerCase().includes("bluetooth") ||
          msg.toLowerCase().includes("adapter")
        ) {
          // alert("Please enable Bluetooth and try again.");
          setAlertTitle("Error");
          setAlertBody("Please enable Bluetooth and try again.");
          setAlertVisible(true);
        }
      } finally {
        if (isMounted.current) setIsClassicScanning(false);
      }
    }
  };

  const handleConnect = async () => {
    if (!selectedPrinter || isConnecting) return;
    setIsConnecting(true);
    try {
      let toSave: DiscoveredPrinter;

      if (selectedPrinter.connectionType === "ble") {
        // Disconnect previous BLE printer if it is different
        if (
          savedPrinter &&
          savedPrinter.connectionType === "ble" &&
          savedPrinter.target !== selectedPrinter.target
        ) {
          await disconnectBleGatt(savedPrinter.target).catch(() => {});
        }
        const { serviceUUID, characteristicUUID, writeWithResponse, mtu } =
          await connectAndDiscoverBleGatt(selectedPrinter.target);
        const isGodex =
          selectedPrinter.deviceName?.toLowerCase().includes("godex") ||
          selectedPrinter.deviceName?.toLowerCase().includes("mx") ||
          selectedPrinter.deviceName?.toLowerCase().includes("gd");
        const protocol = isGodex ? "ezpl" : "escpos";
        toSave = {
          ...selectedPrinter,
          serviceUUID,
          characteristicUUID,
          writeWithResponse,
          mtu,
          printerProtocol: protocol,
        };
        await clearAllSavedPrinters();
        await AsyncStorage.setItem(
          PRINTER_STORAGE_KEYS.ble,
          JSON.stringify(toSave),
        );
        // Do NOT disconnect; keep BLE Server connected
      } else {
        if (!isBLEAvailable())
          throw new Error("Bluetooth printing is not available.");
        await BLEPrinter.connectPrinter(selectedPrinter.target);
        await new Promise((r) => setTimeout(r, 500));
        await BLEPrinter.closeConn();
        const isGodex =
          selectedPrinter.deviceName?.toLowerCase().includes("godex") ||
          selectedPrinter.deviceName?.toLowerCase().includes("mx") ||
          selectedPrinter.deviceName?.toLowerCase().includes("gd");
        const protocol = isGodex ? "ezpl" : "escpos";
        toSave = {
          ...selectedPrinter,
          connectionType: "bluetooth",
          printerProtocol: protocol,
        };
        await clearAllSavedPrinters();
        await AsyncStorage.setItem(
          PRINTER_STORAGE_KEYS.bluetooth,
          JSON.stringify(toSave),
        );
      }

      if (isMounted.current) {
        setSavedPrinter(toSave);
        setConnectedTarget(toSave.target);
        const transportLabel =
          toSave.connectionType === "ble" ? "BLE" : "Classic";
        setAlertTitle("Success");
        setAlertBody(`Printer saved: ${toSave.deviceName} (${transportLabel})`);
        setAlertVisible(true);
      }
    } catch (e: any) {
      try {
        if (selectedPrinter.connectionType !== "ble")
          await BLEPrinter?.closeConn();
      } catch (_) {}
      // alert(`Connection failed: ${e?.message ?? "Unknown error"}`);
      setAlertTitle("Error");
      setAlertBody(`Connection failed: ${e?.message ?? "Unknown error"}`);
      setAlertVisible(true);
    } finally {
      if (isMounted.current) setIsConnecting(false);
    }
  };

  const handleForget = async () => {
    if (savedPrinter && savedPrinter.connectionType === "ble") {
      await disconnectBleGatt(savedPrinter.target).catch(() => {});
    }
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
              Saved: {savedPrinter.deviceName} (
              {savedPrinter.connectionType === "ble" ? "BLE" : "Classic"})
            </Text>
            <TouchableOpacity onPress={handleForget} style={styles.forgetBtn}>
              <Text style={styles.forgetText}>Forget</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedPrinter && selectedPrinter.target !== connectedTarget && (
          <View style={styles.selectedBar}>
            <MaterialIcons
              name="bluetooth-connected"
              size={16}
              color={AppColors.secondary}
            />
            <Text style={styles.selectedBarText} numberOfLines={1}>
              {selectedPrinter.deviceName}
            </Text>
          </View>
        )}

        {screenState === "unavailable" && (
          <View style={styles.centerBox}>
            <MaterialIcons
              name="bluetooth-disabled"
              size={52}
              color={AppColors.grey}
            />
            <Text style={styles.centerText}>Not available</Text>
            <Text style={styles.centerSub}>
              {Platform.OS === "ios"
                ? "Bluetooth printing requires the native module to be linked. Run a development build (not Expo Go)."
                : "Bluetooth printing is not supported on this platform."}
            </Text>
          </View>
        )}

        {screenState === "idle" && (
          <View style={styles.centerBox}>
            <MaterialIcons
              name="bluetooth-searching"
              size={56}
              color={AppColors.grey}
            />
            <Text style={styles.centerText}>Ready to scan</Text>
            <Text style={styles.centerSub}>
              Tap "Scan" to find printers nearby.{"\n\n"}
              <Text style={{ fontWeight: "600", color: AppColors.secondary }}>
                Tip :
              </Text>{" "}
              Classic printers (Xprinter etc.) must be paired in your phone's
              system settings first. BLE printers (GoDEX etc.) don't need
              pairing — just scan and tap Save Printer.{"\n\n"}
              <Text style={{ fontWeight: "600", color: AppColors.secondary }}>
                Note :
              </Text>{" "}
              If a BLE printer was saved before, tap Forget and Save Printer
              again to re-detect the write characteristic.
            </Text>
          </View>
        )}

        {screenState === "discovering" && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={AppColors.secondary} />
            <Text style={styles.centerText}>Scanning for devices...</Text>
            <Text style={styles.centerSub}>
              Keep printer powered on and nearby
            </Text>
          </View>
        )}

        {screenState === "empty" && (
          <View style={styles.centerBox}>
            <MaterialIcons
              name="bluetooth-disabled"
              size={52}
              color={AppColors.grey}
            />
            <Text style={styles.centerText}>No devices found</Text>
            <Text style={styles.centerSub}>
              Make sure the printer is on.{"\n\n"}
              <Text style={{ fontWeight: "600", color: AppColors.secondary }}>
                Tip:
              </Text>{" "}
              Classic printers need to be paired via system Bluetooth settings
              first; BLE printers just need to be powered on.
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
                        name="bluetooth"
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
                        {item.target} (
                        {item.connectionType === "ble" ? "BLE" : "Classic"})
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
            style={[
              styles.footerBtnOutline,
              !isBLEAvailable() && styles.footerBtnDisabled,
            ]}
            onPress={handleScan}
            disabled={!isBLEAvailable()}
          >
            <MaterialIcons
              name="bluetooth-searching"
              size={17}
              color={AppColors.secondary}
            />
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
              <ActivityIndicator size="small" color={AppColors.background2} />
            ) : (
              <MaterialIcons
                name="bluetooth-connected"
                size={17}
                color={AppColors.background2}
              />
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
  safe: { flex: 1, backgroundColor: AppColors.background },
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
  printerCardSelected: { borderWidth: 2, borderColor: AppColors.secondary },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: AppColors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapSelected: { backgroundColor: AppColors.secondary + "18" },
  printerName: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  printerNameSelected: { color: AppColors.secondary },
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
