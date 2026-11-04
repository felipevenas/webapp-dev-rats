import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/config/query-keys';
import { notificationsApi } from './notifications-api';

export function useNotifications(page = 0) {
  return useQuery({
    queryKey: queryKeys.notifications(page),
    queryFn: () => notificationsApi.list(page),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  });
}

export function useUnreadNotifications() {
  const { data } = useNotifications(0);
  return data?.content.filter((notification) => !notification.readAt).length ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.remove,
    //---- Offline deletion must reject immediately so the caller's finally clears the row.
    networkMode: 'always',
    retry: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
