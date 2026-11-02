import { renderAlertModal } from "@/components/alert/alert";
import AppBarGlass from "@/components/appbar/AppBarGlass";
import ScannerModal from "@/components/home/ScannerModal";
import SuccessConfirmationModal from "@/components/home/SuccessConfirmationModal";
import Loading from "@/components/loading/loading";
import { RequestAttendanceModal } from "@/components/request_attendance/RequestAttendanceModal";
import { AppColors } from "@/constants/appcolors";
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
import { apiClient } from "@/services/api";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeActionButtons } from "./_components/HomeActionButtons";
import { HomeWelcomeBanner } from "./_components/HomeWelcomeBanner";
import { RecentAttendanceHistory } from "./_components/RecentAttendanceHistory";
import { TodayAttendanceSummary } from "./_components/TodayAttendanceSummary";
import { AttendanceRecord, AttendanceType } from "./_types/home.types";
import {
  formatDateYMD,
  formatTime12h,
  generateNextAttendanceId,
} from "./_utils/homeUtils";

export * from "./_types/home.types";
export * from "./_utils/homeUtils";

export default function HomeScreen() {
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

  // Fetch official QR and time windows
  const loadOfficialConfig = useCallback(async (sysId?: string) => {
    try {
      const config = await fetchOfficialAttendanceConfig(false, sysId);
      setOfficialQrList(config.qrCodes);
      setCompanyName(config.companyName);
      if (config.timeIn) setTimeInConfig(config.timeIn);
      if (config.timeOut) setTimeOutConfig(config.timeOut);
    } catch (e) {
      console.warn("Failed to load official attendance config:", e);
    }
  }, []);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const u = await userService.get();
      if (u?.id) {
        setUser(u);

        // Fetch fresh user row from backend API
        const dbUser = await apiClient
          .get<StaffUser>(`/users-query/${u.id}`)
          .catch(() => null);

        const activeUser = dbUser || u;
        setUser(activeUser);
        await userService.save(activeUser);

        // Parse attendance records
        let list: AttendanceRecord[] = [];
        if (Array.isArray(activeUser.attendance)) {
          list = activeUser.attendance;
        } else if (typeof activeUser.attendance === "string") {
          try {
            list = JSON.parse(activeUser.attendance);
          } catch (e) {}
        }
        setAttendanceList(list);

        // Load config for user's system
        await loadOfficialConfig(activeUser.system_id);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadOfficialConfig]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, [fetchUserData]);

  // Dynamic time windows
  const timeInWindow = getTimeWindowDisplay(timeInConfig, "08:00:00");
  const timeOutWindow = getTimeWindowDisplay(timeOutConfig, "17:00:00");
  const currentType: AttendanceType = calculateAttendanceType(
    currentTime,
    timeInConfig,
    timeOutConfig,
  );

  // Open Scanner with Security Verification
  const handleOpenScanner = async () => {
    if (Platform.OS !== "web") {
      if (!permission?.granted) {
        const { status } = await requestPermission();
        if (status !== "granted") {
          Alert.alert(
            "Camera Access Needed",
            "Please allow camera access in Settings to scan QR code.",
          );
          return;
        }
      }
    }

    setVerifyingSecurity(true);
    try {
      const secCheck = await verifyAttendanceSecurity(false, user?.system_id);
      if (!secCheck.allowed) {
        let title = "Security Verification Failed";
        if (secCheck.code === "OUT_OF_RANGE") {
          title = "Outside Company Location";
        } else if (secCheck.code === "MOCK_LOCATION") {
          title = "Mock Location Detected";
        } else if (secCheck.code === "VPN_DETECTED") {
          title = "VPN Connection Detected";
        }
        setSecurityErrorTitle(title);
        setSecurityErrorMessage(
          secCheck.reason ||
            "Unable to verify security rules for attendance. Ensure location is enabled and VPN is turned off.",
        );
        setSecurityModalVisible(true);
        return;
      }
    } catch (e) {
      console.warn("Security verification error:", e);
    } finally {
      setVerifyingSecurity(false);
    }

    setScanned(false);
    isScanningRef.current = false;
    setScannerVisible(true);
  };

  const handleOpenRequestAttendance = () => {
    setRequestModalVisible(true);
  };

  // QR Code Scanner Handler
  const isScanningRef = useRef(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || isScanningRef.current) return;
    isScanningRef.current = true;
    setScanned(true);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const isValid = isValidAttendanceQR(data, officialQrList);

    if (!isValid) {
      setScannerVisible(false);
      setTimeout(() => {
        setInvalidQrModalVisible(true);
      }, 350);
      return;
    }

    const scanMoment = new Date();
    const evaluatedType = calculateAttendanceType(
      scanMoment,
      timeInConfig,
      timeOutConfig,
    );
    const dateStr = formatDateYMD(scanMoment);
    const timeStr = formatTime12h(scanMoment);
    const nextAttId = generateNextAttendanceId(attendanceList);

    const newRecord: AttendanceRecord = {
      id: nextAttId,
      staff_id: user?.id ?? "UNKNOWN",
      system_id: user?.system_id,
      name: user?.name ?? "Staff Member",
      date: dateStr,
      time: timeStr,
      type: evaluatedType,
      timestamp: scanMoment.toISOString(),
      qr_data: data,
    };

    setLastRecord(newRecord);
    setScannerVisible(false);
    setTimeout(() => {
      setSuccessModalVisible(true);
    }, 400);
  };

  // Confirm attendance record
  const handleConfirmAttendance = async () => {
    if (!lastRecord || !user?.id) {
      setSuccessModalVisible(false);
      return;
    }

    setSavingAttendance(true);
    const updatedList = [lastRecord, ...attendanceList];

    try {
      await apiClient
        .put(`/users-query/${user.id}`, { attendance: updatedList })
        .catch((err) => console.warn("Failed to update attendance in backend:", err));

      const updatedUser: StaffUser = { ...user, attendance: updatedList };
      setUser(updatedUser);
      setAttendanceList(updatedList);
      await userService.save(updatedUser);

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

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={AppColors.background}
        barStyle="light-content"
      />
      <AppBarGlass />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }
      >
        <View style={styles.container}>
          {/* ── Welcome Banner Card ── */}
          <LinearGradient
            colors={[AppColors.secondary, AppColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bannerCard, { paddingTop: 65 + insets.top }]}
          >
            {/* Top Info, Greetings, Meta & Live Clock */}
            <HomeWelcomeBanner
              user={user}
              currentTime={currentTime}
              currentType={currentType}
            />

            {/* ── Today Attendance Summary Cards ── */}
            <TodayAttendanceSummary
              timeInWindow={timeInWindow}
              timeOutWindow={timeOutWindow}
              todayTimeIn={todayTimeIn}
              todayTimeOut={todayTimeOut}
              todayOtherCount={todayOtherCount}
            />
          </LinearGradient>

          {/* ── Action Buttons ── */}
          <HomeActionButtons
            onScanPress={handleOpenScanner}
            onRequestPress={handleOpenRequestAttendance}
            verifyingSecurity={verifyingSecurity}
          />

          {/* ── Recent Attendance History ── */}
          <RecentAttendanceHistory
            attendanceList={attendanceList}
            onViewAll={() => router.push("/(tabs)/attendance")}
          />

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

      {/* ── Invalid QR Code Alert Modal ── */}
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

      {/* ── Security Alert Modal ── */}
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
  container: {},
  bannerCard: {},
});
