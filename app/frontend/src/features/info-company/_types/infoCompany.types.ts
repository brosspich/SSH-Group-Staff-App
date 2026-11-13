export interface CompanyInfo {
  id: string; // e.g. "system-0001"
  name: string;
  companyName?: string;
  company_name?: string;
  qrCodes: string[];
  qrCode?: string[];
  location: string[];
  locationLinks?: string[];
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  telegramBotToken?: string | string[];
  telegram_bot_token?: string | string[];
  telegramChatId?: string | string[];
  telegram_chat_id?: string | string[];
  timeIn?: string;
  timeOut?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCompanyPayload {
  name: string;
  qrCodes: string[];
  location: string[];
  telegramBotToken: string[];
  telegramChatId: string[];
  timeIn: string;
  timeOut: string;
}
