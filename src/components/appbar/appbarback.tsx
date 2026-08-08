import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

  return (
    <View style={styles.appBar}>
      <View style={styles.side}>
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
          <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
        </Pressable>
      </View>

      <Text style={styles.appBarTitle} numberOfLines={1}>
        {Title}
      </Text>

      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    // height: 60 + (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0),
    height: 60,
    backgroundColor: AppColors.background2,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  side: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  appBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },

  appBarIcons: {
    padding: 8,
    borderRadius: 10,
  },
});
