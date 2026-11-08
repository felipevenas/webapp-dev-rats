import { useState } from 'react';
import { Camera, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import type { GroupMember, StudyPhoto } from '@/core/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/controls';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteStudyPhoto, useStudyPhotos } from '@/features/studies/data/use-studies';
import { StudyPhotoCard } from '@/features/studies/ui/study-photo-card';
import { StudyPhotoLightbox } from '@/features/studies/ui/study-photo-lightbox';

interface StudyPhotoGalleryProps {
  challengeId: string;
  members: GroupMember[];
  currentUserId: string;
  timezone: string;
}

export function StudyPhotoGallery({
  challengeId,
  members,
  currentUserId,
  timezone,
}: StudyPhotoGalleryProps) {
  const [page, setPage] = useState(0);
  const [memberId, setMemberId] = useState('all');
  const [selected, setSelected] = useState<StudyPhoto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StudyPhoto | null>(null);
  const query = useStudyPhotos(challengeId, {
    userId: memberId === 'all' ? undefined : memberId,
    page,
    size: 12,
  });
  const remove = useDeleteStudyPhoto(challengeId);

  const photos = query.data?.content ?? [];
  const totalPages = query.data?.totalPages ?? 0;

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      toast.success('Foto excluída. O dia foi recalculado.');
      setPendingDelete(null);
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Camera className="size-4 text-accent" aria-hidden />
            Galeria do grupo
          </CardTitle>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Cada foto publicada vale um dia. As imagens são privadas do grupo e os links expiram.
          </p>
        </div>
        <Select
          value={memberId}
          onChange={(event) => {
            setMemberId(event.target.value);
            setPage(0);
          }}
          aria-label="Filtrar fotos por participante"
          className="h-9 w-full text-[12px] sm:w-52"
        >
          <option value="all">Todos os participantes</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.userId === currentUserId ? `${member.displayName} (você)` : member.displayName}
            </option>
          ))}
        </Select>
      </CardHeader>

      <CardContent className="space-y-4">
        {query.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <Skeleton key={index} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
        ) : photos.length === 0 ? (
          <EmptyState
            icon={Users}
            compact
            title="Nenhuma foto publicada"
            description="As fotos de estudo do grupo aparecem aqui assim que forem publicadas."
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo) => (
                <StudyPhotoCard
                  key={photo.id}
                  photo={photo}
                  onOpen={setSelected}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={query.data?.totalElements}
              pageSize={12}
              onPageChange={setPage}
            />
          </>
        )}
      </CardContent>

      <StudyPhotoLightbox
        photo={selected}
        timezone={timezone}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onDelete={setPendingDelete}
      />

      <Modal
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Excluir foto?"
        description="O dia correspondente será recalculado e a foto será removida do armazenamento."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleConfirmDelete()}
              loading={remove.isPending}
            >
              <Trash2 aria-hidden />
              Excluir foto
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-muted">
          Se esta foto for a única evidência do dia, o dia deixa de ser válido. A ação não pode ser desfeita.
        </p>
      </Modal>
    </Card>
  );
}
