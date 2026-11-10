import { useAuthStore } from "@/features/auth";
import { useLoginStore } from "@/features/login/_store/useLoginStore";
import { ModalFooterButtons } from "@/shared/components/button/ModalFooterButtons";
import { useUserStore } from "@/shared/contexts/UserContext";
import { queryClient } from "@/shared/services/api/queryClient";
import { secureStorage } from "@/shared/services/storage/secureStore.service";
import { userService } from "@/shared/services/userService";
import { theme } from "@/shared/styles/theme";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

export interface LogoutModalProps {
  logoutModalVisible: boolean;
  setLogoutModalVisible: (visible: boolean) => void;
  isMobile?: boolean;
}

export const renderLogoutModal = ({
  logoutModalVisible,
  setLogoutModalVisible,
  isMobile = false,
}: LogoutModalProps) => {
  return (
    <LogoutModalContent
      logoutModalVisible={logoutModalVisible}
      setLogoutModalVisible={setLogoutModalVisible}
      isMobile={isMobile}
    />
  );
};

const LogoutModalContent: React.FC<LogoutModalProps> = ({
  logoutModalVisible,
  setLogoutModalVisible,
  isMobile = false,
}) => {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await secureStorage.removeItem("auth_token").catch(() => null);
      await AsyncStorage.removeItem("ssh_remembered_username").catch(
        () => null,
      );
      queryClient.clear();
      await userService.clear();
      useUserStore.getState().clearStore();
      useAuthStore.getState().clearSession();
      useLoginStore.getState().resetForm();
      setLogoutModalVisible(false);
      router.replace("/login/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Modal
      visible={logoutModalVisible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (!loggingOut) setLogoutModalVisible(false);
      }}
      statusBarTranslucent
    >
      <View style={styles.conModalLogout}>
        <View
          style={[
            styles.conModal,
            {
              maxWidth: !isMobile ? 400 : "94%",
              width: !isMobile ? 400 : "90%",
            },
          ]}
        >
          <View style={styles.logoutIconBadge}>
            <AntDesign
              name="logout"
              size={32}
              color={theme.colors.background2}
            />
          </View>
          <Text style={[styles.txt, { fontSize: theme.fontSizes.xl }]}>
            Logout
          </Text>
          <Text style={styles.txt}>Are you sure you want to logout?</Text>

          <ModalFooterButtons
            onClose={() => setLogoutModalVisible(false)}
            onSubmit={handleLogout}
            closeText="Cancel"
            submitText={loggingOut ? "Logging out..." : "Logout"}
            submitting={loggingOut}
            variant="danger"
            iconName="log-out-outline"
            noBorderTop
          />
        </View>
      </View>
    </Modal>
  );
};

export default renderLogoutModal;

const styles = StyleSheet.create({
  conModalLogout: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  conModal: {
    backgroundColor: theme.colors.background2,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.xl,
    alignSelf: "center",
    gap: 16,
  },
  logoutIconBadge: {
    backgroundColor: theme.colors.red,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    fontWeight: "bold",
    includeFontPadding: false,
  },
});
