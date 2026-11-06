import { theme } from "@/shared/styles/theme";
import { AppImages } from "@/shared/constants/appImages";
import { Image, StyleSheet, Text, View } from "react-native";

export default function LoginHeaderBanner() {
  return (
    <>
      <View style={styles.conLogo}>
        <Image source={AppImages.logoStaffFG} style={styles.imgLogo} />
      </View>

      <View style={styles.conTxt}>
        <Text style={styles.txtApp}>SSH Group Staff</Text>
        <Text style={styles.subTxt}>
          Please enter your username and password SSH-Group Account to login.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  conLogo: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
  },
  imgLogo: {
    width: "100%",
    height: "100%",
  },
  conTxt: {
    marginVertical: theme.spacing.lg,
  },
  txtApp: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold",
    textAlign: "center",
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  subTxt: {
    fontSize: theme.fontSizes.xs,
    marginTop: theme.spacing.sm,
    color: theme.colors.grey,
    fontFamily: theme.fonts.regular,
    includeFontPadding: false,
    textAlign: "center",
  },
});
