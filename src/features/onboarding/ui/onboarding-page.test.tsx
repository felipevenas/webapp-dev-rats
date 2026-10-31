// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Dashboard, GitHubStatus } from '@/core/types/api';
import { ThemeProvider } from '@/core/lib/theme';
import OnboardingPage from './onboarding-page';

const mocks = vi.hoisted(() => ({
  user: {
    id: 'user-1',
    displayName: 'Ana Rat',
    username: 'ana_rat',
    email: 'ana@devrats.dev',
    timezone: 'America/Sao_Paulo',
    bio: null,
    location: null,
    websiteUrl: null,
    experienceLevel: null,
    primaryStack: [] as string[],
    notifyDailyGoal: true,
    notifyMilestones: true,
    notifyChallengeUpdates: true,
    notifyIntegration: true,
    githubConnected: false,
    githubUsername: null,
    createdAt: '2026-10-01T12:00:00Z',
  },
  logout: vi.fn(),
  updateProfile: vi.fn(),
  startGitHubFlow: vi.fn(),
  status: {
    appConfigured: true,
    connected: false,
    githubUsername: null,
    githubUserId: null,
    installationCount: 0,
    repositoryCount: 0,
    permissions: [],
    connectedAt: null,
    lastSyncedAt: null,
    message: null,
  } as GitHubStatus,
  groups: [] as Dashboard['groups'],
}));

vi.mock('@/core/auth/auth-provider', () => ({
  useAuth: () => ({ user: mocks.user, logout: mocks.logout, setUser: vi.fn() }),
}));

vi.mock('@/features/github/data/use-github', () => ({
  useGitHubStatus: () => ({
    data: mocks.status,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/github/domain/connect', () => ({
  startGitHubFlow: mocks.startGitHubFlow,
}));

vi.mock('@/features/dashboard/data/use-dashboard', () => ({
  useDashboard: () => ({
    data: { groups: mocks.groups, github: mocks.status },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/profile/data/use-profile', () => ({
  useUpdateProfile: () => ({ mutateAsync: mocks.updateProfile, isPending: false }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function renderPage(initialEntry = '/onboarding') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ThemeProvider>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/app" element={<p>dashboard</p>} />
          <Route path="/app/groups/new" element={<p>novo desafio</p>} />
          <Route path="/login" element={<p>login</p>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    mocks.updateProfile.mockReset();
    mocks.updateProfile.mockResolvedValue(mocks.user);
    mocks.startGitHubFlow.mockReset();
    mocks.startGitHubFlow.mockResolvedValue(undefined);
    mocks.logout.mockReset();
    mocks.logout.mockResolvedValue(undefined);
    mocks.groups = [];
    mocks.status.appConfigured = true;
    mocks.status.connected = false;
    mocks.status.githubUsername = null;
    mocks.status.installationCount = 0;
    mocks.status.repositoryCount = 0;
  });

  it('renders the welcome step with the three core concepts', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Bem-vindo ao DevRats' })).toBeInTheDocument();
    expect(screen.getByText('Commit elegível')).toBeInTheDocument();
    expect(screen.getByText('Dia válido')).toBeInTheDocument();
    expect(screen.getByText('Streak e grupo')).toBeInTheDocument();
    expect(screen.getAllByText('Passo 1 de 5').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Entendi, vamos lá/ })).toBeInTheDocument();
  });

  it('advances to the profile step', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Entendi, vamos lá/ }));

    expect(screen.getByRole('heading', { name: 'Agora, quem é você?' })).toBeInTheDocument();
    expect(screen.getAllByText('Passo 2 de 5').length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox', { name: /Bio/ })).toBeInTheDocument();
  });

  it('saves the profile with useUpdateProfile before continuing', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /Entendi, vamos lá/ }));
    await user.type(screen.getByRole('textbox', { name: /Bio/ }), 'Backend em Java');
    await user.click(screen.getByRole('button', { name: /Salvar e continuar/ }));

    expect(mocks.updateProfile).toHaveBeenCalledTimes(1);
    expect(mocks.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        bio: 'Backend em Java',
        location: '',
        websiteUrl: '',
        experienceLevel: null,
        primaryStack: [],
      }),
    );
    expect(await screen.findByRole('heading', { name: 'Conecte seu GitHub' })).toBeInTheDocument();
  });

  it('skips the whole setup from the header and opens the dashboard', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Pular configuração' }));

    expect(await screen.findByText('dashboard')).toBeInTheDocument();
  });

  it('reopens on the GitHub step after OAuth instead of advancing automatically', async () => {
    mocks.status.connected = true;
    mocks.status.githubUsername = 'ana-dev';
    mocks.status.installationCount = 1;
    mocks.status.repositoryCount = 4;

    renderPage('/onboarding?step=github');

    expect(screen.getByRole('heading', { name: 'Conecte seu GitHub' })).toBeInTheDocument();
    expect(screen.getAllByText('Passo 3 de 5').length).toBeGreaterThan(0);
    expect(screen.getByText('@ana-dev')).toBeInTheDocument();
    expect(screen.getByText(/4 repositórios acessíveis/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gerenciar instalação/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Monte seu primeiro desafio' })).toBeNull();
  });

  it('offers the challenge creation route when the user has no group yet', async () => {
    const user = userEvent.setup();
    renderPage('/onboarding?step=challenge');

    await user.click(screen.getByRole('button', { name: /Criar meu primeiro desafio/ }));

    expect(await screen.findByText('novo desafio')).toBeInTheDocument();
  });
});
