import { BellOff, CheckCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/core/http/api-client';
import { toAppError } from '@/core/http/problem';
import { formatRelativeTime } from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import type { AppNotification, Challenge } from '@/core/types/api';
import { Page, PageHeader } from '@/components/layout/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge, Dot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import {
  notificationActor,
  notificationCopy,
  notificationDetail,
} from '@/features/notifications/domain/notification-copy';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/data/use-notifications';
import { FriendRequestActions } from '@/features/notifications/ui/friend-request-actions';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, error, refetch } = useNotifications(page);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.content ?? [];

  useEffect(() => {
    const total = data?.totalPages ?? 0;
    if (total > 0 && page > total - 1) setPage(total - 1);
  }, [data?.totalPages, page]);

  const openNotification = async (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);

    if (notification.type === 'FRIEND_REQUEST_ACCEPTED') {
      const actor = notificationActor(notification.payload);
      if (actor.username) {
        navigate(`/app/users/${actor.username}`);
        return;
      }
    }
    //---- Friend requests are resolved inline; there is no destination page.
    if (notification.type === 'FRIEND_REQUEST') return;
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
      setPage(0);
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
        description="Marcos, convites, amizades e avisos da integração. Nada de conteúdo privado de repositórios."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAll}
            loading={markAllRead.isPending}
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
          description="Quando alguém pedir amizade, alcançar um marco, entrar no grupo ou a integração precisar de atenção, você verá aqui."
          action={
            <Button variant="secondary" onClick={() => navigate('/app')}>
              Voltar ao início
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {notifications.map((notification) => {
              const copy = notificationCopy(notification.type);
              const detail = notificationDetail(notification.type, notification.payload);
              const actor = notificationActor(notification.payload);
              const Icon = copy.icon;
              const unreadItem = !notification.readAt;
              const isFriendRequest = notification.type === 'FRIEND_REQUEST';
              const isFriendAccepted = notification.type === 'FRIEND_REQUEST_ACCEPTED';
              const hasActor = Boolean(actor.username || actor.displayName);

              return (
                <article
                  key={notification.id}
                  className={cn(
                    'rounded-2xl border p-4 transition-colors',
                    unreadItem
                      ? 'border-line bg-card hover:border-line-strong'
                      : 'border-transparent bg-card/40',
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    {hasActor && actor.username ? (
                      <Link
                        to={`/app/users/${actor.username}`}
                        className="ds-focus-ring mt-0.5 shrink-0 rounded-full"
                        aria-label={`Ver perfil de ${actor.displayName ?? actor.username}`}
                        onClick={() => {
                          if (!notification.readAt) markRead.mutate(notification.id);
                        }}
                      >
                        <Avatar
                          src={actor.avatarUrl}
                          name={actor.displayName ?? actor.username ?? 'Dev'}
                          size="md"
                        />
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          'mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl border',
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
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void openNotification(notification)}
                          className="ds-focus-ring min-w-0 rounded text-left"
                        >
                          <span
                            className={cn(
                              'text-sm',
                              unreadItem ? 'font-semibold text-fg' : 'font-medium text-muted',
                            )}
                          >
                            {copy.title}
                          </span>
                        </button>
                        {unreadItem ? <Dot tone="volt" /> : null}
                        <Badge variant="outline" size="sm" className="ml-auto">
                          {formatRelativeTime(notification.createdAt)}
                        </Badge>
                      </div>

                      <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                        {copy.description}
                      </p>
                      {detail ? <p className="mt-1 font-mono text-[11px] text-faint">{detail}</p> : null}

                      {isFriendRequest && actor.friendshipId ? (
                        <FriendRequestActions
                          notificationId={notification.id}
                          friendshipId={actor.friendshipId}
                          displayName={actor.displayName}
                        />
                      ) : null}

                      {isFriendAccepted && actor.username ? (
                        <Link
                          to={`/app/users/${actor.username}`}
                          className="ds-focus-ring mt-2 inline-flex items-center gap-1 rounded text-[11px] font-medium text-accent hover:underline"
                          onClick={() => {
                            if (!notification.readAt) markRead.mutate(notification.id);
                          }}
                        >
                          Ver perfil de @{actor.username}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 0}
            totalElements={data?.totalElements}
            pageSize={data?.size}
            onPageChange={(next) => {
              setPage(next);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </Page>
  );
}
