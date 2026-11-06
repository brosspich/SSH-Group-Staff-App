import { theme } from "@/shared/styles/theme";
import { Platform, StyleSheet, Text, View } from "react-native";
// import DeviceInfo from "react-native-device-info";
import Constants from "expo-constants";

export default function Copyright() {
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const appVersionCode =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode;

  return (
    <View>
      <Text style={styles.txtVersion}>
        Version : {appVersion}
        {appVersionCode ? `.${appVersionCode}` : ""}
      </Text>
      <Text style={[styles.footer, { paddingBottom: 0 }]}>
        WWW.SSHGROUPS.COM
      </Text>
      <Text style={styles.footer}>© 2026 SSH Group | All Rights Reserved</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  txtVersion: {
    textAlign: "center",
    color: theme.colors.grey,
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  footer: {
    textAlign: "center",
    color: theme.colors.grey,
    fontSize: theme.fontSizes.xs,
    marginTop: "auto",
    paddingBottom: 16,
    fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
