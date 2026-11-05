import { api } from '@/core/http/api-client';
import type {
  ChatAttachment,
  ChatMessage,
  Conversation,
  CursorPage,
  PageResponse,
} from '@/core/types/api';

export interface CreateConversationPayload {
  type: 'DIRECT' | 'GROUP';
  userId?: string;
  groupId?: string;
}

export interface SendTextPayload {
  clientMessageId: string;
  type: 'TEXT';
  body: string;
}

export interface SendAttachmentPayload {
  clientMessageId: string;
  type: 'IMAGE' | 'VOICE' | 'FILE';
  body?: string;
  durationSeconds?: number;
  file: File;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export const chatApi = {
  async listConversations(page = 0, size = 20): Promise<PageResponse<Conversation>> {
    const response = await api.get<PageResponse<Conversation>>('/chat/conversations', {
      params: { page, size },
    });
    return response.data;
  },

  async resolveConversation(payload: CreateConversationPayload): Promise<Conversation> {
    const response = await api.post<Conversation>('/chat/conversations', payload);
    return response.data;
  },

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await api.get<Conversation>(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  async messages(
    conversationId: string,
    params: { before?: string | null; limit?: number } = {},
  ): Promise<CursorPage<ChatMessage>> {
    const response = await api.get<CursorPage<ChatMessage>>(
      `/chat/conversations/${conversationId}/messages`,
      { params: { before: params.before ?? undefined, limit: params.limit ?? 30 } },
    );
    return response.data;
  },

  async sendText(conversationId: string, payload: SendTextPayload): Promise<ChatMessage> {
    const response = await api.post<ChatMessage>(
      `/chat/conversations/${conversationId}/messages`,
      payload,
    );
    return response.data;
  },

  async sendAttachment(
    conversationId: string,
    payload: SendAttachmentPayload,
  ): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append('clientMessageId', payload.clientMessageId);
    formData.append('type', payload.type);
    if (payload.body) formData.append('body', payload.body);
    if (payload.durationSeconds != null) {
      formData.append('durationSeconds', String(payload.durationSeconds));
    }
    formData.append('file', payload.file);

    const response = await api.post<ChatMessage>(
      `/chat/conversations/${conversationId}/messages/attachments`,
      formData,
      {
        timeout: 120_000,
        signal: payload.signal,
        onUploadProgress: (event) => {
          if (event.total) {
            payload.onProgress?.(Math.round((event.loaded / event.total) * 100));
          }
        },
      },
    );
    return response.data;
  },

  async markRead(conversationId: string, lastMessageId: string): Promise<void> {
    await api.post(`/chat/conversations/${conversationId}/read`, { lastMessageId });
  },

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/chat/messages/${messageId}`);
  },

  async unreadCount(): Promise<number> {
    const response = await api.get<{ total: number }>('/chat/unread-count');
    return response.data.total;
  },

  async refreshAttachmentUrl(attachmentId: string): Promise<ChatAttachment> {
    const response = await api.get<{ url: string; expiresAt: string }>(
      `/chat/attachments/${attachmentId}/url`,
    );
    return {
      id: attachmentId,
      kind: 'FILE',
      contentType: 'application/octet-stream',
      sizeBytes: 0,
      url: response.data.url,
      urlExpiresAt: response.data.expiresAt,
    };
  },
};
