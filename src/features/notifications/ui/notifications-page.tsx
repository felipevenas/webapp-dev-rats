import { BellOff, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/core/http/api-client';
import { toAppError } from '@/core/http/problem';
import { formatRelativeTime } from '@/core/lib/date';
import type { AppNotification, Challenge } from '@/core/types/api';
import { Page, PageHeader } from '@/components/layout/page-header';
import { Badge, Dot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { notificationCopy, notificationDetail } from '@/features/notifications/domain/notification-copy';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/data/use-notifications';
import { cn } from '@/core/lib/cn';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useNotifications(0);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.content ?? [];
  const unread = notifications.filter((notification) => !notification.readAt).length;

  const openNotification = async (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    if (!notification.challengeId) return;
    try {
      const challenge = await api.get<Challenge>(`/challenges/${notification.challengeId}`);
      navigate(`/app/groups/${challenge.data.groupId}?tab=activity`);
    } catch {
      navigate('/app/challenges');
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success('Todos os alertas foram marcados como lidos.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Central de atividade"
        title="Alertas"
        description="Marcos, convites e avisos da integração. Nada de conteúdo privado de repositórios."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAll}
            loading={markAllRead.isPending}
            disabled={unread === 0}
          >
            <CheckCheck aria-hidden />
            Marcar todas como lidas
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Nenhum alerta por enquanto"
          description="Quando alguém alcançar um marco, entrar no grupo ou a integração precisar de atenção, você verá aqui."
          action={
            <Button variant="secondary" onClick={() => navigate('/app')}>
              Voltar ao início
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const copy = notificationCopy(notification.type);
            const detail = notificationDetail(notification.type, notification.payload);
            const Icon = copy.icon;
            const unreadItem = !notification.readAt;
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => void openNotification(notification)}
                className={cn(
                  'ds-focus-ring flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-colors',
                  unreadItem
                    ? 'border-line bg-card hover:border-line-strong'
                    : 'border-transparent bg-card/40 hover:bg-card',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border',
                    copy.tone === 'volt' && 'border-volt-line bg-volt-soft text-accent',
                    copy.tone === 'cyan' && 'border-cyan/30 bg-cyan-soft text-cyan',
                    copy.tone === 'amber' && 'border-amber/30 bg-amber-soft text-amber',
                    copy.tone === 'rose' && 'border-rose/30 bg-rose-soft text-rose',
                    copy.tone === 'violet' && 'border-violet/30 bg-violet-soft text-violet',
                    copy.tone === 'neutral' && 'border-line bg-card-2 text-muted',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn('text-sm', unreadItem ? 'font-semibold text-fg' : 'font-medium text-muted')}>
                      {copy.title}
                    </p>
                    {unreadItem ? <Dot tone="volt" /> : null}
                    <Badge variant="outline" size="sm" className="ml-auto">
                      {formatRelativeTime(notification.createdAt)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{copy.description}</p>
                  {detail ? <p className="mt-1 font-mono text-[11px] text-faint">{detail}</p> : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Page>
  );
}
