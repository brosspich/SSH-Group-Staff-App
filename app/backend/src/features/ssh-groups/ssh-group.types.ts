export interface SshGroupModel {
  id: string;
  name: string;
  description: string | null;
  serverCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSshGroupDTO {
  name: string;
  description?: string;
  serverCount?: number;
}

export interface UpdateSshGroupDTO {
  name?: string;
  description?: string;
  serverCount?: number;
}
