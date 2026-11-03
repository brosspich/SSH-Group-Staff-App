import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { AppImages } from "@/constants/appImages";
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
    marginTop: 20,
  },
  imgLogo: {
    width: "100%",
    height: "100%",
  },
  conTxt: {
    marginVertical: 20,
  },
  txtApp: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: AppColors.secondary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  subTxt: {
    fontSize: 13,
    marginTop: 10,
    color: AppColors.grey,
    fontFamily: AppFonts.regular,
    includeFontPadding: false,
    textAlign: "center",
  },
});
