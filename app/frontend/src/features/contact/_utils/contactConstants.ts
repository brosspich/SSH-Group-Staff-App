import { theme } from "@/shared/styles/theme";
import {
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Linking } from "react-native";
import type { SocialPlatformItem } from "../_types/contact.types";

export const SOCIAL_PLATFORMS: SocialPlatformItem[] = [
  {
    id: "facebook",
    name: "FACEBOOK",
    url: "https://www.facebook.com/SSHGROUP168",
    backgroundColor: "#1877F2",
    iconComponent: Ionicons,
    iconName: "logo-facebook",
    iconSize: 24,
  },
  {
    id: "youtube",
    name: "YOUTUBE",
    url: "https://www.youtube.com/@SSH-GROUP",
    backgroundColor: "#FF0000",
    iconComponent: Ionicons,
    iconName: "logo-youtube",
    iconSize: 24,
  },
  {
    id: "tiktok",
    name: "TIKTOK",
    url: "https://www.tiktok.com/@ssh3group",
    backgroundColor: "#010101",
    iconComponent: Ionicons,
    iconName: "logo-tiktok",
    iconSize: 24,
  },
  {
    id: "telegram",
    name: "TELEGRAM",
    url: "https://t.me/ssh_T01",
    backgroundColor: "#0088cc",
    iconComponent: MaterialIcons,
    iconName: "telegram",
    iconSize: 24,
  },
  {
    id: "website",
    name: "WEBSITE",
    url: "https://www.sshgroups.com",
    backgroundColor: theme.colors.secondary,
    iconComponent: MaterialCommunityIcons,
    iconName: "web",
    iconSize: 24,
  },
  {
    id: "line",
    name: "LINE",
    url: "https://line.me/ti/p/dp-pR3kCIL",
    backgroundColor: "#06C755",
    iconComponent: Fontisto,
    iconName: "line",
    iconSize: 23,
  },
  {
    id: "whatsapp",
    name: "WHATSAPP",
    url: "https://wa.me/qr/DQYXDOX6CRWZO1",
    backgroundColor: "#25D366",
    iconComponent: Ionicons,
    iconName: "logo-whatsapp",
    iconSize: 24,
  },
];

export async function openSocialLink(url: string): Promise<void> {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.warn("Cannot open URL:", url);
  }
}
