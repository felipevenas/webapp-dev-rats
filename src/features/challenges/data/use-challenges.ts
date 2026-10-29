import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/config/query-keys';
import { challengesApi, type CreateChallengePayload } from './challenges-api';

export function useChallenge(challengeId?: string) {
  return useQuery({
    queryKey: queryKeys.challenge(challengeId ?? ''),
    queryFn: () => challengesApi.get(challengeId as string),
    enabled: Boolean(challengeId),
    refetchInterval: 60_000,
  });
}

export function useGroupChallenges(groupId?: string) {
  return useQuery({
    queryKey: queryKeys.challenges(groupId ?? ''),
    queryFn: () => challengesApi.list(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useCreateChallenge(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChallengePayload) => challengesApi.create(groupId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.challenges(groupId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useStartChallenge(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) => challengesApi.start(challengeId),
    onSuccess: (challenge) => {
      queryClient.setQueryData(queryKeys.challenge(challenge.id), challenge);
      void queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.challenges(groupId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useCancelChallenge(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: string) => challengesApi.cancel(challengeId),
    onSuccess: (challenge) => {
      queryClient.setQueryData(queryKeys.challenge(challenge.id), challenge);
      void queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.challenges(groupId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useAddRepository(challengeId: string, groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (repositoryId: string) => challengesApi.addRepository(challengeId, repositoryId),
    onSuccess: (challenge) => {
      queryClient.setQueryData(queryKeys.challenge(challengeId), challenge);
      void queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
    },
  });
}

export function useRemoveRepository(challengeId: string, groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeRepositoryId: string) => challengesApi.removeRepository(challengeId, challengeRepositoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.challenge(challengeId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
    },
  });
}
