import { MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/core/lib/cn';
import { useAuth } from '@/core/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatConversation, useChatConversations } from '@/features/chat/data/use-chat';
import { ConversationList } from '@/features/chat/ui/conversation-list';
import { MessageThread } from '@/features/chat/ui/message-thread';
import { NewConversationDialog } from '@/features/chat/ui/new-conversation-dialog';

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [newOpen, setNewOpen] = useState(false);
  const conversations = useChatConversations(0, 50);
  const conversationQuery = useChatConversation(conversationId);

  const conversation =
    conversations.data?.content.find((item) => item.id === conversationId) ??
    conversationQuery.data;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 bg-bg lg:h-dvh">
      <aside
        className={cn(
          'w-full shrink-0 border-r border-line bg-surface lg:w-[340px]',
          conversationId ? 'hidden lg:flex' : 'flex pb-20 lg:pb-0',
        )}
      >
        <ConversationList
          conversations={conversations.data?.content ?? []}
          activeId={conversationId}
          currentUserId={user?.id}
          loading={conversations.isLoading}
          error={conversations.isError ? conversations.error : undefined}
          onRetry={() => void conversations.refetch()}
          onNew={() => setNewOpen(true)}
        />
      </aside>

      <main className={cn('min-w-0 flex-1', conversationId ? 'flex' : 'hidden lg:flex')}>
        {!conversationId ? (
          <div className="flex h-full w-full items-center justify-center p-6">
            <EmptyState
              icon={MessageSquare}
              title="Suas conversas em um só lugar"
              description="Escolha uma conversa ao lado ou comece um chat privado com um amigo. O chat do grupo fica disponível na página de cada grupo."
              action={
                <Button onClick={() => setNewOpen(true)}>
                  <Plus aria-hidden />
                  Nova conversa
                </Button>
              }
              secondaryAction={
                <Button asChild variant="secondary">
                  <Link to="/app/friends">Ver amigos</Link>
                </Button>
              }
              className="max-w-lg"
            />
          </div>
        ) : conversationQuery.isLoading && !conversation ? (
          <div className="flex h-full w-full flex-col gap-3 p-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-2/3" />
            <Skeleton className="ml-auto h-16 w-1/2" />
            <Skeleton className="h-20 w-2/3" />
          </div>
        ) : conversationQuery.isError && !conversation ? (
          <div className="flex h-full w-full items-center justify-center p-6">
            <ErrorState
              error={conversationQuery.error}
              onRetry={() => void conversationQuery.refetch()}
              action={
                <Button asChild variant="secondary">
                  <Link to="/app/chat">Voltar para conversas</Link>
                </Button>
              }
              className="max-w-lg"
            />
          </div>
        ) : conversation ? (
          <MessageThread conversation={conversation} />
        ) : null}
      </main>

      <NewConversationDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
