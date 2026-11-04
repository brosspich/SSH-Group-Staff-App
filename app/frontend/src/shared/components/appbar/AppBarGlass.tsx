import { AppImages } from "@/constants/appImages";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { StaffUser, userService } from "@/services/userService";
import { getTwoInitials } from "@/utils/formatters";
import BlurView from "@nguyenduy1412/react-native-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppBarGlass() {
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.get().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  

  return (
    <>
      <View
        style={[
          styles.appBar,
          {
            height: 60 + insets.top,
            paddingTop: insets.top,
          },
        ]}
      >
        <BlurView
          mode="backdrop"
          intensity={25}
          tint="light"
          style={styles.appBarLogo}
        >
          <Image
            source={AppImages.logoSSH}
            style={{
              width: 37,
              height: 37,
            }}
          />
          <Text style={{ color: AppColors.background2, fontSize: 20 }}>|</Text>
          <Image
            source={AppImages.logoStaffW}
            style={{
              width: 37,
              height: 37,
            }}
          />
        </BlurView>

        <View style={styles.appBarIcons}>
          <TouchableOpacity onPress={() => router.push("/account/account")}>
            <LinearGradient
              colors={[AppColors.secondary, AppColors.primary]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              locations={[0.3, 0.9]}
              style={styles.conTxtName}
            >
              <Text style={styles.txtName}>{getTwoInitials(user?.name)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: "center",
    paddingHorizontal: 16,
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  appBarIcons: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
  },
  conTxtName: {
    height: 42,
    width: 42,
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txtName: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  appBarLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    padding: 4,
    borderWidth: 2,
    // borderColor: "rgba(255, 255, 255, 0.45)",
    borderColor: AppColors.grey + 70,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
});
