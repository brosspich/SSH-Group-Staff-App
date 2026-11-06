import { theme } from "@/shared/styles/theme";
import React from "react";
import {
  Pressable,
  Modal as RNModal,
  ModalProps as RNModalProps,
  StyleSheet,
  ViewStyle,
} from "react-native";

export interface AppModalProps extends RNModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

export const Modal: React.FC<AppModalProps> = ({
  isVisible,
  onClose,
  children,
  contentStyle,
  ...rest
}) => {
  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...rest}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.content, contentStyle]}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    width: "100%",
    maxWidth: 480,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
