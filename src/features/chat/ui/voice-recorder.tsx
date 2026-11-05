import { Mic, Square, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { audioExtension } from '@/features/chat/domain/attachment-rules';

interface VoiceRecorderProps {
  onRecorded: (file: File, durationSeconds: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onRecorded, onCancel }: VoiceRecorderProps) {
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const cancelledRef = useRef(false);
  const onRecordedRef = useRef(onRecorded);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onRecordedRef.current = onRecorded;
    onCancelRef.current = onCancel;
  }, [onCancel, onRecorded]);

  useEffect(() => {
    let active = true;
    let interval: number | null = null;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorderRef.current = recorder;
        chunksRef.current = [];
        startedAtRef.current = Date.now();

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        recorder.onstop = () => {
          const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          if (cancelledRef.current) return;
          const type = recorder.mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type });
          const extension = audioExtension(type);
          const file = new File([blob], `voz-${Date.now()}.${extension}`, { type });
          onRecordedRef.current(file, duration);
        };

        recorder.start();
        interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
      } catch {
        toast.error('Não foi possível acessar o microfone. Verifique a permissão do navegador.');
        onCancelRef.current();
      }
    };

    void start();

    return () => {
      active = false;
      if (interval != null) window.clearInterval(interval);
      cancelledRef.current = true;
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopAndSend = () => {
    cancelledRef.current = false;
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  const cancel = () => {
    cancelledRef.current = true;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    onCancel();
  };

  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-rose/30 bg-rose-soft/40 px-3 py-2">
      <span className="inline-flex size-3 animate-pulse rounded-full bg-rose" aria-hidden />
      <Mic className="size-4 text-rose" aria-hidden />
      <span className="font-mono text-[12px] text-fg" aria-live="polite">
        {formatSeconds(seconds)}
      </span>
      <span className="hidden flex-1 text-[11px] text-muted sm:inline">Gravando mensagem de voz…</span>
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={cancel}
          aria-label="Cancelar gravação"
        >
          <Trash2 aria-hidden />
        </Button>
        <Button size="sm" onClick={stopAndSend} aria-label="Enviar mensagem de voz">
          <Square aria-hidden />
          Enviar
        </Button>
      </div>
    </div>
  );
}

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
