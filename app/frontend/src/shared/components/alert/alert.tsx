import { theme } from "@/shared/styles/theme";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AlertModalProps {
  alertModalVisible: boolean;
  setAlertModalVisible: (visible: boolean) => void;
  title: string;
  bodyTxt: string;
  onPress?: () => void;
  isMobile: boolean;
}

export const renderAlertModal = ({
  alertModalVisible,
  setAlertModalVisible,
  title,
  bodyTxt,
  onPress,
  isMobile = false,
}: AlertModalProps) => (
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
            width: !isMobile ? 400 : "90%",
          },
        ]}
      >
        <Text style={[styles.txt, { fontSize: theme.fontSizes.xl, marginTop: 0 }]}>
          {title}
        </Text>
        <Text style={styles.txt}>{bodyTxt}</Text>
        <View style={styles.conBtn}>
          <TouchableOpacity
            onPress={() => setAlertModalVisible(false)}
            style={styles.btn}
          >
            <Text style={styles.txtBtn}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setAlertModalVisible(false);
              if (onPress) onPress(); // This already handles undefined
            }}
            style={[styles.btn, { backgroundColor: theme.colors.secondary }]}
          >
            <Text style={[styles.txtBtn, { color: theme.colors.background2 }]}>
              Ok
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
    alignItems: "center", // Center the modal horizontally
    // paddingHorizontal: 20,
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
