import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createElement } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// ─── Report Screen ───────────────────────────────────────────────────────────

export default function Report() {
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
        {/* ── Report Sale ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Sale</Text>
          <View style={styles.card}>
            <BtnItem
              onPress={() => {
                router.push("/report/daily-report" as any);
              }}
              title="Daily Sale Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/report/weekly-report" as any);
              }}
              title="Weekly Sale Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/report/monthly-report" as any);
              }}
              title="Monthly Sale Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/report/annual-report" as any);
              }}
              title="Annual Sale Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
          </View>
        </View>

        {/* ── Report Stock ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Stock</Text>
          <View style={styles.card}>
            <BtnItem
              onPress={() => {
                router.push("/report-stock/daily-report" as any);
              }}
              title="Daily Stock Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/report-stock/weekly-report" as any);
              }}
              title="Weekly Stock Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/report-stock/monthly-report" as any);
              }}
              title="Monthly Stock Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
            <Border />
            <BtnItem
              onPress={() => {
                router.push("/report-stock/annual-report" as any);
              }}
              title="Annual Stock Report"
              iconName="newspaper-outline"
              icon={Ionicons}
            />
          </View>
        </View>
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
    // letterSpacing: 0.8,
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
