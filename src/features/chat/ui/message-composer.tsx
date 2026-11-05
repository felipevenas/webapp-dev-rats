import { ImagePlus, Mic, Paperclip, Send } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { acceptFor, validateAttachment } from '@/features/chat/domain/attachment-rules';
import { VoiceRecorder } from '@/features/chat/ui/voice-recorder';

interface MessageComposerProps {
  disabled?: boolean;
  sending?: boolean;
  onSendText: (body: string) => void;
  onSendAttachment: (file: File, type: 'IMAGE' | 'VOICE' | 'FILE', durationSeconds?: number) => void;
  onTyping: () => void;
}

const MAX_TEXT = 2000;
const TYPING_THROTTLE_MS = 2000;

export function MessageComposer({
  disabled,
  sending,
  onSendText,
  onSendAttachment,
  onTyping,
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTyping = useRef(0);

  //---- Grow the composer with the message, up to the CSS max-height.
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 128)}px`;
  }, [text]);

  const sendText = () => {
    const value = text.trim();
    if (!value || disabled || sending) return;
    onSendText(value);
    setText('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendText();
    }
  };

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastTyping.current >= TYPING_THROTTLE_MS) {
      lastTyping.current = now;
      onTyping();
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'FILE') => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const error = validateAttachment(file, type);
    if (error) {
      toast.error(error);
      return;
    }
    onSendAttachment(file, type);
  };

  const handleRecorded = (file: File, durationSeconds: number) => {
    const error = validateAttachment(file, 'VOICE', durationSeconds);
    if (error) {
      toast.error(error);
      setRecording(false);
      return;
    }
    onSendAttachment(file, 'VOICE', durationSeconds);
    setRecording(false);
  };

  if (recording) {
    return (
      <div className="border-t border-line bg-surface/95 px-3 py-3 backdrop-blur-sm sm:px-4">
        <VoiceRecorder onRecorded={handleRecorded} onCancel={() => setRecording(false)} />
      </div>
    );
  }

  return (
    <div className="ds-safe-bottom w-full min-w-0 border-t border-line bg-surface/95 px-3 py-3 backdrop-blur-sm sm:px-4">
      <div className="flex min-w-0 items-end gap-2">
        <input
          ref={imageInput}
          type="file"
          accept={acceptFor('IMAGE')}
          className="sr-only"
          onChange={(event) => handleFile(event, 'IMAGE')}
        />
        <input
          ref={fileInput}
          type="file"
          accept={acceptFor('FILE')}
          className="sr-only"
          onChange={(event) => handleFile(event, 'FILE')}
        />

        <div className="flex shrink-0 items-center gap-0.5">
          <div className="hidden items-center gap-0.5 sm:flex">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => imageInput.current?.click()}
              disabled={disabled || sending}
              aria-label="Enviar imagem"
            >
              <ImagePlus aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => fileInput.current?.click()}
              disabled={disabled || sending}
              aria-label="Enviar documento"
            >
              <Paperclip aria-hidden />
            </Button>
          </div>

          <div className="sm:hidden">
            <Dropdown
              align="start"
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled || sending}
                  aria-label="Anexar arquivo"
                >
                  <Paperclip aria-hidden />
                </Button>
              }
            >
              <DropdownItem icon={ImagePlus} onSelect={() => imageInput.current?.click()}>
                Imagem
              </DropdownItem>
              <DropdownItem icon={Paperclip} onSelect={() => fileInput.current?.click()}>
                Documento
              </DropdownItem>
            </Dropdown>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRecording(true)}
            disabled={disabled || sending}
            aria-label="Gravar mensagem de voz"
          >
            <Mic aria-hidden />
          </Button>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => {
            setText(event.target.value.slice(0, MAX_TEXT));
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Mensagem…"
          aria-label="Mensagem"
          disabled={disabled}
          className="ds-focus-ring max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-line bg-card px-3 py-2.5 text-[13px] leading-relaxed text-fg placeholder:text-faint disabled:opacity-60"
        />

        <Button
          size="icon"
          onClick={sendText}
          disabled={disabled || sending || !text.trim()}
          loading={sending}
          className="shrink-0"
          aria-label="Enviar mensagem"
        >
          <Send aria-hidden />
        </Button>
      </div>
      {text.length > MAX_TEXT - 100 ? (
        <p className="mt-1 text-right font-mono text-[9px] text-faint">
          {text.length}/{MAX_TEXT}
        </p>
      ) : null}
    </div>
  );
}
