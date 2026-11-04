import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/core/config/query-keys';
import type { FriendRequestDirection, FriendshipStatus } from '@/core/types/api';
import { friendsApi } from './friends-api';

/** Anything that changes the social graph also changes notifications and public profiles. */
function invalidateSocial(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['friends'] });
  void queryClient.invalidateQueries({ queryKey: ['users'] });
  void queryClient.invalidateQueries({ queryKey: ['notifications'] });
}

export function useFriends(page = 0, size = 12) {
  return useQuery({
    queryKey: queryKeys.friends(page, size),
    queryFn: () => friendsApi.list(page, size),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useFriendRequests(
  direction: FriendRequestDirection,
  page = 0,
  size = 12,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.friendRequests(direction, page, size),
    queryFn: () => friendsApi.requests(direction, page, size),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    enabled,
  });
}

/** Badge counter for the sidebar/bottom nav. Only one item is fetched. */
export function useFriendRequestsCount() {
  return useQuery({
    queryKey: queryKeys.friendRequestsCount,
    queryFn: async () => {
      const page = await friendsApi.requests('RECEIVED', 0, 1);
      return page.totalElements;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/**
 * Batch friendship status for a list of users (group members, search results).
 * The API caps the batch at 50 ids; unknown ids resolve to `NONE`.
 */
export function useFriendshipStatuses(userIds: string[]) {
  const ids = [...new Set(userIds.filter(Boolean))];

  return useQuery({
    queryKey: queryKeys.friendshipStatuses(ids),
    queryFn: () => friendsApi.statuses(ids),
    enabled: ids.length > 0,
    staleTime: 30_000,
    select: (results) =>
      results.reduce<Record<string, FriendshipStatus>>((acc, result) => {
        acc[result.userId] = result.status;
        return acc;
      }, {}),
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => friendsApi.sendRequest(username),
    onSuccess: () => invalidateSocial(queryClient),
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendsApi.acceptRequest(requestId),
    onSuccess: () => invalidateSocial(queryClient),
  });
}

export function useDeclineFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendsApi.declineRequest(requestId),
    onSuccess: () => invalidateSocial(queryClient),
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => friendsApi.cancelRequest(requestId),
    onSuccess: () => invalidateSocial(queryClient),
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.removeFriend(userId),
    onSuccess: () => invalidateSocial(queryClient),
  });
}
