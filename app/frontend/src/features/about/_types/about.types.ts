import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export interface CoreValueItem {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  desc: string;
  color: string;
}
