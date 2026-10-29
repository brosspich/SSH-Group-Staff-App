import { renderAlertModal } from "@/components/alert/alert";
import AppBarGlass from "@/components/appbar/AppBarGlass";
import ScannerModal from "@/components/home/ScannerModal";
import SuccessConfirmationModal from "@/components/home/SuccessConfirmationModal";
import Loading from "@/components/loading/loading";
import { RequestAttendanceModal } from "@/components/request_attendance/RequestAttendanceModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import {
  calculateAttendanceType,
  fetchOfficialAttendanceConfig,
  getTimeWindowDisplay,
  isValidAttendanceQR,
} from "@/constants/attendanceConfig";
import { useResponsive } from "@/hooks/useResponsive";
import { verifyAttendanceSecurity } from "@/services/locationService";
import { sendAttendanceToTelegram } from "@/services/telegramService";
import { StaffUser, userService } from "@/services/userService";
import { supabase } from "@/utils/supabase";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Attendance Item Type Definition ──────────────────────────────────────────

export type AttendanceType = "time-in" | "time-out" | "time-other";

export interface AttendanceRecord {
  id: string;
  staff_id: string;
  system_id?: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // hh:mm:ss AM/PM
  type: AttendanceType;
  timestamp: string; // ISO string
  qr_data?: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

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

  return `ATT-${block1}-${block2}-${block3}`;
}

export default function DashboardIndex() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [officialQrList, setOfficialQrList] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState<string>("SSH Group");
  const [timeInConfig, setTimeInConfig] = useState<string>("08:00:00");
  const [timeOutConfig, setTimeOutConfig] = useState<string>("17:00:00");

  // Scanner modal states
  const [scannerVisible, setScannerVisible] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Security checking states
  const [verifyingSecurity, setVerifyingSecurity] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [securityErrorTitle, setSecurityErrorTitle] = useState(
    "Security Check Failed",
  );
  const [securityErrorMessage, setSecurityErrorMessage] = useState("");

  // Invalid QR alert modal state
  const [invalidQrModalVisible, setInvalidQrModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  // Success result modal
  const [lastRecord, setLastRecord] = useState<AttendanceRecord | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

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
      const u = await userService.get();
      let activeUser = u;

      if (u?.id) {
        // Fetch fresh user row from Supabase
        const { data: dbUser } = await supabase
          .from("ssh_group_staff_users")
          .select("*")
          .eq("id", u.id)
          .maybeSingle();

        if (dbUser) {
          activeUser = dbUser;
          await userService.save(dbUser);
        }
        setUser(activeUser);

        // Parse attendance jsonb column
        let list: AttendanceRecord[] = [];
        if (Array.isArray(activeUser?.attendance)) {
          list = activeUser.attendance;
        } else if (typeof activeUser?.attendance === "string") {
          try {
            list = JSON.parse(activeUser.attendance);
          } catch (e) {}
        }
        setAttendanceList(list);
      }

      // Fetch config matching active user's system_id
      const config = await fetchOfficialAttendanceConfig(
        false,
        activeUser?.system_id || activeUser?.id,
      );
      setOfficialQrList(config.qrCodes);
      if (config.companyName) setCompanyName(config.companyName);
      if (config.timeIn) setTimeInConfig(config.timeIn);
      if (config.timeOut) setTimeOutConfig(config.timeOut);
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

  const isScanningRef = useRef(false);

  // Open scanner modal with Location & Security Checks
  const handleOpenScanner = async () => {
    if (verifyingSecurity) return;
    isScanningRef.current = false;
    setScanned(false);
    // Refresh official QR codes & shift time on open (cached)
    fetchOfficialAttendanceConfig(false, user?.system_id).then((cfg) => {
      setOfficialQrList(cfg.qrCodes);
      if (cfg.companyName) setCompanyName(cfg.companyName);
      if (cfg.timeIn) setTimeInConfig(cfg.timeIn);
      if (cfg.timeOut) setTimeOutConfig(cfg.timeOut);
    });

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

    // Perform Location Geofence & Anti-Spoofing / Anti-VPN Security Check
    setVerifyingSecurity(true);
    try {
      const secCheck = await verifyAttendanceSecurity(false, user?.system_id);
      if (!secCheck.allowed) {
        let title = "Security Verification Failed";
        if (secCheck.code === "OUT_OF_RANGE") {
          title = "Outside Company Location";
        } else if (secCheck.code === "MOCK_LOCATION") {
          title = "Fake Location Detected";
        } else if (secCheck.code === "VPN_DETECTED") {
          title = "VPN Network Detected";
        } else if (secCheck.code === "PERMISSION_DENIED") {
          title = "Location Permission Required";
        }

        setSecurityErrorTitle(title);
        setSecurityErrorMessage(
          secCheck.reason ||
            "Security verification failed. Attendance scan is not permitted.",
        );
        setSecurityModalVisible(true);
        return;
      }

      setScannerVisible(true);
    } finally {
      setVerifyingSecurity(false);
    }
  };

  const handleOpenRequestAttendance = () => {
    setRequestModalVisible(true);
  };

  // Instant Camera Barcode Scanned Handler
  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (isScanningRef.current) return;
      if (!data) return;

      isScanningRef.current = true;
      setScanned(true);

      // Instant QR code verification
      if (!isValidAttendanceQR(data, officialQrList)) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (e) {}
        setInvalidQrModalVisible(true);
        return;
      }

      // Valid QR code match - instant tactile haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}

      // Immediately build record and display confirmation modal (0ms UI lag)
      const now = new Date();
      const attType = calculateAttendanceType(now, timeInConfig, timeOutConfig);
      const dateStr = formatDateYMD(now);
      const timeStr = formatTime12h(now);
      const newRecordId = generateNextAttendanceId(attendanceList);

      const newRecord: AttendanceRecord = {
        id: newRecordId,
        staff_id: user?.id || "",
        system_id: user?.system_id || "",
        name: user?.name || "",
        date: dateStr,
        time: timeStr,
        type: attType,
        timestamp: now.toISOString(),
        qr_data: data,
      };

      setLastRecord(newRecord);
      setScannerVisible(false);
      setSuccessModalVisible(true);
    },
    [officialQrList, user, attendanceList, timeInConfig, timeOutConfig],
  );

  const handleConfirmAttendance = async () => {
    if (!lastRecord || !user?.id || savingAttendance) return;

    setSavingAttendance(true);

    // Double check security right before saving (uses fast cached security state)
    const secCheck = await verifyAttendanceSecurity(false, user?.system_id);
    if (!secCheck.allowed) {
      setSuccessModalVisible(false);
      setSecurityErrorTitle("Security Verification Failed");
      setSecurityErrorMessage(
        secCheck.reason ||
          "Security check failed. Attendance record was cancelled.",
      );
      setSecurityModalVisible(true);
      setSavingAttendance(false);
      isScanningRef.current = false;
      setScanned(false);
      return;
    }

    const updatedList = [lastRecord, ...attendanceList];

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

      // Send attendance details to Telegram for user's specific system (non-blocking)
      sendAttendanceToTelegram(
        { ...lastRecord, system_id: user.system_id || lastRecord.system_id },
        undefined,
        user.system_id,
      );

      setSuccessModalVisible(false);
    } catch (e) {
      Alert.alert("Save Error", "Failed to save attendance. Please try again.");
    } finally {
      setSavingAttendance(false);
      isScanningRef.current = false;
      setScanned(false);
    }
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
      <>
        <StatusBar
          backgroundColor={AppColors.secondary}
          barStyle="light-content"
        />
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
            bodyTxt: `The scanned QR code does not match the official ${companyName || "SSH Group"} Attendance QR Code. Attendance was not recorded.`,
            onPress: () => setScanned(false),
            isMobile,
          })}
        </View>
      </>
    );
  }

  const currentType = calculateAttendanceType(
    currentTime,
    timeInConfig,
    timeOutConfig,
  );

  const timeInWindow = getTimeWindowDisplay(timeInConfig, "08:00:00");
  const timeOutWindow = getTimeWindowDisplay(timeOutConfig, "17:00:00");

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={AppColors.secondary}
        barStyle="light-content"
      />
      <AppBarGlass />

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
            // !isMobile && { maxWidth: 850, width: "100%", alignSelf: "center" },
          ]}
        >
          {/* ── Welcome Banner Card ── */}
          <LinearGradient
            colors={[AppColors.secondary, AppColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bannerCard, { paddingTop: 65 + insets.top }]}
          >
            <View style={styles.bannerTop}>
              <View style={styles.bannerUserInfo}>
                <Text style={styles.bannerGreeting}>Welcome back!</Text>
                <Text
                  style={styles.bannerName}
                  numberOfLines={1}
                  // adjustsFontSizeToFit={true}
                  // minimumFontScale={0.8}
                >
                  {user?.name ?? "Staff Member"}
                </Text>
                <View style={styles.bannerBotton}>
                  <View style={styles.bannerMetaRow}>
                    <View style={styles.bannerBadge}>
                      <Text style={styles.bannerBadgeText}>
                        ID : {user?.id ?? "—"}
                      </Text>
                    </View>
                    <View style={styles.bannerBadge}>
                      <Text
                        style={styles.bannerBadgeText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {user?.position ?? "-"}
                      </Text>
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
                      <View
                        style={[
                          styles.shiftDot,
                          currentType === "time-in"
                            ? { backgroundColor: "#22c55e" }
                            : currentType === "time-out"
                              ? { backgroundColor: "#ef4444" }
                              : { backgroundColor: "#a855f7" },
                        ]}
                      />
                      <Text style={styles.shiftBadgeText}>
                        Current: {currentType.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Today Attendance Summary Cards ── */}
            <View style={styles.conSummary}>
              <View style={styles.bgConSummary}></View>
              <View style={styles.summaryRow}>
                {/* Time-In */}
                <View style={styles.summaryCard}>
                  <View
                    style={[
                      styles.summaryIconBox,
                      { backgroundColor: "#dce0fc" },
                    ]}
                  >
                    <Feather name="log-in" size={20} color="#0022ff" />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>
                      TIME-IN ({timeInWindow.target})
                    </Text>
                    {/* <Text style={styles.summaryWindowSub}>
                      {timeInWindow.start} to {timeInWindow.end}
                    </Text> */}
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: todayTimeIn ? "#0022ff" : AppColors.grey },
                      ]}
                    >
                      {todayTimeIn ? todayTimeIn.time : "Not Scanned"}
                    </Text>
                  </View>
                </View>

                {/* Time-Out */}
                <View style={styles.summaryCard}>
                  <View
                    style={[
                      styles.summaryIconBox,
                      { backgroundColor: "#fedbdb" },
                    ]}
                  >
                    <Feather name="log-out" size={20} color="#ff0000" />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>
                      TIME-OUT ({timeOutWindow.target})
                    </Text>
                    {/* <Text style={styles.summaryWindowSub}>
                      {timeOutWindow.start} to {timeOutWindow.end}
                    </Text> */}
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: todayTimeOut ? "#ff0000" : AppColors.grey },
                      ]}
                    >
                      {todayTimeOut ? todayTimeOut.time : "Not Scanned"}
                    </Text>
                  </View>
                </View>

                {/* Time-Other */}
                <View style={styles.summaryCard}>
                  <View
                    style={[
                      styles.summaryIconBox,
                      { backgroundColor: "#f3e8ff" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="clock-time-four-outline"
                      size={20}
                      color="#7e22ce"
                    />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>TIME-OTHER</Text>
                    {/* <Text style={styles.summaryWindowSub}>Other time</Text> */}
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color:
                            todayOtherCount > 0 ? "#7e22ce" : AppColors.grey,
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
            </View>
          </LinearGradient>

          {/* ── Main Action: Scan Attendance Button ── */}
          <TouchableOpacity
            style={styles.scanBtnContainer}
            onPress={handleOpenScanner}
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
                  <ActivityIndicator
                    size="small"
                    color={AppColors.background2}
                  />
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
            onPress={handleOpenRequestAttendance}
            // disabled={verifyingSecurity}
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
                <Text style={styles.requestBtnTitle}>
                  Request Attendance Rules
                </Text>
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

          {/* <AppleButton title="Test" onPress={() => {}} variant={"filled"} /> */}

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
              {attendanceList.slice(0, 4).map((item) => {
                const isTimeIn = item.type === "time-in";
                const isTimeOut = item.type === "time-out";

                const badgeBg = isTimeIn
                  ? "#dce0fc"
                  : isTimeOut
                    ? "#fedbdb"
                    : "#f3e8ff";
                const badgeColor = isTimeIn
                  ? "#0022ff"
                  : isTimeOut
                    ? "#ff0000"
                    : "#7e22ce";

                return (
                  <View key={item.id} style={styles.historyItem}>
                    {/* <TouchableOpacity
                    key={item.id}
                    style={styles.historyItem}
                    onPress={() => router.push("/(tabs)/attendance")}
                    activeOpacity={0.8}
                  > */}

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
                    {/* </TouchableOpacity> */}
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ paddingBottom: 90 }} />
        </View>
      </ScrollView>

      {/* ── Scanner Modal ── */}
      <ScannerModal
        visible={scannerVisible}
        onClose={() => {
          setScannerVisible(false);
          isScanningRef.current = false;
          setScanned(false);
        }}
        torchOn={torchOn}
        setTorchOn={setTorchOn}
        scanned={scanned}
        onBarcodeScanned={handleBarCodeScanned}
      />

      {/* ── Success Confirmation Modal ── */}
      <SuccessConfirmationModal
        visible={successModalVisible}
        savingAttendance={savingAttendance}
        lastRecord={lastRecord}
        onConfirm={handleConfirmAttendance}
        onClose={() => {
          setSuccessModalVisible(false);
          isScanningRef.current = false;
          setScanned(false);
        }}
      />

      {/* ── Invalid QR Alert Modal ── */}
      {renderAlertModal({
        alertModalVisible: invalidQrModalVisible,
        setAlertModalVisible: (visible) => {
          setInvalidQrModalVisible(visible);
          if (!visible) {
            isScanningRef.current = false;
            setScanned(false);
          }
        },
        title: "Invalid Attendance QR Code",
        bodyTxt: `The scanned QR code does not match the official ${companyName || "SSH Group"} Attendance QR Code. Attendance was not recorded.`,
        onPress: () => {
          isScanningRef.current = false;
          setScanned(false);
        },
        isMobile,
      })}

      {/* ── Security / Location Error Alert Modal ── */}
      {renderAlertModal({
        alertModalVisible: securityModalVisible,
        setAlertModalVisible: (visible) => {
          setSecurityModalVisible(visible);
          if (!visible) {
            isScanningRef.current = false;
            setScanned(false);
          }
        },
        title: securityErrorTitle,
        bodyTxt: securityErrorMessage,
        onPress: () => {
          isScanningRef.current = false;
          setScanned(false);
        },
        isMobile,
      })}

      {/* ── Request Attendance Modal ── */}
      <RequestAttendanceModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        user={user}
      />
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
    // paddingHorizontal: 16,
    // paddingVertical: 12,
  },

  // Banner
  bannerCard: {
    // borderRadius: 20,
    // paddingHorizontal: 20,
    // marginBottom: 16,
    // ...Platform.select({
    //   web: {
    //     boxShadow: "0px 4px 12px rgba(46, 49, 145, 0.25)",
    //   },
    //   default: {
    //     shadowColor: AppColors.primary,
    //     shadowOffset: { width: 0, height: 4 },
    //     shadowOpacity: 0.25,
    //     shadowRadius: 10,
    //     elevation: 6,
    //   },
    // }),
    // height: "40%",
  },
  bannerTop: {
    paddingHorizontal: 20,
  },
  bannerUserInfo: {
    width: "100%",
  },
  bannerGreeting: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.85)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  bannerName: {
    fontSize: 18,
    // fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    marginVertical: 3,
  },
  bannerBotton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 6,
  },
  bannerMetaRow: {
    width: "50%",
    gap: 7,
    paddingRight: 4,
  },
  bannerBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  bannerBadgeText: {
    fontSize: 11,
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  clockBox: {
    width: "50%",
    alignItems: "flex-end",
    paddingLeft: 4,
  },
  clockTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    textAlign: "right",
  },
  clockDate: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 2,
    textAlign: "right",
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 6,
    gap: 5,
    alignSelf: "flex-end",
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
  conSummary: {
    marginTop: 30,
  },
  bgConSummary: {
    backgroundColor: AppColors.background,
    height: 55,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    // marginBottom: 16,
    flexWrap: "wrap",
    paddingHorizontal: 20,
  },
  summaryCard: {
    flex: 1,
    minWidth: 95,
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    padding: 12,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1.5,
    borderColor: AppColors.grey + 70,
  },
  summaryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTextContainer: {
    alignSelf: "stretch",
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: AppColors.grey,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    lineHeight: 12,
  },
  // summaryWindowSub: {
  //   fontSize: 8.5,
  //   color: "#6b7280",
  //   fontFamily: AppFonts.regular,
  //   marginTop: 1,
  //   includeFontPadding: false,
  // },
  summaryValue: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Main Scan Button
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

  // Core Request Button
  requestBtnContainer: {
    marginBottom: 20,
    // marginTop: 20,
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
    fontWeight: "bold",
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

  // History Header
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 15,
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
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppColors.grey + 40,
    marginHorizontal: 15,
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
});
