import { logger } from "@/services/logger";
import { useCallback, useEffect } from "react";
import { keyApi } from "../api/keyApi";
import { useKeyStore } from "../store/useKeyStore";
import { UploadKeyDTO } from "../types/key.types";

export function useKeyManager() {
  const keys = useKeyStore((state) => state.keys);
  const isLoading = useKeyStore((state) => state.isLoading);
  const error = useKeyStore((state) => state.error);

  const setKeys = useKeyStore((state) => state.setKeys);
  const addKey = useKeyStore((state) => state.addKey);
  const removeKey = useKeyStore((state) => state.removeKey);
  const setLoading = useKeyStore((state) => state.setLoading);
  const setError = useKeyStore((state) => state.setError);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await keyApi.getKeys();
      setKeys(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch SSH keys");
      logger.error("Failed to load keys", err);
    }
  }, [setLoading, setError, setKeys]);

  const uploadKey = useCallback(
    async (dto: UploadKeyDTO) => {
      try {
        const newKey = await keyApi.uploadKey(dto);
        addKey(newKey);
        return newKey;
      } catch (err: any) {
        logger.error("Failed to upload SSH key", err);
        throw err;
      }
    },
    [addKey],
  );

  const deleteKey = useCallback(
    async (id: string) => {
      try {
        await keyApi.deleteKey(id);
        removeKey(id);
      } catch (err: any) {
        logger.error("Failed to delete SSH key", err);
        throw err;
      }
    },
    [removeKey],
  );

  useEffect(() => {
    if (keys.length === 0) {
      fetchKeys();
    }
  }, [fetchKeys, keys.length]);

  return {
    keys,
    isLoading,
    error,
    refresh: fetchKeys,
    uploadKey,
    deleteKey,
  };
}
