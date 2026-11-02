import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
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
                  ? `${AppColors.grey}33`
                  : AppColors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={AppColors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>Information</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={AppColors.textPrimary}
            />
          </Pressable>

          <View style={styles.border} />

          <Pressable
            onPress={onLogoutPress}
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${AppColors.grey}33`
                  : AppColors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <AntDesign
                  name="logout"
                  size={20}
                  color={AppColors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>Logout</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={AppColors.textPrimary}
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
                  ? `${AppColors.grey}33`
                  : AppColors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <MaterialIcons
                  name="privacy-tip"
                  size={20}
                  color={AppColors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>Privacy & Policy</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={AppColors.textPrimary}
            />
          </Pressable>

          <View style={styles.border} />

          <Pressable
            onPress={() => router.push("/privacy-policy-security/devices")}
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${AppColors.grey}33`
                  : AppColors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <MaterialIcons
                  name="devices"
                  size={20}
                  color={AppColors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>Devices</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={AppColors.textPrimary}
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
                  ? `${AppColors.grey}33`
                  : AppColors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={AppColors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>About</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={AppColors.textPrimary}
            />
          </Pressable>

          <View style={styles.border} />

          <Pressable
            onPress={() => router.push("/about/contact")}
            style={({ pressed }) => [
              styles.conBtn,
              {
                backgroundColor: pressed
                  ? `${AppColors.grey}33`
                  : AppColors.transparent,
              },
            ]}
          >
            <View style={styles.iconTxt}>
              <View style={styles.conIcon}>
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={AppColors.textPrimary}
                />
              </View>
              <Text style={styles.txtTitle}>Contact</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={AppColors.textPrimary}
            />
          </Pressable>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: AppColors.textSecondary ?? AppColors.grey,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 10,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 16,
    overflow: "hidden",
  },
  conBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  iconTxt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  conIcon: {
    width: 35,
    height: 35,
    backgroundColor: `${AppColors.grey}50`,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txtTitle: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  border: {
    height: 0.3,
    flex: 1,
    backgroundColor: AppColors.grey,
  },
});
