import { useQueryClient } from '@tanstack/react-query';
import { Inbox, Send, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { cn } from '@/core/lib/cn';
import type { Friend, FriendRequest } from '@/core/types/api';
import { Page, PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { Segmented } from '@/components/ui/segmented';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FRIENDS_PAGE_COPY,
  friendRequestDirectionLabel,
} from '@/features/friends/domain/friend-copy';
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDeclineFriendRequest,
  useFriendRequests,
  useFriends,
  useRemoveFriend,
} from '@/features/friends/data/use-friends';
import { FriendCard } from '@/features/friends/ui/friend-card';
import { FriendRequestCard } from '@/features/friends/ui/friend-request-card';
import { RemoveFriendModal } from '@/features/friends/ui/remove-friend-modal';
import { UserSearch } from '@/features/friends/ui/user-search';

type Tab = 'friends' | 'received' | 'sent';

const RECEIVED_COPY = {
  title: 'Nenhuma solicitação recebida',
  description: 'Quando alguém pedir para entrar na sua rede, a solicitação aparece aqui.',
} as const;

const SENT_COPY = {
  title: 'Nenhuma solicitação enviada',
  description: 'Você ainda não pediu amizade a ninguém. Busque por um @usuário para começar.',
} as const;

export default function FriendsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('friends');
  const [friendsPage, setFriendsPage] = useState(0);
  const [receivedPage, setReceivedPage] = useState(0);
  const [sentPage, setSentPage] = useState(0);
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);

  const friendsQuery = useFriends(friendsPage);
  const receivedQuery = useFriendRequests('RECEIVED', receivedPage);
  const sentQuery = useFriendRequests('SENT', sentPage);

  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const removeFriend = useRemoveFriend();

  const friendsTotal = friendsQuery.data?.totalElements ?? 0;
  const receivedTotal = receivedQuery.data?.totalElements ?? 0;
  const sentTotal = sentQuery.data?.totalElements ?? 0;

  //---- Accepting/removing the last item of a page makes the current page unreachable.
  useEffect(() => {
    const friendsPages = friendsQuery.data?.totalPages ?? 0;
    if (friendsPage > 0 && friendsPage > friendsPages - 1) {
      setFriendsPage(Math.max(0, friendsPages - 1));
    }
  }, [friendsPage, friendsQuery.data?.totalPages]);

  useEffect(() => {
    const receivedPages = receivedQuery.data?.totalPages ?? 0;
    if (receivedPage > 0 && receivedPage > receivedPages - 1) {
      setReceivedPage(Math.max(0, receivedPages - 1));
    }
  }, [receivedPage, receivedQuery.data?.totalPages]);

  useEffect(() => {
    const sentPages = sentQuery.data?.totalPages ?? 0;
    if (sentPage > 0 && sentPage > sentPages - 1) {
      setSentPage(Math.max(0, sentPages - 1));
    }
  }, [sentPage, sentQuery.data?.totalPages]);

  const handleActionError = (error: unknown) => {
    const appError = toAppError(error);
    //---- 404/409 mean the other side changed state; refetch before showing stale cards.
    if (appError.status === 404 || appError.status === 409) {
      void queryClient.invalidateQueries({ queryKey: ['friends'] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    }
    toast.error(appError.detail);
  };

  const handleAccept = async (request: FriendRequest) => {
    try {
      await acceptRequest.mutateAsync(request.id);
      toast.success(`Você e ${request.user.displayName} agora são amigos.`);
    } catch (error) {
      handleActionError(error);
    }
  };

  const handleDecline = async (request: FriendRequest) => {
    try {
      await declineRequest.mutateAsync(request.id);
      toast.success('Solicitação recusada.');
    } catch (error) {
      handleActionError(error);
    }
  };

  const handleCancel = async (request: FriendRequest) => {
    try {
      await cancelRequest.mutateAsync(request.id);
      toast.success('Solicitação cancelada.');
    } catch (error) {
      handleActionError(error);
    }
  };

  const handleRemove = async () => {
    if (!friendToRemove) return;
    try {
      await removeFriend.mutateAsync(friendToRemove.userId);
      toast.success(`${friendToRemove.displayName} foi removido da sua rede.`);
      setFriendToRemove(null);
    } catch (error) {
      handleActionError(error);
    }
  };

  const pendingFor = (request: FriendRequest): 'accept' | 'decline' | 'cancel' | null => {
    if (acceptRequest.isPending && acceptRequest.variables === request.id) return 'accept';
    if (declineRequest.isPending && declineRequest.variables === request.id) return 'decline';
    if (cancelRequest.isPending && cancelRequest.variables === request.id) return 'cancel';
    return null;
  };

  return (
    <Page>
      <PageHeader
        eyebrow={FRIENDS_PAGE_COPY.eyebrow}
        title={FRIENDS_PAGE_COPY.title}
        description={FRIENDS_PAGE_COPY.description}
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link to="/app/notifications">Ver alertas</Link>
          </Button>
        }
      />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="min-w-0 space-y-3">
          <Card className="xl:hidden">
            <CardContent className="p-4">
              <UserSearch />
            </CardContent>
          </Card>

          <Segmented<Tab>
            value={tab}
            onChange={setTab}
            ariaLabel="Seções de amizades"
            fullWidth
            options={[
              {
                value: 'friends',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    Amigos
                    <CountBadge value={friendsTotal} active={tab === 'friends'} />
                  </span>
                ),
              },
              {
                value: 'received',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    Recebidas
                    <CountBadge value={receivedTotal} active={tab === 'received'} highlight />
                  </span>
                ),
              },
              {
                value: 'sent',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    Enviadas
                    <CountBadge value={sentTotal} active={tab === 'sent'} />
                  </span>
                ),
              },
            ]}
          />

          <div role="tabpanel" aria-label={tabLabel(tab)}>
            {tab === 'friends' ? (
              <FriendsPanel
                query={friendsQuery}
                page={friendsPage}
                onPageChange={setFriendsPage}
                onRemove={setFriendToRemove}
              />
            ) : tab === 'received' ? (
              <RequestsPanel
                query={receivedQuery}
                page={receivedPage}
                onPageChange={setReceivedPage}
                empty={RECEIVED_COPY}
                emptyIcon={Inbox}
                direction="RECEIVED"
                pendingFor={pendingFor}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ) : (
              <RequestsPanel
                query={sentQuery}
                page={sentPage}
                onPageChange={setSentPage}
                empty={SENT_COPY}
                emptyIcon={Send}
                direction="SENT"
                pendingFor={pendingFor}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>

        <aside className="hidden min-w-0 xl:sticky xl:top-6 xl:block">
          <Card>
            <CardContent className="p-4">
              <UserSearch />
            </CardContent>
          </Card>
          <p className="mt-3 px-1 text-[10px] leading-relaxed text-faint">{FRIENDS_PAGE_COPY.privacyNote}</p>
        </aside>
      </div>

      <RemoveFriendModal
        open={Boolean(friendToRemove)}
        onOpenChange={(open) => !open && setFriendToRemove(null)}
        friendName={friendToRemove?.displayName}
        loading={removeFriend.isPending}
        onConfirm={() => void handleRemove()}
      />
    </Page>
  );
}

function tabLabel(tab: Tab): string {
  if (tab === 'received') return 'Solicitações recebidas';
  if (tab === 'sent') return 'Solicitações enviadas';
  return 'Lista de amigos';
}

function CountBadge({
  value,
  active,
  highlight,
}: {
  value: number;
  active: boolean;
  highlight?: boolean;
}) {
  if (value <= 0) return null;
  return (
    <span
      className={cn(
        'rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold',
        highlight && !active
          ? 'bg-volt text-volt-ink'
          : active
            ? 'bg-volt-soft text-accent'
            : 'bg-card text-faint',
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  );
}

function FriendsPanel({
  query,
  page,
  onPageChange,
  onRemove,
}: {
  query: ReturnType<typeof useFriends>;
  page: number;
  onPageChange: (page: number) => void;
  onRemove: (friend: Friend) => void;
}) {
  if (query.isLoading) return <CardsSkeleton />;
  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const friends = query.data?.content ?? [];

  if (friends.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sua rede está começando"
        description="Busque pelo @ de alguém ou adicione pessoas com quem você já divide desafios."
      />
    );
  }

  return (
    <div className="space-y-3">
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {friends.map((friend) => (
          <FriendCard key={friend.friendshipId} friend={friend} onRemove={onRemove} />
        ))}
      </ul>
      <Pagination
        page={page}
        totalPages={query.data?.totalPages ?? 0}
        totalElements={query.data?.totalElements}
        pageSize={query.data?.size}
        onPageChange={onPageChange}
      />
    </div>
  );
}

function RequestsPanel({
  query,
  page,
  onPageChange,
  empty,
  emptyIcon: EmptyIcon,
  direction,
  pendingFor,
  onAccept,
  onDecline,
  onCancel,
}: {
  query: ReturnType<typeof useFriendRequests>;
  page: number;
  onPageChange: (page: number) => void;
  empty: { title: string; description: string };
  emptyIcon: LucideIcon;
  direction: 'RECEIVED' | 'SENT';
  pendingFor: (request: FriendRequest) => 'accept' | 'decline' | 'cancel' | null;
  onAccept?: (request: FriendRequest) => void;
  onDecline?: (request: FriendRequest) => void;
  onCancel?: (request: FriendRequest) => void;
}) {
  if (query.isLoading) return <CardsSkeleton />;
  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }

  const requests = query.data?.content ?? [];

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={EmptyIcon}
        title={empty.title}
        description={empty.description}
        className="px-5 py-10"
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="px-1 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
        {friendRequestDirectionLabel(direction)}
      </p>
      <ul className="space-y-2.5">
        {requests.map((request) => (
          <FriendRequestCard
            key={request.id}
            request={request}
            pendingAction={pendingFor(request)}
            onAccept={onAccept}
            onDecline={onDecline}
            onCancel={onCancel}
          />
        ))}
      </ul>
      <Pagination
        page={page}
        totalPages={query.data?.totalPages ?? 0}
        totalElements={query.data?.totalElements}
        pageSize={query.data?.size}
        onPageChange={onPageChange}
      />
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2" aria-hidden>
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} className="h-[78px] w-full rounded-2xl" />
      ))}
    </div>
  );
}
