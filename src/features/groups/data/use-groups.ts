import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/config/query-keys';
import { groupsApi, type CreateGroupPayload } from './groups-api';

export function useGroups() {
  return useQuery({ queryKey: queryKeys.groups, queryFn: groupsApi.list });
}

export function useGroup(groupId?: string) {
  return useQuery({
    queryKey: queryKeys.group(groupId ?? ''),
    queryFn: () => groupsApi.get(groupId as string),
    enabled: Boolean(groupId),
    refetchInterval: 60_000,
  });
}

export function useGroupMembers(groupId?: string) {
  return useQuery({
    queryKey: queryKeys.groupMembers(groupId ?? ''),
    queryFn: () => groupsApi.members(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useGroupInvites(groupId?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.groupInvites(groupId ?? ''),
    queryFn: () => groupsApi.invites(groupId as string),
    enabled: Boolean(groupId) && enabled,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => groupsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; description?: string }) => groupsApi.update(groupId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    },
  });
}

export function useRemoveMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => groupsApi.removeMember(groupId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
    },
  });
}

export function useLeaveGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => groupsApi.leave(groupId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCreateInvite(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { expiresAt?: string; maxUses?: number }) => groupsApi.createInvite(groupId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupInvites(groupId) });
    },
  });
}

export function useRevokeInvite(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => groupsApi.revokeInvite(groupId, inviteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.groupInvites(groupId) });
    },
  });
}
