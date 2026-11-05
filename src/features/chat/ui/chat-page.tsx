import { MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/core/lib/cn';
import { useAuth } from '@/core/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useChatConversation, useChatConversations } from '@/features/chat/data/use-chat';
import { ChatThreadSkeleton } from '@/features/chat/ui/chat-thread-skeleton';
import { ConversationList } from '@/features/chat/ui/conversation-list';
import { MessageThread } from '@/features/chat/ui/message-thread';
import { NewConversationDialog } from '@/features/chat/ui/new-conversation-dialog';

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [newOpen, setNewOpen] = useState(false);
  const conversations = useChatConversations(0, 100);
  const conversationQuery = useChatConversation(conversationId);

  const conversation =
    conversations.data?.content.find((item) => item.id === conversationId) ??
    conversationQuery.data;

  return (
    <div className="flex h-full min-h-0 bg-bg">
      <aside
        className={cn(
          'w-full shrink-0 border-r border-line bg-surface xl:w-[340px]',
          conversationId ? 'hidden xl:flex' : 'flex pb-20 lg:pb-0',
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

      <main className={cn('min-w-0 flex-1', conversationId ? 'flex' : 'hidden xl:flex')}>
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
          <ChatThreadSkeleton />
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
          <MessageThread key={conversation.id} conversation={conversation} />
        ) : null}
      </main>

      <NewConversationDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
