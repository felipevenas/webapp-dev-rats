import { useEffect, useId, useRef, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toAppError } from '@/core/http/problem';
import { cn } from '@/core/lib/cn';
import type { User } from '@/core/types/api';
import {
  AVATAR_ACCEPT,
  AVATAR_MAX_LABEL,
  processAvatarImage,
  validateAvatarFile,
} from '@/features/profile/domain/avatar-image';
import { useDeleteAvatar, useUploadAvatar } from '@/features/profile/data/use-profile';

interface AvatarUploaderProps {
  user: User;
  className?: string;
}

export function AvatarUploader({ user, className }: AvatarUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = uploadAvatar.isPending || deleteAvatar.isPending;
  const canRemove = user.avatarSource === 'CUSTOM';

  //---- Every preview owns an object URL; release it as soon as it is replaced or unmounted.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = async (file: File | undefined) => {
    if (!file || busy) return;

    const validation = validateAvatarFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setError(null);

    let processed: File;
    try {
      processed = await processAvatarImage(file);
    } catch {
      setError('Não foi possível processar a imagem. Tente outra foto.');
      return;
    }

    setPreviewUrl(URL.createObjectURL(processed));
    try {
      await uploadAvatar.mutateAsync(processed);
      toast.success('Foto de perfil atualizada.');
    } catch (uploadError) {
      setError(toAppError(uploadError).detail);
    } finally {
      setPreviewUrl(null);
    }
  };

  const handleRemove = async () => {
    if (busy) return;
    setError(null);
    try {
      await deleteAvatar.mutateAsync();
      toast.success('Foto de perfil removida.');
    } catch (removeError) {
      setError(toAppError(removeError).detail);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="relative">
          <Avatar src={previewUrl ?? user.avatarUrl} name={user.displayName} size="2xl" ring />
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-bg/60">
              <Loader2 className="size-5 animate-spin text-fg" aria-hidden />
              <span className="sr-only">Processando foto de perfil</span>
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              loading={uploadAvatar.isPending}
              disabled={busy}
            >
              <Camera aria-hidden />
              Alterar foto
            </Button>
            {canRemove ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-rose hover:bg-rose-soft hover:text-rose"
                onClick={() => void handleRemove()}
                loading={deleteAvatar.isPending}
                disabled={busy}
              >
                <Trash2 aria-hidden />
                Remover foto
              </Button>
            ) : null}
          </div>
          <p className="text-[11px] text-faint">
            JPEG ou PNG, até {AVATAR_MAX_LABEL}. Sem foto, usamos o avatar do GitHub ou suas iniciais.
          </p>
        </div>
      </div>

      <label htmlFor={inputId} className="sr-only">
        Escolher arquivo de foto de perfil
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={AVATAR_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          void handleFile(file);
        }}
      />

      {error ? (
        <p role="alert" className="text-xs leading-relaxed text-rose">
          {error}
        </p>
      ) : null}
    </div>
  );
}
