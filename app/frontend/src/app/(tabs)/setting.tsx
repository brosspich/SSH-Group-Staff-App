import Appbar from "@/components/appbar/appbar";
import {
  MenuButtonItem,
  MenuDivider,
} from "@/components/common/MenuButtonItem";
import Copyright from "@/components/copyright/copyright";
import Loading from "@/components/loading/loading";
import { renderLogoutModal } from "@/components/logout/logoutModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { StaffUser, userService } from "@/services/userService";
import { getTwoInitials } from "@/utils/formatters";
import { formatRole, hasAdminOrOwnerRole } from "@/utils/roleUtils";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Setting Screen ───────────────────────────────────────────────────────────

export default function Setting() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { isTablet, isMobile } = useResponsive();
  const insets = useSafeAreaInsets();

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

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={AppColors.background}
        barStyle="light-content"
      />
      <Appbar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 90,
        }}
      >
        <View>
          <View style={styles.avatarSection}>
            <View style={styles.conAvatarTxt}>
              <LinearGradient
                colors={[AppColors.secondary, AppColors.primary]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0.3, 0.9]}
                style={styles.avatarCircle}
              >
                <Text style={styles.avatarInitial}>
                  {getTwoInitials(user?.name)}
                </Text>
              </LinearGradient>

              <View style={styles.conName}>
                <Text style={styles.userName}>{user?.name ?? "Name"}</Text>
                <Text style={styles.txtUserName}>
                  @{user?.username ?? "username"}
                </Text>
              </View>
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{formatRole(user?.role)}</Text>
            </View>
          </View>

          {/* ── Admin/Owner : Account Staff Section ── */}
          {hasAdminOrOwnerRole(user?.role) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Staff</Text>
              <View style={styles.card}>
                <MenuButtonItem
                  onPress={() => {
                    router.push("/account-staff/CreateAccountStaff");
                  }}
                  title="Create Account Staff"
                  iconName="person-outline"
                  icon={Ionicons}
                />
                <MenuDivider />
                <MenuButtonItem
                  onPress={() => {
                    router.push("/account-staff/ChangeInfoAccountStaff");
                  }}
                  title="Change Info Account Staff"
                  iconName="create-outline"
                  icon={Ionicons}
                />
              </View>
            </View>
          )}

          {/* ── SSH Infrastructure Section ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SSH Infrastructure</Text>
            <View style={styles.card}>
              <MenuButtonItem
                onPress={() => router.push("/ssh-groups" as any)}
                title="Server Groups"
                subtitle="Production, staging and cluster permissions"
                iconName="server-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => router.push("/keys" as any)}
                title="SSH Keys"
                subtitle="Manage public keys & server access"
                iconName="key-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => router.push("/audit-logs" as any)}
                title="Security Audit Trail"
                subtitle="View access history & security events"
                iconName="shield-checkmark-outline"
                icon={Ionicons}
              />
            </View>
          </View>

          {/* ── Account Info Section ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Info</Text>
            <View style={styles.card}>
              <MenuButtonItem
                onPress={() => {
                  router.push("/account/information");
                }}
                title="Information"
                iconName="person-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => {
                  handleLogout();
                }}
                title="Logout"
                iconName="logout"
                icon={AntDesign}
              />
            </View>
          </View>

          {/* Privacy & Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            <View style={styles.card}>
              <MenuButtonItem
                onPress={() => {
                  router.push("/privacy-policy-security/PrivacyPolicy");
                }}
                title="Privacy & Policy"
                iconName="privacy-tip"
                icon={MaterialIcons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => {
                  router.push("/privacy-policy-security/devices");
                }}
                title="Devices"
                iconName="devices"
                icon={MaterialIcons}
              />
            </View>
          </View>

          {/* About Us Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Us</Text>
            <View style={styles.card}>
              <MenuButtonItem
                onPress={() => {
                  router.push("/about/about");
                }}
                title="About"
                iconName="information-circle-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => {
                  router.push("/about/contact");
                }}
                title="Contact"
                iconName="person-circle-outline"
                icon={Ionicons}
              />
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={{ marginTop: 10 }} />
          <Copyright />
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

  // Avatar
  avatarSection: {
    alignItems: "center",
    paddingVertical: 15,
    gap: 8,
    flexDirection: "row",
    marginHorizontal: 15,
    backgroundColor: AppColors.background2,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 5,
    justifyContent: "space-between",
  },
  conAvatarTxt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarInitial: {
    fontSize: 16,
    color: "#fff",
    fontFamily: AppFonts.medium,
  },
  conName: {
    justifyContent: "center",
  },
  userName: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.medium,
  },
  txtUserName: {
    fontSize: 12,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: `${AppColors.secondary}20`,
  },
  roleBadgeText: {
    fontSize: 11,
    color: AppColors.secondary,
    fontFamily: AppFonts.medium,
  },

  // Section
  section: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: AppColors.grey,
    fontFamily: AppFonts.medium,
    marginBottom: 8,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 10,
    overflow: "hidden",
  },
});
