import Appbar from "@/components/appbar/appbar";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useUser } from "@/contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, usePathname } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Home, Receipt2, Settings2 } from "reicon-react-native";

// ─── Tab definitions (single source of truth) ────────────────────────────────
const TABS = [
  {
    name: "index",
    label: "Home",
    icon: (color: string, size: number) => (
      <Home size={size} weight="Filled" color={color} />
    ),
    iconOutline: (color: string, size: number) => (
      <Home size={size} color={color} />
    ),
    href: "/(tabs)/",
  },
  {
    name: "attendance",
    label: "Attendance",
    icon: (color: string, size: number) => (
      <Ionicons name="calendar" size={size} color={color} />
    ),
    iconOutline: (color: string, size: number) => (
      <Ionicons name="calendar-outline" size={size} color={color} />
    ),
    href: "/(tabs)/attendance",
  },
  {
    name: "report",
    label: "Report",
    icon: (color: string, size: number) => (
      <Receipt2 size={size} weight="Filled" color={color} />
    ),
    iconOutline: (color: string, size: number) => (
      <Receipt2 size={size} color={color} />
    ),
    href: "/(tabs)/report",
  },
  {
    name: "setting",
    label: "Setting",
    icon: (color: string, size: number) => (
      <Settings2 size={size} weight="Filled" color={color} />
    ),
    iconOutline: (color: string, size: number) => (
      <Settings2 size={size} color={color} />
    ),
    href: "/(tabs)/setting",
  },
];

// ─── Mobile: custom tab button ────────────────────────────────────────────────
function CustomTabBarButton({ children, onPress, accessibilityState }: any) {
  const isFocused = accessibilityState?.selected;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        {
          backgroundColor: pressed
            ? `${AppColors.grey}33`
            : AppColors.transparent,
        },
        isFocused && styles.activeTab,
      ]}
    >
      {children}
    </Pressable>
  );
}

// ─── Admin Role Check Helper ──────────────────────────────────────────────────
export function hasAdminRole(role: any): boolean {
  if (!role) return false;
  if (Array.isArray(role)) {
    return role.some((r) => String(r).trim().toLowerCase() === "admin");
  }
  if (typeof role === "string") {
    if (role.trim().toLowerCase() === "admin") return true;
    try {
      const parsed = JSON.parse(role);
      if (Array.isArray(parsed)) {
        return parsed.some((r) => String(r).trim().toLowerCase() === "admin");
      }
    } catch (e) {}
  }
  return false;
}

// ─── Tablet: left sidebar ─────────────────────────────────────────────────────
function SideRail() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = hasAdminRole(user?.role);
  const visibleTabs = TABS.filter((tab) => tab.name !== "report" || isAdmin);

  return (
    <View style={[styles.sidebar, { paddingTop: 8 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {visibleTabs.map((tab) => {
          const active =
            tab.name === "index"
              ? pathname === "/" ||
                pathname === "/(tabs)" ||
                pathname === "/(tabs)/"
              : pathname.includes(tab.name);

          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.sideItem, active && styles.sideItemActive]}
              activeOpacity={0.7}
              // expo-router Link doesn't work well here; use href navigation
              onPress={() => {
                const { router } = require("expo-router");
                router.push(tab.href);
              }}
            >
              {active
                ? tab.icon(AppColors.background2, 22)
                : tab.iconOutline(AppColors.secondary, 22)}
              <Text
                style={[styles.sideLabel, active && styles.sideLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────
export default function TabLayout() {
  const { user, loading } = useUser();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (!user) return <Redirect href="/login/login" />;

  const isAdmin = hasAdminRole(user?.role);
  const visibleTabs = TABS.filter((tab) => tab.name !== "report" || isAdmin);

  // ── Shared Tabs component ──
  const tabScreens = (
    <Tabs
      screenOptions={{
        headerShown: false,
        // On tablet we hide the bottom bar entirely
        tabBarActiveTintColor: AppColors.secondary,
        tabBarStyle: isTablet
          ? { display: "none" }
          : {
              height: 65 + insets.bottom,
              paddingBottom: insets.bottom,
            },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 4,
          fontWeight: "bold",
          fontFamily: AppFonts.bold,
          includeFontPadding: false,
        },
        tabBarIconStyle: { marginTop: 4, marginBottom: 2 },
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
      }}
    >
      {TABS.map((tab) => {
        const isReportTab = tab.name === "report";
        const shouldHideTab = isReportTab && !isAdmin;

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              href: shouldHideTab ? null : undefined,
              title: tab.label,
              tabBarIcon: ({ color, size, focused }) => {
                const iconSize = tab.name === "index" ? size : size + 3;
                const iconColor = color as string;
                return focused
                  ? tab.icon(iconColor, iconSize)
                  : tab.iconOutline(iconColor, iconSize);
              },
            }}
          />
        );
      })}
    </Tabs>
  );

  if (isTablet) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background2 }}>
        <View style={{ flex: 1, backgroundColor: AppColors.background }}>
          {/* <StatusBar backgroundColor={AppColors.red} barStyle="dark-content" /> */}
          <Appbar />
          <View style={{ flex: 1, flexDirection: "row" }}>
            <SideRail />
            <View style={{ flex: 1 }}>{tabScreens}</View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Mobile
  return (
    <>
      {/* <StatusBar barStyle="dark-content" /> */}
      {/* <SafeAreaView
        style={{ flex: 1, backgroundColor: AppColors.background2 }}
        edges={
          Platform.OS === "android"
            ? ["top", "left", "right", "bottom"]
            : ["top", "left", "right"]
        }
      > */}
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{
          flex: 1,
          backgroundColor: AppColors.background2,
        }}
      >
        <Appbar />
        {tabScreens}
      </SafeAreaView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: AppColors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  // Mobile tab button
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    // marginHorizontal: 5,
  },
  activeTab: {
    color: AppColors.secondary,
  },

  // Tablet sidebar
  sidebar: {
    width: "12%",
    backgroundColor: AppColors.background2,
    borderRightWidth: 0.5,
    borderRightColor: "#e0e0e0",
    paddingHorizontal: 10,
  },
  sideItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  sideItemActive: {
    backgroundColor: AppColors.secondary,
  },
  sideLabel: {
    fontSize: 14,
    color: AppColors.secondary,
    fontWeight: "500",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  sideLabelActive: {
    color: AppColors.background2,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
