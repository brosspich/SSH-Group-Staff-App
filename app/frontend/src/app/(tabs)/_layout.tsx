import Appbar from "@/shared/components/appbar/appbar";
import Loading from "@/shared/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useUser } from "@/contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";
import BlurView from "@nguyenduy1412/react-native-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, Tabs, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
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

// ─── Mobile: custom tab button (kept for compatibility) ───────────────────────
function CustomTabBarButton({ children, onPress, accessibilityState }: any) {
  const isFocused = accessibilityState?.selected;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        Platform.OS === "android" && {
          backgroundColor: pressed
            ? `${AppColors.grey}33`
            : AppColors.transparent,
        },
        Platform.OS === "ios" && {
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

// ─── Mobile: Liquid Glass Tab Bar ────────────────────────────────────────────
function GlassTabBar({ state, descriptors, navigation }: any) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Bar sits inside horizontal padding of 16 each side
  const barInnerWidth = width - 30;
  const tabWidth = barInnerWidth / TABS.length;
  const pillWidth = tabWidth - 10;

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      friction: 9,
      tension: 80,
    }).start();
  }, [state.index, tabWidth]);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.glassWrap,
        {
          paddingBottom:
            Platform.OS === "android"
              ? Math.max(insets.bottom, 14)
              : Math.max(insets.bottom - 12),
        },
      ]}
    >
      <LinearGradient
        colors={[
          "transparent",
          // "rgba(255, 255, 255, 0.95)",
          "transparent",
          "rgba(255, 255, 255, 0.95)",
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <BlurView
        mode="backdrop"
        intensity={25}
        tint="light"
        style={styles.glassBar}
      >
        {/* Inner highlight border (liquid sheen) */}
        <View style={styles.glassInner} pointerEvents="none" />

        {/* Sliding active pill */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glassActive,
            {
              width: pillWidth,
              transform: [{ translateX }],
            },
          ]}
        />

        {state.routes.map((route: any, index: number) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            if (Platform.OS === "ios") {
              Haptics.selectionAsync().catch(() => {});
            }
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const color = isFocused ? AppColors.secondary : "rgba(0,0,0,0.45)";

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.glassTab,
                { width: tabWidth },
                pressed && { opacity: 0.6 },
              ]}
            >
              <View style={{ zIndex: 1 }}>
                {isFocused ? tab.icon(color, 22) : tab.iconOutline(color, 22)}
              </View>
              <Text
                style={[
                  styles.glassLabel,
                  { color },
                  isFocused && styles.glassLabelActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

// ─── Tablet: left sidebar ─────────────────────────────────────────────────────
function SideRail() {
  const pathname = usePathname();

  return (
    <View style={[styles.sidebar, { paddingTop: 8 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {TABS.map((tab) => {
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
              onPress={() => router.push(tab.href as any)}
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

  // ── Shared Tabs component ──
  const tabScreens = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.secondary,
        // Hide default bar – we render our own on mobile, none on tablet
        tabBarStyle: { display: "none" },
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
      }}
      tabBar={isTablet ? undefined : (props) => <GlassTabBar {...props} />}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.label }}
        />
      ))}
    </Tabs>
  );

  if (isTablet) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background2 }}>
        <View style={{ flex: 1, backgroundColor: AppColors.background }}>
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
    <View style={{ flex: 1, backgroundColor: AppColors.background2 }}>
      {tabScreens}
    </View>
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

  // Mobile tab button (kept for compatibility)
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  activeTab: {
    color: AppColors.secondary,
  },

  // ── Liquid glass tab bar ──
  glassWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 15,
    // paddingTop: 8,
    backgroundColor: "transparent",
    // backgroundColor: AppColors.red,
  },
  glassBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    // borderWidth: 1,
    // borderColor: "rgba(255,255,255,0.55)",
    borderColor: AppColors.grey + 70,
    // iOS shadow / glow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    // Android
    elevation: 5,
  },
  glassInner: {
    ...StyleSheet.absoluteFill,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  glassActive: {
    position: "absolute",
    top: 5,
    left: 5,
    bottom: 5,
    // right: 5,
    borderRadius: 26,
    backgroundColor: "#02020214",
    borderColor: AppColors.grey + 30,
    borderWidth: 1.5,
  },
  glassTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 2,
  },
  glassLabel: {
    fontSize: 12,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  glassLabelActive: {
    fontFamily: AppFonts.bold,
    fontWeight: "bold",
  },

  // ── Tablet / Web sidebar ──
  sidebar: {
    width: 200,
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
