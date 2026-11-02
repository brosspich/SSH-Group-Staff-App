import { ComponentType } from "react";

export type ReportPeriod = "daily" | "weekly" | "monthly" | "annual";

export interface ReportItemConfig {
  title: string;
  route: string;
  iconName: string;
  icon: ComponentType<any>;
}

export interface ReportSectionConfig {
  title: string;
  items: ReportItemConfig[];
}
