import { useLanguage } from "@/features/language";
import { theme } from "@/shared/styles/theme";
import { AntDesign } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LoginActionButtonsProps {
  onOpenPrivacy: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function LoginActionButtons({
  onOpenPrivacy,
  onSubmit,
  isLoading,
}: LoginActionButtonsProps) {
  const { t } = useLanguage();

  return (
    <>
      <TouchableOpacity
        onPress={onOpenPrivacy}
        style={styles.privacyLink}
        activeOpacity={0.7}
      >
        <Text style={styles.privacyLinkText}>{t("auth.privacyPolicy")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSubmit}
        style={[styles.conBtn, isLoading && { opacity: 0.7 }]}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <View style={styles.btnContent}>
          {isLoading ? (
            <>
              <ActivityIndicator size={24} color={theme.colors.background2} />
              <Text style={styles.txtBtn}>{t("auth.loggingIn")}</Text>
            </>
          ) : (
            <>
              <AntDesign
                name="logout"
                size={18}
                color={theme.colors.background2}
              />
              <Text style={styles.txtBtn}>{t("auth.loginButton")}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  privacyLink: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  privacyLinkText: {
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.xs,
    textDecorationLine: "underline",
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    textAlign: "center",
  },
  conBtn: {
    height: 48,
    width: "100%",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  txtBtn: {
    color: theme.colors.background2,
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
