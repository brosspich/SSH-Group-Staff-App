export interface SupportConfig {
  telegramUrl: string;
  telegramFallbackUrl: string;
  phone: string;
  email: string;
}

export interface SocialLinksConfig {
  facebook: string;
  youtube: string;
  tiktok: string;
  telegram: string;
  website: string;
  line: string;
  location: string;
}

export interface AppConfigMeta {
  name: string;
  minVersion: string;
  latestVersion: string;
  maintenanceMode: boolean;
}

export interface SocialPlatformBackend {
  id: string;
  name: string;
  url: string;
  backgroundColor: string;
  iconFamily:
    | "Ionicons"
    | "MaterialIcons"
    | "MaterialCommunityIcons"
    | "Fontisto";
  iconName: string;
  iconSize?: number;
}

export interface SystemConfig {
  support: SupportConfig;
  social: SocialLinksConfig;
  socialPlatforms: SocialPlatformBackend[];
  app: AppConfigMeta;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  support: {
    telegramUrl: "https://t.me/sshgroup168",
    telegramFallbackUrl: "https://telegram.org",
    phone: "092696698",
    email: "support@sshgroups.com",
  },
  social: {
    facebook: "https://www.facebook.com/SSHGROUP168",
    youtube: "https://www.youtube.com/@SSH-GROUP",
    tiktok: "https://www.tiktok.com/@ssh3group",
    telegram: "https://t.me/ssh_T01",
    website: "https://www.sshgroups.com",
    line: "https://line.me/ti/p/dp-pR3kCIL",
    location: "https://maps.app.goo.gl/k9eE8y9k1YQjN9UFA",
  },
  socialPlatforms: [
    {
      id: "facebook",
      name: "FACEBOOK",
      url: "https://www.facebook.com/SSHGROUP168",
      backgroundColor: "#1877F2",
      iconFamily: "Ionicons",
      iconName: "logo-facebook",
      iconSize: 24,
    },
    {
      id: "youtube",
      name: "YOUTUBE",
      url: "https://www.youtube.com/@SSH-GROUP",
      backgroundColor: "#FF0000",
      iconFamily: "Ionicons",
      iconName: "logo-youtube",
      iconSize: 24,
    },
    {
      id: "tiktok",
      name: "TIKTOK",
      url: "https://www.tiktok.com/@ssh3group",
      backgroundColor: "#010101",
      iconFamily: "Ionicons",
      iconName: "logo-tiktok",
      iconSize: 24,
    },
    {
      id: "telegram",
      name: "TELEGRAM",
      url: "https://t.me/ssh_T01",
      backgroundColor: "#0088cc",
      iconFamily: "MaterialIcons",
      iconName: "telegram",
      iconSize: 24,
    },
    {
      id: "website",
      name: "WEBSITE",
      url: "https://www.sshgroups.com",
      backgroundColor: "#36855B",
      iconFamily: "MaterialCommunityIcons",
      iconName: "web",
      iconSize: 24,
    },
    {
      id: "line",
      name: "LINE",
      url: "https://line.me/ti/p/dp-pR3kCIL",
      backgroundColor: "#06C755",
      iconFamily: "Fontisto",
      iconName: "line",
      iconSize: 23,
    },
    {
      id: "whatsapp",
      name: "WHATSAPP",
      url: "https://wa.me/qr/DQYXDOX6CRWZO1",
      backgroundColor: "#25D366",
      iconFamily: "Ionicons",
      iconName: "logo-whatsapp",
      iconSize: 24,
    },
  ],
  app: {
    name: "SSH Group Staff",
    minVersion: "1.0.0",
    latestVersion: "1.0.1",
    maintenanceMode: false,
  },
};
