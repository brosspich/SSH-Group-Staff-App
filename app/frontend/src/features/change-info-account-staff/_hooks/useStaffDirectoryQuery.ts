import { queryKeys } from "@/shared/services/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchStaffDirectoryApi } from "../_api/changeInfoStaffApi";
import { useStaffDirectoryStore } from "../_store/useStaffDirectoryStore";

export function useStaffDirectoryQuery() {
  const setStaffList = useStaffDirectoryStore((state) => state.setStaffList);
  const setError = useStaffDirectoryStore((state) => state.setError);

  const query = useQuery({
    queryKey: queryKeys.staff.all,
    queryFn: fetchStaffDirectoryApi,
    staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  useEffect(() => {
    if (query.data) {
      setStaffList(query.data);
    } else if (query.error) {
      setError(
        query.error instanceof Error
          ? query.error.message
          : "Failed to fetch staff directory",
      );
    }
  }, [query.data, query.error, setStaffList, setError]);

  return query;
}
