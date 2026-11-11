import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sshGroupApi } from '../api/sshGroupApi';
import { queryKeys } from '@/shared/services/api/queryKeys';
import { CreateGroupDTO, UpdateGroupDTO } from '../types/sshGroup.types';

/**
 * TanStack Query Hook: Server data caching for SSH Groups
 */
export function useSshGroupsQuery() {
  return useQuery({
    queryKey: queryKeys.sshGroups.list(),
    queryFn: () => sshGroupApi.getGroups(),
  });
}

export function useSshGroupDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.sshGroups.detail(id),
    queryFn: () => sshGroupApi.getGroupById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSshGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupDTO) => sshGroupApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sshGroups.all });
    },
  });
}

export function useUpdateSshGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupDTO }) =>
      sshGroupApi.updateGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sshGroups.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sshGroups.list() });
    },
  });
}

export function useDeleteSshGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sshGroupApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sshGroups.all });
    },
  });
}
