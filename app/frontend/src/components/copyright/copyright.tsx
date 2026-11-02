import { AppColors } from "@/constants/appcolors";
import { Platform, StyleSheet, Text, View } from "react-native";
// import DeviceInfo from "react-native-device-info";
import { AppFonts } from "@/constants/appfonts";
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
    color: AppColors.grey,
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  footer: {
    textAlign: "center",
    color: AppColors.grey,
    fontSize: 12,
    marginTop: "auto",
    paddingBottom: 16,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
