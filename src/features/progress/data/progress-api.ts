import { api } from '@/core/http/api-client';
import type {
  ActivityCalendar,
  ChallengeResult,
  Dashboard,
  FeedItem,
  ProgressEntry,
} from '@/core/types/api';

export const progressApi = {
  async dashboard() {
    const response = await api.get<Dashboard>('/dashboard');
    return response.data;
  },
  async progress(challengeId: string) {
    const response = await api.get<ProgressEntry[]>(`/challenges/${challengeId}/progress`);
    return response.data;
  },
  async leaderboard(challengeId: string) {
    const response = await api.get<ProgressEntry[]>(`/challenges/${challengeId}/leaderboard`);
    return response.data;
  },
  async activity(challengeId: string, params: { userId?: string; from?: string; to?: string }) {
    const response = await api.get<ActivityCalendar>(`/challenges/${challengeId}/activity`, { params });
    return response.data;
  },
  async result(challengeId: string) {
    const response = await api.get<ChallengeResult>(`/challenges/${challengeId}/result`);
    return response.data;
  },
  async feed(challengeId: string, limit = 20) {
    const response = await api.get<FeedItem[]>(`/challenges/${challengeId}/feed`, { params: { limit } });
    return response.data;
  },
};
