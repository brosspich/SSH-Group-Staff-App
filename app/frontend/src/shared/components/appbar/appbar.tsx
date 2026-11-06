import { theme } from "@/shared/styles/theme";
import { AppImages } from "@/shared/constants/appImages";
import { useUser } from "@/shared/contexts/UserContext";
import { StaffUser, userService } from "@/shared/services/userService";
import { getTwoInitials } from "@/utils/formatters";
import { BlurView } from "@nguyenduy1412/react-native-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Appbar() {
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
      {/* <StatusBar
        backgroundColor={theme.colors.background}
        barStyle="dark-content"
      /> */}
      {/* <SafeAreaView> */}
      <View style={[styles.appBar, { height: 70 + insets.top }]}>
        {/* <View style={styles.appBarLogo}>
          <Image
            source={AppImages.logoSSH}
            style={{
              width: 37,
              height: 37,
            }}
          />
          <Text style={{ color: theme.colors.background2, fontSize: theme.fontSizes.xl }}>|</Text>
          <Image
            source={AppImages.logoStaffW}
            style={{
              width: 37,
              height: 37,
            }}
          />
        </View> */}

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
          <Text style={{ color: theme.colors.background2, fontSize: theme.fontSizes.xl }}>|</Text>
          <Image
            source={AppImages.logoStaffW}
            style={{
              width: 37,
              height: 37,
            }}
          />
        </BlurView>

        <View style={styles.appBarIcons}>
          {/* <Ionicons
            name="notifications"
            size={24}
            color={theme.colors.secondary}
          /> */}
          {/* <Ionicons name="person-circle-outline" size={24} color="#333" /> */}
          <TouchableOpacity onPress={() => router.push("/account/account")}>
            <LinearGradient
              colors={[theme.colors.secondary, theme.colors.primary]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              locations={[0.3, 0.9]}
              style={styles.conTxtName}
            >
              <Text style={styles.txtName}>{getTwoInitials(user?.name)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.bgAppBar}></View>
      </View>
      {/* </SafeAreaView> */}
    </>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    alignContent: "center",
    paddingHorizontal: 15,
    backgroundColor: theme.colors.secondary,
    // borderBottomWidth: 1,
    // borderBottomColor: `${theme.colors.grey}33`,
    // height: 60,
    // height: 60 + (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0),
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 20,
    // position: "absolute",
    // left: 0,
    // right: 0,
    // zIndex: 10,
  },
  appBarTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold",
    color: "#333",
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },
  appBarIcons: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: theme.borderRadius.md,
  },
  conTxtName: {
    height: 42,
    width: 42,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  txtName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "bold",
    color: theme.colors.background2,
    fontFamily: theme.fonts.bold,
    includeFontPadding: false,
  },

  appBarLogo: {
    // borderColor: theme.colors.background2,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    padding: 4,
    borderWidth: 2,
    // borderColor: "rgba(255, 255, 255, 0.45)",
    borderColor: theme.colors.grey + 70,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  bgAppBar: {
    backgroundColor: theme.colors.background,
    height: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopRightRadius: theme.borderRadius.md,
    borderTopLeftRadius: theme.borderRadius.md,
  },
});
