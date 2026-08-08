import AppbarBack from "@/components/appbar/appbarback";
import Loading from "@/components/loading/loading";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { activationService } from "@/services/activationService";
import { userService } from "@/services/userService";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ActivationDetails {
  id: string;
  plan: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

const PLAN_LABELS: Record<string, string> = {
  "1_month": "1 Month",
  "3_month": "3 Months",
  "6_month": "6 Months",
  "1_year": "1 Year",
};

const Activation = () => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [details, setDetails] = useState<ActivationDetails | null>(null);

  const fetchActivation = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const user = await userService.get();
    if (!user) {
      setDetails(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // forceRefresh bypasses any cached activation status so this
    // always hits the DB, not stale local data
    const data = await activationService.getActivationDetails(user.system_id);

    setDetails(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      // Ensure real-time offset is loaded
      await activationService.getRealTime();

      const user = await userService.get();
      if (!user || ignore) {
        setLoading(false);
        return;
      }

      const data = await activationService.getActivationDetails(user.system_id);
      if (!ignore) {
        setDetails(data);
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const onRefresh = useCallback(() => {
    fetchActivation(true);
  }, [fetchActivation]);

  const daysRemaining = details
    ? Math.ceil(
        (new Date(details.end_date).getTime() -
          activationService.getRealTimeNow().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const isActive = daysRemaining > 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <SafeAreaView style={styles.container}>
      <AppbarBack Title="Activation" />

      {loading ? (
        <Loading />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppColors.textPrimary}
              colors={[AppColors.textPrimary]}
            />
          }
        >
          <View
            style={[
              { flex: 1, width: "100%" },
              !isMobile && { maxWidth: "50%", alignSelf: "center" },
            ]}
          >
            {!details ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No activation found</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchActivation()}
                >
                  <Text style={styles.retryText}>Tap to refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isActive ? "#E6F7EC" : "#FDECEC" },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isActive ? "#22C55E" : "#EF4444" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: isActive ? "#22C55E" : "#EF4444" },
                    ]}
                  >
                    {isActive ? "Active" : "Expired"}
                  </Text>
                </View>

                <Text style={styles.planLabel}>
                  {PLAN_LABELS[details.plan] ?? details.plan}
                </Text>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Start Date</Text>
                  <Text style={styles.rowValue}>
                    {formatDate(details.start_date)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>End Date</Text>
                  <Text style={styles.rowValue}>
                    {formatDate(details.end_date)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>
                    {isActive ? "Days Remaining" : "Expired Since"}
                  </Text>
                  <Text
                    style={[
                      styles.rowValue,
                      { color: isActive ? AppColors.textPrimary : "#EF4444" },
                    ]}
                  >
                    {isActive
                      ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`
                      : `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} ago`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Activation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background2,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: AppColors.background,
  },
  center: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  planLabel: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  rowLabel: {
    fontSize: 14,
    color: "#888",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
