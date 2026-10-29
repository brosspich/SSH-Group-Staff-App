import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { UserProvider } from "@/contexts/UserContext";
import { useFonts } from "expo-font";
import { NavigationBar } from "expo-navigation-bar";
import { SplashScreen, Stack } from "expo-router";
import Head from "expo-router/head";
import { useEffect } from "react";
import { LogBox, Platform, StatusBar, Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Set global default font family to Google Sans for all Text and TextInput components
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: AppFonts.regular };

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = { fontFamily: AppFonts.regular };

if (Platform.OS === "android") {
  (Text as any).defaultProps.includeFontPadding = false;
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
    <>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />

      {/* This is the new, error-free way to set the Android nav bar */}
      {Platform.OS === "android" && <NavigationBar style="dark" />}

      <SafeAreaProvider
        style={{ flex: 1, backgroundColor: AppColors.background2 }}
      >
        {Platform.OS === "web" && (
          <Head>
            <title>SSH Group Staff</title>
            <style>{`
            input:focus, textarea:focus, [role="textbox"]:focus, div:focus, select:focus {
              outline: none !important;
              box-shadow: none !important;
            }
            input, textarea, [role="textbox"] {
              outline-style: none !important;
            }
            * {
              -webkit-tap-highlight-color: transparent;
            }
          `}</style>
          </Head>
        )}
        <UserProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              animationDuration: 300,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login/login" />
            <Stack.Screen name="(tabs)" />

            <Stack.Screen name="about/about" />
            <Stack.Screen name="about/contact" />

            <Stack.Screen name="account/account" />
            <Stack.Screen name="account/information" />

            <Stack.Screen name="account-staff/CreateAccountStaff" />
            <Stack.Screen name="account-staff/ChangeInfoAccountStaff" />

            <Stack.Screen name="privacy-policy-security/devices" />
            <Stack.Screen name="privacy-policy-security/PrivacyPolicy" />

            <Stack.Screen name="report-current-staff/annual-report" />
            <Stack.Screen name="report-current-staff/daily-report" />
            <Stack.Screen name="report-current-staff/monthly-report" />
            <Stack.Screen name="report-current-staff/weekly-report" />

            <Stack.Screen name="report-individual-staff/annual-report" />
            <Stack.Screen name="report-individual-staff/daily-report" />
            <Stack.Screen name="report-individual-staff/monthly-report" />
            <Stack.Screen name="report-individual-staff/weekly-report" />

            <Stack.Screen name="report-request-current-staff/annual-report" />
            <Stack.Screen name="report-request-current-staff/daily-report" />
            <Stack.Screen name="report-request-current-staff/monthly-report" />
            <Stack.Screen name="report-request-current-staff/weekly-report" />

            <Stack.Screen name="report-request-individual-staff/annual-report" />
            <Stack.Screen name="report-request-individual-staff/daily-report" />
            <Stack.Screen name="report-request-individual-staff/monthly-report" />
            <Stack.Screen name="report-request-individual-staff/weekly-report" />
          </Stack>
        </UserProvider>
      </SafeAreaProvider>
    </>
  );
}
