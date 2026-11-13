import { renderAlertModal } from "@/shared/components/alert/alert";
import { renderLogoutModal } from "@/shared/components/logout/logoutModal";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { theme } from "@/shared/styles/theme";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NonSubscriptionActions } from "./_components/NonSubscriptionActions";
import { NonSubscriptionDetailsCard } from "./_components/NonSubscriptionDetailsCard";
import { NonSubscriptionHeader } from "./_components/NonSubscriptionHeader";
import { useNonSubscription } from "./_hooks/useNonSubscription";

export default function NonSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsive();

  const {
    companyId,
    staffName,
    checking,
    subInfo,
    logoutModalVisible,
    setLogoutModalVisible,
    alertConfig,
    setAlertConfig,
    handleCheckAgain,
    handleContactSupport,
    handleLogout,
  } = useNonSubscription();

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={theme.colors.background2}
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          !isMobile && styles.webContent,
          {
            paddingTop: insets.top + 30,
            paddingBottom: insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Warning Illustration & Titles ── */}
        <NonSubscriptionHeader />

        {/* ── Details Card ── */}
        <NonSubscriptionDetailsCard
          companyId={companyId}
          staffName={staffName}
          subInfo={subInfo}
        />

        {/* ── Action Buttons ── */}
        <NonSubscriptionActions
          checking={checking}
          onCheckAgain={handleCheckAgain}
          onContactSupport={handleContactSupport}
          onLogout={handleLogout}
        />
      </ScrollView>

      {/* ── Standard Alert Modal from @/shared/components/alert ── */}
      {renderAlertModal({
        alertModalVisible: alertConfig.visible,
        setAlertModalVisible: (visible) =>
          setAlertConfig((prev) => ({ ...prev, visible })),
        title: alertConfig.title,
        bodyTxt: alertConfig.message,
        onPress: alertConfig.onPress,
        isMobile,
        iconName: alertConfig.iconName,
        hideCancel: alertConfig.hideCancel,
      })}

      {/* ── Standard Logout Modal from @/shared/components/logout ── */}
      {renderLogoutModal({
        logoutModalVisible,
        setLogoutModalVisible,
        isMobile,
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  webContent: {
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
});
