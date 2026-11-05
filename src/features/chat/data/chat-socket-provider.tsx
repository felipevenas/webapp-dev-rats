import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/core/auth/auth-provider';
import { queryKeys } from '@/core/config/query-keys';
import type { ChatEvent, ChatMessage, ChatTyping, CursorPage } from '@/core/types/api';
import {
  mergeMessage,
  markMessageDeleted,
  type ChatMessageView,
} from '@/features/chat/domain/chat-message';
import { chatSocket, type ChatSocketStatus } from './chat-socket';

interface ChatSocketContextValue {
  status: ChatSocketStatus;
  sendTyping: (conversationId: string) => void;
  typingFor: (conversationId: string) => ChatTyping[];
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

type MessageCache = InfiniteData<CursorPage<ChatMessageView>>;

export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ChatSocketStatus>('idle');
  const [typing, setTyping] = useState<Record<string, ChatTyping[]>>({});
  const typingTimers = useRef<Map<string, number>>(new Map());

  const updateMessages = useCallback(
    (conversationId: string, updater: (messages: ChatMessageView[]) => ChatMessageView[]) => {
      queryClient.setQueryData<MessageCache>(
        queryKeys.chatMessages(conversationId),
        (current) => {
          if (!current || current.pages.length === 0) return current;
          const pages = current.pages.map((page, index) =>
            index === 0 ? { ...page, items: updater(page.items) } : page,
          );
          return { ...current, pages };
        },
      );
    },
    [queryClient],
  );

  const updateAllMessages = useCallback(
    (conversationId: string, updater: (messages: ChatMessageView[]) => ChatMessageView[]) => {
      queryClient.setQueryData<MessageCache>(
        queryKeys.chatMessages(conversationId),
        (current) => {
          if (!current || current.pages.length === 0) return current;
          return {
            ...current,
            pages: current.pages.map((page) => ({ ...page, items: updater(page.items) })),
          };
        },
      );
    },
    [queryClient],
  );

  const invalidateLists = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.chatConversations }),
      queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread }),
    ]);
  }, [queryClient]);

  const applyCreated = useCallback(
    (conversationId: string, message: ChatMessage) => {
      updateMessages(conversationId, (messages) =>
        mergeMessage(messages, { ...message, status: 'sent' }),
      );
      void invalidateLists();
    },
    [invalidateLists, updateMessages],
  );

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      chatSocket.disconnect();
      setStatus('idle');
      setTyping({});
      return;
    }
    chatSocket.connect();
    const offStatus = chatSocket.onStatus(setStatus);
    return () => {
      offStatus();
      chatSocket.disconnect();
    };
  }, [authStatus]);

  useEffect(() => {
    const off = chatSocket.onEvent((event: ChatEvent) => {
      if (event.type === 'MESSAGE_CREATED' && event.message) {
        applyCreated(event.conversationId, event.message);
      } else if (event.type === 'MESSAGE_DELETED' && event.messageId) {
        updateAllMessages(event.conversationId, (messages) =>
          markMessageDeleted(messages, event.messageId as string),
        );
        void invalidateLists();
      } else if (event.type === 'CONVERSATION_REVOKED') {
        queryClient.removeQueries({ queryKey: queryKeys.chatConversation(event.conversationId) });
        queryClient.removeQueries({ queryKey: queryKeys.chatMessages(event.conversationId) });
        void invalidateLists();
      } else if (event.type === 'TYPING' && event.typing) {
        const entry = event.typing;
        if (entry.userId === user?.id) return;
        setTyping((current) => {
          const existing = current[event.conversationId] ?? [];
          const others = existing.filter((value) => value.userId !== entry.userId);
          return { ...current, [event.conversationId]: [...others, entry] };
        });
        const key = `${event.conversationId}:${entry.userId}`;
        const existingTimer = typingTimers.current.get(key);
        if (existingTimer) window.clearTimeout(existingTimer);
        const delay = Math.max(500, new Date(entry.expiresAt).getTime() - Date.now());
        const timer = window.setTimeout(() => {
          typingTimers.current.delete(key);
          setTyping((current) => {
            const remaining = (current[event.conversationId] ?? []).filter(
              (value) => value.userId !== entry.userId,
            );
            if (remaining.length === 0) {
              const next = { ...current };
              delete next[event.conversationId];
              return next;
            }
            return { ...current, [event.conversationId]: remaining };
          });
        }, delay);
        typingTimers.current.set(key, timer);
      }
    });
    return off;
  }, [applyCreated, invalidateLists, queryClient, updateAllMessages, updateMessages, user?.id]);

  useEffect(() => {
    const timers = typingTimers.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const sendTyping = useCallback((conversationId: string) => {
    chatSocket.sendTyping(conversationId);
  }, []);

  const typingFor = useCallback(
    (conversationId: string) => typing[conversationId] ?? [],
    [typing],
  );

  const value = useMemo(
    () => ({ status, sendTyping, typingFor }),
    [status, sendTyping, typingFor],
  );

  return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
}

export function useChatSocket() {
  const context = useContext(ChatSocketContext);
  if (!context) throw new Error('useChatSocket deve ser usado dentro de ChatSocketProvider');
  return context;
}
