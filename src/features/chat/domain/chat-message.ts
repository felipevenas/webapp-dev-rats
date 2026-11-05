import type { ChatMessage, ChatUserSummary, IsoInstant } from '@/core/types/api';

export type ChatMessageStatus = 'sending' | 'sent' | 'failed';

export interface ChatMessageView extends ChatMessage {
  status?: ChatMessageStatus;
  progress?: number;
  localAttachmentUrl?: string;
}

export function toChatMessageView(message: ChatMessage): ChatMessageView {
  return { ...message, status: 'sent' };
}

/** Ordena do mais novo para o mais antigo, que é a ordem usada pelo cache da API. */
export function sortNewestFirst(messages: ChatMessageView[]): ChatMessageView[] {
  return [...messages].sort((first, second) => {
    const byDate = second.createdAt.localeCompare(first.createdAt);
    return byDate !== 0 ? byDate : second.id.localeCompare(first.id);
  });
}

/**
 * Insere/substitui uma mensagem pelo `clientMessageId` (idempotência do envio)
 * ou pelo `id` (evento do WebSocket). O retorno mantém a ordem do cache.
 */
export function mergeMessage(
  messages: ChatMessageView[],
  incoming: ChatMessageView,
): ChatMessageView[] {
  const byClient = messages.findIndex(
    (message) => message.clientMessageId === incoming.clientMessageId,
  );
  if (byClient >= 0) {
    const next = [...messages];
    next[byClient] = { ...incoming, status: incoming.status ?? 'sent' };
    return sortNewestFirst(next);
  }
  if (messages.some((message) => message.id === incoming.id)) {
    return messages;
  }
  return sortNewestFirst([{ ...incoming, status: incoming.status ?? 'sent' }, ...messages]);
}

export function markMessageFailed(
  messages: ChatMessageView[],
  clientMessageId: string,
): ChatMessageView[] {
  return messages.map((message) =>
    message.clientMessageId === clientMessageId
      ? { ...message, status: 'failed', progress: undefined }
      : message,
  );
}

export function markMessageProgress(
  messages: ChatMessageView[],
  clientMessageId: string,
  progress: number,
): ChatMessageView[] {
  return messages.map((message) =>
    message.clientMessageId === clientMessageId ? { ...message, progress } : message,
  );
}

export function markMessageDeleted(messages: ChatMessageView[], messageId: string): ChatMessageView[] {
  return messages.map((message) =>
    message.id === messageId
      ? { ...message, deleted: true, body: null, attachments: [], status: 'sent' }
      : message,
  );
}

export interface MessageDay {
  key: string;
  label: string;
  messages: ChatMessageView[];
}

/** Recebe mensagens em ordem cronológica ascendente. */
export function groupMessagesByDay(messages: ChatMessageView[], timezone: string): MessageDay[] {
  const days: MessageDay[] = [];
  for (const message of messages) {
    const key = dayKey(message.createdAt, timezone);
    const current = days[days.length - 1];
    if (current?.key === key) {
      current.messages.push(message);
    } else {
      days.push({ key, label: dayLabel(message.createdAt, timezone), messages: [message] });
    }
  }
  return days;
}

export function dayKey(instant: IsoInstant, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(instant));
}

export function dayLabel(instant: IsoInstant, timezone: string): string {
  const date = new Date(instant);
  const today = dayKey(new Date().toISOString(), timezone);
  const yesterday = dayKey(new Date(Date.now() - 86_400_000).toISOString(), timezone);
  const key = dayKey(instant, timezone);
  if (key === today) return 'Hoje';
  if (key === yesterday) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date);
}

export function messageTime(instant: IsoInstant, timezone: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(instant));
}

export function conversationTime(instant: IsoInstant): string {
  const date = new Date(instant);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'ontem';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

export function previewText(instant: IsoInstant): string {
  const date = new Date(instant);
  const now = new Date();
  return date.toDateString() === now.toDateString()
    ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
    : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

export function messageTypeLabel(type: ChatMessage['type']): string {
  switch (type) {
    case 'IMAGE':
      return 'Imagem';
    case 'VOICE':
      return 'Mensagem de voz';
    case 'FILE':
      return 'Documento';
    default:
      return 'Mensagem';
  }
}

export function summaryOf(user: {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}): ChatUserSummary {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? null,
  };
}

export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
