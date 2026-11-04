import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/config/query-keys';
import { usersApi } from './users-api';

/** Username search is only sent after two characters, matching the backend contract. */
export function useUserSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: queryKeys.userSearch(trimmed),
    queryFn: () => usersApi.search(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function usePublicProfile(username?: string) {
  return useQuery({
    queryKey: queryKeys.publicProfile(username ?? ''),
    queryFn: () => usersApi.profile(username as string),
    enabled: Boolean(username),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      //---- 404 is deterministic: a missing username must not be retried.
      if (status === 404) return false;
      return status !== undefined && status >= 500 && failureCount < 2;
    },
  });
}
