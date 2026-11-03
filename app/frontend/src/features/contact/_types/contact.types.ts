import type { ComponentType } from "react";

export interface SocialPlatformItem {
  id: string;
  name: string;
  url: string;
  backgroundColor: string;
  iconComponent: ComponentType<any>;
  iconName: string;
  iconSize?: number;
}
