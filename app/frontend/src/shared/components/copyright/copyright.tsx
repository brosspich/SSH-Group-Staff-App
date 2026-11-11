import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import Constants from "expo-constants";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function Copyright() {
  const { t } = useLanguage();
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const appVersionCode =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode;

  return (
    <View>
      <Text style={styles.txtVersion}>
        {t("about.version")} : {appVersion}
        {appVersionCode ? `.${appVersionCode}` : ""}
      </Text>
      <Text style={[styles.footer, { paddingBottom: 0 }]}>
        WWW.SSHGROUPS.COM
      </Text>
      <Text style={styles.footer}>
        © 2026 SSH Group | {t("common.allRightsReserved")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  txtVersion: {
    textAlign: "center",
    color: theme.colors.grey,
    fontSize: theme.fontSizes.xs,
    // fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  footer: {
    textAlign: "center",
    color: theme.colors.grey,
    fontSize: theme.fontSizes.xs,
    marginTop: "auto",
    paddingBottom: 16,
    // fontWeight: "bold",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
