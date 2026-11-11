export interface ServerGroupModel {
  id: string;
  name: string;
  description: string | null;
  serverCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServerGroupDTO {
  name: string;
  description?: string;
  serverCount?: number;
}

export interface UpdateServerGroupDTO {
  name?: string;
  description?: string;
  serverCount?: number;
}
