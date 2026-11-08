import { Camera } from 'lucide-react';
import type { StudyPhoto } from '@/core/types/api';
import { formatFullDate } from '@/core/lib/date';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudyPhotos } from '@/features/studies/data/use-studies';

interface StudyPhotoDayProps {
  challengeId: string;
  userId: string;
  date: string;
}

export function StudyPhotoDay({ challengeId, userId, date }: StudyPhotoDayProps) {
  const query = useStudyPhotos(challengeId, { userId, date, size: 4 }, Boolean(date));
  const photos: StudyPhoto[] = query.data?.content ?? [];

  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="ds-label">Foto do dia</p>
      {query.isLoading ? (
        <Skeleton className="mt-2 h-20 rounded-lg" />
      ) : query.isError ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} className="mt-2" />
      ) : photos.length === 0 ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Nenhuma foto registrada para este dia.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {photos.map((photo) => (
            <li key={photo.id} className="flex gap-2.5 rounded-lg border border-line bg-card p-2">
              <span className="size-14 shrink-0 overflow-hidden rounded-md bg-card-2">
                {photo.imageUrl ? (
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || `Foto de ${photo.displayName}`}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-faint">
                    <Camera className="size-4" aria-hidden />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <Avatar src={photo.avatarUrl} name={photo.displayName} size="xs" />
                  <span className="truncate text-[11px] font-medium">{photo.displayName}</span>
                </span>
                <span className="mt-1 block truncate text-[11px] text-fg">
                  {photo.title || 'Foto de estudo'}
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <Badge variant="volt" size="sm">
                    dia válido
                  </Badge>
                  <span className="font-mono text-[9px] text-faint">
                    {formatFullDate(photo.activityDate)}
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
