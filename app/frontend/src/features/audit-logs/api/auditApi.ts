import { apiClient } from "@/services/api";
import { AuditFilterParams, AuditLog } from "../types/audit.types";

export const auditApi = {
  async getAuditLogs(params?: AuditFilterParams): Promise<AuditLog[]> {
    const res = await apiClient.get<any>("/audit-logs", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getAuditLogById(id: string): Promise<AuditLog> {
    const res = await apiClient.get<any>(`/audit-logs/${id}`);
    return res?.data ?? res;
  },
};
