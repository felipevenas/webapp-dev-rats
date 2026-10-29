import { api } from '@/core/http/api-client';
import type { Group, InvitePreview } from '@/core/types/api';

export const invitesApi = {
  async preview(token: string) {
    const response = await api.get<InvitePreview>(`/invites/${token}`);
    return response.data;
  },
  async accept(token: string) {
    const response = await api.post<Group>(`/invites/${token}/accept`);
    return response.data;
  },
};
