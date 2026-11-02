import { logger } from "@/services/logger";
import { useCallback, useEffect, useState } from "react";
import { auditApi } from "../api/auditApi";
import { AuditFilterParams, AuditLog } from "../types/audit.types";

export function useAuditLogs(initialParams?: AuditFilterParams) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterParams, setFilterParams] = useState<
    AuditFilterParams | undefined
  >(initialParams);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditApi.getAuditLogs(filterParams);
      setLogs(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch audit logs");
      logger.error("Failed to load audit logs", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    filterParams,
    setFilterParams,
    refresh: fetchLogs,
  };
}
