import type { SubscriptionInfo } from "@/features/subscription/_types/subscription.types";
import type { Ionicons } from "@expo/vector-icons";

export interface NonSubscriptionAlertConfig {
  visible: boolean;
  title: string;
  message: string;
  onPress?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap | null;
  hideCancel?: boolean;
}

export interface NonSubscriptionHeaderProps {
  title?: string;
  subtitle?: string;
}

export interface NonSubscriptionDetailsCardProps {
  companyId: string;
  staffName: string;
  subInfo: SubscriptionInfo | null;
}

export interface NonSubscriptionActionsProps {
  checking: boolean;
  onCheckAgain: () => void;
  onContactSupport: () => void;
  onLogout: () => void;
}
