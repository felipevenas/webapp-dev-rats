import { describe, expect, it } from 'vitest';
import type { ChatMessage } from '@/core/types/api';
import {
  groupMessagesByDay,
  markMessageDeleted,
  mergeMessage,
  sortNewestFirst,
  type ChatMessageView,
} from './chat-message';

const sender = {
  id: 'user-1',
  username: 'ana',
  displayName: 'Ana',
  avatarUrl: null,
};

function message(overrides: Partial<ChatMessageView> = {}): ChatMessageView {
  const base: ChatMessage = {
    id: 'message-1',
    conversationId: 'conversation-1',
    sender,
    type: 'TEXT',
    body: 'oi',
    clientMessageId: 'client-1',
    createdAt: '2026-11-04T12:00:00Z',
    deleted: false,
    attachments: [],
  };
  return { ...base, ...overrides };
}

describe('chat message cache helpers', () => {
  it('replaces an optimistic message by clientMessageId', () => {
    const optimistic = message({ id: 'local-client-1', status: 'sending' });
    const confirmed = message({ id: 'message-1', status: 'sent' });

    const result = mergeMessage([optimistic], confirmed);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('message-1');
    expect(result[0].status).toBe('sent');
  });

  it('does not duplicate a message already confirmed by id', () => {
    const confirmed = message();
    const result = mergeMessage([confirmed], confirmed);
    expect(result).toHaveLength(1);
  });

  it('keeps the newest first', () => {
    const older = message({ id: 'old', clientMessageId: 'old', createdAt: '2026-11-04T10:00:00Z' });
    const newer = message({ id: 'new', clientMessageId: 'new', createdAt: '2026-11-04T11:00:00Z' });
    const result = sortNewestFirst([older, newer]);
    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('clears body and attachments when a message is deleted', () => {
    const withAttachment = message({
      attachments: [
        {
          id: 'attachment-1',
          kind: 'IMAGE',
          contentType: 'image/jpeg',
          sizeBytes: 10,
        },
      ],
    });
    const result = markMessageDeleted([withAttachment], withAttachment.id);
    expect(result[0].deleted).toBe(true);
    expect(result[0].body).toBeNull();
    expect(result[0].attachments).toEqual([]);
  });

  it('groups messages by day in chronological order', () => {
    const first = message({ id: '1', clientMessageId: '1', createdAt: '2026-11-03T23:00:00Z' });
    const second = message({ id: '2', clientMessageId: '2', createdAt: '2026-11-04T10:00:00Z' });
    const third = message({ id: '3', clientMessageId: '3', createdAt: '2026-11-04T12:00:00Z' });

    const days = groupMessagesByDay([first, second, third], 'UTC');

    expect(days).toHaveLength(2);
    expect(days[0].messages.map((item) => item.id)).toEqual(['1']);
    expect(days[1].messages.map((item) => item.id)).toEqual(['2', '3']);
  });
});
