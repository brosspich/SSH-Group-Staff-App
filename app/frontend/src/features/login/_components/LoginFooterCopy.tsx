import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import Constants from "expo-constants";
import { Platform, StyleSheet, Text } from "react-native";

export default function LoginFooterCopy() {
  const { t } = useLanguage();
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const appVersionCode =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode;

  return (
    <>
      <Text style={[styles.txtCopy, { marginBottom: 0 }]}>
        {t("about.version", "Version")} : {appVersion}
        {appVersionCode ? `.${appVersionCode}` : ""}
      </Text>
      <Text style={[styles.txtCopy, { marginTop: 2, marginBottom: 0 }]}>
        WWW.SSHGROUPS.COM
      </Text>
      <Text style={[styles.txtCopy, { marginTop: 0 }]}>
        © 2026 SSH Group |{" "}
        {t("common.allRightsReserved", "All Rights Reserved")}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  txtCopy: {
    color: theme.colors.grey,
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    textAlign: "center",
  },
});
