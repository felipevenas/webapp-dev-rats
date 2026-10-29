import { api } from '@/core/http/api-client';
import type { AppNotification, PageResponse } from '@/core/types/api';

export const notificationsApi = {
  async list(page = 0, size = 20) {
    const response = await api.get<PageResponse<AppNotification>>('/notifications', {
      params: { page, size },
    });
    return response.data;
  },
  async markRead(notificationId: string) {
    await api.patch(`/notifications/${notificationId}/read`);
  },
  async markAllRead() {
    await api.post('/notifications/read-all');
  },
};
