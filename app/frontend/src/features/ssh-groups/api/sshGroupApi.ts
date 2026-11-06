import { apiClient } from "@/shared/services/api";
import {
  CreateGroupDTO,
  SshGroup,
  UpdateGroupDTO,
} from "../types/sshGroup.types";

export const sshGroupApi = {
  async getGroups(): Promise<SshGroup[]> {
    const res = await apiClient.get<any>("/ssh-groups");
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getGroupById(id: string): Promise<SshGroup> {
    const res = await apiClient.get<any>(`/ssh-groups/${id}`);
    return res?.data ?? res;
  },

  async createGroup(data: CreateGroupDTO): Promise<SshGroup> {
    const res = await apiClient.post<any>("/ssh-groups", data);
    return res?.data ?? res;
  },

  async updateGroup(id: string, data: UpdateGroupDTO): Promise<SshGroup> {
    const res = await apiClient.put<any>(`/ssh-groups/${id}`, data);
    return res?.data ?? res;
  },

  async deleteGroup(id: string): Promise<void> {
    await apiClient.delete(`/ssh-groups/${id}`);
  },
};
