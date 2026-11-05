import { MessageSquarePlus, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useFriends } from '@/features/friends/data/use-friends';
import { PresenceDot } from '@/features/friends/ui/presence-dot';
import { useCreateConversation } from '@/features/chat/data/use-chat';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationDialog({ open, onOpenChange }: NewConversationDialogProps) {
  const navigate = useNavigate();
  const friends = useFriends(0, 100);
  const createConversation = useCreateConversation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const list = friends.data?.content ?? [];
    if (!value) return list;
    return list.filter(
      (friend) =>
        friend.displayName.toLowerCase().includes(value) ||
        friend.username.toLowerCase().includes(value),
    );
  }, [friends.data?.content, query]);

  const openConversation = async (userId: string) => {
    try {
      const conversation = await createConversation.mutateAsync({ type: 'DIRECT', userId });
      onOpenChange(false);
      setQuery('');
      navigate(`/app/chat/${conversation.id}`);
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nova conversa"
      description="Escolha um amigo para iniciar um chat privado."
      size="md"
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-faint" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar amigo"
            aria-label="Buscar amigo"
            className="pl-8"
          />
        </div>

        {friends.isLoading ? (
          <div className="space-y-2" aria-hidden>
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : friends.isError ? (
          <ErrorState error={friends.error} onRetry={() => void friends.refetch()} compact />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={query ? Search : Users}
            title={query ? 'Nenhum amigo encontrado' : 'Você ainda não tem amigos'}
            description={
              query
                ? 'Tente outro nome ou @usuário.'
                : 'Adicione amigos para começar uma conversa privada.'
            }
            action={
              !query ? (
                <Button asChild size="sm" variant="secondary">
                  <Link to="/app/friends">Encontrar amigos</Link>
                </Button>
              ) : undefined
            }
            compact
          />
        ) : (
          <ul className="max-h-[50dvh] space-y-1 overflow-y-auto">
            {filtered.map((friend) => {
              const pending =
                createConversation.isPending && createConversation.variables?.userId === friend.userId;
              return (
                <li key={friend.userId}>
                  <button
                    type="button"
                    onClick={() => void openConversation(friend.userId)}
                    disabled={createConversation.isPending}
                    className="ds-focus-ring flex w-full min-w-0 items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-card-2 disabled:opacity-60"
                  >
                    <span className="relative shrink-0">
                      <Avatar src={friend.avatarUrl} name={friend.displayName} size="md" />
                      <PresenceDot
                        presence={friend.presence}
                        size="sm"
                        className="absolute -bottom-0.5 -right-0.5"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-fg">
                        {friend.displayName}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-faint">
                        @{friend.username}
                      </span>
                    </span>
                    {pending ? (
                      <MessageSquarePlus className="size-4 animate-pulse text-accent" aria-hidden />
                    ) : (
                      <MessageSquarePlus className="size-4 text-faint" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
