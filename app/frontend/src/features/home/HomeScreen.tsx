import EditAttendanceModal from "@/features/home/_components/EditAttendanceModal";
import { RequestAttendanceModal } from "@/features/home/_components/RequestAttendanceModal";
import ScannerModal from "@/features/home/_components/ScannerModal";
import SuccessConfirmationModal from "@/features/home/_components/SuccessConfirmationModal";
import { renderAlertModal } from "@/shared/components/alert/alert";
import AppBarGlass from "@/shared/components/appbar/AppBarGlass";
import Loading from "@/shared/components/loading/loading";
import {
  calculateAttendanceType,
  fetchOfficialAttendanceConfig,
  getTimeWindowDisplay,
} from "@/shared/constants/attendanceConfig";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { apiClient } from "@/shared/services/api";
import {
  scanAttendanceWithSecurity,
  submitAttendanceRecord,
  verifyAttendanceSecurity,
} from "@/shared/services/locationService";
import { StaffUser, userService } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
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
import { formatDateYMD } from "./_utils/homeUtils";

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

  // General alert modal state (shared alert component)
  const [generalAlert, setGeneralAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const showGeneralAlert = (title: string, message: string) => {
    setGeneralAlert({ visible: true, title, message });
  };

  // Success result modal
  const [lastRecord, setLastRecord] = useState<AttendanceRecord | null>(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

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
          showGeneralAlert(
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

  // QR Code Scanner Handler (Thin Client: 30% UI/Sensor -> Backend: 70% Conditions/DB)
  const isScanningRef = useRef(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isScanningRef.current) return;
    isScanningRef.current = true;
    setScanned(true);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      // Backend 70%: Validates conditions (QR validity, GPS geofence A vs B, Time window A vs B)
      // previewOnly: true -> Does NOT save to database and does NOT send to Telegram yet!
      const result = await scanAttendanceWithSecurity({
        userId: user?.id ?? "",
        systemId: user?.system_id,
        qrData: data,
        previewOnly: true,
      });

      if (!result.allowed) {
        setScannerVisible(false);
        if (result.code === "INVALID_QR") {
          setTimeout(() => {
            setInvalidQrModalVisible(true);
          }, 350);
        } else {
          let title = "Security Verification Failed";
          if (result.code === "OUT_OF_RANGE") {
            title = "Outside Company Location";
          } else if (result.code === "MOCK_LOCATION") {
            title = "Mock Location Detected";
          } else if (result.code === "VPN_DETECTED") {
            title = "VPN Connection Detected";
          }
          setSecurityErrorTitle(title);
          setSecurityErrorMessage(
            result.reason || "Unable to verify security rules for attendance.",
          );
          setTimeout(() => {
            setSecurityModalVisible(true);
          }, 350);
        }
        return;
      }

      // Backend succeeded & generated preview record for user confirmation
      if (result.record) {
        const previewRec: AttendanceRecord = {
          id: result.record.id,
          staff_id: result.record.staff_id,
          system_id: result.record.system_id,
          name: result.record.name,
          date: result.record.date,
          time: result.record.time,
          type: result.record.type,
          timestamp: result.record.timestamp,
          qr_data: result.record.qr_data,
        };

        setLastRecord(previewRec);
        setScannerVisible(false);
        setTimeout(() => {
          setSuccessModalVisible(true);
        }, 350);
      }
    } catch (e: any) {
      showGeneralAlert(
        "Scan Error",
        e?.message || "Failed to process attendance scan. Please try again.",
      );
    } finally {
      isScanningRef.current = false;
      setScanned(false);
    }
  };

  // Submit attendance record: commits to Database & dispatches to Telegram!
  const handleConfirmAttendance = async () => {
    if (!lastRecord || !user?.id) return;

    try {
      setSavingAttendance(true);

      const result = await submitAttendanceRecord({
        userId: user.id,
        systemId: user.system_id || lastRecord.system_id,
        qrData: lastRecord.qr_data || "",
        date: lastRecord.date,
        time: lastRecord.time,
        type: lastRecord.type,
        timestamp: lastRecord.timestamp,
        name: lastRecord.name,
      });

      if (result?.record) {
        const savedRec: AttendanceRecord = {
          id: result.record.id,
          staff_id: result.record.staff_id,
          system_id: result.record.system_id,
          name: result.record.name,
          date: result.record.date,
          time: result.record.time,
          type: result.record.type,
          timestamp: result.record.timestamp,
          qr_data: result.record.qr_data,
        };

        // Append / Update local attendance history without duplicates
        setAttendanceList((prev) => {
          const filtered = prev.filter((r) => r.id !== savedRec.id);
          return [savedRec, ...filtered];
        });

        // Sync local cache
        const nextList = [
          savedRec,
          ...attendanceList.filter((r) => r.id !== savedRec.id),
        ];
        const updatedUser: StaffUser = {
          ...user,
          attendance: nextList,
        };
        setUser(updatedUser);
        userService.save(updatedUser).catch(() => {});

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setSuccessModalVisible(false);
        setLastRecord(null);
      }
    } catch (e: any) {
      showGeneralAlert(
        "Submission Error",
        e?.message || "Failed to submit attendance. Please try again.",
      );
    } finally {
      setSavingAttendance(false);
      isScanningRef.current = false;
      setScanned(false);
    }
  };

  const handleEditAttendanceSubmit = async (data: {
    type: "time-in" | "time-out";
    remark: string;
    image: string;
  }) => {
    if (!lastRecord || !user?.id) return;

    try {
      setSubmittingEdit(true);

      const result = await submitAttendanceRecord({
        userId: user.id,
        systemId: user.system_id || lastRecord.system_id,
        qrData: lastRecord.qr_data || "",
        date: lastRecord.date,
        time: lastRecord.time,
        type: data.type,
        timestamp: lastRecord.timestamp,
        name: lastRecord.name,
        remark: data.remark,
        image: data.image,
      });

      if (result?.record) {
        const savedRec: AttendanceRecord = {
          id: result.record.id,
          staff_id: result.record.staff_id,
          system_id: result.record.system_id,
          name: result.record.name,
          date: result.record.date,
          time: result.record.time,
          type: result.record.type,
          timestamp: result.record.timestamp,
          qr_data: result.record.qr_data,
          remark: result.record.remark,
          image: result.record.image,
        };

        setAttendanceList((prev) => {
          const filtered = prev.filter((r) => r.id !== savedRec.id);
          return [savedRec, ...filtered];
        });

        const nextList = [
          savedRec,
          ...attendanceList.filter((r) => r.id !== savedRec.id),
        ];
        const updatedUser: StaffUser = {
          ...user,
          attendance: nextList,
        };
        setUser(updatedUser);
        userService.save(updatedUser).catch(() => {});

        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setEditModalVisible(false);
        setSuccessModalVisible(false);
        setLastRecord(null);
      }
    } catch (e: any) {
      showGeneralAlert(
        "Submission Error",
        e?.message ||
          "Failed to submit attendance adjustment. Please try again.",
      );
    } finally {
      setSubmittingEdit(false);
      isScanningRef.current = false;
      setScanned(false);
    }
  };

  // Calculate today's status badges
  const todayStr = formatDateYMD(currentTime);
  const todayRecords = attendanceList.filter(
    (r) => (r.date || (r as any).scanDate) === todayStr,
  );
  const todayTimeIn = todayRecords.find((r) => r.type === "time-in");
  const todayTimeOut = todayRecords.find((r) => r.type === "time-out");
  const todayOtherCount = todayRecords.filter(
    (r) => r.type === "time-other",
  ).length;

  if (loading) {
    return (
      <>
        <StatusBar
          backgroundColor={theme.colors.secondary}
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
        backgroundColor={theme.colors.background}
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
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.container}>
          {/* ── Welcome Banner Card ── */}
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.primary]}
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
        onEdit={() => {
          setSuccessModalVisible(false);
          setEditModalVisible(true);
        }}
        onClose={() => {
          setSuccessModalVisible(false);
          setLastRecord(null);
          isScanningRef.current = false;
          setScanned(false);
        }}
      />

      {/* ── Edit Attendance Modal ── */}
      <EditAttendanceModal
        visible={editModalVisible}
        submitting={submittingEdit}
        record={lastRecord}
        onSubmit={handleEditAttendanceSubmit}
        onClose={() => {
          setEditModalVisible(false);
          setSuccessModalVisible(true);
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

      {/* ── General Alert Modal ── */}
      {renderAlertModal({
        alertModalVisible: generalAlert.visible,
        setAlertModalVisible: (visible) =>
          setGeneralAlert((prev) => ({ ...prev, visible })),
        title: generalAlert.title,
        bodyTxt: generalAlert.message,
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
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {},
  bannerCard: {},
});
