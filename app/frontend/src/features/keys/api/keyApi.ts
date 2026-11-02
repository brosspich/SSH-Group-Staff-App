import { apiClient } from "@/services/api";
import { SshKey, UploadKeyDTO } from "../types/key.types";

export const keyApi = {
  async getKeys(): Promise<SshKey[]> {
    return await apiClient.get<SshKey[]>("/keys");
  },

  async getKeyById(id: string): Promise<SshKey> {
    return await apiClient.get<SshKey>(`/keys/${id}`);
  },

  async uploadKey(dto: UploadKeyDTO): Promise<SshKey> {
    return await apiClient.post<SshKey>("/keys", dto);
  },

  async deleteKey(id: string): Promise<void> {
    await apiClient.delete(`/keys/${id}`);
  },
};
