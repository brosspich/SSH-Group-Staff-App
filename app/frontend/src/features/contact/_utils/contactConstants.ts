import type { SocialPlatformBackend } from "@/features/system-config";
import {
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Linking } from "react-native";
import type { SocialPlatformItem } from "../_types/contact.types";

const ICON_FAMILY_MAP: Record<string, any> = {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  Fontisto,
};

/**
 * Transforms dynamic social platforms returned by the backend into renderable UI items
 */
export function resolveSocialPlatforms(
  backendPlatforms?: SocialPlatformBackend[],
): SocialPlatformItem[] {
  if (!backendPlatforms || backendPlatforms.length === 0) return [];

  return backendPlatforms.map((platform) => ({
    id: platform.id,
    name: platform.name,
    url: platform.url,
    backgroundColor: platform.backgroundColor,
    iconComponent: ICON_FAMILY_MAP[platform.iconFamily] || Ionicons,
    iconName: platform.iconName,
    iconSize: platform.iconSize ?? 24,
  }));
}

/**
 * Open external URL safely
 */
export async function openSocialLink(url: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.warn("[contactConstants] Cannot open URL:", url);
    }
  } catch (err) {
    console.warn("[contactConstants] Error opening URL:", url, err);
  }
}
