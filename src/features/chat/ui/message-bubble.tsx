import { AlertCircle, Check, CheckCheck, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/core/lib/cn';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ChatMessageView } from '@/features/chat/domain/chat-message';
import { messageTime } from '@/features/chat/domain/chat-message';
import { AttachmentView } from '@/features/chat/ui/attachment-view';

interface MessageBubbleProps {
  message: ChatMessageView;
  isOwn: boolean;
  showSender: boolean;
  timezone: string;
  onDelete?: (message: ChatMessageView) => void;
  onRetry?: (message: ChatMessageView) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showSender,
  timezone,
  onDelete,
  onRetry,
}: MessageBubbleProps) {
  const canDelete = isOwn && !message.deleted && !message.id.startsWith('local-') && message.status !== 'sending';
  return (
    <div className={cn('group flex w-full items-end gap-2', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn ? (
        <Avatar
          src={message.sender.avatarUrl}
          name={message.sender.displayName}
          size="xs"
          className="mb-1"
        />
      ) : null}

      <div className={cn('flex max-w-[85%] flex-col gap-1 sm:max-w-[72%]', isOwn && 'items-end')}>
        {showSender && !isOwn ? (
          <p className="px-1 text-[10px] font-medium text-muted">{message.sender.displayName}</p>
        ) : null}

        <div
          className={cn(
            'relative min-w-0 rounded-2xl border px-3 py-2 shadow-[0_1px_0_rgba(0,0,0,0.04)]',
            isOwn
              ? 'rounded-br-md border-volt-line bg-volt-soft text-fg'
              : 'rounded-bl-md border-line bg-card text-fg',
            message.status === 'failed' && 'border-rose/50',
          )}
        >
          {message.deleted ? (
            <p className="text-[12px] italic text-faint">Mensagem apagada</p>
          ) : (
            <div className="space-y-2">
              {message.body ? (
                <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                  {message.body}
                </p>
              ) : null}
              {message.attachments.map((attachment) => (
                <AttachmentView
                  key={attachment.id}
                  attachment={attachment}
                  localUrl={message.localAttachmentUrl}
                />
              ))}
            </div>
          )}

          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete?.(message)}
              className="ds-focus-ring absolute -right-2 -top-2 hidden size-7 items-center justify-center rounded-full border border-line bg-surface text-faint shadow-sm transition-colors hover:text-rose group-hover:flex focus:flex"
              aria-label="Apagar mensagem"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className={cn('flex items-center gap-1 px-1 font-mono text-[9px] text-faint', isOwn && 'justify-end')}>
          {message.status === 'sending' ? (
            <span>enviando…</span>
          ) : message.status === 'failed' ? (
            <>
              <AlertCircle className="size-3 text-rose" aria-hidden />
              <span className="text-rose">não enviada</span>
              {onRetry ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6 text-rose"
                  onClick={() => onRetry(message)}
                  aria-label="Tentar enviar novamente"
                >
                  <RotateCcw className="size-3" aria-hidden />
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <span>{messageTime(message.createdAt, timezone)}</span>
              {isOwn ? <CheckCheck className="size-3 text-accent" aria-hidden /> : <Check className="size-3 opacity-0" aria-hidden />}
            </>
          )}
        </div>

        {message.status === 'sending' && message.progress != null ? (
          <div className="h-1 w-24 overflow-hidden rounded-full bg-line" aria-hidden>
            <div
              className="h-full rounded-full bg-volt transition-[width]"
              style={{ width: `${Math.max(5, message.progress)}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
