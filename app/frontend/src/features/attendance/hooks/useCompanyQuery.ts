import {
  fetchAvailableCompanySystems,
  fetchOfficialAttendanceConfig,
} from "@/constants/attendanceConfig";
import { queryKeys } from "@/shared/services/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useCompanyStore } from "../store/useCompanyStore";

/**
 * TanStack Query Hook: Server data caching for Company Attendance Configuration
 */
export function useCompanyConfigQuery(systemId?: string) {
  const setConfig = useCompanyStore((state) => state.setConfig);

  const query = useQuery({
    queryKey: queryKeys.company.config(systemId),
    queryFn: () => fetchOfficialAttendanceConfig(false, systemId),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh in cache
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
  });

  useEffect(() => {
    if (query.data) {
      setConfig(query.data);
    }
  }, [query.data, setConfig]);

  return query;
}

/**
 * TanStack Query Hook: Server data caching for Available Company Systems
 */
export function useAvailableCompanySystemsQuery() {
  const setAvailableSystems = useCompanyStore(
    (state) => state.setAvailableSystems,
  );

  const query = useQuery({
    queryKey: queryKeys.company.list(),
    queryFn: () => fetchAvailableCompanySystems(),
    staleTime: 1000 * 60 * 10, // 10 minutes fresh
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (query.data) {
      setAvailableSystems(query.data);
    }
  }, [query.data, setAvailableSystems]);

  return query;
}
