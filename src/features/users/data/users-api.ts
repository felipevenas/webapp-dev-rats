import { api } from '@/core/http/api-client';
import type { PublicUser, UserSearchResult } from '@/core/types/api';

export const usersApi = {
  /** Exact username or prefix search, minimum 2 characters, server caps the result at 10. */
  async search(query: string, limit = 10): Promise<UserSearchResult[]> {
    const response = await api.get<
      UserSearchResult[] | { content?: UserSearchResult[]; items?: UserSearchResult[] }
    >('/users/search', { params: { q: query, limit } });
    if (Array.isArray(response.data)) return response.data;
    return response.data?.content ?? response.data?.items ?? [];
  },
  async profile(username: string): Promise<PublicUser> {
    const response = await api.get<PublicUser>(`/users/${encodeURIComponent(username)}`);
    return response.data;
  },
};

export const publicUsersApi = usersApi;
