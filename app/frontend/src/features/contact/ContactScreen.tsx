import AppbarBack from "@/shared/components/appbar/appbarback";
import { AppColors } from "@/constants/appcolors";
import { useResponsive } from "@/hooks/useResponsive";
import { StyleSheet, Text, View } from "react-native";
import { ContactItemButton } from "./_components/ContactItemButton";
import { openSocialLink, SOCIAL_PLATFORMS } from "./_utils/contactConstants";

export default function ContactScreen() {
  const { isMobile } = useResponsive();

  return (
    <View style={styles.container}>
      <AppbarBack Title="Contact" />
      <View style={styles.content}>
        <Text style={styles.txtHeader}>
          Welcome to the official platform of SSH GROUP:
        </Text>
        <View style={[styles.conBody, !isMobile && styles.conBodyGrid]}>
          {SOCIAL_PLATFORMS.map((platform) => (
            <ContactItemButton
              key={platform.id}
              platform={platform}
              onPress={() => openSocialLink(platform.url)}
              isGrid={!isMobile}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  txtHeader: {
    textAlign: "center",
    color: AppColors.textPrimary,
  },
  conBody: {
    flex: 1,
    marginTop: 20,
  },
  conBodyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
