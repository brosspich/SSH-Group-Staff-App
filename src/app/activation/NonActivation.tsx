import { renderAlertModal } from "@/components/alert/alert";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import { activationService } from "@/services/activationService";
import { userService } from "@/services/userService";
import { AntDesign, Feather, Octicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const NonActivation = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { isMobile } = useResponsive();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);

    try {
      // Get the current user from the service and grab the system identifier
      const currentUser = await userService.get();
      const systemId = currentUser?.system_id;

      if (!systemId) {
        // Alert.alert(
        //   "Error",
        //   "Could not determine your account. Please log in again.",
        // );
        setAlertTitle("Error");
        setAlertBody("Could not determine your account. Please log in again.");
        setAlertVisible(true);
        return;
      }

      const isActive = await activationService.checkActivation(systemId, true);

      if (isActive) {
        router.replace("/(tabs)" as any);
      } else {
        // Alert.alert(
        //   "Still Inactive",
        //   "Your subscription is still expired. Please contact SSH Group to renew your plan.",
        // );

        setAlertTitle("Still Inactive");
        setAlertBody(
          "Your subscription is still expired. Please contact SSH Group to renew your plan.",
        );
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Failed to refresh activation status:", error);
      setAlertTitle("Error");
      setAlertBody(
        "Couldn't check your subscription status. Please try again.",
      );
      setAlertVisible(true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await userService.clear();
    router.replace("/login/login");
  };

  return (
    <>
      <View style={styles.container}>
        <View
          style={[
            { alignItems: "center", justifyContent: "center", width: "100%" },
            !isMobile && { maxWidth: "50%", alignSelf: "center" },
          ]}
        >
          <View style={styles.iconContainer}>
            <Octicons name="unverified" size={64} color={AppColors.secondary} />
          </View>

          <Text style={styles.title}>Your subscription has expired</Text>
          <Text style={styles.subtitle}>
            Please contact SSH Group to renew your plan and continue using the
            app.
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              {
                width: isMobile ? "60%" : "60%",
                marginBottom: 10,
              },
              refreshing && styles.buttonDisabled,
            ]}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={AppColors.background2} />
            ) : (
              <Feather
                name="refresh-ccw"
                size={20}
                color={AppColors.background2}
              />
            )}
            <Text style={styles.buttonText}>
              {refreshing ? "Checking..." : "Refresh"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                width: isMobile ? "60%" : "60%",
                backgroundColor: AppColors.background2,
                borderWidth: 1.5,
                borderColor: AppColors.red,
              },
            ]}
            onPress={handleLogout}
            disabled={refreshing}
          >
            <AntDesign name="logout" size={20} color={AppColors.red} />
            <Text style={[styles.buttonText, { color: AppColors.red }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderAlertModal({
        isMobile: isMobile,
        alertModalVisible: alertVisible,
        setAlertModalVisible: setAlertVisible,
        title: alertTitle,
        bodyTxt: alertBody,
        onPress: () => setAlertVisible(false),
      })}
    </>
  );
};

export default NonActivation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background2,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    padding: 20,
    borderRadius: 50,
    backgroundColor: AppColors.background,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
  },
  button: {
    backgroundColor: AppColors.secondary,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: AppColors.background2,
    fontWeight: "600",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
