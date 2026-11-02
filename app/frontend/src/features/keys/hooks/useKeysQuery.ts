import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keyApi } from '../api/keyApi';
import { queryKeys } from '@/shared/services/api/queryKeys';
import { UploadKeyDTO } from '../types/key.types';

/**
 * TanStack Query Hook: Server data caching for SSH Keys
 */
export function useKeysQuery() {
  return useQuery({
    queryKey: queryKeys.keys.list(),
    queryFn: () => keyApi.getKeys(),
  });
}

export function useUploadKeyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UploadKeyDTO) => keyApi.uploadKey(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keys.all });
    },
  });
}

export function useRevokeKeyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => keyApi.deleteKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keys.all });
    },
  });
}
