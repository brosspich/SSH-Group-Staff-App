import type { DeviceSession, InactivePeriod } from "@/utils/deviceSession";

export type { DeviceSession, InactivePeriod };

export interface AlertConfig {
  visible: boolean;
  title: string;
  body: string;
  type: "destructive" | "info";
  confirmText: string;
  onConfirm?: (() => Promise<void>) | null;
}
