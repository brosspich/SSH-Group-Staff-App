import { apiClient } from "@/shared/services/api";
import {
  DEFAULT_SYSTEM_CONFIG,
  type SystemConfig,
} from "../_types/systemConfig.types";

/**
 * Fetch dynamic system links and configuration from backend
 */
export async function fetchSystemConfig(
  force: boolean = false,
): Promise<SystemConfig> {
  try {
    const query = force ? "?force=true" : "";
    const res = await apiClient.get<any>(`/system-config${query}`, {
      timeout: 8000,
    });
    if (!res) return DEFAULT_SYSTEM_CONFIG;
    if (res.data && res.data.support) return res.data;
    if (res.support) return res;
    return DEFAULT_SYSTEM_CONFIG;
  } catch (err) {
    console.warn(
      "[systemConfigApi] Fetch system config warning (using defaults):",
      err,
    );
    return DEFAULT_SYSTEM_CONFIG;
  }
}

/**
 * Update dynamic system configuration (Admin / Owner)
 */
export async function updateSystemConfigApi(
  payload: Partial<SystemConfig>,
): Promise<boolean> {
  try {
    const res = await apiClient.put<any>("/system-config", payload, {
      timeout: 10000,
    });
    return res?.success !== false;
  } catch (err) {
    console.error("[systemConfigApi] Update system config error:", err);
    throw err;
  }
}
