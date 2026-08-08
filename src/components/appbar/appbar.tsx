import { AppImages } from "@/constants/appImages";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { PosAdminUser, userService } from "@/services/userService";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Appbar() {
  const [user, setUser] = useState<PosAdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.get().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const getTwoInitials = (name: any) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <>
      {/* <StatusBar
        backgroundColor={AppColors.background}
        barStyle="dark-content"
      /> */}
      {/* <SafeAreaView> */}
      <View style={styles.appBar}>
        <View style={styles.appBarLogo}>
          <Image
            source={AppImages.logoSSH}
            style={{
              width: 42,
              height: 42,
              padding: 10,
              borderRadius: 10,
              backgroundColor: AppColors.background2,
              borderColor: `${AppColors.primary}`,
              borderWidth: 1,
            }}
          />
          <Text style={{ color: AppColors.secondary }}>|</Text>
          <Image
            source={AppImages.logoPOS}
            style={{
              width: 42,
              height: 42,
              borderColor: `${AppColors.secondary}50`,
              borderWidth: 1,
              borderRadius: 10,
            }}
          />
          {/* <Image
            source={AppImages.logoPOSWeb}
            style={{
              width: 120,
              height: 42,
              // aspectRatio: 960 / 271,
              resizeMode: "contain",
            }}
          /> */}
          {/* <Image
            source={AppImages.logoTxt}
            style={{ width: 120, height: 40 }}
          /> */}
        </View>

        <View style={styles.appBarIcons}>
          {/* <Ionicons
            name="notifications"
            size={24}
            color={AppColors.secondary}
          /> */}
          {/* <Ionicons name="person-circle-outline" size={24} color="#333" /> */}
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
      {/* </SafeAreaView> */}
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
    backgroundColor: AppColors.background2,
    borderBottomWidth: 1,
    borderBottomColor: `${AppColors.grey}33`,
    height: 60,
    // height: 60 + (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0),
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
  appBarIcons: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
    // marginRight: 5,
  },
  conTxtName: {
    height: 40,
    width: 40,
    backgroundColor: AppColors.secondary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txtName: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  appBarLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
