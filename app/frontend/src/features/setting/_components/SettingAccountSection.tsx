import { useLanguage } from "@/features/language/hooks/useLanguage";
import { theme } from "@/shared/styles/theme";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SettingAccountSectionProps {
  onLogoutPress: () => void;
}

export const SettingAccountSection: React.FC<SettingAccountSectionProps> = ({
  onLogoutPress,
}) => {
  const { t, currentLang, isKhmer } = useLanguage();

  return (
    <>
      {/* ── Account Info Section ── */}
      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {t("setting.accountInfo")}
        </Text>
        <View style={styles.card}>
          <Pressable
            onPress={() => router.push("/account/information")}
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${theme.colors.grey}33`
                  : theme.colors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>{t("setting.information")}</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.textPrimary}
            />
          </Pressable>

          <View style={styles.border} />

          <Pressable
            onPress={onLogoutPress}
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${theme.colors.grey}33`
                  : theme.colors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <AntDesign
                  name="logout"
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>{t("setting.logout")}</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.textPrimary}
            />
          </Pressable>
        </View>
      </View>

      {/* ── Preferences Section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("setting.preferences")}</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() => router.push("/language" as any)}
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${theme.colors.grey}33`
                  : theme.colors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <Ionicons
                  name="language-outline"
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>{t("setting.language")}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fonts.medium,
                }}
              >
                {currentLang === "en"
                  ? "English 🇬🇧"
                  : currentLang === "zh"
                    ? "中文 🇨🇳"
                    : "ភាសាខ្មែរ 🇰🇭"}
              </Text>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={theme.colors.textPrimary}
              />
            </View>
          </Pressable>
        </View>
      </View>

      {/* ── Privacy & Security Section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("setting.privacySecurity")}</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() =>
              router.push("/privacy-policy-security/PrivacyPolicy")
            }
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${theme.colors.grey}33`
                  : theme.colors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <MaterialIcons
                  name="privacy-tip"
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>{t("setting.privacyPolicy")}</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.textPrimary}
            />
          </Pressable>

          <View style={styles.border} />

          <Pressable
            onPress={() => router.push("/privacy-policy-security/devices")}
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${theme.colors.grey}33`
                  : theme.colors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <MaterialIcons
                  name="devices"
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>{t("setting.devices")}</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.textPrimary}
            />
          </Pressable>
        </View>
      </View>

      {/* ── About Us Section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("setting.aboutUs")}</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() => router.push("/about/about")}
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${theme.colors.grey}33`
                  : theme.colors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>{t("setting.about")}</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.textPrimary}
            />
          </Pressable>

          <View style={styles.border} />

          <Pressable
            onPress={() => router.push("/about/contact")}
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${theme.colors.grey}33`
                  : theme.colors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={theme.colors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>{t("setting.contact")}</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.textPrimary}
            />
          </Pressable>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary ?? theme.colors.grey,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
    flexShrink: 1,
  },
  card: {
    backgroundColor: theme.colors.background2,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  conBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 7,
  },
  iconTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  conIcon: {
    width: 35,
    height: 35,
    backgroundColor: `${theme.colors.grey}50`,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  txtTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
  },
  border: {
    height: 0.3,
    flex: 1,
    backgroundColor: theme.colors.grey,
  },
});
