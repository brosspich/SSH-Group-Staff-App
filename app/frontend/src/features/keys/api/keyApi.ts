import { apiClient } from "@/shared/services/api";
import { SshKey, UploadKeyDTO } from "../types/key.types";

export const keyApi = {
  async getKeys(): Promise<SshKey[]> {
    const res = await apiClient.get<any>("/keys");
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getKeyById(id: string): Promise<SshKey> {
    const res = await apiClient.get<any>(`/keys/${id}`);
    return res?.data ?? res;
  },

  async uploadKey(dto: UploadKeyDTO): Promise<SshKey> {
    const res = await apiClient.post<any>("/keys", dto);
    return res?.data ?? res;
  },

  async deleteKey(id: string): Promise<void> {
    await apiClient.delete(`/keys/${id}`);
  },
};
