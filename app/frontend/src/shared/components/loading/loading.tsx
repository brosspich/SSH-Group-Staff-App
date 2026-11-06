import { AppImages } from "@/shared/constants/appImages";
import { theme } from "@/shared/styles/theme";
import { Image, StyleSheet, Text, View } from "react-native";
import { Bounce } from "react-native-animated-spinkit";

export default function Loading() {
  return (
    <View style={styles.centered}>
      {/* <ActivityIndicator size="large" color={theme.colors.secondary} /> */}
      <View style={styles.loading}>
        <Bounce size={70} color={theme.colors.grey} />

        <View
          style={{
            width: 51,
            height: 51,
            backgroundColor: theme.colors.background2,
            position: "absolute",
            alignItems: "center",
            borderRadius: 100,
            // borderColor: theme.colors.background2,
            // borderWidth: 1,
          }}
        ></View>
        <Image source={AppImages.logoGrey} style={styles.logoGrey} />
      </View>
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.regular,
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
    backgroundColor: theme.colors.background,
    gap: 12,
    padding: 24,
  },

  loading: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },

  logoGrey: {
    width: 45,
    height: 45,
    position: "absolute",
    alignItems: "center",
    // top: 0,
    // left: 0,
    backgroundColor: theme.colors.background2,
    borderRadius: 100,
  },
});
