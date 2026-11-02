import { apiClient } from "@/services/api";
import {
  CreateGroupDTO,
  SshGroup,
  UpdateGroupDTO,
} from "../types/sshGroup.types";

export const sshGroupApi = {
  async getGroups(): Promise<SshGroup[]> {
    return await apiClient.get<SshGroup[]>("/ssh-groups");
  },

  async getGroupById(id: string): Promise<SshGroup> {
    return await apiClient.get<SshGroup>(`/ssh-groups/${id}`);
  },

  async createGroup(data: CreateGroupDTO): Promise<SshGroup> {
    return await apiClient.post<SshGroup>("/ssh-groups", data);
  },

  async updateGroup(id: string, data: UpdateGroupDTO): Promise<SshGroup> {
    return await apiClient.put<SshGroup>(`/ssh-groups/${id}`, data);
  },

  async deleteGroup(id: string): Promise<void> {
    await apiClient.delete(`/ssh-groups/${id}`);
  },
};
