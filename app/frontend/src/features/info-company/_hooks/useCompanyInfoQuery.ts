import { queryKeys } from "@/shared/services/api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchCompanyByIdApi } from "../_api/infoCompanyApi";
import { useCompanyInfoStore } from "../_store/useCompanyInfoStore";

export function useCompanyInfoQuery(companyId?: string) {
  const cleanId = (companyId || "").trim().toLowerCase();
  const setCompany = useCompanyInfoStore((state) => state.setCompany);
  const setError = useCompanyInfoStore((state) => state.setError);

  const query = useQuery({
    queryKey: queryKeys.infoCompany.detail(cleanId),
    queryFn: () => fetchCompanyByIdApi(cleanId),
    enabled: Boolean(cleanId),
    staleTime: 1000 * 60 * 3, // 3 minutes fresh
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
  });

  useEffect(() => {
    if (query.data) {
      setCompany(query.data);
    } else if (query.error) {
      setError(
        query.error instanceof Error
          ? query.error.message
          : "Failed to load company info",
      );
    }
  }, [query.data, query.error, setCompany, setError]);

  return query;
}
