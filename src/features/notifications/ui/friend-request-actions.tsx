import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import type { FriendshipStatus } from '@/core/types/api';
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
  friendshipStatus?: FriendshipStatus;
}

type Resolution = 'accepted' | 'declined' | 'stale';

const RESOLUTION_PREFIX = 'devrats:friend-resolution:';

function readStoredResolution(notificationId: string): Resolution | null {
  try {
    const value = sessionStorage.getItem(RESOLUTION_PREFIX + notificationId);
    return value === 'accepted' || value === 'declined' || value === 'stale' ? value : null;
  } catch {
    return null;
  }
}

function storeResolution(notificationId: string, resolution: Resolution) {
  try {
    sessionStorage.setItem(RESOLUTION_PREFIX + notificationId, resolution);
  } catch {
    //---- UI-only hint; storage failures must never block the action.
  }
}

/**
 * Inline accept/decline used in the notification center.
 * The server is always revalidated; the local resolution is only a visual after-state.
 */
export function FriendRequestActions({
  notificationId,
  friendshipId,
  displayName,
  friendshipStatus,
}: FriendRequestActionsProps) {
  const queryClient = useQueryClient();
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const markRead = useMarkNotificationRead();
  const [resolution, setResolution] = useState<Resolution | null>(() =>
    friendshipStatus === 'FRIENDS' ? 'accepted' : readStoredResolution(notificationId),
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (friendshipStatus === 'FRIENDS' && resolution !== 'accepted') {
      setResolution('accepted');
    }
  }, [friendshipStatus, resolution]);

  const resolve = async (action: Resolution) => {
    if (submitting || resolution) return;
    setSubmitting(true);
    try {
      if (action === 'accepted') {
        await accept.mutateAsync(friendshipId);
      } else {
        await decline.mutateAsync(friendshipId);
      }
      //---- Resolve the row before awaiting mark-read so repeated clicks cannot race.
      setResolution(action);
      storeResolution(notificationId, action);
      await markRead.mutateAsync(notificationId).catch(() => undefined);
      toast.success(action === 'accepted' ? 'Solicitação aceita.' : 'Solicitação recusada.');
    } catch (error) {
      const appError = toAppError(error);
      const stale =
        appError.status === 404 ||
        (appError.status === 409 && appError.code === 'INVALID_FRIENDSHIP_STATE');
      if (stale) {
        //---- Already handled elsewhere: hide the stale actions and resync.
        await markRead.mutateAsync(notificationId).catch(() => undefined);
        void queryClient.invalidateQueries({ queryKey: ['friends'] });
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
        setResolution('stale');
        storeResolution(notificationId, 'stale');
      }
      toast.error(appError.detail);
    } finally {
      setSubmitting(false);
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
        loading={accept.isPending || submitting}
        disabled={decline.isPending || submitting}
      >
        <Check aria-hidden />
        Aceitar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void resolve('declined')}
        loading={decline.isPending || submitting}
        disabled={accept.isPending || submitting}
      >
        <X aria-hidden />
        Recusar
      </Button>
    </div>
  );
}
