import { ModalFooterButtons } from "@/shared/components/button/ModalFooterButtons";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, View } from "react-native";

export interface AlertModalProps {
  alertModalVisible: boolean;
  setAlertModalVisible: (visible: boolean) => void;
  title: string;
  bodyTxt: string;
  onPress?: () => void;
  isMobile?: boolean;
  cancelText?: string;
  okText?: string;
  iconName?: keyof typeof Ionicons.glyphMap | null;
}

export const renderAlertModal = ({
  alertModalVisible,
  setAlertModalVisible,
  title,
  bodyTxt,
  onPress,
  isMobile = false,
  cancelText = "Cancel",
  okText = "Ok",
  iconName = "checkmark-circle-outline",
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
        <Text
          style={[styles.txt, { fontSize: theme.fontSizes.xl, marginTop: 0 }]}
        >
          {title}
        </Text>
        <Text style={styles.txt}>{bodyTxt}</Text>

        <ModalFooterButtons
          onClose={() => setAlertModalVisible(false)}
          onSubmit={() => {
            setAlertModalVisible(false);
            if (onPress) onPress();
          }}
          closeText={cancelText}
          submitText={okText}
          iconName={iconName}
          noBorderTop
        />
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
    borderRadius: theme.borderRadius.xl,
    alignSelf: "center",
    gap: 16,
  },
  txt: {
    color: theme.colors.textPrimary,
    fontWeight: "bold",
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
