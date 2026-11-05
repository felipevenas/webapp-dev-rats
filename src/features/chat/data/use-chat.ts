import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useAuth } from '@/core/auth/auth-provider';
import { queryKeys } from '@/core/config/query-keys';
import type { ChatMessage, Conversation, CursorPage, PageResponse } from '@/core/types/api';
import { chatApi, type CreateConversationPayload, type SendAttachmentPayload, type SendTextPayload } from './chat-api';
import {
  markMessageDeleted,
  markMessageFailed,
  markMessageProgress,
  mergeMessage,
  sortNewestFirst,
  summaryOf,
  type ChatMessageView,
} from '../domain/chat-message';

type MessageCache = InfiniteData<CursorPage<ChatMessageView>>;

export function useChatConversations(page = 0, size = 20) {
  return useQuery<PageResponse<Conversation>>({
    queryKey: [...queryKeys.chatConversations, page, size],
    queryFn: () => chatApi.listConversations(page, size),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

export function useChatConversation(conversationId?: string) {
  return useQuery({
    queryKey: queryKeys.chatConversation(conversationId ?? ''),
    queryFn: () => chatApi.getConversation(conversationId as string),
    enabled: Boolean(conversationId),
    staleTime: 15_000,
  });
}

export function useChatMessages(conversationId?: string) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: queryKeys.chatMessages(conversationId ?? ''),
    queryFn: async ({ pageParam }) => {
      const page = await chatApi.messages(conversationId as string, {
        before: pageParam as string | null,
        limit: 30,
      });
      if (pageParam) return page;
      //---- Refetch não pode apagar bolhas otimistas/falhas que ainda não voltaram do servidor.
      const cached = queryClient.getQueryData<MessageCache>(
        queryKeys.chatMessages(conversationId ?? ''),
      );
      const local = (cached?.pages[0]?.items ?? []).filter(
        (message) =>
          message.id.startsWith('local-') ||
          message.status === 'sending' ||
          message.status === 'failed',
      );
      if (local.length === 0) return page;
      const confirmed = new Set(page.items.map((message) => message.clientMessageId));
      const pending = local.filter((message) => !confirmed.has(message.clientMessageId));
      return pending.length === 0
        ? page
        : { ...page, items: sortNewestFirst([...pending, ...page.items]) };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: Boolean(conversationId),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useChatUnread() {
  return useQuery({
    queryKey: queryKeys.chatUnread,
    queryFn: chatApi.unreadCount,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConversationPayload) => chatApi.resolveConversation(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatConversations });
    },
  });
}

export function useMarkChatRead(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lastMessageId: string) => chatApi.markRead(conversationId, lastMessageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatConversations });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread });
    },
  });
}

export function useDeleteChatMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => chatApi.deleteMessage(messageId),
    onSuccess: (_result, messageId) => {
      queryClient.setQueryData<MessageCache>(queryKeys.chatMessages(conversationId), (current) => {
        if (!current) return current;
        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: markMessageDeleted(page.items, messageId),
          })),
        };
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatConversations });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread });
    },
  });
}

interface OptimisticInput {
  conversationId: string;
  clientMessageId: string;
  type: 'TEXT' | 'IMAGE' | 'VOICE' | 'FILE';
  body?: string | null;
  file?: File;
  durationSeconds?: number;
  localUrl?: string;
}

function useOptimisticCache(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const add = (input: OptimisticInput) => {
    if (!user) return;
    const optimistic: ChatMessageView = {
      id: `local-${input.clientMessageId}`,
      conversationId: input.conversationId,
      sender: summaryOf(user),
      type: input.type,
      body: input.body ?? null,
      clientMessageId: input.clientMessageId,
      createdAt: new Date().toISOString(),
      deleted: false,
      status: 'sending',
      progress: input.file ? 0 : undefined,
      attachments: input.file
        ? [
            {
              id: `local-attachment-${input.clientMessageId}`,
              kind: input.type === 'TEXT' ? 'FILE' : input.type,
              fileName: input.file.name,
              contentType: input.file.type || 'application/octet-stream',
              sizeBytes: input.file.size,
              durationSeconds: input.durationSeconds ?? null,
              url: input.localUrl ?? null,
              urlExpiresAt: null,
            },
          ]
        : [],
    };
    queryClient.setQueryData<MessageCache>(queryKeys.chatMessages(conversationId), (current) => {
      if (!current || current.pages.length === 0) return current;
      return {
        ...current,
        pages: current.pages.map((page, index) =>
          index === 0 ? { ...page, items: mergeMessage(page.items, optimistic) } : page,
        ),
      };
    });
  };

  const replace = (message: ChatMessage) => {
    queryClient.setQueryData<MessageCache>(queryKeys.chatMessages(conversationId), (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page, index) =>
          index === 0
            ? {
                ...page,
                items: mergeMessage(page.items, { ...message, status: 'sent' }),
              }
            : page,
        ),
      };
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.chatConversations });
    void queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread });
  };

  const fail = (clientMessageId: string) => {
    queryClient.setQueryData<MessageCache>(queryKeys.chatMessages(conversationId), (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page, index) =>
          index === 0
            ? { ...page, items: markMessageFailed(page.items, clientMessageId) }
            : page,
        ),
      };
    });
  };

  const progress = (clientMessageId: string, value: number) => {
    queryClient.setQueryData<MessageCache>(queryKeys.chatMessages(conversationId), (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page, index) =>
          index === 0
            ? { ...page, items: markMessageProgress(page.items, clientMessageId, value) }
            : page,
        ),
      };
    });
  };

  return { add, replace, fail, progress };
}

export function useSendChatMessage(conversationId: string) {
  const optimistic = useOptimisticCache(conversationId);

  const sendText = useMutation({
    mutationFn: (payload: SendTextPayload) => chatApi.sendText(conversationId, payload),
    onMutate: async (payload) => {
      optimistic.add({
        conversationId,
        clientMessageId: payload.clientMessageId,
        type: 'TEXT',
        body: payload.body,
      });
    },
    onSuccess: (message) => optimistic.replace(message),
    onError: (_error, payload) => optimistic.fail(payload.clientMessageId),
  });

  const sendAttachment = useMutation({
    mutationFn: (payload: SendAttachmentPayload) =>
      chatApi.sendAttachment(conversationId, {
        ...payload,
        onProgress: (value) => optimistic.progress(payload.clientMessageId, value),
      }),
    onMutate: async (payload) => {
      optimistic.add({
        conversationId,
        clientMessageId: payload.clientMessageId,
        type: payload.type,
        body: payload.body ?? null,
        file: payload.file,
        durationSeconds: payload.durationSeconds,
        localUrl: URL.createObjectURL(payload.file),
      });
    },
    onSuccess: (message) => optimistic.replace(message),
    onError: (_error, payload) => optimistic.fail(payload.clientMessageId),
  });

  return { sendText, sendAttachment };
}
