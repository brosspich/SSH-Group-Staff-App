import Appbar from "@/shared/components/appbar/appbar";
import Copyright from "@/shared/components/copyright/copyright";
import Loading from "@/shared/components/loading/loading";
import { renderLogoutModal } from "@/shared/components/logout/logoutModal";
import { useUser } from "@/shared/contexts/UserContext";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { StaffUser, userService } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { hasAdminOrOwnerRole } from "@/utils/roleUtils";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SettingAccountSection } from "./_components/SettingAccountSection";
import { SettingAdminStaffSection } from "./_components/SettingAdminStaffSection";
import { SettingInfrastructureSection } from "./_components/SettingInfrastructureSection";
import { SettingProfileCard } from "./_components/SettingProfileCard";

export default function SettingScreen() {
  const { user: contextUser } = useUser();
  const [user, setUser] = useState<StaffUser | null>(contextUser);
  const [loading, setLoading] = useState(!contextUser);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setLoading(false);
    } else {
      userService.get().then((u) => {
        if (u) {
          setUser(u);
          setLoading(false);
        }
      });
    }
  }, [contextUser]);

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
        backgroundColor={theme.colors.background}
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
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {},
});
