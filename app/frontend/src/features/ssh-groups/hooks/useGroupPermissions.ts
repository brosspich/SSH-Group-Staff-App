import { useMemo } from "react";
import { SshGroup, SshPermissionLevel } from "../types/sshGroup.types";

export function useGroupPermissions(group?: SshGroup | null) {
  const hasAdmin = useMemo(() => {
    return group?.permissions.includes("admin") ?? false;
  }, [group]);

  const hasWrite = useMemo(() => {
    return hasAdmin || (group?.permissions.includes("write") ?? false);
  }, [group, hasAdmin]);

  const hasRead = useMemo(() => {
    return hasWrite || (group?.permissions.includes("read") ?? false);
  }, [group, hasWrite]);

  const canPerformAction = (required: SshPermissionLevel) => {
    if (required === "admin") return hasAdmin;
    if (required === "write") return hasWrite;
    return hasRead;
  };

  return {
    hasAdmin,
    hasWrite,
    hasRead,
    canPerformAction,
  };
}
