import Appbar from "@/components/appbar/appbar";
import {
  MenuButtonItem,
  MenuDivider,
} from "@/components/common/MenuButtonItem";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useUser } from "@/contexts/UserContext";
import { useResponsive } from "@/hooks/useResponsive";
import { hasAdminRole } from "@/utils/roleUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Report Screen ───────────────────────────────────────────────────────────

export default function Report() {
  const { user } = useUser();
  const isAdmin = hasAdminRole(user?.role);
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <StatusBar
        backgroundColor={AppColors.background}
        barStyle="light-content"
      />
      <Appbar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 90,
        }}
      >
        <View style={!isMobile ? styles.webContainer : undefined}>
          {/* ── Report Current Staff (Visible to All Staff & Admins) ── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginTop: 5 }]}>
              Report Current Staff
            </Text>
            <View style={styles.card}>
              <MenuButtonItem
                onPress={() => {
                  router.push("/report-current-staff/daily-report");
                }}
                title="Daily Report"
                iconName="newspaper-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => {
                  router.push("/report-current-staff/weekly-report");
                }}
                title="Weekly Report"
                iconName="newspaper-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => {
                  router.push("/report-current-staff/monthly-report");
                }}
                title="Monthly Report"
                iconName="newspaper-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => {
                  router.push("/report-current-staff/annual-report");
                }}
                title="Annual Report"
                iconName="newspaper-outline"
                icon={Ionicons}
              />
            </View>
          </View>

          {/* ── Report Request Current Staff (Visible to All Staff & Admins) ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Report Request Current Staff
            </Text>
            <View style={styles.card}>
              <MenuButtonItem
                onPress={() => {
                  router.push("/report-request-current-staff/daily-report");
                }}
                title="Daily Report"
                iconName="document-text-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => {
                  router.push("/report-request-current-staff/weekly-report");
                }}
                title="Weekly Report"
                iconName="document-text-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => {
                  router.push("/report-request-current-staff/monthly-report");
                }}
                title="Monthly Report"
                iconName="document-text-outline"
                icon={Ionicons}
              />
              <MenuDivider />
              <MenuButtonItem
                onPress={() => {
                  router.push("/report-request-current-staff/annual-report");
                }}
                title="Annual Report"
                iconName="document-text-outline"
                icon={Ionicons}
              />
            </View>
          </View>

          {/* ── Admin Only: Report Individual Staff ── */}
          {isAdmin && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Report Individual Staff</Text>
                <View style={styles.card}>
                  <MenuButtonItem
                    onPress={() => {
                      router.push("/report-individual-staff/daily-report");
                    }}
                    title="Daily Report"
                    iconName="newspaper-outline"
                    icon={Ionicons}
                  />
                  <MenuDivider />
                  <MenuButtonItem
                    onPress={() => {
                      router.push("/report-individual-staff/weekly-report");
                    }}
                    title="Weekly Report"
                    iconName="newspaper-outline"
                    icon={Ionicons}
                  />
                  <MenuDivider />
                  <MenuButtonItem
                    onPress={() => {
                      router.push("/report-individual-staff/monthly-report");
                    }}
                    title="Monthly Report"
                    iconName="newspaper-outline"
                    icon={Ionicons}
                  />
                  <MenuDivider />
                  <MenuButtonItem
                    onPress={() => {
                      router.push("/report-individual-staff/annual-report");
                    }}
                    title="Annual Report"
                    iconName="newspaper-outline"
                    icon={Ionicons}
                  />
                </View>
              </View>

              {/* ── Report Request Individual Staff ── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Report Request Individual Staff
                </Text>
                <View style={styles.card}>
                  <MenuButtonItem
                    onPress={() => {
                      router.push(
                        "/report-request-individual-staff/daily-report",
                      );
                    }}
                    title="Daily Report"
                    iconName="document-text-outline"
                    icon={Ionicons}
                  />
                  <MenuDivider />
                  <MenuButtonItem
                    onPress={() => {
                      router.push(
                        "/report-request-individual-staff/weekly-report",
                      );
                    }}
                    title="Weekly Report"
                    iconName="document-text-outline"
                    icon={Ionicons}
                  />
                  <MenuDivider />
                  <MenuButtonItem
                    onPress={() => {
                      router.push(
                        "/report-request-individual-staff/monthly-report",
                      );
                    }}
                    title="Monthly Report"
                    iconName="document-text-outline"
                    icon={Ionicons}
                  />
                  <MenuDivider />
                  <MenuButtonItem
                    onPress={() => {
                      router.push(
                        "/report-request-individual-staff/annual-report",
                      );
                    }}
                    title="Annual Report"
                    iconName="document-text-outline"
                    icon={Ionicons}
                  />
                </View>
              </View>
            </>
          )}
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
  webContainer: {
    maxWidth: 850,
    width: "100%",
    alignSelf: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.textSecondary ?? AppColors.grey,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 6,
    fontFamily: AppFonts.bold,
  },
  card: {
    backgroundColor: AppColors.background2,
    borderRadius: 12,
    overflow: "hidden",
  },
});
