import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, Clock, UserMinus, UserPlus, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { cn } from '@/core/lib/cn';
import type { FriendshipStatus } from '@/core/types/api';
import { Button } from '@/components/ui/button';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown';
import { Tooltip } from '@/components/ui/tooltip';
import { FRIEND_ACTION_COPY } from '@/features/friends/domain/friend-copy';
import { friendsApi } from '@/features/friends/data/friends-api';
import {
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useCancelFriendRequest,
  useFriendRequests,
  useRemoveFriend,
  useSendFriendRequest,
} from '@/features/friends/data/use-friends';
import { RemoveFriendModal } from '@/features/friends/ui/remove-friend-modal';

interface FriendButtonProps {
  userId: string;
  username: string;
  displayName: string;
  status?: FriendshipStatus;
  compact?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

/**
 * Single source of truth for friendship actions.
 * Actions are always siblings or dropdown items, never nested buttons.
 */
export function FriendButton({
  userId,
  username,
  displayName,
  status = 'NONE',
  compact,
  variant = 'secondary',
  className,
}: FriendButtonProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [removeOpen, setRemoveOpen] = useState(false);

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const cancelRequest = useCancelFriendRequest();
  const removeFriend = useRemoveFriend();

  //---- Incoming requests carry an id used by accept/decline. The list is cached and only
  //---- fetched when a button actually renders the PENDING_INCOMING state.
  const incomingQuery = useFriendRequests('RECEIVED', 0, 50, status === 'PENDING_INCOMING');
  const incomingRequest = incomingQuery.data?.content.find((request) => request.user.id === userId);
  const incomingLoading = status === 'PENDING_INCOMING' && incomingQuery.isLoading;

  const handleError = (error: unknown) => {
    const appError = toAppError(error);
    //---- 404/409 mean another device changed the relationship; resync instead of guessing.
    if (appError.status === 404 || appError.status === 409) {
      void queryClient.invalidateQueries({ queryKey: ['friends'] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    }
    toast.error(appError.detail);
  };

  const handleSend = async () => {
    try {
      await sendRequest.mutateAsync(username);
      toast.success(`Solicitação enviada para @${username}.`);
    } catch (error) {
      handleError(error);
    }
  };

  const handleAccept = async () => {
    try {
      if (incomingRequest) {
        await acceptRequest.mutateAsync(incomingRequest.id);
      } else {
        const listComplete =
          incomingQuery.isSuccess &&
          incomingQuery.data.totalElements <= incomingQuery.data.content.length;
        if (listComplete) {
          toast.error('Não encontramos esta solicitação. Atualize a página e tente novamente.');
          void incomingQuery.refetch();
          return;
        }
        //---- A crossed request is auto-accepted by the API, so resending is a safe fallback.
        await sendRequest.mutateAsync(username);
      }
      toast.success('Solicitação aceita.');
    } catch (error) {
      handleError(error);
    }
  };

  const handleDecline = async () => {
    if (!incomingRequest) {
      toast.error('Não encontramos esta solicitação. Atualize a página e tente novamente.');
      void incomingQuery.refetch();
      return;
    }
    try {
      await declineRequest.mutateAsync(incomingRequest.id);
      toast.success('Solicitação recusada.');
    } catch (error) {
      handleError(error);
    }
  };

  const handleCancel = async () => {
    const outgoing = await friendsApi.requests('SENT', 0, 50).catch(() => null);
    const request = outgoing?.content.find((item) => item.user.id === userId);
    if (!request) {
      toast.error('Não encontramos esta solicitação. Atualize a página e tente novamente.');
      void queryClient.invalidateQueries({ queryKey: ['friends'] });
      return;
    }
    try {
      await cancelRequest.mutateAsync(request.id);
      toast.success('Solicitação cancelada.');
    } catch (error) {
      handleError(error);
    }
  };

  const handleRemove = async () => {
    try {
      await removeFriend.mutateAsync(userId);
      setRemoveOpen(false);
      toast.success('Amizade removida.');
    } catch (error) {
      handleError(error);
    }
  };

  if (status === 'SELF') return null;

  if (compact) {
    if (status === 'PENDING_OUTGOING') {
      return (
        <StaticIcon
          label={`Solicitação enviada para @${username}`}
          icon={Clock}
          className={className}
        />
      );
    }
    if (status === 'FRIENDS') {
      return (
        <StaticIcon
          label={`Você e @${username} são amigos`}
          icon={Check}
          className={cn('text-accent', className)}
        />
      );
    }
    if (status === 'PENDING_INCOMING') {
      return (
        <Tooltip content={`Aceitar solicitação de ${displayName}`}>
          <Button
            variant="accent"
            size="icon-sm"
            className={className}
            onClick={() => void handleAccept()}
            loading={acceptRequest.isPending || sendRequest.isPending || incomingLoading}
            aria-label={`Aceitar solicitação de ${displayName}`}
          >
            <Check aria-hidden />
          </Button>
        </Tooltip>
      );
    }
    return (
      <Tooltip content={`Adicionar ${displayName}`}>
        <Button
          variant="secondary"
          size="icon-sm"
          className={className}
          onClick={() => void handleSend()}
          loading={sendRequest.isPending}
          aria-label={`Adicionar ${displayName}`}
        >
          <UserPlus aria-hidden />
        </Button>
      </Tooltip>
    );
  }

  if (status === 'PENDING_OUTGOING') {
    return (
      <Dropdown
        trigger={
          <Button variant="secondary" size="sm" className={className}>
            <Clock aria-hidden />
            {FRIEND_ACTION_COPY.sent}
            <ChevronDown className="size-3.5 text-muted" aria-hidden />
          </Button>
        }
      >
        <DropdownItem danger disabled={cancelRequest.isPending} onSelect={() => void handleCancel()}>
          {FRIEND_ACTION_COPY.cancel}
        </DropdownItem>
      </Dropdown>
    );
  }

  if (status === 'PENDING_INCOMING') {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <Button
          variant="accent"
          size="sm"
          onClick={() => void handleAccept()}
          loading={acceptRequest.isPending || sendRequest.isPending || incomingLoading}
        >
          <Check aria-hidden />
          {FRIEND_ACTION_COPY.accept}
        </Button>
        <Tooltip content="Recusar solicitação">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void handleDecline()}
            loading={declineRequest.isPending}
            aria-label={`Recusar solicitação de ${displayName}`}
          >
            <X aria-hidden />
          </Button>
        </Tooltip>
      </div>
    );
  }

  if (status === 'FRIENDS') {
    return (
      <>
        <Dropdown
          trigger={
            <Button variant="secondary" size="sm" className={className}>
              <Check className="text-accent" aria-hidden />
              {FRIEND_ACTION_COPY.friends}
              <ChevronDown className="size-3.5 text-muted" aria-hidden />
            </Button>
          }
        >
          <DropdownItem onSelect={() => navigate(`/app/users/${username}`)}>
            {FRIEND_ACTION_COPY.viewProfile}
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={UserMinus} danger onSelect={() => setRemoveOpen(true)}>
            {FRIEND_ACTION_COPY.remove}
          </DropdownItem>
        </Dropdown>
        <RemoveFriendModal
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          friendName={displayName}
          loading={removeFriend.isPending}
          onConfirm={() => void handleRemove()}
        />
      </>
    );
  }

  return (
    <Button
      variant={variant}
      size="sm"
      className={className}
      onClick={() => void handleSend()}
      loading={sendRequest.isPending}
    >
      <UserPlus aria-hidden />
      {FRIEND_ACTION_COPY.add}
    </Button>
  );
}

function StaticIcon({
  label,
  icon: Icon,
  className,
}: {
  label: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <Tooltip content={label}>
      <span
        role="img"
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-card-2 text-muted',
          className,
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
    </Tooltip>
  );
}
