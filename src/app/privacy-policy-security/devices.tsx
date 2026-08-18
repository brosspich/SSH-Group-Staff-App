// src/app/privacy-policy-security/devices.tsx
import AppbarBack from "@/components/appbar/appbarback";
import LaptopGraphic from "@/components/laptopgraphic/LaptopGraphic";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useUser } from "@/contexts/UserContext";
import { useResponsive } from "@/hooks/useResponsive";
import {
  autoTerminateInactiveSessions,
  DeviceSession,
  getSessionId,
  InactivePeriod,
  syncDeviceSession,
  terminateDeviceSession,
  terminateOtherDeviceSessions,
} from "@/utils/deviceSession";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Devices() {
  const { user, refresh } = useUser();
  const { isMobile, pick } = useResponsive();
  const insets = useSafeAreaInsets();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [selectedSession, setSelectedSession] = useState<DeviceSession | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [addDeviceModalVisible, setAddDeviceModalVisible] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");
  const [alertType, setAlertType] = useState<"destructive" | "info">(
    "destructive",
  );
  const [alertConfirmText, setAlertConfirmText] = useState("Terminate");
  const [alertOnPress, setAlertOnPress] = useState<
    (() => Promise<void>) | null
  >(null);

  // Inactive period auto-terminate state
  const INACTIVE_PERIOD_STORAGE_KEY = "@pos_inactive_terminate_period";
  const [inactivePeriod, setInactivePeriod] =
    useState<InactivePeriod>("6 months");
  const [selfDestructModalVisible, setSelfDestructModalVisible] =
    useState(false);

  // Synchronize devices state with user context (realtime updates)
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionId = await getSessionId();
        setCurrentSessionId(sessionId);
        if (user?.id) {
          await syncDeviceSession(user.id);
          await refresh();
        }
      } catch (e) {
        console.error("Failed to get session ID:", e);
      }
    };
    initSession();
  }, [user?.id]);

  useEffect(() => {
    if (user?.devices && Array.isArray(user.devices)) {
      setDevices(user.devices as DeviceSession[]);
    } else {
      setDevices([]);
    }
    setLoading(false);
  }, [user?.devices]);

  // Load saved self-destruct inactive period setting
  useEffect(() => {
    const loadInactivePeriod = async () => {
      try {
        const stored = await AsyncStorage.getItem(INACTIVE_PERIOD_STORAGE_KEY);
        if (
          stored === "1 day" ||
          stored === "1 week" ||
          stored === "3 months" ||
          stored === "6 months" ||
          stored === "1 year"
        ) {
          setInactivePeriod(stored as InactivePeriod);
        }
      } catch (e) {
        console.warn("Failed to load inactive period setting:", e);
      }
    };
    loadInactivePeriod();
  }, []);

  // Automatically terminate sessions older than the configured threshold on load or sync
  useEffect(() => {
    if (user?.id && currentSessionId) {
      autoTerminateInactiveSessions(
        user.id,
        currentSessionId,
        inactivePeriod,
      ).then((updated) => {
        if (updated) {
          refresh();
        }
      });
    }
  }, [user?.id, currentSessionId, inactivePeriod]);

  // Auto-refresh devices list every 5 seconds while viewing this screen
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, refresh]);

  // Handle Pull-To-Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      await syncDeviceSession(user.id);
      await refresh();
    }
    setRefreshing(false);
  }, [user?.id, refresh]);

  // Split sessions into "This device" and "Active sessions" (hiding terminated sessions where terminate === "true")
  const nonTerminatedDevices = devices.filter(
    (d) =>
      d.terminate !== true &&
      d.terminate !== "true" &&
      String(d.terminate).toLowerCase() !== "true",
  );
  const thisDevice =
    nonTerminatedDevices.find((d) => d.id === currentSessionId) ||
    nonTerminatedDevices.find(
      (d) =>
        d.device_type === (Platform.OS === "web" ? "web" : "phone") &&
        d.os === (Platform.OS === "web" ? "Windows" : "HarmonyOS"),
    );

  const activeSessions = nonTerminatedDevices.filter(
    (d) => d.id !== (thisDevice?.id ?? currentSessionId),
  );

  // Terminate a specific session (atomic RPC)
  const terminateSession = (sessionId: string) => {
    if (!user?.id) return;
    const targetSession = devices.find((d) => d.id === sessionId);
    const name = targetSession?.device_name || "this device";

    setAlertTitle("Terminate Session");
    setAlertBody(
      `Are you sure you want to terminate the session for "${name}"?`,
    );
    setAlertType("destructive");
    setAlertConfirmText("Terminate");
    setAlertOnPress(() => async () => {
      try {
        const ok = await terminateDeviceSession(user.id, sessionId);
        if (!ok) throw new Error("Termination failed");
        setModalVisible(false);
        setSelectedSession(null);
        await refresh();
      } catch (e) {
        Alert.alert(
          "Error",
          "Could not terminate this session. Please try again.",
        );
      }
    });
    setAlertVisible(true);
  };

  // Terminate all other sessions (atomic RPC)
  const terminateAllOtherSessions = () => {
    if (!user?.id || !currentSessionId) return;

    setAlertTitle("Terminate Sessions");
    setAlertBody(
      "Are you sure you want to terminate all other sessions? This will log out all other devices.",
    );
    setAlertType("destructive");
    setAlertConfirmText("Terminate");
    setAlertOnPress(() => async () => {
      try {
        const ok = await terminateOtherDeviceSessions(
          user.id,
          currentSessionId,
        );
        if (!ok) throw new Error("Termination failed");
        await refresh();
      } catch (e) {
        setAlertTitle("Error");
        setAlertBody("Failed to terminate other sessions.");
        setAlertVisible(true);
      }
    });
    setAlertVisible(true);
  };

  // Helper to render OS circle icon with vibrant solid background
  const renderOSIcon = (os: string, isLarge = false, deviceType?: string) => {
    const osLower = (os || "").toLowerCase();
    const circleSize = isLarge ? 72 : 44;
    const iconSize = isLarge ? 36 : 22;

    let bg = "#0088cc";
    let iconName = "web";
    let IconComponent: any = MaterialCommunityIcons;

    if (deviceType === "web" || osLower.includes("web")) {
      bg = "#0088cc";
      iconName = "web";
      IconComponent = MaterialCommunityIcons;
    } else if (
      osLower.includes("android") ||
      osLower.includes("harmony") ||
      osLower.includes("huawei") ||
      osLower.includes("HarmonyOS") ||
      osLower.includes("hios") ||
      osLower.includes("HyperOS") ||
      osLower.includes("One UI") ||
      osLower.includes("ColorOS") ||
      osLower.includes("OxygenOS") ||
      osLower.includes("EMUI") ||
      osLower.includes("MagicOS")
    ) {
      bg = "#5cbf47";
      iconName = "android";
      IconComponent = FontAwesome6;
    } else if (
      osLower.includes("ios") ||
      osLower.includes("mac") ||
      osLower.includes("apple") ||
      osLower.includes("iphone") ||
      osLower.includes("ipad") ||
      osLower.includes("ipod") ||
      osLower.includes("macos")
    ) {
      bg = "#29b6f6";
      iconName = "apple";
      IconComponent = FontAwesome6;
    } else if (osLower.includes("windows")) {
      bg = "#0288d1";
      iconName = "windows";
      IconComponent = FontAwesome6;
    }

    return (
      <View
        style={{
          width: circleSize,
          height: circleSize,
          // borderRadius: circleSize / 2,
          borderRadius: 12,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: isLarge ? 0 : 14,
        }}
      >
        <IconComponent name={iconName} size={iconSize} color="#ffffff" />
      </View>
    );
  };

  // Helper to format last active date/time for modal title
  const formatLastActive = (isoString: string) => {
    if (!isoString) return "online";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "online";

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();

    // Within 2 mins (or slight clock skew) -> online
    if (diffMs < 120 * 1000 && diffMs > -120 * 1000) {
      return "online";
    }

    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (d.toDateString() === now.toDateString()) {
      return `today at ${timeStr}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `yesterday at ${timeStr}`;
    }

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Helper to format last active string for list item line 3
  const formatListLastActive = (isoString: string) => {
    if (!isoString) return "online";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "online";

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();

    if (diffMs < 120 * 1000 && diffMs > -120 * 1000) {
      return "online";
    }

    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `yesterday ${d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatAgo = (diffMs: number) => {
    if (diffMs < 60 * 1000) return "just now";
    const mins = Math.floor(diffMs / (60 * 1000));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  const formatDateTimeWithAgo = (isoString: string) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const diffMs = Math.max(0, Date.now() - d.getTime());
    const agoText = formatAgo(diffMs);

    return `${day}/${month}/${year} ${timeStr} • ${agoText}`;
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={Platform.OS === "ios" ? ["top", "left", "right"] : undefined}
        style={styles.safe}
      >
        <AppbarBack Title="Devices" />
        {/* <View style={styles.loaderContainer}> */}
        {/* <ActivityIndicator size="large" color={AppColors.secondary} /> */}
        <Loading />
        {/* </View> */}
      </SafeAreaView>
    );
  }

  // Responsive formatting
  const containerMaxWidth = pick("100%", "85%", "70%");
  const selfAlign = pick("stretch" as any, "center" as any, "center" as any);

  return (
    <SafeAreaView
      edges={Platform.OS === "ios" ? ["top", "left", "right"] : undefined}
      style={styles.safe}
    >
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
              tintColor={AppColors.secondary}
              colors={[AppColors.secondary]}
              progressBackgroundColor={AppColors.background2}
            />
          }
        >
          {/* Top Graphic Card */}
          <View style={styles.card}>
            <View style={styles.graphicContainer}>
              <LaptopGraphic />
              <Text style={styles.graphicTitle}>
                The official{" "}
                <Text
                  style={{
                    color: AppColors.secondary,
                    fontFamily: AppFonts.bold,
                    includeFontPadding: false,
                  }}
                >
                  SSH Group POS
                </Text>{" "}
                app is available for Android, iPhone, Tablet and Website.
              </Text>
            </View>
          </View>

          {/* Section 1: This Device */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>This device</Text>
            {thisDevice ? (
              <>
                <View style={styles.divider} />
                <Pressable
                  style={({ pressed }) => [
                    styles.sessionItem,
                    {
                      backgroundColor: pressed
                        ? `${AppColors.grey}33`
                        : AppColors.transparent,
                    },
                  ]}
                  onPress={() => {
                    setSelectedSession(thisDevice);
                    setModalVisible(true);
                  }}
                >
                  {renderOSIcon(thisDevice.os, false, thisDevice.device_type)}
                  <View style={styles.sessionDetails}>
                    <Text style={styles.deviceNameText}>
                      {thisDevice.device_name}
                    </Text>
                    <Text style={styles.sessionSubtext}>
                      {`SSH Group POS ${thisDevice.device_type === "web" || thisDevice.os === "Web" ? "Web" : thisDevice.os} ${thisDevice.app_version}`}
                    </Text>
                    <Text style={styles.locationStatusText}>
                      {`${thisDevice.location} • `}
                      <Text style={styles.onlineColor}>online</Text>
                    </Text>
                  </View>
                </Pressable>
              </>
            ) : (
              <View style={styles.emptySession}>
                <Text style={styles.emptyText}>
                  Loading current device details...
                </Text>
              </View>
            )}

            {activeSessions.length > 0 && (
              <>
                <View style={styles.divider} />
                <Pressable
                  style={({ pressed }) => [
                    styles.actionRow,
                    {
                      backgroundColor: pressed
                        ? `${AppColors.grey}33`
                        : AppColors.transparent,
                    },
                  ]}
                  onPress={terminateAllOtherSessions}
                >
                  <Ionicons
                    name="hand-left-outline"
                    size={22}
                    color={AppColors.red}
                  />
                  <Text style={styles.terminateOtherText}>
                    Terminate All Other Sessions
                  </Text>
                </Pressable>
              </>
            )}
          </View>
          <Text style={styles.helpText}>
            Logs out all devices except for this one.
          </Text>

          {/* Section 2: Active Sessions */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Active sessions</Text>
            <View style={styles.divider} />
            {activeSessions.length > 0 ? (
              activeSessions.map((session, index) => {
                const lastActiveText = formatListLastActive(
                  session.last_active,
                );
                return (
                  <React.Fragment key={session.id}>
                    {index > 0 && <View style={styles.divider} />}
                    <Pressable
                      style={({ pressed }) => [
                        styles.sessionItem,
                        {
                          backgroundColor: pressed
                            ? `${AppColors.grey}33`
                            : AppColors.transparent,
                        },
                      ]}
                      onPress={() => {
                        setSelectedSession(session);
                        setModalVisible(true);
                      }}
                    >
                      {renderOSIcon(session.os, false, session.device_type)}
                      <View style={styles.sessionDetails}>
                        <Text style={styles.deviceNameText}>
                          {session.device_name}
                        </Text>
                        <Text style={styles.sessionSubtext}>
                          {`SSH Group POS ${session.device_type === "web" || session.os === "Web" ? "Web" : session.os} ${session.app_version}`}
                        </Text>
                        <Text style={styles.locationStatusText}>
                          {`${session.location} • `}
                          {lastActiveText === "online" ? (
                            <Text style={styles.onlineColor}>online</Text>
                          ) : (
                            lastActiveText
                          )}
                        </Text>
                      </View>
                    </Pressable>
                  </React.Fragment>
                );
              })
            ) : (
              <View style={styles.emptySession}>
                <Text style={styles.emptyText}>No other active sessions</Text>
              </View>
            )}
          </View>
          {/* <Text style={styles.helpText}>
            The official SSH Group POS app is available for Android, iPhone,
            iPad, Windows, macOS and Web.
          </Text> */}

          {/* Section 3: Automatic termination */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>
              Automatically terminate old sessions
            </Text>
            <View style={styles.divider} />
            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                {
                  backgroundColor: pressed
                    ? `${AppColors.grey}33`
                    : AppColors.transparent,
                  paddingVertical: 16,
                },
              ]}
              onPress={() => setSelfDestructModalVisible(true)}
            >
              <View style={styles.sessionDetails}>
                <Text style={styles.optionTitleText}>If inactive for</Text>
              </View>
              <Text style={styles.optionValueText}>{inactivePeriod}</Text>
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modal Sheet matching Picture 3 */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setModalVisible(false);
            setSelectedSession(null);
          }}
          statusBarTranslucent
        >
          <View
            style={[
              styles.modalOverlay,
              {
                justifyContent: !isMobile ? "center" : "flex-end",
                alignItems: !isMobile ? "center" : "stretch",
              },
            ]}
          >
            <View
              style={[
                styles.modalSheet,
                {
                  maxHeight: "90%",
                  maxWidth: !isMobile ? 480 : "100%",
                  width: !isMobile ? 480 : "100%",
                  borderBottomLeftRadius: !isMobile ? 20 : 0,
                  borderBottomRightRadius: !isMobile ? 20 : 0,
                  paddingBottom: Math.max(insets.bottom, 20),
                },
              ]}
            >
              {selectedSession &&
                (() => {
                  const activeSelectedSession =
                    devices.find((d) => d.id === selectedSession.id) ||
                    selectedSession;
                  const statusText = formatLastActive(
                    activeSelectedSession.last_active,
                  );
                  return (
                    <>
                      <ScrollView
                        style={{ flexShrink: 1 }}
                        showsVerticalScrollIndicator={false}
                      >
                        {/* Centered Large Icon & Device Name */}
                        <View style={styles.modalHeaderContainer}>
                          {renderOSIcon(
                            activeSelectedSession.os,
                            true,
                            activeSelectedSession.device_type,
                          )}
                          <Text style={styles.modalDeviceName}>
                            {activeSelectedSession.device_name}
                          </Text>
                          <Text style={styles.modalStatusTime}>
                            {statusText === "online" ? (
                              <Text style={styles.onlineColor}>online</Text>
                            ) : (
                              statusText
                            )}
                          </Text>
                        </View>

                        {/* Modal details list */}
                        <View style={styles.modalList}>
                          {/* Row 1: Application / Model Name */}
                          <View style={styles.modalRow}>
                            <View style={styles.modalIconBox}>
                              <MaterialCommunityIcons
                                name="laptop"
                                size={22}
                                color={AppColors.textSecondary}
                              />
                            </View>
                            <View style={styles.modalRowText}>
                              <Text style={styles.modalRowTitle}>
                                {activeSelectedSession.browser_name
                                  ? `${activeSelectedSession.browser_name} ${activeSelectedSession.browser_version || ""}`
                                  : activeSelectedSession.model_name ||
                                    `SSH Group POS ${activeSelectedSession.os} ${activeSelectedSession.app_version}`}
                              </Text>
                              <Text style={styles.modalRowSub}>
                                {activeSelectedSession.browser_name
                                  ? "Web Browser"
                                  : "Application / Model Name"}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.modalRowDivider} />

                          {/* Row 2: OS & Model Number */}
                          <View style={styles.modalRow}>
                            <View style={styles.modalIconBox}>
                              <Ionicons
                                name="information-circle-outline"
                                size={22}
                                color={AppColors.textSecondary}
                              />
                            </View>
                            <View style={styles.modalRowText}>
                              <Text style={styles.modalRowTitle}>
                                {`${activeSelectedSession.os} ${activeSelectedSession.os_version} ${activeSelectedSession.model_number ? "• " + activeSelectedSession.model_number : ""}`}
                              </Text>
                              <Text style={styles.modalRowSub}>
                                System & Model Number
                              </Text>
                            </View>
                          </View>
                          <View style={styles.modalRowDivider} />

                          {/* Row 3: Location */}
                          <View style={styles.modalRow}>
                            <View style={styles.modalIconBox}>
                              <Ionicons
                                name="location-outline"
                                size={22}
                                color={AppColors.textSecondary}
                              />
                            </View>
                            <View style={styles.modalRowText}>
                              <Text style={styles.modalRowTitle}>
                                {activeSelectedSession.location}
                              </Text>
                              <Text style={styles.modalRowSub}>
                                {`IP: ${activeSelectedSession.ip_address || "Unknown"}`}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.modalRowDivider} />

                          {/* Row 4: Last Login */}
                          {activeSelectedSession.last_login && (
                            <>
                              <View style={styles.modalRow}>
                                <View style={styles.modalIconBox}>
                                  <Ionicons
                                    name="log-in-outline"
                                    size={22}
                                    color={AppColors.textSecondary}
                                  />
                                </View>
                                <View style={styles.modalRowText}>
                                  <Text style={styles.modalRowTitle}>
                                    {formatDateTimeWithAgo(
                                      activeSelectedSession.last_login,
                                    )}
                                  </Text>
                                  <Text style={styles.modalRowSub}>
                                    Last Login Time
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.modalRowDivider} />
                            </>
                          )}

                          {/* Row 5: Last Use Time */}
                          {(activeSelectedSession.last_use_time ||
                            activeSelectedSession.last_active) && (
                            <>
                              <View style={styles.modalRow}>
                                <View style={styles.modalIconBox}>
                                  <Ionicons
                                    name="time-outline"
                                    size={22}
                                    color={AppColors.textSecondary}
                                  />
                                </View>
                                <View style={styles.modalRowText}>
                                  <Text style={styles.modalRowTitle}>
                                    {(() => {
                                      const raw =
                                        activeSelectedSession.last_use_time ||
                                        activeSelectedSession.last_active;
                                      const d = raw ? new Date(raw) : null;
                                      const diffMs =
                                        d && !isNaN(d.getTime())
                                          ? Date.now() - d.getTime()
                                          : Infinity;
                                      const isOnline =
                                        diffMs < 120 * 1000 &&
                                        diffMs > -120 * 1000;
                                      if (isOnline) {
                                        return (
                                          <Text style={styles.onlineColor}>
                                            online
                                          </Text>
                                        );
                                      }
                                      return formatDateTimeWithAgo(raw);
                                    })()}
                                  </Text>
                                  <Text style={styles.modalRowSub}>
                                    Last Use Time
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.modalRowDivider} />
                            </>
                          )}
                        </View>
                      </ScrollView>

                      <View style={styles.conBtn}>
                        {activeSelectedSession.id === currentSessionId ? (
                          <TouchableOpacity
                            style={[
                              styles.terminateBtn,
                              {
                                backgroundColor: AppColors.background2,
                                borderColor: AppColors.secondary,
                              },
                            ]}
                            onPress={() => {
                              setModalVisible(false);
                              setSelectedSession(null);
                            }}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.terminateBtnText,
                                { color: AppColors.secondary },
                              ]}
                            >
                              Close
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.terminateBtn,
                                {
                                  backgroundColor: AppColors.background2,
                                  borderColor: AppColors.secondary,
                                },
                              ]}
                              onPress={() => {
                                setModalVisible(false);
                                setSelectedSession(null);
                              }}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.terminateBtnText,
                                  { color: AppColors.secondary },
                                ]}
                              >
                                Cancel
                              </Text>
                            </TouchableOpacity>

                            {/* Terminate Session Button */}
                            <TouchableOpacity
                              style={[styles.terminateBtn, { flex: 2 }]}
                              onPress={() =>
                                terminateSession(activeSelectedSession.id)
                              }
                              activeOpacity={0.8}
                            >
                              <Text style={styles.terminateBtnText}>
                                Terminate Session
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </>
                  );
                })()}
            </View>
          </View>
        </Modal>

        {/* Add Device Instructions Modal */}
        <Modal
          visible={addDeviceModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAddDeviceModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setAddDeviceModalVisible(false)}
            />
            <View
              style={[
                styles.modalSheet,
                { borderRadius: 24 },
                !isMobile && {
                  maxWidth: 400,
                  alignSelf: "center",
                },
              ]}
            >
              <View style={styles.modalHeaderContainer}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "#fff3e0",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="rocket-outline" size={32} color="#ff9800" />
                </View>
                <Text style={styles.modalDeviceName}>Coming Soon</Text>
                <Text style={styles.modalStatusTime}>
                  Feature Under Development
                </Text>
              </View>

              <View style={{ marginBottom: 24, alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: AppFonts.regular,
                    color: AppColors.textPrimary,
                    fontSize: 14,
                    lineHeight: 20,
                    textAlign: "center",
                    paddingHorizontal: 8,
                  }}
                >
                  The option to add devices via QR Code scanning is coming soon!
                  You will be able to link new devices instantly in a future
                  update.
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.terminateBtn,
                  { backgroundColor: AppColors.secondary },
                ]}
                onPress={() => setAddDeviceModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.terminateBtnText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Custom Confirmation Alert Modal */}
        <Modal
          visible={alertVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAlertVisible(false)}
        >
          <View style={styles.alertOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setAlertVisible(false)}
            />
            <View style={[styles.alertCard, !isMobile && { maxWidth: 400 }]}>
              <View
                style={[
                  styles.alertIconCircle,
                  {
                    backgroundColor:
                      alertType === "destructive" ? "#ffebee" : "#e3f2fd",
                  },
                ]}
              >
                <Ionicons
                  name={
                    alertType === "destructive"
                      ? "hand-left-outline"
                      : "information-circle-outline"
                  }
                  size={28}
                  color={
                    alertType === "destructive"
                      ? "#e53935"
                      : AppColors.secondary
                  }
                />
              </View>

              <Text style={styles.alertTitleText}>{alertTitle}</Text>
              <Text style={styles.alertBodyText}>{alertBody}</Text>

              <View style={styles.alertBtnRow}>
                <TouchableOpacity
                  style={styles.alertCancelBtn}
                  onPress={() => setAlertVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.alertCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.alertConfirmBtn,
                    {
                      backgroundColor:
                        alertType === "destructive"
                          ? "#e53935"
                          : AppColors.secondary,
                    },
                  ]}
                  onPress={async () => {
                    setAlertVisible(false);
                    if (alertOnPress) {
                      await alertOnPress();
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.alertConfirmText}>
                    {alertConfirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Sessions Self-Destruct Selection Modal matching Telegram style */}
        <Modal
          visible={selfDestructModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSelfDestructModalVisible(false)}
        >
          <View style={styles.alertOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setSelfDestructModalVisible(false)}
            />
            <View
              style={[styles.selfDestructCard, !isMobile && { maxWidth: 400 }]}
            >
              <Text style={styles.selfDestructTitle}>
                Sessions self-destruct
              </Text>

              {(
                [
                  "1 day",
                  "1 week",
                  "3 months",
                  "6 months",
                  "1 year",
                ] as InactivePeriod[]
              ).map((period) => {
                const isSelected = inactivePeriod === period;
                return (
                  <Pressable
                    key={period}
                    style={({ pressed }) => [
                      styles.radioOptionRow,
                      {
                        backgroundColor: pressed
                          ? `${AppColors.grey}33`
                          : AppColors.transparent,
                        paddingVertical: 16,
                      },
                    ]}
                    onPress={async () => {
                      setInactivePeriod(period);
                      setSelfDestructModalVisible(false);
                      try {
                        await AsyncStorage.setItem(
                          INACTIVE_PERIOD_STORAGE_KEY,
                          period,
                        );
                        if (user?.id && currentSessionId) {
                          const ok = await autoTerminateInactiveSessions(
                            user.id,
                            currentSessionId,
                            period,
                          );
                          if (ok) {
                            await refresh();
                          }
                        }
                      } catch (e) {
                        console.error(
                          "Failed to save self-destruct setting:",
                          e,
                        );
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                    <Text style={styles.radioOptionText}>{period}</Text>
                  </Pressable>
                );
              })}

              <TouchableOpacity
                style={styles.selfDestructCancelBtn}
                onPress={() => setSelfDestructModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.selfDestructCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background2,
  },
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  graphicContainer: {
    alignItems: "center",
    paddingVertical: 4,
  },
  graphicTitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
    lineHeight: 20,
  },
  addDeviceBtn: {
    backgroundColor: AppColors.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    gap: 8,
    width: "100%",
  },
  addDeviceText: {
    color: AppColors.background2,
    fontSize: 15,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  sectionHeader: {
    fontSize: 14,
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    // padding: 16,
    marginTop: 14,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  sessionDetails: {
    flex: 1,
  },
  deviceNameText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    marginBottom: 2,
  },
  sessionSubtext: {
    fontSize: 13,
    color: AppColors.textPrimary + 90,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginBottom: 2,
  },
  locationStatusText: {
    fontSize: 13,
    color: AppColors.textPrimary + 90,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  onlineColor: {
    color: AppColors.green,
    fontWeight: "600",
  },
  divider: {
    height: 0.5,
    backgroundColor: AppColors.grey + 50,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  terminateOtherText: {
    color: AppColors.red,
    fontSize: 16,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  helpText: {
    fontSize: 12,
    color: "#9e9e9e",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    marginTop: 6,
    marginLeft: 16,
    marginRight: 16,
    lineHeight: 16,
  },
  emptySession: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  optionTitleText: {
    fontSize: 15,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  optionValueText: {
    fontSize: 15,
    color: AppColors.red,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Modal Sheet Styles matching Picture 3
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: AppColors.background2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  modalHeaderContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalDeviceName: {
    fontSize: 20,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    color: AppColors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  modalStatusTime: {
    fontSize: 13,
    color: "#9e9e9e",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  modalList: {
    marginBottom: 24,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  modalRowDivider: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginLeft: 44,
  },
  modalIconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalRowText: {
    flex: 1,
  },
  modalRowTitle: {
    fontSize: 15,
    fontFamily: AppFonts.bold,
    color: AppColors.textPrimary,
    includeFontPadding: false,
    marginBottom: 2,
  },
  modalRowSub: {
    fontSize: 12,
    color: "#9e9e9e",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  conBtn: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    // marginTop: 16,
    marginBottom: 10,
    // borderTopWidth: 1,
    // borderColor: AppColors.grey + 33,
    // paddingTop: 10,
    // paddingHorizontal: 24,
  },
  terminateBtn: {
    flex: 1,
    backgroundColor: AppColors.red,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderColor: AppColors.transparent,
    borderWidth: 1.5,
  },
  terminateBtnText: {
    color: AppColors.background2,
    fontSize: 16,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  alertCard: {
    width: "100%",
    backgroundColor: AppColors.background2,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  alertIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  alertTitleText: {
    fontSize: 18,
    fontFamily: AppFonts.bold,
    color: AppColors.textPrimary,
    includeFontPadding: false,
    marginBottom: 8,
    textAlign: "center",
  },
  alertBodyText: {
    fontSize: 14,
    fontFamily: AppFonts.regular,
    color: "#616161",
    includeFontPadding: false,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  alertBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  alertCancelBtn: {
    flex: 1,
    height: 44,
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderColor: AppColors.secondary,
    borderWidth: 1.5,
  },
  alertCancelText: {
    fontSize: 15,
    fontFamily: AppFonts.bold,
    color: AppColors.secondary,
    includeFontPadding: false,
  },
  alertConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  alertConfirmText: {
    fontSize: 15,
    fontFamily: AppFonts.bold,
    color: AppColors.background2,
    includeFontPadding: false,
  },
  selfDestructCard: {
    width: "100%",
    backgroundColor: AppColors.background2,
    borderRadius: 24,
    // paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  selfDestructTitle: {
    fontSize: 20,
    fontFamily: AppFonts.bold,
    color: AppColors.textPrimary,
    includeFontPadding: false,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  radioOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: AppColors.grey,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  radioCircleSelected: {
    borderColor: AppColors.secondary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: AppColors.secondary,
  },
  radioOptionText: {
    fontSize: 16,
    fontFamily: AppFonts.regular,
    color: AppColors.textPrimary,
    includeFontPadding: false,
  },
  selfDestructCancelBtn: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    // backgroundColor: AppColors.background2,
    borderColor: AppColors.secondary,
    borderWidth: 1.5,
    borderRadius: 10,
    marginRight: 16,
  },
  selfDestructCancelText: {
    fontSize: 15,
    fontFamily: AppFonts.bold,
    color: AppColors.secondary,
    includeFontPadding: false,
  },
});
