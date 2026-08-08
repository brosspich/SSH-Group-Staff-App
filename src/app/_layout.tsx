import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { UserProvider } from "@/contexts/UserContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import Head from "expo-router/head";
import { useEffect } from "react";
import { LogBox, Platform, StatusBar, Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Disable default font padding on Android so custom fonts (like Google Sans) do not add extra vertical space
if (Platform.OS === "android") {
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.includeFontPadding = false;
  (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
  (TextInput as any).defaultProps.includeFontPadding = false;
}

// Ignore React Native Web unknown event handler warnings that trigger development error overlay
LogBox.ignoreLogs([
  "Unknown event handler property",
  "onPressOut",
  "onPressIn",
  "onStartShouldSetResponder",
  "onResponderRelease",
  "shadow* style props are deprecated",
  "props.pointerEvents is deprecated",
  "TouchableMixin is deprecated",
  "TouchableWithoutFeedback is deprecated",
]);

if (Platform.OS === "web") {
  const ignorePatterns = [
    "Unknown event handler property",
    "onPressOut",
    "onPressIn",
    "onStartShouldSetResponder",
    "onResponderRelease",
    "shadow* style props are deprecated",
    "props.pointerEvents is deprecated",
    "TouchableMixin is deprecated",
    "TouchableWithoutFeedback is deprecated",
  ];

  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      ignorePatterns.some((pattern) => args[0].includes(pattern))
    ) {
      return;
    }
    originalError(...args);
  };

  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      ignorePatterns.some((pattern) => args[0].includes(pattern))
    ) {
      return;
    }
    originalWarn(...args);
  };
}

import { fetchOfficialAttendanceQRCodes } from "@/constants/attendanceConfig";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    [AppFonts.regular]: require("@/assets/fonts/GoogleSans-Regular.ttf"),
    [AppFonts.bold]: require("@/assets/fonts/GoogleSans-Bold.ttf"),
  });

  useEffect(() => {
    fetchOfficialAttendanceQRCodes();
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider
      style={{ flex: 1, backgroundColor: AppColors.background2 }}
    >
      {Platform.OS === "web" && (
        <Head>
          <title>SSH Group Staff</title>
        </Head>
      )}
      <UserProvider>
        <StatusBar
          backgroundColor={AppColors.background2}
          barStyle="dark-content"
        />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login/login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </UserProvider>
    </SafeAreaProvider>
  );
}
