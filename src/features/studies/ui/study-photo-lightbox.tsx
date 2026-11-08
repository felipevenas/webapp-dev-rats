import { ExternalLink, Trash2 } from 'lucide-react';
import type { StudyPhoto } from '@/core/types/api';
import { formatDateTime } from '@/core/lib/date';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface StudyPhotoLightboxProps {
  photo: StudyPhoto | null;
  timezone: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (photo: StudyPhoto) => void;
}

export function StudyPhotoLightbox({ photo, timezone, open, onOpenChange, onDelete }: StudyPhotoLightboxProps) {
  return (
    <Modal
      open={open && Boolean(photo)}
      onOpenChange={onOpenChange}
      title={photo?.title || 'Foto de estudo'}
      description={
        photo
          ? `${photo.displayName} · ${formatDateTime(photo.createdAt, timezone)}`
          : undefined
      }
      size="lg"
      footer={
        photo?.canDelete && onDelete ? (
          <Button
            variant="danger"
            onClick={() => {
              onDelete(photo);
              onOpenChange(false);
            }}
          >
            <Trash2 aria-hidden />
            Excluir foto
          </Button>
        ) : undefined
      }
    >
      {photo ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-line bg-card-2">
            {photo.imageUrl ? (
              <img
                src={photo.imageUrl}
                alt={photo.title || `Foto de estudo de ${photo.displayName}`}
                className="max-h-[60dvh] w-full object-contain"
              />
            ) : (
              <p className="p-6 text-center text-[12px] text-muted">
                A imagem expirou. Atualize a galeria para gerar um novo link.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Avatar src={photo.avatarUrl} name={photo.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{photo.displayName}</p>
              <p className="font-mono text-[10px] text-faint">@{photo.username}</p>
            </div>
            <Badge variant="volt">dia válido</Badge>
          </div>

          {photo.description ? (
            <p className="whitespace-pre-line text-[12px] leading-relaxed text-muted">{photo.description}</p>
          ) : null}

          {photo.commitUrl ? (
            <a
              href={photo.commitUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              {photo.repositoryFullName ?? 'Ver commit no GitHub'}
            </a>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
