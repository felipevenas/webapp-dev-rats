import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/core/lib/cn';
import type { Conversation } from '@/core/types/api';
import { Avatar } from '@/components/ui/avatar';
import { PresenceDot } from '@/features/friends/ui/presence-dot';
import { conversationTime } from '@/features/chat/domain/chat-message';

interface ConversationItemProps {
  conversation: Conversation;
  active: boolean;
  currentUserId?: string;
}

export function ConversationItem({ conversation, active, currentUserId }: ConversationItemProps) {
  const last = conversation.lastMessage;
  const preview = !last
    ? 'Comece a conversa'
    : last.deleted
      ? 'Mensagem apagada'
      : last.senderId === currentUserId
        ? `Você: ${last.preview}`
        : last.preview;

  return (
    <li>
      <Link
        to={`/app/chat/${conversation.id}`}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'ds-focus-ring flex min-w-0 items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors',
          active ? 'bg-volt-soft text-accent' : 'hover:bg-card-2',
        )}
      >
        {conversation.type === 'DIRECT' ? (
          <span className="relative shrink-0">
            <Avatar
              src={conversation.peer?.avatarUrl ?? conversation.avatarUrl}
              name={conversation.title}
              size="md"
            />
            <PresenceDot
              presence={conversation.presence}
              size="sm"
              className="absolute -bottom-0.5 -right-0.5"
            />
          </span>
        ) : (
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-card-2 text-accent">
            <Users className="size-4" aria-hidden />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={cn('truncate text-[13px] font-semibold', active ? 'text-accent' : 'text-fg')}>
              {conversation.title}
            </p>
            <span className="shrink-0 font-mono text-[9px] text-faint">
              {conversationTime(conversation.lastMessageAt)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="truncate text-[11px] leading-relaxed text-muted">{preview}</p>
            {conversation.unreadCount > 0 ? (
              <span className="shrink-0 rounded-full bg-volt px-1.5 py-0.5 font-mono text-[9px] font-semibold text-volt-ink">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
