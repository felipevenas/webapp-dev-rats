import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/config/query-keys';
import { toAppError } from '@/core/http/problem';
import { progressApi } from './progress-api';

export function useProgress(challengeId?: string) {
  return useQuery({
    queryKey: queryKeys.progress(challengeId ?? ''),
    queryFn: () => progressApi.progress(challengeId as string),
    enabled: Boolean(challengeId),
    refetchInterval: 60_000,
  });
}

export function useLeaderboard(challengeId?: string) {
  return useQuery({
    queryKey: queryKeys.leaderboard(challengeId ?? ''),
    queryFn: () => progressApi.leaderboard(challengeId as string),
    enabled: Boolean(challengeId),
    refetchInterval: 60_000,
  });
}

export function useActivity(
  challengeId: string | undefined,
  params: { userId?: string; from?: string; to?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.activity(challengeId ?? '', params.userId ?? 'me', params.from ?? '', params.to ?? ''),
    queryFn: () => progressApi.activity(challengeId as string, params),
    enabled: Boolean(challengeId) && enabled && Boolean(params.from) && Boolean(params.to),
    refetchInterval: 60_000,
  });
}

export function useChallengeResult(challengeId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.result(challengeId ?? ''),
    queryFn: async () => {
      try {
        return await progressApi.result(challengeId as string);
      } catch (error) {
        //---- A 404 here means the challenge has no winner yet, not a failure.
        if (toAppError(error).status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(challengeId) && enabled,
    retry: false,
  });
}

export function useFeed(challengeId?: string) {
  return useQuery({
    queryKey: queryKeys.feed(challengeId ?? ''),
    queryFn: () => progressApi.feed(challengeId as string, 20),
    enabled: Boolean(challengeId),
    refetchInterval: 60_000,
  });
}
