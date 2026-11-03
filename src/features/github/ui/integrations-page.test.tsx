// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GitHubRepository, GitHubStatus, PageResponse } from '@/core/types/api';
import { ThemeProvider } from '@/core/lib/theme';
import IntegrationsPage from './integrations-page';

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

const mocks = vi.hoisted(() => ({
  status: {
    appConfigured: true,
    connected: false,
    githubUsername: null,
    githubUserId: null,
    installationCount: 0,
    repositoryCount: 0,
    permissions: [] as string[],
    connectedAt: null,
    lastSyncedAt: null,
    message: null,
  } as GitHubStatus,
  repos: {
    data: null as PageResponse<GitHubRepository> | null,
    isLoading: false,
    isError: false,
    error: null as unknown,
    refetch: vi.fn(),
  },
  refetchStatus: vi.fn(),
  syncAsync: vi.fn(),
  syncPending: false,
  disconnectAsync: vi.fn(),
  refreshUser: vi.fn(),
  startGitHubFlow: vi.fn(),
}));

vi.mock('@/core/auth/auth-provider', () => ({
  useAuth: () => ({ refreshUser: mocks.refreshUser }),
}));

vi.mock('@/features/github/data/use-github', () => ({
  useGitHubStatus: () => ({
    data: mocks.status,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: mocks.refetchStatus,
  }),
  useRepositories: () => mocks.repos,
  useSyncRepositories: () => ({ mutateAsync: mocks.syncAsync, isPending: mocks.syncPending }),
  useDisconnectGitHub: () => ({ mutateAsync: mocks.disconnectAsync, isPending: false }),
}));

vi.mock('@/features/github/domain/connect', () => ({
  startGitHubFlow: mocks.startGitHubFlow,
}));

vi.mock('sonner', () => ({ toast: toastMock }));

const emptyPage: PageResponse<GitHubRepository> = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/app/settings/integrations']}>
      <ThemeProvider>
        <Routes>
          <Route path="/app/settings/integrations" element={<IntegrationsPage />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('IntegrationsPage', () => {
  beforeEach(() => {
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    mocks.repos.refetch.mockReset();
    mocks.repos.refetch.mockResolvedValue(undefined);
    mocks.refetchStatus.mockReset();
    mocks.refetchStatus.mockResolvedValue(undefined);
    mocks.syncAsync.mockReset();
    mocks.syncAsync.mockResolvedValue(undefined);
    mocks.syncPending = false;
    mocks.startGitHubFlow.mockReset();
    mocks.startGitHubFlow.mockResolvedValue(undefined);

    mocks.status.connected = false;
    mocks.status.githubUsername = null;
    mocks.status.installationCount = 0;
    mocks.status.repositoryCount = 0;
    mocks.repos.data = emptyPage;
  });

  it('offers to install the App when the account is authorized but has no installation', async () => {
    mocks.status.connected = true;
    mocks.status.githubUsername = 'ana-dev';
    const user = userEvent.setup();

    renderPage();

    expect(screen.queryByRole('button', { name: /Gerenciar instalação/ })).toBeNull();
    expect(screen.getByText('Falta instalar a GitHub App.')).toBeInTheDocument();
    expect(screen.getByText('GitHub App não instalada')).toBeInTheDocument();
    expect(screen.getByText(/A autorização da conta existe/)).toBeInTheDocument();

    const installButtons = screen.getAllByRole('button', { name: /Instalar nos repositórios/ });
    expect(installButtons.length).toBeGreaterThan(0);

    await user.click(installButtons[0]);

    expect(mocks.startGitHubFlow).toHaveBeenCalledWith('install', '/app/settings/integrations');
    expect(mocks.syncAsync).not.toHaveBeenCalled();
  });

  it('keeps "Gerenciar instalação" and the sync action when an installation exists', async () => {
    mocks.status.connected = true;
    mocks.status.githubUsername = 'ana-dev';
    mocks.status.installationCount = 2;
    const user = userEvent.setup();

    renderPage();

    expect(screen.queryByRole('button', { name: /Instalar nos repositórios/ })).toBeNull();
    expect(screen.queryByText('Falta instalar a GitHub App.')).toBeNull();

    const manage = screen.getByRole('button', { name: /Gerenciar instalação/ });
    await user.click(manage);
    expect(mocks.startGitHubFlow).toHaveBeenCalledWith('install', '/app/settings/integrations');

    await user.click(screen.getByRole('button', { name: /Sincronizar agora/ }));

    await waitFor(() => expect(toastMock.success).toHaveBeenCalledWith('Repositórios sincronizados.'));
    expect(mocks.syncAsync).toHaveBeenCalledTimes(1);
    expect(mocks.refetchStatus).toHaveBeenCalledTimes(1);
    expect(mocks.repos.refetch).toHaveBeenCalledTimes(1);
  });
});
