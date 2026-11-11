export type SshPermissionLevel = "admin" | "write" | "read";

export interface SshGroupMember {
  userId: string;
  username: string;
  role: string;
  joinedAt: string;
}

export interface SshGroup {
  id: string;
  name: string;
  description?: string;
  serverCount: number;
  members: SshGroupMember[];
  permissions: SshPermissionLevel[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
  permissions?: SshPermissionLevel[];
}

export interface UpdateGroupDTO {
  name?: string;
  description?: string;
  permissions?: SshPermissionLevel[];
}
