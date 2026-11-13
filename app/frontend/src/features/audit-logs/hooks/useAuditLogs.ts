import { queryKeys } from "@/shared/services/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { auditApi } from "../api/auditApi";
import { AuditFilterParams, AuditLog } from "../types/audit.types";

export function useAuditLogs(initialParams?: AuditFilterParams) {
  const [filterParams, setFilterParams] = useState<
    AuditFilterParams | undefined
  >(initialParams);

  const query = useQuery<AuditLog[]>({
    queryKey: queryKeys.auditLogs.list(filterParams as Record<string, unknown>),
    queryFn: () => auditApi.getAuditLogs(filterParams),
    staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
    gcTime: 1000 * 60 * 20, // 20 minutes garbage collection
  });

  return {
    logs: query.data || [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    filterParams,
    setFilterParams,
    refresh: query.refetch,
  };
}
