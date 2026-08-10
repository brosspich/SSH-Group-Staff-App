import { renderAlertModal } from "@/components/alert/alert";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  fetchOfficialAttendanceQRCodes,
  isValidAttendanceQR,
} from "@/constants/attendanceConfig";
import { useResponsive } from "@/hooks/useResponsive";
import { StaffUser, userService } from "@/services/userService";
import { supabase } from "@/utils/supabase";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// ─── Attendance Item Type Definition ──────────────────────────────────────────

export type AttendanceType = "time-in" | "time-out" | "time-other";

export interface AttendanceRecord {
  id: string;
  staff_id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // hh:mm:ss AM/PM
  type: AttendanceType;
  timestamp: string; // ISO string
  qr_data?: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Classifies current time into time-in, time-out, or time-other
 * time-in:  07:00 AM to 09:00 AM
 * time-out: 04:00 PM to 06:00 PM (16:00 to 18:00)
 * time-other: any other time
 */
export function calculateAttendanceType(now = new Date()): AttendanceType {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 7:00 AM (420 mins) to 9:00 AM (540 mins)
  if (totalMinutes >= 420 && totalMinutes <= 540) {
    return "time-in";
  }

  // 4:00 PM (16:00 = 960 mins) to 6:00 PM (18:00 = 1080 mins)
  if (totalMinutes >= 960 && totalMinutes <= 1080) {
    return "time-out";
  }

  return "time-other";
}

export function formatTime12h(date = new Date()): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatDateYMD(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Generates formatted attendance ID: att-XXXX-YYYY-ZZZZ
 * att-0000-0000-9999 -> att-0000-0001-0000
 * att-0000-9999-9999 -> att-0001-0000-0000
 */
export function generateNextAttendanceId(
  existingRecords: AttendanceRecord[] = [],
): string {
  let maxSeq = 0;

  for (const rec of existingRecords) {
    if (rec?.id && typeof rec.id === "string") {
      const clean = rec.id.replace(/^att[-_]/i, "").replace(/-/g, "");
      const num = parseInt(clean, 10);
      if (!isNaN(num) && num > maxSeq && num < 1000000000000) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(12, "0");
  const block1 = seqStr.substring(0, 4);
  const block2 = seqStr.substring(4, 8);
  const block3 = seqStr.substring(8, 12);

  return `att-${block1}-${block2}-${block3}`;
}

export default function DashboardIndex() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [officialQrList, setOfficialQrList] = useState<string[]>([]);

  // Scanner modal states
  const [scannerVisible, setScannerVisible] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Invalid QR alert modal state
  const [invalidQrModalVisible, setInvalidQrModalVisible] = useState(false);

  // Success result modal
  const [lastRecord, setLastRecord] = useState<AttendanceRecord | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Filter history: "all" | "today" | "month"
  const [historyFilter, setHistoryFilter] = useState<"today" | "month" | "all">(
    "today",
  );

  const [permission, requestPermission] = useCameraPermissions();
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();

  // Clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial user fetch & official QR codes from Supabase
  const fetchUserAndAttendance = useCallback(async () => {
    try {
      const qrs = await fetchOfficialAttendanceQRCodes();
      setOfficialQrList(qrs);

      const u = await userService.get();
      if (u?.id) {
        // Fetch fresh user row from Supabase
        const { data: dbUser } = await supabase
          .from("ssh_group_staff_users")
          .select("*")
          .eq("id", u.id)
          .maybeSingle();

        const activeUser = dbUser || u;
        setUser(activeUser);
        await userService.save(activeUser);

        // Parse attendance jsonb column
        let list: AttendanceRecord[] = [];
        if (Array.isArray(activeUser.attendance)) {
          list = activeUser.attendance;
        } else if (typeof activeUser.attendance === "string") {
          try {
            list = JSON.parse(activeUser.attendance);
          } catch (e) {}
        }
        setAttendanceList(list);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserAndAttendance();
  }, [fetchUserAndAttendance]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserAndAttendance();
  }, [fetchUserAndAttendance]);

  // Open scanner modal
  const handleOpenScanner = async () => {
    setScanned(false);
    // Refresh official QR codes on open
    fetchOfficialAttendanceQRCodes().then(setOfficialQrList);

    if (Platform.OS !== "web" && (!permission || !permission.granted)) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please grant camera access to scan attendance QR codes.",
        );
        return;
      }
    }
    setScannerVisible(true);
  };

  // Process QR Data & Save Attendance
  const processAttendanceScan = async (qrDataText: string) => {
    if (!user?.id || scanned) return;

    // Check if scanned QR matches myQrCode configuration
    if (!isValidAttendanceQR(qrDataText, officialQrList)) {
      setScanned(true);
      setInvalidQrModalVisible(true);
      return;
    }

    setScanned(true);

    const now = new Date();
    const attType = calculateAttendanceType(now);
    const dateStr = formatDateYMD(now);
    const timeStr = formatTime12h(now);

    const newRecordId = generateNextAttendanceId(attendanceList);

    const newRecord: AttendanceRecord = {
      id: newRecordId,
      staff_id: user.id,
      name: user.name,
      date: dateStr,
      time: timeStr,
      type: attType,
      timestamp: now.toISOString(),
      qr_data: qrDataText,
    };

    // Construct updated list (prepend new record)
    const updatedList = [newRecord, ...attendanceList];

    try {
      // Save directly to Supabase table ssh_group_staff_users attendance column
      const { error } = await supabase
        .from("ssh_group_staff_users")
        .update({ attendance: updatedList })
        .eq("id", user.id);

      if (error) {
        console.warn("Failed to update attendance in Supabase:", error);
      }

      // Update local state and AsyncStorage
      const updatedUser: StaffUser = { ...user, attendance: updatedList };
      setUser(updatedUser);
      setAttendanceList(updatedList);
      await userService.save(updatedUser);

      setLastRecord(newRecord);
      setScannerVisible(false);
      setSuccessModalVisible(true);
    } catch (e) {
      Alert.alert("Scan Error", "Failed to save attendance. Please try again.");
    }
  };

  // Camera Barcode Scanned Handler
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    processAttendanceScan(data);
  };

  // Calculate today's status badges
  const todayStr = formatDateYMD(currentTime);
  const todayRecords = attendanceList.filter((r) => r.date === todayStr);
  const todayTimeIn = todayRecords.find((r) => r.type === "time-in");
  const todayTimeOut = todayRecords.find((r) => r.type === "time-out");
  const todayOtherCount = todayRecords.filter(
    (r) => r.type === "time-other",
  ).length;

  // Filtered history list
  const filteredHistory = attendanceList.filter((r) => {
    if (historyFilter === "today") return r.date === todayStr;
    if (historyFilter === "month") {
      const currentMonth = todayStr.substring(0, 7); // YYYY-MM
      return r.date.startsWith(currentMonth);
    }
    return true;
  });

  if (loading) {
    return (
      <View style={styles.safe}>
        <View style={styles.centered}>
          <Loading />
        </View>
        {/* ── Invalid QR Alert Modal ── */}
        {renderAlertModal({
          alertModalVisible: invalidQrModalVisible,
          setAlertModalVisible: (visible) => {
            setInvalidQrModalVisible(visible);
            if (!visible) setScanned(false);
          },
          title: "Invalid Attendance QR Code",
          bodyTxt:
            "The scanned QR code does not match the official SSH Group Attendance QR Code. Attendance was not recorded.",
          onPress: () => setScanned(false),
          isMobile,
        })}
      </View>
    );
  }

  const currentType = calculateAttendanceType(currentTime);

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }
      >
        <View
          style={[
            styles.container,
            !isMobile && { maxWidth: "70%", alignSelf: "center" },
          ]}
        >
          {/* ── Welcome Banner Card ── */}
          <LinearGradient
            colors={[AppColors.secondary, AppColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerCard}
          >
            <View style={styles.bannerTop}>
              <View style={styles.bannerUserInfo}>
                <Text style={styles.bannerGreeting}>Welcome back</Text>
                <Text style={styles.bannerName}>
                  {user?.name ?? "Staff Member"}
                </Text>
                <View style={styles.bannerMetaRow}>
                  <View style={styles.bannerBadge}>
                    <Text style={styles.bannerBadgeText}>
                      ID: {user?.id ?? "—"}
                    </Text>
                  </View>
                  <View style={styles.bannerBadge}>
                    <Text style={styles.bannerBadgeText}>
                      {user?.position ?? "Staff"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.clockBox}>
                <Text style={styles.clockTime}>
                  {formatTime12h(currentTime)}
                </Text>
                <Text style={styles.clockDate}>
                  {currentTime.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                <View style={styles.shiftBadge}>
                  <View style={styles.shiftDot} />
                  <Text style={styles.shiftBadgeText}>
                    Current: {currentType.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* ── Today Attendance Summary Cards ── */}
          <View style={styles.summaryRow}>
            {/* Time-In */}
            <View style={styles.summaryCard}>
              <View
                style={[styles.summaryIconBox, { backgroundColor: "#dcfce7" }]}
              >
                <Feather name="log-in" size={20} color="#15803d" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>TIME-IN (8:00 AM)</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: todayTimeIn ? "#15803d" : AppColors.grey },
                  ]}
                >
                  {todayTimeIn ? todayTimeIn.time : "Not Scanned"}
                </Text>
              </View>
            </View>

            {/* Time-Out */}
            <View style={styles.summaryCard}>
              <View
                style={[styles.summaryIconBox, { backgroundColor: "#dbeafe" }]}
              >
                <Feather name="log-out" size={20} color="#1d4ed8" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>TIME-OUT (5:00 PM)</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: todayTimeOut ? "#1d4ed8" : AppColors.grey },
                  ]}
                >
                  {todayTimeOut ? todayTimeOut.time : "Not Scanned"}
                </Text>
              </View>
            </View>

            {/* Time-Other */}
            <View style={styles.summaryCard}>
              <View
                style={[styles.summaryIconBox, { backgroundColor: "#f3e8ff" }]}
              >
                <MaterialCommunityIcons
                  name="clock-time-four-outline"
                  size={20}
                  color="#7e22ce"
                />
              </View>
              <View>
                <Text style={styles.summaryLabel}>TIME-OTHER</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: todayOtherCount > 0 ? "#7e22ce" : AppColors.grey,
                    },
                  ]}
                >
                  {todayOtherCount > 0
                    ? `${todayOtherCount} Record(s)`
                    : "None"}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Main Action: Scan Attendance Button ── */}
          <TouchableOpacity
            style={styles.scanBtnContainer}
            onPress={handleOpenScanner}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[AppColors.primary, AppColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanBtn}
            >
              <View style={styles.scanBtnIconCircle}>
                <Ionicons
                  name="qr-code-outline"
                  size={28}
                  color={AppColors.background2}
                />
              </View>
              <View style={styles.scanBtnTextCol}>
                <Text style={styles.scanBtnTitle}>Scan Attendance QR Code</Text>
                <Text style={styles.scanBtnSub}>
                  Tap to open camera scanner
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={AppColors.background2}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Recent History Section ── */}
          <View style={styles.historyHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Attendance Logs</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/attendance")}
              style={styles.viewAllBtn}
            >
              <Text style={styles.viewAllText}>
                View All ({attendanceList.length})
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={AppColors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Recent History List (First 3) */}
          {attendanceList.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="calendar-outline"
                size={42}
                color={AppColors.grey}
              />
              <Text style={styles.emptyTitle}>No Attendance Records</Text>
              <Text style={styles.emptySub}>
                Scan a QR code to record your time-in, time-out, or time-other.
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {attendanceList.slice(0, 2).map((item) => {
                const isTimeIn = item.type === "time-in";
                const isTimeOut = item.type === "time-out";

                const badgeBg = isTimeIn
                  ? "#dcfce7"
                  : isTimeOut
                    ? "#dbeafe"
                    : "#f3e8ff";
                const badgeColor = isTimeIn
                  ? "#15803d"
                  : isTimeOut
                    ? "#1d4ed8"
                    : "#7e22ce";

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.historyItem}
                    onPress={() => router.push("/(tabs)/attendance")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.historyItemLeft}>
                      <View
                        style={[
                          styles.historyBadge,
                          { backgroundColor: badgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.historyBadgeText,
                            { color: badgeColor },
                          ]}
                        >
                          {item.type.toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.historyItemTime}>{item.time}</Text>
                        <Text style={styles.historyItemDate}>{item.date}</Text>
                      </View>
                    </View>

                    <View style={styles.historyItemRight}>
                      <Text style={styles.historyStaffName}>{item.name}</Text>
                      <Text style={styles.historyStaffId}>
                        ID: {item.staff_id}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ marginTop: 20 }} />
        </View>
      </ScrollView>

      {/* ── Scanner Modal (Camera Only) ── */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScannerVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.secondary }}>
          <View
            style={[
              styles.modalHeader,
              {
                paddingTop:
                  insets.top > 0
                    ? insets.top + (Platform.OS === "android" ? 10 : 6)
                    : Platform.OS === "android"
                      ? 36
                      : 16,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setScannerVisible(false)}
            >
              <Ionicons name="close" size={24} color={AppColors.background2} />
            </TouchableOpacity>

            <Text style={styles.modalHeaderTitle}>Scan Attendance QR Code</Text>

            <TouchableOpacity
              style={styles.torchBtn}
              onPress={() => setTorchOn((t) => !t)}
            >
              <Ionicons
                name={torchOn ? "flash" : "flash-outline"}
                size={24}
                color={AppColors.background2}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraContainer}>
            {Platform.OS === "web" ? (
              <View style={styles.webFallbackContainer}>
                <Ionicons
                  name="camera-outline"
                  size={60}
                  color={AppColors.grey}
                />
                <Text style={styles.webFallbackTitle}>Web Camera Preview</Text>
                <Text style={styles.webFallbackSub}>
                  Camera QR scanning requires an iOS or Android device.
                </Text>
              </View>
            ) : (
              <>
                <CameraView
                  style={StyleSheet.absoluteFill}
                  enableTorch={torchOn}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                />
                <View
                  style={[styles.overlayCenter, StyleSheet.absoluteFill]}
                  pointerEvents="box-none"
                >
                  <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                  </View>
                  <Text style={styles.scanInstruction}>
                    Align Attendance QR Code inside the frame
                  </Text>
                </View>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Success Confirmation Modal ── */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons
                name="checkmark"
                size={40}
                color={AppColors.background2}
              />
            </View>

            <Text style={styles.successTitle}>Attendance Recorded!</Text>

            {lastRecord && (
              <View style={styles.successDetails}>
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Staff Name:</Text>
                  <Text style={styles.successDetailValue}>
                    {lastRecord.name}
                  </Text>
                </View>

                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Staff ID:</Text>
                  <Text style={styles.successDetailValue}>
                    {lastRecord.staff_id}
                  </Text>
                </View>

                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Scan Type:</Text>
                  <View
                    style={[
                      styles.historyBadge,
                      {
                        backgroundColor:
                          lastRecord.type === "time-in"
                            ? "#dcfce7"
                            : lastRecord.type === "time-out"
                              ? "#dbeafe"
                              : "#f3e8ff",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyBadgeText,
                        {
                          color:
                            lastRecord.type === "time-in"
                              ? "#15803d"
                              : lastRecord.type === "time-out"
                                ? "#1d4ed8"
                                : "#7e22ce",
                        },
                      ]}
                    >
                      {lastRecord.type.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Time Logged:</Text>
                  <Text style={styles.successDetailValue}>
                    {lastRecord.time}
                  </Text>
                </View>

                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Date:</Text>
                  <Text style={styles.successDetailValue}>
                    {lastRecord.date}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.successCloseBtn}
              onPress={() => setSuccessModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.successCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Invalid QR Alert Modal ── */}
      {renderAlertModal({
        alertModalVisible: invalidQrModalVisible,
        setAlertModalVisible: (visible) => {
          setInvalidQrModalVisible(visible);
          if (!visible) setScanned(false);
        },
        title: "Invalid Attendance QR Code",
        bodyTxt:
          "The scanned QR code does not match the official SSH Group Attendance QR Code. Attendance was not recorded.",
        onPress: () => setScanned(false),
        isMobile,
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Banner
  bannerCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 12px rgba(46, 49, 145, 0.25)",
      },
      default: {
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  bannerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  bannerUserInfo: {
    flex: 1,
    minWidth: 180,
  },
  bannerGreeting: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  bannerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    marginVertical: 4,
  },
  bannerMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  bannerBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bannerBadgeText: {
    fontSize: 11,
    color: AppColors.background2,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  clockBox: {
    alignItems: "flex-start",
  },
  clockTime: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  clockDate: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    gap: 5,
  },
  shiftDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  shiftBadgeText: {
    fontSize: 10,
    color: AppColors.background2,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Summary Cards
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  summaryCard: {
    flex: 1,
    minWidth: 105,
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  summaryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: AppColors.grey,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Main Scan Button
  scanBtnContainer: {
    marginBottom: 20,
  },
  scanBtn: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  scanBtnIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanBtnTextCol: {
    flex: 1,
  },
  scanBtnTitle: {
    fontSize: 17,
    fontWeight: "bold",
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

  // History Header
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: AppColors.primary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  filterGroup: {
    flexDirection: "row",
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: AppColors.background2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  filterChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterChipText: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  filterChipTextActive: {
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    fontWeight: "bold",
  },

  // History List
  historyList: {
    gap: 10,
  },
  historyItem: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyItemTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyItemDate: {
    fontSize: 11,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },
  historyItemRight: {
    alignItems: "flex-end",
  },
  historyStaffName: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  historyStaffId: {
    fontSize: 11,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
  },

  // Empty State
  emptyCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    marginTop: 10,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: 12,
    color: AppColors.grey,
    textAlign: "center",
    marginTop: 4,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  // Scanner Modal
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
    paddingBottom: 14,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalHeaderTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  modalCloseBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: AppColors.background2,
  },
  torchBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: AppColors.background2,
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
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
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanInstruction: {
    color: AppColors.background2,
    fontSize: 13,
    marginTop: 20,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
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

  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  successCard: {
    backgroundColor: AppColors.background2,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
  },
  successIconCircle: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: AppColors.secondary,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  successDetails: {
    width: "100%",
    backgroundColor: AppColors.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    gap: 10,
  },
  successDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successDetailLabel: {
    fontSize: 12.5,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  successDetailValue: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  successCloseBtn: {
    backgroundColor: AppColors.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  successCloseText: {
    color: AppColors.background2,
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
