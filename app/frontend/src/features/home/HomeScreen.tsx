import EditAttendanceModal from "@/features/home/_components/EditAttendanceModal";
import { RequestAttendanceModal } from "@/features/home/_components/RequestAttendanceModal";
import ScannerModal from "@/features/home/_components/ScannerModal";
import SuccessConfirmationModal from "@/features/home/_components/SuccessConfirmationModal";
import { renderAlertModal } from "@/shared/components/alert/alert";
import AppBarGlass from "@/shared/components/appbar/AppBarGlass";
import Loading from "@/shared/components/loading/loading";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { prewarmDeviceGps } from "@/shared/services/locationService";
import { theme } from "@/shared/styles/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeActionButtons } from "./_components/HomeActionButtons";
import { HomeWelcomeBanner } from "./_components/HomeWelcomeBanner";
import { RecentAttendanceHistory } from "./_components/RecentAttendanceHistory";
import { TodayAttendanceSummary } from "./_components/TodayAttendanceSummary";
import { useHomeData } from "./_hooks/useHomeData";
import { useHomeScanner } from "./_hooks/useHomeScanner";
import { styles } from "./HomeScreen.styles";

export * from "./_types/home.types";
export * from "./_utils/homeUtils";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  // Pre-warm GPS sensor in background on screen load for instantaneous 0ms attendance scans
  useEffect(() => {
    prewarmDeviceGps().catch(() => {});
  }, []);

  // Hook 1: Home Data, User Profile, Config & Live Clock (SRP)
  const {
    user,
    setUser,
    loading,
    refreshing,
    currentTime,
    attendanceList,
    setAttendanceList,
    officialQrList,
    companyName,
    timeInWindow,
    timeOutWindow,
    currentType,
    todayTimeIn,
    todayTimeOut,
    todayOtherCount,
    onRefresh,
  } = useHomeData();

  // Hook 2: Attendance Scanner, Security & Submission Logic (SRP)
  const {
    scannerVisible,
    setScannerVisible,
    torchOn,
    setTorchOn,
    scanned,
    setScanned,
    verifyingSecurity,
    securityModalVisible,
    setSecurityModalVisible,
    securityErrorTitle,
    securityErrorMessage,
    invalidQrModalVisible,
    setInvalidQrModalVisible,
    generalAlert,
    setGeneralAlert,
    lastRecord,
    setLastRecord,
    successModalVisible,
    setSuccessModalVisible,
    savingAttendance,
    editModalVisible,
    setEditModalVisible,
    submittingEdit,
    isScanningRef,
    handleOpenScanner,
    handleBarCodeScanned,
    handleConfirmAttendance,
    handleEditAttendanceSubmit,
  } = useHomeScanner({
    user,
    attendanceList,
    setAttendanceList,
    setUser,
    companyName,
    officialQrList,
    currentType,
  });

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
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View>
          {/* ── Welcome Banner & Live Clock ── */}
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bannerContainer, { paddingTop: 65 + insets.top }]}
          >
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

          {/* ── Action Buttons (Scan & Request) ── */}
          <HomeActionButtons
            onScanPress={handleOpenScanner}
            onRequestPress={() => setRequestModalVisible(true)}
            verifyingSecurity={verifyingSecurity}
          />

          {/* ── Recent Attendance History ── */}
          <RecentAttendanceHistory
            attendanceList={attendanceList}
            onViewAll={() => router.push("/(tabs)/attendance")}
          />

          <View style={styles.bottomSpacer} />
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

      {/* ── Request Attendance Modal ── */}
      <RequestAttendanceModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        user={user}
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
    </View>
  );
}
