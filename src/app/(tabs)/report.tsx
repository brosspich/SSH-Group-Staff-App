import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useUser } from "@/contexts/UserContext";
import { hasAdminRole } from "@/utils/roleUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createElement } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// ─── Report Screen ───────────────────────────────────────────────────────────

export default function Report() {
  const { user } = useUser();
  const isAdmin = hasAdminRole(user?.role);

  function BtnItem({ iconName, title, onPress, icon }: any) {
    return (
      <Pressable
        onPress={onPress}
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
            {createElement(icon, {
              name: iconName,
              size: 20,
              color: AppColors.textPrimary,
            })}
          </View>
          <Text style={styles.txtTitle}>{title}</Text>
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={20}
          color={AppColors.textPrimary}
        />
      </Pressable>
    );
  }

  function Border() {
    return (
      <View
        style={{
          height: 0.3,
          flex: 1,
          backgroundColor: AppColors.grey,
        }}
      />
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* ── Report Current Staff (Visible to All Staff & Admins) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Current Staff</Text>
          <View style={styles.card}>
            <BtnItem
              onPress={() => {
                router.push("/report-current-staff/daily-report");
              }}
              title="Daily Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/report-current-staff/weekly-report");
              }}
              title="Weekly Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/report-current-staff/monthly-report");
              }}
              title="Monthly Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/report-current-staff/annual-report");
              }}
              title="Annual Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
          </View>
        </View>

        {/* ── Admin Only: Report Individual Staff & Report All Staff ── */}
        {isAdmin && (
          <>
            {/* ── Report Individual Staff ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Report Individual Staff</Text>
              <View style={styles.card}>
                <BtnItem
                  onPress={() => {
                    router.push("/report-individual-staff/daily-report");
                  }}
                  title="Daily Report"
                  iconName="newspaper-outline"
                  icon={Ionicons}
                />
                <Border />
                <BtnItem
                  onPress={() => {
                    router.push("/report-individual-staff/weekly-report");
                  }}
                  title="Weekly Report"
                  iconName="newspaper-outline"
                  icon={Ionicons}
                />
                <Border />
                <BtnItem
                  onPress={() => {
                    router.push("/report-individual-staff/monthly-report");
                  }}
                  title="Monthly Report"
                  iconName="newspaper-outline"
                  icon={Ionicons}
                />
                <Border />
                <BtnItem
                  onPress={() => {
                    router.push("/report-individual-staff/annual-report");
                  }}
                  title="Annual Report"
                  iconName="newspaper-outline"
                  icon={Ionicons}
                />
              </View>
            </View>

            {/* ── Report All Staff ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Report All Staff</Text>
              <View style={styles.card}>
                <BtnItem
                  onPress={() => {
                    router.push("/report-all-staff/daily-report");
                  }}
                  title="Daily Report"
                  iconName="newspaper-outline"
                  icon={Ionicons}
                />
                <Border />
                <BtnItem
                  onPress={() => {
                    router.push("/report-all-staff/weekly-report");
                  }}
                  title="Weekly Report"
                  iconName="newspaper-outline"
                  icon={Ionicons}
                />
                <Border />
                <BtnItem
                  onPress={() => {
                    router.push("/report-all-staff/monthly-report");
                  }}
                  title="Monthly Report"
                  iconName="newspaper-outline"
                  icon={Ionicons}
                />
                <Border />
                <BtnItem
                  onPress={() => {
                    router.push("/report-all-staff/annual-report");
                  }}
                  title="Annual Report"
                  iconName="newspaper-outline"
                  icon={Ionicons}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Section
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.textSecondary ?? AppColors.grey,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 10,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  // Info card
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
});
