import { queryKeys } from "@/shared/services/api/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCompanyApi } from "../_api/infoCompanyApi";
import type {
  CompanyInfo,
  UpdateCompanyPayload,
} from "../_types/infoCompany.types";

export interface UpdateCompanyInput {
  companyId: string;
  payload: UpdateCompanyPayload;
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation<CompanyInfo, Error, UpdateCompanyInput>({
    mutationFn: ({ companyId, payload }) =>
      updateCompanyApi(companyId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.infoCompany.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.home.all,
      });
    },
  });
}
