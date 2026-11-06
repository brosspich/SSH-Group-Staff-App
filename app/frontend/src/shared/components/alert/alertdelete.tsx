import { theme } from "@/shared/styles/theme";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const renderAlertDeleteModal = ({
  alertModalVisible,
  setAlertModalVisible,
  title,
  bodyTxt,
  deleteAction,
  isDeleting = false,
  isMobile = false,
}: any) => (
  <Modal
    visible={alertModalVisible}
    animationType="fade"
    transparent
    onRequestClose={() => setAlertModalVisible(false)}
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
        <Text style={[styles.txt, { fontSize: theme.fontSizes.xl }]}>{title}</Text>
        <Text style={styles.txt}>{bodyTxt}</Text>
        <View style={styles.conBtn}>
          <TouchableOpacity
            onPress={() => setAlertModalVisible(false)}
            style={styles.btn}
          >
            <Text style={styles.txtBtn}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await deleteAction();
            }}
            style={[
              styles.btn,
              { backgroundColor: theme.colors.red, borderColor: theme.colors.red },
            ]}
            disabled={isDeleting}
          >
            <Text style={[styles.txtBtn, { color: theme.colors.background2 }]}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  // Modal Logout
  conModalLogout: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    // paddingHorizontal: 20,
  },
  conModal: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.background2,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.xl,
    alignSelf: "center",
    gap: 16,
  },
  txt: {
    color: theme.colors.textPrimary,
    fontWeight: "bold",
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    // marginTop: 10,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  conBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    // marginTop: 15,
  },

  btn: {
    backgroundColor: theme.colors.background2,
    // width: "100%",
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
