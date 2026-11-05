import { MessageSquarePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Conversation } from '@/core/types/api';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConversationItem } from '@/features/chat/ui/conversation-item';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  currentUserId?: string;
  loading?: boolean;
  error?: unknown;
  onRetry: () => void;
  onNew: () => void;
}

export function ConversationList({
  conversations,
  activeId,
  currentUserId,
  loading,
  error,
  onRetry,
  onNew,
}: ConversationListProps) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return conversations;
    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(value),
    );
  }, [conversations, query]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-line px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">DevRats</p>
          <h1 className="truncate text-lg font-semibold tracking-tight text-fg">Conversas</h1>
        </div>
        <Button size="icon-sm" onClick={onNew} aria-label="Nova conversa">
          <MessageSquarePlus aria-hidden />
        </Button>
      </header>

      <div className="border-b border-line px-3 py-2.5 sm:px-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-faint" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conversa"
            aria-label="Buscar conversa"
            className="h-9 pl-8 text-[12px]"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="space-y-2" aria-hidden>
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} compact />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquarePlus}
            title={query ? 'Nenhuma conversa encontrada' : 'Sua caixa está vazia'}
            description={
              query
                ? 'Tente outro nome ou abra uma nova conversa.'
                : 'Comece uma conversa com um amigo ou abra o chat de um grupo.'
            }
            action={
              !query ? (
                <Button size="sm" onClick={onNew}>
                  <MessageSquarePlus aria-hidden />
                  Nova conversa
                </Button>
              ) : undefined
            }
            className="mt-4"
          />
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeId}
                currentUserId={currentUserId}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
