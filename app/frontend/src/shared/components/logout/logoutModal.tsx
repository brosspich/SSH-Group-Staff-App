import { theme } from "@/shared/styles/theme";
import { useUserStore } from "@/shared/contexts/UserContext";
import { useAuthStore } from "@/features/auth";
import { useLoginStore } from "@/features/login/_store/useLoginStore";
import { secureStorage } from "@/shared/services/storage/secureStore.service";
import { userService } from "@/shared/services/userService";
import { queryClient } from "@/shared/services/api/queryClient";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const renderLogoutModal = ({
  logoutModalVisible,
  setLogoutModalVisible,
  isMobile = false,
}: any) => (
  <Modal
    visible={logoutModalVisible}
    animationType="fade"
    transparent
    onRequestClose={() => setLogoutModalVisible(false)}
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
        <View
          style={{
            backgroundColor: theme.colors.red,
            padding: 10,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <AntDesign name="logout" size={35} color={theme.colors.background2} />
        </View>
        <Text style={[styles.txt, { fontSize: theme.fontSizes.xl }]}>Logout</Text>
        <Text style={styles.txt}>Are you sure you want to logout?</Text>
        <View style={styles.conBtn}>
          <TouchableOpacity
            onPress={() => setLogoutModalVisible(false)}
            style={styles.btn}
          >
            <Text style={styles.txtBtn}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
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
            }}
            style={[
              styles.btn,
              { backgroundColor: theme.colors.red, borderColor: theme.colors.red },
            ]}
          >
            <AntDesign name="logout" size={18} color={theme.colors.background2} />
            <Text
              style={[
                styles.txtBtn,
                { marginLeft: 5, color: theme.colors.background2 },
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

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
    borderRadius: theme.borderRadius.md,
    alignSelf: "center",
    gap: 12,
  },
  txt: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  conBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  btn: {
    backgroundColor: theme.colors.background2,
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
  },
  txtBtn: {
    fontWeight: "bold",
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
