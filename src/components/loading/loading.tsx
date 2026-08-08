import { AppImages } from "@/constants/appImages";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Image, StyleSheet, Text, View } from "react-native";
import { Bounce } from "react-native-animated-spinkit";

export default function Loading() {
  return (
    <View style={styles.centered}>
      {/* <ActivityIndicator size="large" color={AppColors.secondary} /> */}
      <View style={styles.loading}>
        <Bounce size={70} color={AppColors.grey} />

        <View
          style={{
            width: 51,
            height: 51,
            backgroundColor: AppColors.background2,
            position: "absolute",
            alignItems: "center",
            borderRadius: 100,
            // borderColor: AppColors.background2,
            // borderWidth: 1,
          }}
        ></View>
        <Image source={AppImages.logoGrey} style={styles.logoGrey} />
      </View>
      <Text
        style={{
          color: AppColors.textSecondary,
          fontFamily: AppFonts.regular,
          includeFontPadding: false,
        }}
      >
        Loading...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.background,
    gap: 12,
    padding: 24,
  },

  loading: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.background,
  },

  logoGrey: {
    width: 45,
    height: 45,
    position: "absolute",
    alignItems: "center",
    // top: 0,
    // left: 0,
    backgroundColor: AppColors.background2,
    borderRadius: 100,
  },
});
