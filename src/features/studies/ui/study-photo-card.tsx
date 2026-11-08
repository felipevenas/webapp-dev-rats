import { Camera, ExternalLink, Trash2 } from 'lucide-react';
import type { StudyPhoto } from '@/core/types/api';
import { formatFullDate } from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StudyPhotoCardProps {
  photo: StudyPhoto;
  onOpen: (photo: StudyPhoto) => void;
  onDelete?: (photo: StudyPhoto) => void;
  compact?: boolean;
}

export function StudyPhotoCard({ photo, onOpen, onDelete, compact = false }: StudyPhotoCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-card">
      <button
        type="button"
        onClick={() => onOpen(photo)}
        className="ds-focus-ring block w-full text-left"
        aria-label={`Abrir foto de ${photo.displayName} de ${formatFullDate(photo.activityDate)}`}
      >
        <div className={cn('relative w-full overflow-hidden bg-card-2', compact ? 'aspect-square' : 'aspect-[4/3]')}>
          {photo.imageUrl ? (
            <img
              src={photo.imageUrl}
              alt={photo.title || `Foto de estudo de ${photo.displayName}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-faint">
              <Camera className="size-7" aria-hidden />
            </span>
          )}
          <span className="absolute left-2 top-2">
            <Badge variant="volt" size="sm">
              dia válido
            </Badge>
          </span>
        </div>
      </button>

      <div className="space-y-2 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar src={photo.avatarUrl} name={photo.displayName} size="xs" />
          <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{photo.displayName}</span>
          <span className="shrink-0 font-mono text-[10px] text-faint">
            {formatFullDate(photo.activityDate)}
          </span>
        </div>

        {photo.title ? <p className="truncate text-[12px] font-medium text-fg">{photo.title}</p> : null}
        {photo.description ? (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted">{photo.description}</p>
        ) : null}

        <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
          {photo.commitUrl ? (
            <a
              href={photo.commitUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-w-0 items-center gap-1 truncate font-mono text-[10px] text-accent hover:underline"
            >
              <ExternalLink className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{photo.repositoryFullName ?? 'commit'}</span>
            </a>
          ) : (
            <span className="font-mono text-[10px] text-faint">
              {photo.repositoryFullName ?? 'estudo'}
            </span>
          )}
          {photo.canDelete && onDelete ? (
            <Button
              type="button"
              variant="danger-ghost"
              size="icon-sm"
              onClick={() => onDelete(photo)}
              aria-label="Excluir foto"
              title="Excluir foto"
            >
              <Trash2 aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
