import { apiClient } from "@/shared/services/api";

export interface CompanyRecord {
  id: string;
  name: string;
  companyName: string;
  company_name: string;
  qrCodes?: string[];
  qrCode?: string[];
  "qr-code"?: string[];
  location?: string[];
  locationLinks?: string[];
  location_links?: string[];
  telegramBotToken?: string;
  telegram_bot_token?: string;
  telegramChatId?: string;
  telegram_chat_id?: string;
  timeIn?: string;
  "time-in"?: string;
  timeOut?: string;
  "time-out"?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const companyApi = {
  /**
   * Fetch all companies or a single company by systemId via Backend API
   */
  async getCompanies(systemId?: string): Promise<CompanyRecord[]> {
    return await apiClient.get<CompanyRecord[]>("/company-query", {
      params: systemId ? { id: systemId } : undefined,
    });
  },

  /**
   * Fetch a single company by ID via Backend API
   */
  async getCompanyById(id: string): Promise<CompanyRecord> {
    return await apiClient.get<CompanyRecord>(`/company-query/${id}`);
  },
};
