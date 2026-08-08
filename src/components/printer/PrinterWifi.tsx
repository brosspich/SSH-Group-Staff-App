import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { clearAllSavedPrinters } from "@/hooks/usePrinter";
import { useResponsive } from "@/hooks/useResponsive";
import { NetPrinter } from "@/utils/thermalPrinter";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { renderAlertModal } from "../alert/alert";

const STORAGE_KEY = "selected_printer_wifi";

const PRINTER_PORTS = [9100, 515, 631];
const TCP_TIMEOUT_MS = 800;
const SCAN_CONCURRENCY = 20;

interface DiscoveredPrinter {
  target: string; // "ip:port"
  deviceName: string;
  ip: string;
  port: number;
  connectionType: "wifi";
  source: "scan" | "manual";
  printerProtocol?: "escpos" | "ezpl";
}

type ScreenState = "idle" | "discovering" | "empty" | "found";

const getNetworkInfo = () => require("react-native-network-info").NetworkInfo;

const tcpProbe = (ip: string, port: number): Promise<boolean> =>
  new Promise((resolve) => {
    let settled = false;
    const done = (result: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        client.destroy();
      } catch {}
      resolve(result);
    };
    const timer = setTimeout(() => done(false), TCP_TIMEOUT_MS);
    const TcpSocketModule = require("react-native-tcp-socket");
    const TcpSocket = TcpSocketModule.default || TcpSocketModule;
    const client = TcpSocket.connect(
      { host: ip, port, timeout: TCP_TIMEOUT_MS },
      () => done(true),
    );
    client.on("error", () => done(false));
    client.on("timeout", () => done(false));
  });

async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  let idx = 0;
  const run = async (): Promise<void> => {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

const buildSubnetIps = (deviceIp: string): string[] => {
  const parts = deviceIp.split(".");
  if (parts.length !== 4) return [];
  const base = parts.slice(0, 3).join(".");
  return Array.from({ length: 254 }, (_, i) => `${base}.${i + 1}`);
};

export default function PrinterWifi() {
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [printers, setPrinters] = useState<DiscoveredPrinter[]>([]);
  const [selectedPrinter, setSelectedPrinterState] =
    useState<DiscoveredPrinter | null>(null);
  const [savedPrinter, setSavedPrinter] = useState<DiscoveredPrinter | null>(
    null,
  );
  const [connectedTarget, setConnectedTarget] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const [manualIp, setManualIp] = useState("");
  const [manualPort, setManualPort] = useState("9100");

  const isMounted = useRef(true);
  const scannedTargets = useRef<Set<string>>(new Set());

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");
  const { isMobile } = useResponsive();

  useEffect(() => {
    isMounted.current = true;
    if (NetPrinter) {
      NetPrinter.init().catch((e: any) =>
        console.warn("[PrinterWifi] NetPrinter.init failed:", e),
      );
    }
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw && isMounted.current) {
        const p: DiscoveredPrinter = JSON.parse(raw);
        if (p.connectionType === "wifi") {
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

  const addPrinter = (p: DiscoveredPrinter) => {
    if (!isMounted.current) return;
    const key = p.target;
    if (scannedTargets.current.has(key)) return;
    scannedTargets.current.add(key);
    setPrinters((prev) => [...prev, p]);
  };

  const runSubnetScan = async (): Promise<void> => {
    const NetworkInfo = getNetworkInfo();
    const deviceIp: string | null = await NetworkInfo.getIPAddress();
    if (!deviceIp || !isMounted.current) return;

    const ips = buildSubnetIps(deviceIp);
    const totalProbes = ips.length * PRINTER_PORTS.length;
    let done = 0;

    const tasks = ips.flatMap((ip) =>
      PRINTER_PORTS.map((port) => async () => {
        const ok = await tcpProbe(ip, port);
        done++;
        if (isMounted.current)
          setScanProgress(Math.round((done / totalProbes) * 100));
        if (ok) {
          addPrinter({
            target: `${ip}:${port}`,
            deviceName: `Wi-Fi Printer (${ip})`,
            ip,
            port,
            connectionType: "wifi",
            source: "scan",
          });
        }
      }),
    );
    await pLimit(tasks, SCAN_CONCURRENCY);
  };

  const handleScan = async () => {
    if (!isMounted.current) return;
    setPrinters([]);
    scannedTargets.current.clear();
    setScanProgress(0);
    setScreenState("discovering");
    await runSubnetScan();
    if (!isMounted.current) return;
    setPrinters((prev) => {
      setScreenState(prev.length > 0 ? "found" : "empty");
      return prev;
    });
  };

  const handleAddManual = () => {
    const ip = manualIp.trim();
    const port = parseInt(manualPort, 10) || 9100;
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
      // alert("Enter a valid IP address (e.g. 192.168.1.100)");
      setAlertTitle("Invalid IP");
      setAlertBody("Enter a valid IP address (e.g. 192.168.1.100)");
      setAlertVisible(true);
      return;
    }
    addPrinter({
      target: `${ip}:${port}`,
      deviceName: `Wi-Fi Printer (${ip})`,
      ip,
      port,
      connectionType: "wifi",
      source: "manual",
    });
    setScreenState("found");
  };

  const handleConnect = async () => {
    if (!selectedPrinter) return;
    if (!NetPrinter) {
      // alert("Wi-Fi printing is not available on this device.");
      setAlertTitle("Error");
      setAlertBody("Wi-Fi printing is not available on this device.");
      setAlertVisible(true);
      return;
    }
    setIsConnecting(true);
    try {
      await NetPrinter.connectPrinter(selectedPrinter.ip, selectedPrinter.port);
      await NetPrinter.closeConn();

      const isGodex =
        selectedPrinter.deviceName?.toLowerCase().includes("godex") ||
        selectedPrinter.deviceName?.toLowerCase().includes("mx") ||
        selectedPrinter.deviceName?.toLowerCase().includes("gd");
      const protocol = isGodex ? "ezpl" : "escpos";
      const toSave: DiscoveredPrinter = {
        ...selectedPrinter,
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
      if (NetPrinter) {
        try {
          await NetPrinter.closeConn();
        } catch (_) {}
      }
      setAlertTitle("Connection Failed");
      setAlertBody(
        `Cannot reach ${selectedPrinter.target}.\n${
          e?.message ?? "Check that the printer is on."
        }`,
      );
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
            <MaterialIcons name="wifi" size={16} color={AppColors.secondary} />
            <Text style={styles.selectedBarText} numberOfLines={1}>
              {selectedPrinter.deviceName}
            </Text>
          </View>
        )}

        {/* Manual IP entry — always visible */}
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="IP address  e.g. 192.168.1.100"
            placeholderTextColor={AppColors.grey}
            value={manualIp}
            onChangeText={setManualIp}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <TextInput
            style={[styles.manualInput, { width: 72 }]}
            placeholder="Port"
            placeholderTextColor={AppColors.grey}
            value={manualPort}
            onChangeText={setManualPort}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.manualAddBtn}
            onPress={handleAddManual}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {screenState === "idle" && (
          <View style={styles.centerBox}>
            <MaterialIcons name="wifi-find" size={56} color={AppColors.grey} />
            <Text style={styles.centerText}>Ready to scan</Text>
            <Text style={styles.centerSub}>
              Tap "Scan" to find Wi-Fi printers on your network
            </Text>
          </View>
        )}

        {screenState === "discovering" && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={AppColors.secondary} />
            <Text style={styles.centerText}>Scanning network...</Text>
            <Text style={styles.centerSub}>mDNS + TCP sweep in progress</Text>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${scanProgress}%` }]}
              />
            </View>
            <Text style={styles.progressLabel}>{scanProgress}%</Text>
            {printers.length > 0 && (
              <Text style={styles.foundSoFar}>
                {printers.length} printer{printers.length !== 1 ? "s" : ""}{" "}
                found so far
              </Text>
            )}
          </View>
        )}

        {screenState === "empty" && (
          <View style={styles.centerBox}>
            <MaterialIcons name="wifi-off" size={52} color={AppColors.grey} />
            <Text style={styles.centerText}>No printers found</Text>
            <Text style={styles.centerSub}>
              Make sure the printer is on the same Wi-Fi network
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
              {printers.length} printer{printers.length !== 1 ? "s" : ""} found
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
                        name="wifi"
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
                        {item.ip}:{item.port}
                      </Text>
                      <View
                        style={[
                          styles.sourceBadge,
                          item.source === "manual" && styles.sourceBadgeManual,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sourceBadgeText,
                            item.source === "manual" &&
                              styles.sourceBadgeTextManual,
                          ]}
                        >
                          {item.source === "manual" ? "Manual" : "TCP scan"}
                        </Text>
                      </View>
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
              screenState === "discovering" && styles.footerBtnDisabled,
            ]}
            disabled={screenState === "discovering"}
            onPress={handleScan}
          >
            <MaterialIcons
              name="wifi-find"
              size={17}
              color={AppColors.secondary}
            />
            <Text style={styles.footerBtnOutlineText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.footerBtnPrimary,
              (!selectedPrinter ||
                isConnecting ||
                screenState === "discovering") &&
                styles.footerBtnDisabled,
            ]}
            disabled={
              !selectedPrinter || isConnecting || screenState === "discovering"
            }
            onPress={handleConnect}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color={AppColors.background2} />
            ) : (
              <MaterialIcons
                name="save"
                size={17}
                color={AppColors.background2}
              />
            )}
            <Text style={styles.footerBtnPrimaryText}>
              {isConnecting ? "Saving..." : "Save Printer"}
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

  manualRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  manualInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: AppColors.grey,
    paddingHorizontal: 12,
    backgroundColor: AppColors.background,
    color: AppColors.textPrimary,
    fontSize: 13,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  manualAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: AppColors.secondary,
    alignItems: "center",
    justifyContent: "center",
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
  foundSoFar: {
    fontSize: 13,
    color: AppColors.secondary,
    marginTop: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 99,
    backgroundColor: AppColors.grey + "44",
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: AppColors.secondary,
  },
  progressLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
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

  sourceBadge: {
    alignSelf: "flex-start",
    marginTop: 5,
    backgroundColor: AppColors.grey + "33",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  sourceBadgeManual: {
    backgroundColor: "#FF980018",
  },
  sourceBadgeText: {
    fontSize: 10,
    color: AppColors.textSecondary,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  sourceBadgeTextManual: {
    color: "#E65100",
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
