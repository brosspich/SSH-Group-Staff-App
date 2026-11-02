import { apiClient } from "@/services/api";
import { AuditFilterParams, AuditLog } from "../types/audit.types";

export const auditApi = {
  async getAuditLogs(params?: AuditFilterParams): Promise<AuditLog[]> {
    return await apiClient.get<AuditLog[]>("/audit-logs", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  async getAuditLogById(id: string): Promise<AuditLog> {
    return await apiClient.get<AuditLog>(`/audit-logs/${id}`);
  },
};
