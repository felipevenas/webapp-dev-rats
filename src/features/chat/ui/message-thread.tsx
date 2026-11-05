import { ArrowDown, ArrowLeft, MessageSquare, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { cn } from '@/core/lib/cn';
import type { Conversation } from '@/core/types/api';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { PresenceDot } from '@/features/friends/ui/presence-dot';
import { useChatSocket } from '@/features/chat/data/chat-socket-provider';
import {
  useChatMessages,
  useDeleteChatMessage,
  useMarkChatRead,
  useSendChatMessage,
} from '@/features/chat/data/use-chat';
import {
  groupMessagesByDay,
  type ChatMessageView,
} from '@/features/chat/domain/chat-message';
import { MessageBubble } from '@/features/chat/ui/message-bubble';
import { MessageComposer } from '@/features/chat/ui/message-composer';

interface MessageThreadProps {
  conversation: Conversation;
}

export function MessageThread({ conversation }: MessageThreadProps) {
  const { user } = useAuth();
  const { sendTyping, status, typingFor } = useChatSocket();
  const messagesQuery = useChatMessages(conversation.id);
  const sendMessage = useSendChatMessage(conversation.id);
  const markRead = useMarkChatRead(conversation.id);
  const deleteMessage = useDeleteChatMessage(conversation.id);
  const [deleteTarget, setDeleteTarget] = useState<ChatMessageView | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMarked = useRef<string | null>(null);
  const previousCount = useRef(0);
  const loadingOlder = useRef(false);
  const [atBottom, setAtBottom] = useState(true);
  const [newBelow, setNewBelow] = useState(false);

  const pages = messagesQuery.data?.pages;
  const chronological = useMemo(() => {
    if (!pages) return [];
    return [...pages].reverse().flatMap((page) => [...page.items].reverse());
  }, [pages]);
  const latest = chronological[chronological.length - 1];
  const typing = typingFor(conversation.id);
  const timezone = user?.timezone || 'America/Sao_Paulo';

  useEffect(() => {
    lastMarked.current = null;
    previousCount.current = 0;
    loadingOlder.current = false;
    setAtBottom(true);
    setNewBelow(false);
  }, [conversation.id]);

  useEffect(() => {
    if (!atBottom) return;
    if (!latest || latest.id.startsWith('local-') || latest.id === lastMarked.current) return;
    if (document.visibilityState !== 'visible') return;
    const timer = window.setTimeout(() => {
      lastMarked.current = latest.id;
      markRead.mutate(latest.id);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [atBottom, latest, markRead]);

  useEffect(() => {
    const count = chronological.length;
    if (count > previousCount.current) {
      if (loadingOlder.current) {
        previousCount.current = count;
        return;
      }
      if (atBottom || previousCount.current === 0) {
        bottomRef.current?.scrollIntoView({
          behavior: previousCount.current === 0 ? 'auto' : 'smooth',
          block: 'end',
        });
      } else {
        setNewBelow(true);
      }
    }
    previousCount.current = count;
  }, [atBottom, chronological.length]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 120;
    setAtBottom(nearBottom);
    if (nearBottom) setNewBelow(false);
  };

  const loadOlder = async () => {
    const element = scrollRef.current;
    const previousHeight = element?.scrollHeight ?? 0;
    loadingOlder.current = true;
    try {
      await messagesQuery.fetchNextPage();
    } finally {
      loadingOlder.current = false;
    }
    window.requestAnimationFrame(() => {
      if (element) element.scrollTop = element.scrollHeight - previousHeight;
    });
  };

  const handleSendText = (body: string) => {
    sendMessage.sendText.mutate({
      clientMessageId: crypto.randomUUID(),
      type: 'TEXT',
      body,
    });
  };

  const handleSendAttachment = (
    file: File,
    type: 'IMAGE' | 'VOICE' | 'FILE',
    durationSeconds?: number,
  ) => {
    sendMessage.sendAttachment.mutate({
      clientMessageId: crypto.randomUUID(),
      type,
      file,
      durationSeconds,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMessage.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Mensagem apagada.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const retry = (message: ChatMessageView) => {
    if (message.type === 'TEXT' && message.body) {
      sendMessage.sendText.mutate({
        clientMessageId: message.clientMessageId,
        type: 'TEXT',
        body: message.body,
      });
    }
  };

  const days = groupMessagesByDay(chronological, timezone);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-line bg-surface/95 px-3 py-2.5 backdrop-blur-sm sm:px-4">
        <Link
          to="/app/chat"
          className="ds-focus-ring inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-2 hover:text-fg lg:hidden"
          aria-label="Voltar para conversas"
        >
          <ArrowLeft aria-hidden />
        </Link>

        {conversation.type === 'DIRECT' && conversation.peer ? (
          <span className="relative shrink-0">
            <Avatar src={conversation.peer.avatarUrl} name={conversation.peer.displayName} size="sm" />
            <PresenceDot presence={conversation.presence} size="sm" className="absolute -bottom-0.5 -right-0.5" />
          </span>
        ) : (
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-card-2 text-accent">
            <Users className="size-4" aria-hidden />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[13px] font-semibold text-fg">{conversation.title}</h2>
          <p className="flex items-center gap-1.5 truncate text-[10px] text-faint">
            {conversation.type === 'GROUP' ? (
              <>
                <Users className="size-3" aria-hidden />
                conversa do grupo
              </>
            ) : (
              <>
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    status === 'connected' ? 'bg-volt' : 'bg-amber',
                  )}
                  aria-hidden
                />
                {status === 'connected' ? 'ao vivo' : 'reconectando'}
              </>
            )}
          </p>
        </div>

        {conversation.groupId ? (
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to={`/app/groups/${conversation.groupId}`}>Abrir grupo</Link>
          </Button>
        ) : null}
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
        aria-live="polite"
        aria-label="Mensagens da conversa"
      >
        {messagesQuery.isLoading ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-14 w-2/3 rounded-2xl" />
            ))}
          </div>
        ) : messagesQuery.isError ? (
          <ErrorState error={messagesQuery.error} onRetry={() => void messagesQuery.refetch()} compact />
        ) : chronological.length === 0 ? (
          <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-3 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-line bg-card-2 text-volt">
              <MessageSquare className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-fg">Comece a conversa</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Envie uma mensagem, uma foto, um áudio ou um documento.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messagesQuery.hasNextPage ? (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void loadOlder()}
                  loading={messagesQuery.isFetchingNextPage}
                >
                  Carregar mensagens anteriores
                </Button>
              </div>
            ) : null}

            {days.map((day) => (
              <section key={day.key} className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-line" aria-hidden />
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                    {day.label}
                  </span>
                  <span className="h-px flex-1 bg-line" aria-hidden />
                </div>
                {day.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender.id === user?.id}
                    showSender={conversation.type === 'GROUP'}
                    timezone={timezone}
                    onDelete={setDeleteTarget}
                    onRetry={message.type === 'TEXT' ? retry : undefined}
                  />
                ))}
              </section>
            ))}

            {typing.length > 0 ? (
              <p className="px-2 text-[11px] text-faint" aria-live="polite">
                {typingLabel(typing)}
              </p>
            ) : null}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {newBelow ? (
        <div className="pointer-events-none relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
              setNewBelow(false);
            }}
            className="pointer-events-auto absolute -top-12 left-1/2 -translate-x-1/2 shadow-float"
          >
            <ArrowDown aria-hidden />
            Novas mensagens
          </Button>
        </div>
      ) : null}

      <MessageComposer
        disabled={messagesQuery.isError}
        sending={sendMessage.sendText.isPending || sendMessage.sendAttachment.isPending}
        onSendText={handleSendText}
        onSendAttachment={handleSendAttachment}
        onTyping={() => sendTyping(conversation.id)}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Apagar mensagem?"
        description="A mensagem será removida para todos os participantes."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void handleDelete()} loading={deleteMessage.isPending}>
              <Trash2 aria-hidden />
              Apagar
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-muted">
          Esta ação não pode ser desfeita. Os anexos também serão removidos.
        </p>
      </Modal>
    </div>
  );
}

function typingLabel(typing: Array<{ displayName: string }>): string {
  if (typing.length === 1) return `${typing[0].displayName} está digitando…`;
  if (typing.length === 2) return `${typing[0].displayName} e ${typing[1].displayName} estão digitando…`;
  return 'Várias pessoas estão digitando…';
}
