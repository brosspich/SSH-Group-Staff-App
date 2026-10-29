import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppbarBack({
  Title,
  fallbackRoute = "/",
}: {
  Title: string;
  fallbackRoute?: string;
}) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as any);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.appBar, { height: 70 + insets.top }]}>
      {/* <View style={styles.side}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.appBarIcons,
            {
              backgroundColor: pressed
                ? `${AppColors.grey}33`
                : AppColors.transparent,
            },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={AppColors.background2} />
        </Pressable>
      </View> */}

      <View style={[styles.side, { marginBottom: 18, marginRight: 10 }]}>
        {/* <AppleGlassBackButton onPress={() => navigation?.goBack()} /> */}
        {/* <Pressable
          onPress={() => navigation?.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={({ pressed }) => [
            styles.outerContainer,
            pressed && styles.pressed,
          ]}
        >
          <BlurView
            mode="backdrop"
            intensity={25}
            tint="light"
            style={[styles.blurFill]}
          >
            <View style={styles.iconShift}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={AppColors.background2}
              />
            </View>
          </BlurView>
        </Pressable> */}
        <TouchableOpacity
          style={styles.appBarBackBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.3}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={AppColors.background2}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.appBarTitle} numberOfLines={1}>
        {Title}
      </Text>

      <View style={styles.side} />

      <View style={styles.bgAppBar}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // height: 60 + (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0),
    // height: 60,
    backgroundColor: AppColors.secondary,
    // borderBottomWidth: 1,
    // borderBottomColor: "#e0e0e0",
    // paddingBottom: 25,
  },

  side: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  appBarBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },

  appBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.background2,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
    paddingBottom: 25,
  },

  appBarIcons: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 18,
  },

  bgAppBar: {
    backgroundColor: AppColors.background,
    height: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },

  outerContainer: {
    overflow: "hidden",
    // Apple ultra-thin perimeter highlight
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
    // Subtle float elevation / shadow
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.12,
    // shadowRadius: 10,
    // elevation: 10,
    width: 43,
    height: 43,
    borderRadius: 100,
  },
  blurFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lightOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  darkOverlay: {
    backgroundColor: "rgba(30, 30, 30, 0.45)",
  },
  iconShift: {
    // Left-shift by 1-2px so the chevron optically centers inside the circle
    transform: [{ translateX: -1 }],
  },
  pressed: {
    // opacity: 0.5,
    transform: [{ scale: 0.94 }],
    backgroundColor: "rgb(2, 2, 2)",
  },
});
