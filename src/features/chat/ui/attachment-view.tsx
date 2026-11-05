import { Download, FileText, ImageOff, Loader2, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ChatAttachment } from '@/core/types/api';
import { Modal } from '@/components/ui/modal';
import { chatApi } from '@/features/chat/data/chat-api';
import { fileSizeLabel } from '@/features/chat/domain/chat-message';

interface AttachmentViewProps {
  attachment: ChatAttachment;
  localUrl?: string | null;
}

export function AttachmentView({ attachment, localUrl }: AttachmentViewProps) {
  const [src, setSrc] = useState<string | null>(localUrl ?? attachment.url ?? null);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setSrc(localUrl ?? attachment.url ?? null);
  }, [attachment.url, localUrl]);

  const refresh = async () => {
    if (refreshing || !attachment.id || attachment.id.startsWith('local-')) return;
    setRefreshing(true);
    try {
      const refreshed = await chatApi.refreshAttachmentUrl(attachment.id);
      if (refreshed.url) setSrc(refreshed.url);
    } catch {
      //---- Mantém o placeholder; a próxima abertura do thread tenta de novo.
    } finally {
      setRefreshing(false);
    }
  };

  const downloadFile = async () => {
    if (localUrl) {
      window.open(localUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setDownloading(true);
    try {
      //---- Sempre renova: o link assinado pode ter expirado enquanto a thread estava aberta.
      const refreshed = await chatApi.refreshAttachmentUrl(attachment.id);
      if (refreshed.url) {
        setSrc(refreshed.url);
        window.open(refreshed.url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setSrc(null);
    } finally {
      setDownloading(false);
    }
  };

  if (attachment.kind === 'IMAGE') {
    return (
      <>
        {src ? (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="ds-focus-ring block max-w-full overflow-hidden rounded-xl border border-line/60"
            aria-label={`Abrir imagem ${attachment.fileName ?? ''}`}
          >
            <img
              src={src}
              alt={attachment.fileName ? `Imagem enviada: ${attachment.fileName}` : 'Imagem enviada'}
              loading="lazy"
              decoding="async"
              onError={() => void refresh()}
              className="max-h-72 w-auto max-w-full object-contain"
            />
          </button>
        ) : (
          <div className="flex h-36 w-56 items-center justify-center rounded-xl border border-dashed border-line bg-card-2 text-faint">
            {refreshing ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImageOff className="size-5" aria-hidden />}
            <span className="sr-only">Imagem indisponível</span>
          </div>
        )}
        <Modal
          open={lightbox}
          onOpenChange={setLightbox}
          title={attachment.fileName ?? 'Imagem'}
          size="lg"
        >
          {src ? (
            <img src={src} alt={attachment.fileName ?? 'Imagem enviada'} className="max-h-[75dvh] w-full object-contain" />
          ) : null}
        </Modal>
      </>
    );
  }

  if (attachment.kind === 'VOICE') {
    return (
      <div className="min-w-56 max-w-full space-y-1">
        <audio
          controls
          preload="metadata"
          src={src ?? undefined}
          onError={() => void refresh()}
          className="h-10 w-full max-w-xs"
        >
          Seu navegador não suporta áudio.
        </audio>
        <p className="flex items-center gap-1 font-mono text-[10px] text-faint">
          <Play className="size-3" aria-hidden />
          {formatDuration(attachment.durationSeconds)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex max-w-xs items-center gap-2.5 rounded-xl border border-line bg-card-2/80 p-2.5">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-accent">
        <FileText className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-fg">{attachment.fileName ?? 'Documento'}</p>
        <p className="font-mono text-[10px] text-faint">{fileSizeLabel(attachment.sizeBytes)}</p>
      </div>
      <button
        type="button"
        onClick={() => void downloadFile()}
        disabled={downloading}
        className="ds-focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card hover:text-fg disabled:opacity-60"
        aria-label={`Baixar ${attachment.fileName ?? 'documento'}`}
      >
        {downloading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Download className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return 'mensagem de voz';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
