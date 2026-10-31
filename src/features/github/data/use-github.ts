import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/config/query-keys';
import { githubApi } from './github-api';

export function useGitHubStatus() {
  return useQuery({
    queryKey: queryKeys.github,
    queryFn: githubApi.status,
    refetchInterval: 60_000,
  });
}

export function useRepositories(params: { query?: string; page?: number; size?: number }, enabled = true) {
  return useQuery({
    queryKey: queryKeys.repositories(params.query ?? '', params.page ?? 0),
    queryFn: () => githubApi.repositories(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useSyncRepositories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: githubApi.sync,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.github });
      void queryClient.invalidateQueries({ queryKey: ['github', 'repositories'] });
    },
  });
}

export function useDisconnectGitHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: githubApi.disconnect,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.github });
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
      void queryClient.invalidateQueries({ queryKey: ['github', 'repositories'] });
    },
  });
}
