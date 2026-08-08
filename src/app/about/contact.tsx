import AppbarBack from "@/components/appbar/appbarback";
import { AppColors } from "@/constants/appcolors";
import { AppFonts } from "@/constants/appfonts";
import { useResponsive } from "@/hooks/useResponsive";
import {
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/SSHGROUP168",
  youtube: "https://www.youtube.com/@SSH-GROUP",
  tiktok: "https://www.tiktok.com/@ssh3group",
  telegram: "https://t.me/ssh_T01",
  website: "https://www.sshgroups.com",
  line: "https://line.me/ti/p/dp-pR3kCIL",
  whatsapp: "https://wa.me/qr/DQYXDOX6CRWZO1",
};

async function openLink(url: string) {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.warn("Cannot open URL:", url);
  }
}

export default function Contact() {
  const { isMobile } = useResponsive();

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.background2 }}>
        <AppbarBack Title="Contact" />
        <View style={styles.containar}>
          <Text style={styles.txtHeader}>
            Wellcome to official platform of SSH GROUP :
          </Text>
          <View style={[styles.conBody, !isMobile && styles.conBodyGrid]}>
            {/* FACEBOOK */}
            <TouchableHighlight
              onPress={() => openLink(SOCIAL_LINKS.facebook)}
              style={[styles.btn, !isMobile && styles.btnGrid]}
            >
              <View style={[styles.conBoxRow, { backgroundColor: "#1877F2" }]}>
                <View style={styles.icon_txt}>
                  <Ionicons
                    name="logo-facebook"
                    size={24}
                    color={AppColors.background2}
                  />
                  <Text style={styles.txt}>FACEBOOK</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={AppColors.background2}
                />
              </View>
            </TouchableHighlight>

            {/* YOUTUBE */}
            <TouchableHighlight
              onPress={() => openLink(SOCIAL_LINKS.youtube)}
              style={[styles.btn, !isMobile && styles.btnGrid]}
            >
              <View style={[styles.conBoxRow, { backgroundColor: "#FF0000" }]}>
                <View style={styles.icon_txt}>
                  <Ionicons
                    name="logo-youtube"
                    size={24}
                    color={AppColors.background2}
                  />
                  <Text style={styles.txt}>YOUTUBE</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={AppColors.background2}
                />
              </View>
            </TouchableHighlight>

            {/* TIKTOK */}
            <TouchableHighlight
              onPress={() => openLink(SOCIAL_LINKS.tiktok)}
              style={[styles.btn, !isMobile && styles.btnGrid]}
            >
              <View style={[styles.conBoxRow, { backgroundColor: "#010101" }]}>
                <View style={styles.icon_txt}>
                  <Ionicons
                    name="logo-tiktok"
                    size={24}
                    color={AppColors.background2}
                  />
                  <Text style={styles.txt}>TIKTOK</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={AppColors.background2}
                />
              </View>
            </TouchableHighlight>

            {/* TELEGRAM */}
            <TouchableHighlight
              onPress={() => openLink(SOCIAL_LINKS.telegram)}
              style={[styles.btn, !isMobile && styles.btnGrid]}
            >
              <View style={[styles.conBoxRow, { backgroundColor: "#0088cc" }]}>
                <View style={styles.icon_txt}>
                  <MaterialIcons
                    name="telegram"
                    size={24}
                    color={AppColors.background2}
                  />
                  <Text style={styles.txt}>TELEGRAM</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={AppColors.background2}
                />
              </View>
            </TouchableHighlight>

            {/* WEBSITE */}
            <TouchableHighlight
              onPress={() => openLink(SOCIAL_LINKS.website)}
              style={[styles.btn, !isMobile && styles.btnGrid]}
            >
              <View
                style={[
                  styles.conBoxRow,
                  {
                    // backgroundColor: "#6A0DAD"
                    backgroundColor: AppColors.secondary,
                  },
                ]}
              >
                <View style={styles.icon_txt}>
                  <MaterialCommunityIcons
                    name="web"
                    size={24}
                    color={AppColors.background2}
                  />
                  <Text style={styles.txt}>WEBSITE</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={AppColors.background2}
                />
              </View>
            </TouchableHighlight>

            {/* LINE */}
            <TouchableHighlight
              onPress={() => openLink(SOCIAL_LINKS.line)}
              style={[styles.btn, !isMobile && styles.btnGrid]}
            >
              <View style={[styles.conBoxRow, { backgroundColor: "#06C755" }]}>
                <View style={styles.icon_txt}>
                  <Fontisto
                    name="line"
                    size={23}
                    color={AppColors.background2}
                  />
                  <Text style={styles.txt}>LINE</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={AppColors.background2}
                />
              </View>
            </TouchableHighlight>

            {/* WHATSAPP */}
            <TouchableHighlight
              onPress={() => openLink(SOCIAL_LINKS.whatsapp)}
              style={[styles.btn, !isMobile && styles.btnGrid]}
            >
              <View style={[styles.conBoxRow, { backgroundColor: "#25D366" }]}>
                <View style={styles.icon_txt}>
                  <Ionicons
                    name="logo-whatsapp"
                    size={24}
                    color={AppColors.background2}
                  />
                  <Text style={styles.txt}>WHATSAPP</Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color={AppColors.background2}
                />
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  containar: {
    flex: 1,
    backgroundColor: AppColors.background,
    padding: 20,
  },
  txtHeader: {
    textAlign: "center",
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
  btnGrid: {
    width: "48%",
    marginBottom: 0,
  },
  btn: {
    marginBottom: 10,
    borderRadius: 15,
  },
  conBoxRow: {
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderRadius: 15,
  },
  icon_txt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  txt: {
    color: AppColors.background2,
    fontWeight: "bold",
    fontFamily: AppFonts.bold,
    includeFontPadding: false,
  },
});
