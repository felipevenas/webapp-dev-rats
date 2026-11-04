import { Check, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '@/core/lib/date';
import type { FriendRequest } from '@/core/types/api';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FRIEND_ACTION_COPY } from '@/features/friends/domain/friend-copy';

interface FriendRequestCardProps {
  request: FriendRequest;
  pendingAction?: 'accept' | 'decline' | 'cancel' | null;
  onAccept?: (request: FriendRequest) => void;
  onDecline?: (request: FriendRequest) => void;
  onCancel?: (request: FriendRequest) => void;
}

export function FriendRequestCard({
  request,
  pendingAction,
  onAccept,
  onDecline,
  onCancel,
}: FriendRequestCardProps) {
  const received = request.direction === 'RECEIVED';

  return (
    <li className="ds-card min-w-0 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <Link
          to={`/app/users/${request.user.username}`}
          className="ds-focus-ring shrink-0 rounded-full"
          aria-label={`Ver perfil de ${request.user.displayName}`}
        >
          <Avatar src={request.user.avatarUrl} name={request.user.displayName} size="md" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/app/users/${request.user.username}`}
            className="ds-focus-ring block truncate text-[13px] font-semibold text-fg transition-colors hover:text-accent"
          >
            {request.user.displayName}
          </Link>
          <p className="truncate font-mono text-[10px] text-faint">@{request.user.username}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            {received ? 'quer adicionar você' : 'aguardando resposta'} ·{' '}
            {formatRelativeTime(request.createdAt)}
          </p>
        </div>

        {received ? null : (
          <Badge variant="amber" size="sm" className="shrink-0">
            <Clock className="size-2.5" aria-hidden />
            Aguardando
          </Badge>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        {received ? (
          <>
            <Button
              variant="accent"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => onAccept?.(request)}
              loading={pendingAction === 'accept'}
              disabled={pendingAction === 'decline'}
            >
              <Check aria-hidden />
              {FRIEND_ACTION_COPY.accept}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => onDecline?.(request)}
              loading={pendingAction === 'decline'}
              disabled={pendingAction === 'accept'}
            >
              <X aria-hidden />
              {FRIEND_ACTION_COPY.decline}
            </Button>
          </>
        ) : (
          <Button
            variant="danger-ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onCancel?.(request)}
            loading={pendingAction === 'cancel'}
          >
            {FRIEND_ACTION_COPY.cancel}
          </Button>
        )}
      </div>
    </li>
  );
}
