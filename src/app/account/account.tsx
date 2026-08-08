import AppbarBack from "@/components/appbar/appbarback";
import Copyright from "@/components/copyright/copyright";
import Loading from "@/components/loading/loading";
import { renderLogoutModal } from "@/components/logout/logoutModal";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { PosAdminUser, userService } from "@/services/userService";
import { supabase } from "@/utils/supabase";
import { AntDesign, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { createElement, useCallback, useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Row item ─────────────────────────────────────────────────────────────────

function InfoRow({ iconName, icon, label, value }: any) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        {createElement(icon, {
          name: iconName,
          size: 18,
          color: AppColors.secondary,
        })}
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Account Screen ───────────────────────────────────────────────────────────

export default function Account() {
  const [user, setUser] = useState<PosAdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { isMobile } = useResponsive();

  useEffect(() => {
    userService.get().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // 🔴 Real-time: keep this user row in sync with ssh_group_staff_users
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `pos-admin-user-${user.id}`;

    const existing = supabase
      .getChannels()
      .find((ch) => ch.topic === `realtime:${channelName}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ssh_group_staff_users",
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            await userService.clear();
            setUser(null);
            return;
          }
          const { data: dbUser } = await supabase
            .from("ssh_group_staff_users")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (!dbUser) return;
          const updated = dbUser as PosAdminUser;
          await userService.save(updated); // keep AsyncStorage in sync
          setUser(updated);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // 🔽 Pull-to-refresh: manually re-fetch the current user row from Supabase
  const onRefresh = useCallback(async () => {
    const current = await userService.get();
    if (!current?.id) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("ssh_group_staff_users")
        .select("*")
        .eq("id", current.id)
        .single();

      if (!error && data) {
        await userService.save(data as PosAdminUser);
        setUser(data as PosAdminUser);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background2 }}>
        <View style={styles.safe}>
          <View style={styles.centered}>
            <Loading />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const getTwoInitials = (name: any) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background2 }}>
      <View style={styles.safe}>
        <AppbarBack Title={"Account"} />
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
                <Text style={styles.roleText}>
                  {user?.role?.toUpperCase() ?? "—"}
                </Text>
                <View
                  style={[
                    styles.activeDot,
                    {
                      backgroundColor: user?.is_active
                        ? "#22c55e"
                        : AppColors.red,
                    },
                  ]}
                ></View>
              </View>
            </View>

            {/* ── Account Info ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Info</Text>
              <View style={styles.card}>
                <InfoRow
                  icon={FontAwesome6}
                  iconName="contact-card"
                  label="User ID"
                  value={user?.id ?? "None"}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="fingerprint"
                  label="System ID"
                  value={user?.system_id ?? "None"}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="badge"
                  label="Full Name"
                  value={user?.name ?? "None"}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="person"
                  label="Username"
                  value={user?.username ?? "None"}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="email"
                  label="Email"
                  value={user?.email ?? "None"}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="phone"
                  label="Phone"
                  value={user?.phone ?? "None"}
                />
                <InfoRow
                  icon={MaterialIcons}
                  iconName="event"
                  label="Joined"
                  value={joinedDate}
                />
              </View>
            </View>

            {/* ── Logout ── */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <AntDesign name="logout" size={20} color={AppColors.red} />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* ── Footer ── */}
            <Copyright />
          </View>
        </ScrollView>

        {renderLogoutModal({
          logoutModalVisible,
          setLogoutModalVisible,
          isMobile,
        })}
      </View>
    </SafeAreaView>
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
    gap: 10,
    flexDirection: "row",
    marginHorizontal: 15,
    backgroundColor: AppColors.background2,
    paddingHorizontal: 13,
    borderRadius: 12,
    marginVertical: 12,
    justifyContent: "space-between",
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },

      default: {
        shadowOffset: { width: 0, height: 2 },
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  conAvatarTxt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 65,
    height: 65,
    borderRadius: 12,
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
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.background2,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  conName: {},
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    letterSpacing: -0.3,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  txtUserName: {
    fontSize: 12,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.textSecondary ?? AppColors.grey,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Info card
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,

    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowOffset: { width: 0, height: 2 },
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${AppColors.grey}22`,
    gap: 12,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: `${AppColors.secondary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: AppColors.textSecondary ?? AppColors.grey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.textPrimary,
    marginTop: 1,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppColors.background2,
    borderRadius: 14,
    paddingVertical: 12,
    borderColor: AppColors.red,
    borderWidth: 1.5,

    ...Platform.select({
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowOffset: { width: 0, height: 3 },
        shadowColor: AppColors.background2,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  logoutText: {
    color: AppColors.red,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
