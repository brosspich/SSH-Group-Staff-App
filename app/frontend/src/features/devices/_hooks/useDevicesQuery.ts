import { queryKeys } from "@/shared/services/api/queryKeys";
import { fetchUserDeviceSessions } from "@/utils/deviceSession";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDevicesStore } from "../_store/useDevicesStore";

export function useDevicesQuery(userId?: string) {
  const setDevices = useDevicesStore((state) => state.setDevices);
  const setError = useDevicesStore((state) => state.setError);

  const query = useQuery({
    queryKey: queryKeys.devices.list(userId),
    queryFn: async () => {
      if (!userId) return [];
      const list = await fetchUserDeviceSessions(userId);
      return list || [];
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2, // 2 minutes fresh cache
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  useEffect(() => {
    if (query.data) {
      setDevices(query.data);
    } else if (query.error) {
      setError(
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch devices",
      );
    }
  }, [query.data, query.error, setDevices, setError]);

  return query;
}
