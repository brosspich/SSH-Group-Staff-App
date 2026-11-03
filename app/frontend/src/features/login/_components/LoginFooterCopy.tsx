import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import Constants from "expo-constants";
import { Platform, StyleSheet, Text } from "react-native";

export default function LoginFooterCopy() {
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const appVersionCode =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode;

  return (
    <>
      <Text style={[styles.txtCopy, { marginBottom: 0 }]}>
        Version : {appVersion}
        {appVersionCode ? `.${appVersionCode}` : ""}
      </Text>
      <Text style={[styles.txtCopy, { marginTop: 2, marginBottom: 0 }]}>
        WWW.SSHGROUPS.COM
      </Text>
      <Text style={[styles.txtCopy, { marginTop: 0 }]}>
        © 2026 SSH Group | All Rights Reserved
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  txtCopy: {
    color: AppColors.grey,
    fontSize: 13,
    marginTop: 20,
    fontWeight: "400",
    marginBottom: 20,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    textAlign: "center",
  },
});
