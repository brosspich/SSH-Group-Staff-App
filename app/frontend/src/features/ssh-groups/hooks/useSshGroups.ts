import { logger } from "@/services/logger";
import { useCallback, useEffect } from "react";
import { sshGroupApi } from "../api/sshGroupApi";
import { useSshGroupStore } from "../store/useSshGroupStore";
import { CreateGroupDTO } from "../types/sshGroup.types";

export function useSshGroups() {
  const groups = useSshGroupStore((state) => state.groups);
  const activeGroupId = useSshGroupStore((state) => state.activeGroupId);
  const isLoading = useSshGroupStore((state) => state.isLoading);
  const error = useSshGroupStore((state) => state.error);

  const setGroups = useSshGroupStore((state) => state.setGroups);
  const setActiveGroupId = useSshGroupStore((state) => state.setActiveGroupId);
  const addGroup = useSshGroupStore((state) => state.addGroup);
  const setLoading = useSshGroupStore((state) => state.setLoading);
  const setError = useSshGroupStore((state) => state.setError);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sshGroupApi.getGroups();
      setGroups(data);
    } catch (err: any) {
      const msg = err?.message || "Failed to fetch SSH groups";
      setError(msg);
      logger.error("Failed to load SSH groups", err);
    }
  }, [setLoading, setError, setGroups]);

  const createGroup = useCallback(
    async (dto: CreateGroupDTO) => {
      try {
        const newGroup = await sshGroupApi.createGroup(dto);
        addGroup(newGroup);
        return newGroup;
      } catch (err: any) {
        logger.error("Failed to create SSH group", err);
        throw err;
      }
    },
    [addGroup],
  );

  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups();
    }
  }, [fetchGroups, groups.length]);

  return {
    groups,
    activeGroupId,
    setActiveGroupId,
    isLoading,
    error,
    refresh: fetchGroups,
    createGroup,
  };
}
