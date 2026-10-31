// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/core/types/api';
import { AVATAR_MAX_BYTES } from '@/features/profile/domain/avatar-image';
import { AvatarUploader } from './avatar-uploader';

const mocks = vi.hoisted(() => ({
  upload: { mutateAsync: vi.fn(), isPending: false },
  remove: { mutateAsync: vi.fn(), isPending: false },
}));

vi.mock('@/features/profile/data/use-profile', () => ({
  useUploadAvatar: () => mocks.upload,
  useDeleteAvatar: () => mocks.remove,
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const baseUser: User = {
  id: 'user-1',
  displayName: 'Felipe Silva',
  username: 'felipe',
  email: 'felipe@example.com',
  avatarUrl: null,
  timezone: 'America/Sao_Paulo',
  notifyDailyGoal: true,
  notifyMilestones: true,
  notifyChallengeUpdates: true,
  notifyIntegration: true,
  githubConnected: false,
  githubUsername: null,
  createdAt: '2025-01-01T00:00:00Z',
};

function renderUploader(user: User) {
  return render(<AvatarUploader user={user} />);
}

function selectFile(file: File) {
  const input = screen.getByLabelText('Escolher arquivo de foto de perfil');
  fireEvent.change(input, { target: { files: [file] } });
}

afterEach(cleanup);

beforeEach(() => {
  mocks.upload.mutateAsync.mockReset();
  mocks.remove.mutateAsync.mockReset();
  mocks.upload.isPending = false;
  mocks.remove.isPending = false;
});

describe('AvatarUploader', () => {
  it('mostra apenas "Alterar foto" quando não há avatar', () => {
    renderUploader(baseUser);

    expect(screen.getByRole('button', { name: /alterar foto/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /remover foto/i })).toBeNull();
  });

  it('mostra "Remover foto" quando há avatar do GitHub', () => {
    renderUploader({ ...baseUser, avatarUrl: 'https://avatars.githubusercontent.com/u/1' });

    expect(screen.getByRole('button', { name: /alterar foto/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /remover foto/i })).toBeTruthy();
  });

  it('valida o tipo do arquivo no cliente antes de enviar', async () => {
    renderUploader(baseUser);

    selectFile(new File(['conteudo'], 'avatar.gif', { type: 'image/gif' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('JPEG ou PNG');
    expect(mocks.upload.mutateAsync).not.toHaveBeenCalled();
  });

  it('valida o tamanho máximo de 2 MB no cliente', async () => {
    renderUploader(baseUser);

    selectFile(new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], 'grande.png', { type: 'image/png' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('no máximo 2 MB');
    expect(mocks.upload.mutateAsync).not.toHaveBeenCalled();
  });

  it('remove a foto ao confirmar a ação', async () => {
    mocks.remove.mutateAsync.mockResolvedValue({ ...baseUser, avatarUrl: null });
    renderUploader({ ...baseUser, avatarUrl: 'https://avatars.githubusercontent.com/u/1' });

    fireEvent.click(screen.getByRole('button', { name: /remover foto/i }));

    await waitFor(() => expect(mocks.remove.mutateAsync).toHaveBeenCalledTimes(1));
  });
});
