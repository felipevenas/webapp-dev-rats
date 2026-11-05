import { MessageCircle, UserMinus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import type { Friend } from '@/core/types/api';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useCreateConversation } from '@/features/chat/data/use-chat';
import { friendsSinceLabel } from '@/features/friends/domain/friend-copy';
import { FriendButton } from '@/features/friends/ui/friend-button';
import { PresenceDot } from '@/features/friends/ui/presence-dot';

interface FriendCardProps {
  friend: Friend;
  onRemove: (friend: Friend) => void;
}

export function FriendCard({ friend, onRemove }: FriendCardProps) {
  const navigate = useNavigate();
  const createConversation = useCreateConversation();

  const openChat = async () => {
    try {
      const conversation = await createConversation.mutateAsync({
        type: 'DIRECT',
        userId: friend.userId,
      });
      navigate(`/app/chat/${conversation.id}`);
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <li className="ds-card flex min-w-0 items-center gap-3 p-3.5">
      <Link
        to={`/app/users/${friend.username}`}
        className="ds-focus-ring relative shrink-0 rounded-full"
        aria-label={`Ver perfil de ${friend.displayName}`}
      >
        <Avatar src={friend.avatarUrl} name={friend.displayName} size="md" />
        <PresenceDot
          presence={friend.presence}
          size="sm"
          className="absolute -bottom-0.5 -right-0.5"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/app/users/${friend.username}`}
          className="ds-focus-ring block truncate text-[13px] font-semibold text-fg transition-colors hover:text-accent"
        >
          {friend.displayName}
        </Link>
        <p className="truncate font-mono text-[10px] text-faint">@{friend.username}</p>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          {friend.presence ? <PresenceDot presence={friend.presence} withLabel size="sm" /> : null}
          {friend.presence ? (
            <span className="text-[10px] text-faint" aria-hidden>
              ·
            </span>
          ) : null}
          <span className="text-[10px] text-muted">{friendsSinceLabel(friend.friendsSince)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <FriendButton
          compact
          userId={friend.userId}
          username={friend.username}
          displayName={friend.displayName}
          status="FRIENDS"
        />
        <Tooltip content="Enviar mensagem">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void openChat()}
            loading={createConversation.isPending && createConversation.variables?.userId === friend.userId}
            aria-label={`Enviar mensagem para ${friend.displayName}`}
          >
            <MessageCircle aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip content="Remover amizade">
          <Button
            variant="danger-ghost"
            size="icon-sm"
            onClick={() => onRemove(friend)}
            aria-label={`Remover ${friend.displayName} da lista de amigos`}
          >
            <UserMinus aria-hidden />
          </Button>
        </Tooltip>
      </div>
    </li>
  );
}
