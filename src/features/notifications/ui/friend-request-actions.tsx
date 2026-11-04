import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { Button } from '@/components/ui/button';
import {
  useAcceptFriendRequest,
  useDeclineFriendRequest,
} from '@/features/friends/data/use-friends';
import { useMarkNotificationRead } from '@/features/notifications/data/use-notifications';

interface FriendRequestActionsProps {
  notificationId: string;
  friendshipId: string;
  displayName?: string | null;
}

type Resolution = 'accepted' | 'declined' | 'stale';

/**
 * Inline accept/decline used in the notification center.
 * The server is always revalidated; the local resolution is only a visual after-state.
 */
export function FriendRequestActions({
  notificationId,
  friendshipId,
  displayName,
}: FriendRequestActionsProps) {
  const queryClient = useQueryClient();
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const markRead = useMarkNotificationRead();
  const [resolution, setResolution] = useState<Resolution | null>(null);

  const resolve = async (action: Resolution) => {
    try {
      if (action === 'accepted') {
        await accept.mutateAsync(friendshipId);
      } else {
        await decline.mutateAsync(friendshipId);
      }
      //---- The notification stays in history but must not keep unread actions.
      await markRead.mutateAsync(notificationId).catch(() => undefined);
      setResolution(action);
      toast.success(action === 'accepted' ? 'Solicitação aceita.' : 'Solicitação recusada.');
    } catch (error) {
      const appError = toAppError(error);
      if (appError.status === 404 || appError.status === 409) {
        //---- Already handled elsewhere: hide the stale actions and resync.
        await markRead.mutateAsync(notificationId).catch(() => undefined);
        void queryClient.invalidateQueries({ queryKey: ['friends'] });
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
        setResolution('stale');
      }
      toast.error(appError.detail);
    }
  };

  if (resolution) {
    return (
      <p
        className={
          resolution === 'stale'
            ? 'mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-faint'
            : 'mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-accent'
        }
      >
        <Check className="size-3.5" aria-hidden />
        {resolution === 'accepted'
          ? 'Solicitação aceita'
          : resolution === 'declined'
            ? 'Solicitação recusada'
            : 'Solicitação já resolvida'}
        {resolution !== 'stale' && displayName ? ` · ${displayName}` : ''}
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Button
        variant="accent"
        size="sm"
        onClick={() => void resolve('accepted')}
        loading={accept.isPending}
        disabled={decline.isPending}
      >
        <Check aria-hidden />
        Aceitar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void resolve('declined')}
        loading={decline.isPending}
        disabled={accept.isPending}
      >
        <X aria-hidden />
        Recusar
      </Button>
    </div>
  );
}
