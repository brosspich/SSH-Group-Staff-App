import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { theme } from "@/shared/styles/theme";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import ActiveSessionsSection from "./_components/ActiveSessionsSection";
import AddDeviceModal from "./_components/AddDeviceModal";
import AutoTerminateSection from "./_components/AutoTerminateSection";
import ConfirmActionModal from "./_components/ConfirmActionModal";
import DeviceDetailModal from "./_components/DeviceDetailModal";
import DevicesBannerCard from "./_components/DevicesBannerCard";
import SelfDestructModal from "./_components/SelfDestructModal";
import ThisDeviceSection from "./_components/ThisDeviceSection";
import { useDevicesData } from "./_hooks/useDevicesData";

export default function DevicesScreen() {
  const { pick } = useResponsive();
  const {
    loading,
    refreshing,
    onRefresh,
    currentSessionId,
    thisDevice,
    activeSessions,
    selectedSession,
    setSelectedSession,
    modalVisible,
    setModalVisible,
    addDeviceModalVisible,
    setAddDeviceModalVisible,
    selfDestructModalVisible,
    setSelfDestructModalVisible,
    inactivePeriod,
    handleSelectInactivePeriod,
    alertConfig,
    closeAlert,
    requestTerminateSession,
    requestTerminateAllOtherSessions,
  } = useDevicesData();

  if (loading) {
    return (
      <>
        <AppbarBack Title="Devices" />
        <Loading />
      </>
    );
  }

  // Responsive container width
  const containerMaxWidth = pick("100%", "85%", "70%");
  const selfAlign = pick(
    "stretch" as const,
    "center" as const,
    "center" as const,
  );

  return (
    <View style={styles.container}>
      <AppbarBack Title="Devices" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { width: containerMaxWidth, alignSelf: selfAlign },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.secondary}
            colors={[theme.colors.secondary]}
            progressBackgroundColor={theme.colors.background2}
          />
        }
      >
        {/* Top Graphic Card */}
        <DevicesBannerCard />

        {/* Section 1: This Device */}
        <ThisDeviceSection
          thisDevice={thisDevice}
          activeSessionsCount={activeSessions.length}
          onSelectDevice={(device) => {
            setSelectedSession(device);
            setModalVisible(true);
          }}
          onTerminateOtherSessions={requestTerminateAllOtherSessions}
        />

        {/* Section 2: Active Sessions */}
        <ActiveSessionsSection
          activeSessions={activeSessions}
          onSelectDevice={(device) => {
            setSelectedSession(device);
            setModalVisible(true);
          }}
        />

        {/* Section 3: Automatic termination */}
        <AutoTerminateSection
          inactivePeriod={inactivePeriod}
          onOpenSelector={() => setSelfDestructModalVisible(true)}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Device Detail Sheet Modal */}
      <DeviceDetailModal
        visible={modalVisible}
        selectedSession={selectedSession}
        currentSessionId={currentSessionId}
        onClose={() => {
          setModalVisible(false);
          setSelectedSession(null);
        }}
        onTerminate={(sessionId) => {
          setModalVisible(false);
          requestTerminateSession(sessionId);
        }}
      />

      {/* Add Device QR Code Modal */}
      <AddDeviceModal
        visible={addDeviceModalVisible}
        onClose={() => setAddDeviceModalVisible(false)}
      />

      {/* Custom Confirmation Alert Modal */}
      <ConfirmActionModal config={alertConfig} onClose={closeAlert} />

      {/* Sessions Self-Destruct Selection Modal */}
      <SelfDestructModal
        visible={selfDestructModalVisible}
        currentPeriod={inactivePeriod}
        onSelectPeriod={handleSelectInactivePeriod}
        onClose={() => setSelfDestructModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
});
