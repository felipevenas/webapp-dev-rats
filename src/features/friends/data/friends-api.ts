import { api } from '@/core/http/api-client';
import type {
  Friend,
  FriendRequest,
  FriendRequestDirection,
  FriendshipStatusResult,
  PageResponse,
} from '@/core/types/api';
import { usersApi } from '@/features/users/data/users-api';

const MAX_STATUS_BATCH = 50;

export const friendsApi = {
  search: usersApi.search,
  profile: usersApi.profile,

  async list(page = 0, size = 12): Promise<PageResponse<Friend>> {
    const response = await api.get<PageResponse<Friend>>('/friends', { params: { page, size } });
    return response.data;
  },

  async requests(
    direction: FriendRequestDirection,
    page = 0,
    size = 12,
  ): Promise<PageResponse<FriendRequest>> {
    const response = await api.get<PageResponse<FriendRequest>>('/friends/requests', {
      params: { direction, page, size },
    });
    return response.data;
  },

  /** Batch status lookup. The API accepts up to 50 ids; unknown ids resolve to `NONE`. */
  async statuses(userIds: string[]): Promise<FriendshipStatusResult[]> {
    const ids = [...new Set(userIds.filter(Boolean))].slice(0, MAX_STATUS_BATCH);
    if (ids.length === 0) return [];
    const response = await api.get<FriendshipStatusResult[] | { statuses?: FriendshipStatusResult[] }>(
      '/friends/status',
      { params: { userIds: ids.join(',') } },
    );
    return Array.isArray(response.data) ? response.data : (response.data?.statuses ?? []);
  },

  async sendRequest(username: string): Promise<void> {
    await api.post('/friends/requests', { username });
  },

  async acceptRequest(requestId: string): Promise<void> {
    await api.post(`/friends/requests/${requestId}/accept`);
  },

  async declineRequest(requestId: string): Promise<void> {
    await api.post(`/friends/requests/${requestId}/decline`);
  },

  async cancelRequest(requestId: string): Promise<void> {
    await api.delete(`/friends/requests/${requestId}`);
  },

  async removeFriend(userId: string): Promise<void> {
    await api.delete(`/friends/${userId}`);
  },

  /** Upserts `last_seen_at` for the JWT subject. No body is sent. */
  async heartbeat(): Promise<void> {
    await api.post('/presence/heartbeat');
  },
};

export { MAX_STATUS_BATCH };
