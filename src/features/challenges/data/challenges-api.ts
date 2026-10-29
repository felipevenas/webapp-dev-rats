import { api } from '@/core/http/api-client';
import type { Challenge } from '@/core/types/api';

export interface CreateChallengePayload {
  verificationMode: 'SELECTED_REPOSITORIES' | 'OWN_REPOSITORIES';
  targetValidDays: number;
  startsAt: string;
  endsAt?: string;
  admissionEndsAt?: string;
  repositoryIds?: string[];
}

export const challengesApi = {
  async create(groupId: string, payload: CreateChallengePayload) {
    const response = await api.post<Challenge>(`/groups/${groupId}/challenges`, payload);
    return response.data;
  },
  async list(groupId: string) {
    const response = await api.get<Challenge[]>(`/groups/${groupId}/challenges`);
    return response.data;
  },
  async get(challengeId: string) {
    const response = await api.get<Challenge>(`/challenges/${challengeId}`);
    return response.data;
  },
  async update(challengeId: string, payload: Partial<CreateChallengePayload>) {
    const response = await api.patch<Challenge>(`/challenges/${challengeId}`, payload);
    return response.data;
  },
  async addRepository(challengeId: string, githubRepositoryId: string) {
    const response = await api.post<Challenge>(`/challenges/${challengeId}/repositories`, { githubRepositoryId });
    return response.data;
  },
  async removeRepository(challengeId: string, challengeRepositoryId: string) {
    await api.delete(`/challenges/${challengeId}/repositories/${challengeRepositoryId}`);
  },
  async start(challengeId: string) {
    const response = await api.post<Challenge>(`/challenges/${challengeId}/start`);
    return response.data;
  },
  async cancel(challengeId: string) {
    const response = await api.post<Challenge>(`/challenges/${challengeId}/cancel`);
    return response.data;
  },
};
