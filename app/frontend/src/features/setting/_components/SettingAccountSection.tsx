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
  return (
    <>
      {/* ── Account Info Section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
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
              <Text style={styles.txtTitle}>Information</Text>
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
              <Text style={styles.txtTitle}>Logout</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.textPrimary}
            />
          </Pressable>
        </View>
      </View>

      {/* ── Privacy & Security Section ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
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
              <Text style={styles.txtTitle}>Privacy & Policy</Text>
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
              <Text style={styles.txtTitle}>Devices</Text>
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
        <Text style={styles.sectionTitle}>About Us</Text>
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
              <Text style={styles.txtTitle}>About</Text>
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
              <Text style={styles.txtTitle}>Contact</Text>
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
