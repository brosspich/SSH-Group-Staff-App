import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { AntDesign } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LoginActionButtonsProps {
  onOpenPrivacy: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function LoginActionButtons({
  onOpenPrivacy,
  onSubmit,
  isLoading,
}: LoginActionButtonsProps) {
  return (
    <>
      <TouchableOpacity
        onPress={onOpenPrivacy}
        style={styles.privacyLink}
        activeOpacity={0.7}
      >
        <Text style={styles.privacyLinkText}>Privacy & Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSubmit}
        style={[styles.conBtn, isLoading && { opacity: 0.7 }]}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <View style={styles.btnContent}>
          {isLoading ? (
            <>
              <ActivityIndicator size={24} color={AppColors.background2} />
              <Text style={styles.txtBtn}>Login...</Text>
            </>
          ) : (
            <>
              <AntDesign
                name="logout"
                size={18}
                color={AppColors.background2}
              />
              <Text style={styles.txtBtn}>Login</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  privacyLink: {
    marginTop: 14,
    paddingVertical: 6,
  },
  privacyLinkText: {
    color: AppColors.secondary,
    fontSize: 13,
    textDecorationLine: "underline",
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    textAlign: "center",
  },
  conBtn: {
    height: 48,
    width: "100%",
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  txtBtn: {
    color: AppColors.background2,
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 16,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
