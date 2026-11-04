import AppbarBack from "@/shared/components/appbar/appbarback";
import Loading from "@/shared/components/loading/loading";
import { renderLogoutModal } from "@/shared/components/logout/logoutModal";
import { AppColors } from "@/constants/appcolors";
import { useResponsive } from "@/hooks/useResponsive";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { AccountInfoCard } from "./_components/AccountInfoCard";
import { AccountProfileHeader } from "./_components/AccountProfileHeader";
import { useAccount } from "./_hooks/useAccount";

export default function AccountScreen() {
  const { isMobile } = useResponsive();

  const {
    user,
    loading,
    refreshing,
    onRefresh,
    logoutModalVisible,
    setLogoutModalVisible,
  } = useAccount();

  if (loading) {
    return (
      <View style={styles.safe}>
        <View style={styles.centered}>
          <Loading />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <AppbarBack Title="Account" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.secondary}
            colors={[AppColors.secondary]}
          />
        }
      >
        <View
          style={[
            { flex: 1, width: "100%" },
            !isMobile && { maxWidth: "60%", alignSelf: "center" },
          ]}
        >
          <AccountProfileHeader user={user} />
          <AccountInfoCard user={user} />
        </View>
      </ScrollView>

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
    backgroundColor: AppColors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
