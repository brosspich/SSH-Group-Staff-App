import { apiClient } from "@/shared/services/api";
import type {
  CompanyInfo,
  UpdateCompanyPayload,
} from "../_types/infoCompany.types";

export async function fetchCompanyByIdApi(
  companyId: string,
): Promise<CompanyInfo | null> {
  try {
    const data = await apiClient.get<CompanyInfo>(
      `/company-query/${companyId}`,
    );
    return data || null;
  } catch (err) {
    console.warn(`[infoCompanyApi] Failed to fetch company ${companyId}:`, err);
    return null;
  }
}

export async function fetchAllCompaniesApi(): Promise<CompanyInfo[]> {
  try {
    const res = await apiClient.get<any>("/company-query");
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  } catch (err) {
    console.warn("[infoCompanyApi] Failed to fetch all companies:", err);
    return [];
  }
}

export async function updateCompanyApi(
  companyId: string,
  payload: UpdateCompanyPayload,
): Promise<CompanyInfo> {
  const data = await apiClient.put<any>(`/company-query/${companyId}`, payload);
  if (data && data.data) return data.data;
  return data;
}
