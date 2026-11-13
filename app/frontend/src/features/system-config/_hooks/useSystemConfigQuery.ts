import { queryKeys } from "@/shared/services/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchSystemConfig } from "../_api/systemConfigApi";
import { useSystemConfigStore } from "../_store/useSystemConfigStore";
import type { SystemConfig } from "../_types/systemConfig.types";

/**
 * TanStack Query Hook: Fetches and caches dynamic backend configuration & links
 */
export function useSystemConfigQuery(force: boolean = false) {
  const setConfig = useSystemConfigStore((state) => state.setConfig);
  const setError = useSystemConfigStore((state) => state.setError);
  const cachedConfig = useSystemConfigStore((state) => state.config);

  const query = useQuery<SystemConfig>({
    queryKey: queryKeys.systemConfig.all,
    queryFn: () => fetchSystemConfig(force),
    staleTime: 1000 * 60 * 10, // 10 minutes fresh cache
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
    initialData: cachedConfig,
  });

  useEffect(() => {
    if (query.data) {
      setConfig(query.data);
    } else if (query.error) {
      setError(
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch system configuration",
      );
    }
  }, [query.data, query.error, setConfig, setError]);

  return {
    ...query,
    config: query.data || cachedConfig,
    supportLinks: (query.data || cachedConfig).support,
    socialLinks: (query.data || cachedConfig).social,
    socialPlatforms: (query.data || cachedConfig).socialPlatforms || [],
    appMeta: (query.data || cachedConfig).app,
  };
}
