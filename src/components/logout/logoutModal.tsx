import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { userService } from "@/services/userService";
import { AntDesign } from "@expo/vector-icons";
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
            width: !isMobile ? 400 : "94%",
          },
        ]}
      >
        <Text style={[styles.txt, { fontSize: 20 }]}>Logout</Text>
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
              await userService.clear();
              router.replace("/login/login");
            }}
            style={[
              styles.btn,
              { backgroundColor: AppColors.red, borderColor: AppColors.red },
            ]}
          >
            <AntDesign name="logout" size={18} color={AppColors.background2} />
            <Text
              style={[
                styles.txtBtn,
                { marginLeft: 5, color: AppColors.background2 },
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
    // paddingHorizontal: 20,
  },
  conModal: {
    backgroundColor: AppColors.background2,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    alignSelf: "center",
    gap: 15,
  },
  txt: {
    color: AppColors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    fontFamily: AppFonts.bold,
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
    backgroundColor: AppColors.background2,
    // width: "100%",
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: AppColors.secondary,
  },
  txtBtn: {
    fontWeight: "bold",
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
