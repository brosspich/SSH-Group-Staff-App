import { useLanguage } from "@/features/language";
import { ModalFooterButtons } from "@/shared/components/button/ModalFooterButtons";
import { theme } from "@/shared/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  hideCancel?: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  alertModalVisible,
  setAlertModalVisible,
  title,
  bodyTxt,
  onPress,
  isMobile = false,
  cancelText,
  okText,
  iconName = "checkmark-circle-outline",
  hideCancel = false,
}) => {
  const { t } = useLanguage();
  const resolvedCancelText = cancelText ?? t("common.cancel");
  const resolvedOkText = okText ?? t("common.ok");

  return (
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

          {hideCancel ? (
            <TouchableOpacity
              style={styles.singleOkBtn}
              onPress={() => {
                setAlertModalVisible(false);
                if (onPress) onPress();
              }}
              activeOpacity={0.85}
            >
              {iconName && (
                <Ionicons
                  name={iconName}
                  size={18}
                  color={theme.colors.background2}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text style={styles.singleOkBtnText}>{resolvedOkText}</Text>
            </TouchableOpacity>
          ) : (
            <ModalFooterButtons
              onClose={() => setAlertModalVisible(false)}
              onSubmit={() => {
                setAlertModalVisible(false);
                if (onPress) onPress();
              }}
              closeText={resolvedCancelText}
              submitText={resolvedOkText}
              iconName={iconName}
              noBorderTop
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export const renderAlertModal = (props: AlertModalProps) => (
  <AlertModal {...props} />
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
    fontSize: theme.fontSizes.md,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  singleOkBtn: {
    width: "100%",
    height: 44,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  singleOkBtnText: {
    color: theme.colors.background2,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
});
