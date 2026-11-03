import type { InactivePeriod } from "../_types/devices.types";

export const INACTIVE_PERIOD_STORAGE_KEY = "@pos_inactive_terminate_period";

export const INACTIVE_PERIODS: InactivePeriod[] = [
  "1 day",
  "1 week",
  "3 months",
  "6 months",
  "1 year",
];
