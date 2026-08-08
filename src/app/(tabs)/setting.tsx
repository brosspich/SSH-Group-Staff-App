import Copyright from "@/components/copyright/copyright";
import Loading from "@/components/loading/loading";
import { renderLogoutModal } from "@/components/logout/logoutModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { PosAdminUser, userService } from "@/services/userService";
import {
  AntDesign,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { createElement, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Setting Screen ───────────────────────────────────────────────────────────

export default function Setting() {
  const [user, setUser] = useState<PosAdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { isTablet, isMobile } = useResponsive();

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
          {/* <ActivityIndicator size="large" color={AppColors.secondary} /> */}
          <Loading />
        </View>
      </View>
    );
  }

  const getTwoInitials = (name: any) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  function BtnItem({ iconName, title, onPress, icon }: any) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.conBtn,
          {
            backgroundColor: pressed
              ? `${AppColors.grey}33`
              : AppColors.transparent,
          },
        ]}
      >
        <View style={styles.iconTxt}>
          <View style={styles.conIcon}>
            {createElement(icon, {
              name: iconName,
              size: 20,
              color: AppColors.textPrimary,
            })}
          </View>
          <Text style={styles.txtTitle}>{title}</Text>
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color={AppColors.textPrimary}
        />
      </Pressable>
    );
  }

  function Border() {
    return (
      <View
        style={{
          height: 0.3,
          flex: 1,
          backgroundColor: AppColors.grey,
        }}
      />
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Avatar + Name ── */}
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
                {/* {user?.name?.charAt(0)?.toUpperCase() ?? "?"} */}
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
            <Text style={styles.roleText}>
              {user?.role?.toUpperCase() ?? "—"}
            </Text>
            <View
              style={[
                styles.activeDot,
                {
                  backgroundColor: user?.is_active ? "#22c55e" : AppColors.red,
                },
              ]}
            ></View>
          </View>
        </View>

        {/* ── Account Info Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <View style={styles.card}>
            <BtnItem
              onPress={() => {
                router.push("/account/information" as any);
              }}
              title="Information"
              iconName="person-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                handleLogout();
              }}
              title="Logout"
              iconName="logout"
              icon={AntDesign}
            />
          </View>
        </View>

        {/* Privacy & Secueity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Secueity</Text>
          <View style={styles.card}>
            <BtnItem
              onPress={() => {
                router.push("/privacy-policy-security/PrivacyPolicy" as any);
              }}
              title="Privacy & Policy"
              iconName="privacy-tip"
              icon={MaterialIcons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/privacy-policy-security/devices" as any);
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
            <BtnItem
              onPress={() => {
                router.push("/about/about" as any);
              }}
              title="About"
              iconName="information-circle-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/about/contact" as any);
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
    marginTop: 10,
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
    // backgroundColor: AppColors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    // elevation: 6,

    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },

      default: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: AppColors.secondary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  conName: {},
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    // letterSpacing: -0.3,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  txtUserName: {
    fontSize: 10,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  roleBadge: {
    backgroundColor: `${AppColors.secondary}22`,
    // paddingHorizontal: 14,
    paddingLeft: 14,
    paddingRight: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: `${AppColors.secondary}55`,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.secondary,
    // letterSpacing: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  activeDot: {
    borderRadius: 20,
    width: 10,
    height: 10,
  },

  // Section
  section: {
    paddingHorizontal: 16,
    // marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.textSecondary ?? AppColors.grey,
    // letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 10,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    // textAlign: "center",
  },

  // Info card
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    // paddingHorizontal: 10,
    // paddingVertical: 4,
    overflow: "hidden",
  },
  conBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 7,
    // backgroundColor: AppColors.red,
  },
  iconTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  conIcon: {
    // padding: 10,
    width: 35,
    height: 35,
    backgroundColor: `${AppColors.grey}50`,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txtTitle: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
});
