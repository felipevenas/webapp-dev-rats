import { Camera, ImagePlus, Upload, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { formatFullDate } from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import type { StudyPhoto } from '@/core/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/controls';
import { Field, Input, Textarea } from '@/components/ui/input';
import { useRepositories } from '@/features/github/data/use-github';
import {
  STUDY_PHOTO_ACCEPT,
  STUDY_PHOTO_MAX_LABEL,
  normalizeStudyPhotoImage,
  validateStudyPhotoFile,
} from '@/features/studies/domain/study-photo-image';
import { useDeleteStudyPhoto, usePublishStudyPhoto } from '@/features/studies/data/use-studies';

interface StudyPhotoUploaderProps {
  challengeId: string;
  todayPhoto: StudyPhoto | null;
  active: boolean;
}

export function StudyPhotoUploader({ challengeId, todayPhoto, active }: StudyPhotoUploaderProps) {
  const { user } = useAuth();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const publish = usePublishStudyPhoto(challengeId);
  const remove = useDeleteStudyPhoto(challengeId);
  const repositories = useRepositories(
    { query: '', page: 0, size: 100 },
    Boolean(user?.githubConnected),
  );

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryId, setRepositoryId] = useState('');
  const [commitUrl, setCommitUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    setRepositoryId('');
    setCommitUrl('');
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = (selected: File | undefined) => {
    if (!selected) return;
    const validation = validateStudyPhotoFile(selected);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Escolha uma foto primeiro.');
      return;
    }
    setError(null);
    setProgress(0);
    try {
      const normalized = await normalizeStudyPhotoImage(file);
      await publish.mutateAsync({
        file: normalized,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        githubRepositoryId: repositoryId || undefined,
        commitUrl: commitUrl.trim() || undefined,
        onProgress: setProgress,
      });
      toast.success('Foto publicada. O dia de hoje foi validado.');
      reset();
    } catch (uploadError) {
      setError(toAppError(uploadError).detail);
    }
  };

  const handleDelete = async () => {
    if (!todayPhoto) return;
    try {
      await remove.mutateAsync(todayPhoto.id);
      toast.success('Foto removida. Publique outra para validar o dia.');
      reset();
    } catch (deleteError) {
      toast.error(toAppError(deleteError).detail);
    }
  };

  if (!active) {
    return null;
  }

  if (todayPhoto) {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Camera className="size-4 text-accent" aria-hidden />
            Foto de hoje publicada
          </CardTitle>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
            {formatFullDate(todayPhoto.activityDate)}
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full overflow-hidden rounded-xl border border-line bg-card-2 sm:w-56">
            {todayPhoto.imageUrl ? (
              <img
                src={todayPhoto.imageUrl}
                alt={todayPhoto.title || 'Sua foto de estudo de hoje'}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <span className="flex aspect-[4/3] items-center justify-center text-faint">
                <Camera className="size-6" aria-hidden />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-[13px] font-medium">
              {todayPhoto.title || 'Dia validado com sua foto de estudo.'}
            </p>
            {todayPhoto.description ? (
              <p className="line-clamp-3 text-[11px] leading-relaxed text-muted">{todayPhoto.description}</p>
            ) : null}
            <p className="text-[11px] leading-relaxed text-muted">
              Uma foto por dia. Se quiser trocar, exclua a de hoje e publique outra.
            </p>
            <Button
              variant="danger-ghost"
              size="sm"
              onClick={() => void handleDelete()}
              loading={remove.isPending}
            >
              <X aria-hidden />
              Excluir e reenviar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-1 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Camera className="size-4 text-accent" aria-hidden />
          Sua foto de hoje
        </CardTitle>
        <p className="text-[11px] leading-relaxed text-muted">
          Tire uma foto estudando e publique. O dia vale 1 dia válido, uma vez por dia.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={STUDY_PHOTO_ACCEPT}
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            handleFile(selected);
          }}
        />
        <label htmlFor={inputId} className="sr-only">
          Escolher foto de estudo
        </label>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'ds-focus-ring relative flex w-full overflow-hidden rounded-xl border border-dashed transition-colors',
            previewUrl ? 'border-volt-line bg-card-2' : 'border-line-strong bg-card-2/60 hover:border-volt-line',
          )}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Prévia da foto selecionada" className="aspect-[16/9] w-full object-cover" />
          ) : (
            <span className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-card text-accent">
                <ImagePlus className="size-5" aria-hidden />
              </span>
              <span className="text-[13px] font-medium">Escolher ou tirar foto</span>
              <span className="text-[11px] text-faint">
                JPEG ou PNG, até {STUDY_PHOTO_MAX_LABEL}. No celular abre a câmera.
              </span>
            </span>
          )}
          {previewUrl ? (
            <span className="absolute bottom-2 right-2 rounded-lg bg-bg/80 px-2 py-1 text-[10px] font-medium text-fg backdrop-blur">
              Trocar foto
            </span>
          ) : null}
        </button>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Título" htmlFor="study-photo-title" optional hint={`${title.length}/120`}>
            <Input
              id="study-photo-title"
              value={title}
              maxLength={120}
              placeholder="Ex.: Estudando para a certificação"
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field
            label="Descrição"
            htmlFor="study-photo-description"
            optional
            hint={`${description.length}/500`}
          >
            <Textarea
              id="study-photo-description"
              value={description}
              maxLength={500}
              rows={2}
              placeholder="O que você está estudando hoje?"
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
        </div>

        {user?.githubConnected ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Repositório"
              htmlFor="study-photo-repository"
              optional
              hint="contexto, não pontua"
            >
              <Select
                id="study-photo-repository"
                value={repositoryId}
                onChange={(event) => setRepositoryId(event.target.value)}
              >
                <option value="">Nenhum</option>
                {(repositories.data?.content ?? []).map((repository) => (
                  <option key={repository.id} value={repository.id}>
                    {repository.fullName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="URL do commit"
              htmlFor="study-photo-commit"
              optional
              hint="contexto, não pontua"
            >
              <Input
                id="study-photo-commit"
                value={commitUrl}
                maxLength={500}
                disabled={!repositoryId}
                placeholder="https://github.com/usuario/repo/commit/..."
                onChange={(event) => setCommitUrl(event.target.value)}
              />
            </Field>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-lg border border-rose/30 bg-rose-soft p-3 text-[12px] leading-relaxed text-rose">
            {error}
          </p>
        ) : null}

        {publish.isPending ? (
          <div className="space-y-1.5" aria-live="polite">
            <div className="h-1.5 overflow-hidden rounded-full bg-card-2">
              <div
                className="h-full rounded-full bg-volt transition-[width] duration-200"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
            <p className="text-right font-mono text-[10px] text-faint">{progress}%</p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] leading-relaxed text-faint">
            A foto fica visível para o grupo. Você pode excluir e reenviar enquanto o desafio estiver ativo.
          </p>
          <Button onClick={() => void handleSubmit()} loading={publish.isPending} disabled={!file}>
            <Upload aria-hidden />
            Publicar foto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
