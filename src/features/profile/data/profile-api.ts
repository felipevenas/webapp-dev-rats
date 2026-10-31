import { api } from '@/core/http/api-client';
import type { ExperienceLevel, TechStack, User } from '@/core/types/api';

export interface UpdateMePayload {
  displayName?: string;
  timezone?: string;
  bio?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  experienceLevel?: ExperienceLevel | null;
  clearExperienceLevel?: boolean;
  primaryStack?: TechStack[];
  notifyDailyGoal?: boolean;
  notifyMilestones?: boolean;
  notifyChallengeUpdates?: boolean;
  notifyIntegration?: boolean;
}

export const profileApi = {
  async me() {
    const response = await api.get<User>('/me');
    return response.data;
  },
  async update(payload: UpdateMePayload) {
    const response = await api.patch<User>('/me', payload);
    return response.data;
  },
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.put<User>('/me/avatar', formData);
    return response.data;
  },
  async deleteAvatar() {
    const response = await api.delete<User>('/me/avatar');
    return response.data;
  },
  async exportData() {
    const response = await api.get<Record<string, unknown>>('/me/export');
    return response.data;
  },
  async deleteAccount(password: string) {
    await api.delete('/me', { data: { password } });
  },
};
