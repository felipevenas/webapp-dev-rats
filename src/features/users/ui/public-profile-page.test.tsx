// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { AppError } from '@/core/http/problem';
import type { PublicUser } from '@/core/types/api';
import { renderWithProviders } from '@/tests/test-utils';
import PublicProfilePage from './public-profile-page';

const mocks = vi.hoisted(() => ({
  profile: vi.fn(),
}));

vi.mock('@/features/users/data/use-public-profile', () => ({
  usePublicProfile: () => mocks.profile(),
}));

const profile: PublicUser = {
  id: 'user-1',
  username: 'ana',
  displayName: 'Ana Souza',
  avatarUrl: null,
  bio: 'Backend em Java.',
  location: 'São Paulo',
  websiteUrl: 'https://ana.dev',
  experienceLevel: 'PLENO',
  primaryStack: ['JAVA', 'SPRING'],
  createdAt: '2026-01-01T00:00:00Z',
  friendshipStatus: 'NONE',
  presence: null,
  friendsCount: 3,
};

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/app/users/:username" element={<PublicProfilePage />} />
    </Routes>,
    { route: '/app/users/ana' },
  );
}

describe('PublicProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the public profile without a presence line for non-friends', () => {
    mocks.profile.mockReturnValue({
      data: profile,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByRole('heading', { name: 'Ana Souza' })).toBeInTheDocument();
    expect(screen.getByText('@ana')).toBeInTheDocument();
    expect(screen.getByText('Sem conexão')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /ana.dev/ })[0]).toHaveAttribute(
      'href',
      'https://ana.dev/',
    );
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();

    //---- Presence is null: the UI must never fall back to "Offline".
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
    expect(screen.queryByText('Online agora')).not.toBeInTheDocument();
    expect(screen.queryByText('Ausente')).not.toBeInTheDocument();
  });

  it('shows presence only when the backend shares it with a friend', () => {
    mocks.profile.mockReturnValue({
      data: { ...profile, friendshipStatus: 'FRIENDS', presence: 'ONLINE' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('Online agora')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Amigos/ })).toBeInTheDocument();
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
  });

  it('renders a not-found state for a 404', () => {
    mocks.profile.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new AppError({
        status: 404,
        code: 'NOT_FOUND',
        title: 'Não encontrado',
        detail: 'Usuário não encontrado.',
      }),
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('Perfil não encontrado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para amigos' })).toHaveAttribute(
      'href',
      '/app/friends',
    );
  });
});
