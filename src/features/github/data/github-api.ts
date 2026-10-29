import { api } from '@/core/http/api-client';
import type { GitHubRepository, GitHubStatus, PageResponse } from '@/core/types/api';

export const githubApi = {
  async status() {
    const response = await api.get<GitHubStatus>('/integrations/github');
    return response.data;
  },
  async authorizeUrl() {
    const response = await api.get<{ url: string }>('/integrations/github/authorize-url');
    return response.data.url;
  },
  async installUrl() {
    const response = await api.get<{ url: string }>('/integrations/github/install-url');
    return response.data.url;
  },
  async sync() {
    await api.post('/integrations/github/sync');
  },
  async disconnect() {
    await api.delete('/integrations/github');
  },
  async repositories(params: { query?: string; page?: number; size?: number }) {
    const response = await api.get<PageResponse<GitHubRepository>>('/github/repositories', { params });
    return response.data;
  },
};
