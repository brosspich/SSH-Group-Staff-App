import Appbar from "@/components/appbar/appbar";
import Copyright from "@/components/copyright/copyright";
import Loading from "@/components/loading/loading";
import { renderLogoutModal } from "@/components/logout/logoutModal";
import { AppColors } from "@/constants/appcolors";
import { useResponsive } from "@/hooks/useResponsive";
import { StaffUser, userService } from "@/services/userService";
import { hasAdminOrOwnerRole } from "@/utils/roleUtils";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SettingAccountSection } from "./_components/SettingAccountSection";
import { SettingAdminStaffSection } from "./_components/SettingAdminStaffSection";
import { SettingInfrastructureSection } from "./_components/SettingInfrastructureSection";
import { SettingProfileCard } from "./_components/SettingProfileCard";

export default function SettingScreen() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { isMobile } = useResponsive();

  useEffect(() => {
    userService.get().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.safe}>
        <View style={styles.centered}>
          <Loading />
        </View>
      </View>
    );
  }

  const isAdminOrOwner = hasAdminOrOwnerRole(user?.role);

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={AppColors.background}
        barStyle="light-content"
      />
      <Appbar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <View style={styles.container}>
          {/* ── User Profile Card ── */}
          <SettingProfileCard user={user} />

          {/* ── Admin/Owner: Account Staff Section ── */}
          {isAdminOrOwner && (
            <SettingAdminStaffSection isAdminOrOwner={isAdminOrOwner} />
          )}

          {/* ── Admin/Owner: Infrastructure & Security Section ── */}
          {isAdminOrOwner && (
            <SettingInfrastructureSection isAdminOrOwner={isAdminOrOwner} />
          )}

          {/* ── Account Info, Privacy & Security, About Us ── */}
          <SettingAccountSection onLogoutPress={handleLogout} />

          {/* ── Footer ── */}
          <View style={{ marginTop: 10 }} />
          <Copyright />
        </View>
      </ScrollView>

      {/* ── Logout Confirmation Modal ── */}
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
  container: {},
});
