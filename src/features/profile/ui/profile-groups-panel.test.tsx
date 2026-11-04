// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DashboardGroup } from '@/core/types/api';
import { ProfileGroupsPanel } from './profile-groups-panel';

const groups: DashboardGroup[] = [
  {
    groupId: 'group-1',
    groupName: 'Constância 2026',
    challengeId: 'challenge-1',
    challengeStatus: 'ACTIVE',
    targetValidDays: 60,
    validDays: 42,
    percent: 70,
    currentStreak: 9,
    bestStreak: 14,
    rank: 2,
    lastValidDate: '2026-11-03',
    startsAt: '2026-09-01T03:00:00Z',
    endsAt: '2026-12-01T03:00:00Z',
  },
  {
    groupId: 'group-2',
    groupName: 'Rats de Produto',
    challengeId: 'challenge-2',
    challengeStatus: 'ACTIVE',
    targetValidDays: 30,
    validDays: 12,
    percent: 40,
    currentStreak: 3,
    bestStreak: 6,
    rank: 5,
    lastValidDate: '2026-11-02',
    startsAt: '2026-10-15T03:00:00Z',
    endsAt: '2026-11-15T03:00:00Z',
  },
  {
    groupId: 'group-3',
    groupName: 'Open Source Squad',
    challengeId: 'challenge-3',
    challengeStatus: 'COMPLETED',
    targetValidDays: 21,
    validDays: 21,
    percent: 100,
    currentStreak: 0,
    bestStreak: 21,
    rank: 1,
    lastValidDate: '2026-10-20',
    startsAt: '2026-09-20T03:00:00Z',
    endsAt: '2026-10-21T03:00:00Z',
  },
  {
    groupId: 'group-4',
    groupName: 'Algoritmos e Café',
    challengeId: 'challenge-4',
    challengeStatus: 'EXPIRED',
    targetValidDays: 42,
    validDays: 18,
    percent: 43,
    currentStreak: 0,
    bestStreak: 5,
    rank: 7,
    lastValidDate: '2026-10-01',
    startsAt: '2026-08-01T03:00:00Z',
    endsAt: '2026-09-15T03:00:00Z',
  },
];

function renderPanel(overrides: Partial<Parameters<typeof ProfileGroupsPanel>[0]> = {}) {
  return render(
    <MemoryRouter>
      <ProfileGroupsPanel groups={groups} isLoading={false} isError={false} onRetry={vi.fn()} {...overrides} />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('ProfileGroupsPanel', () => {
  it('resume os grupos e limita os cards visíveis no banner', () => {
    renderPanel();

    expect(screen.getByText('93')).toBeTruthy();
    expect(screen.getByText('21d')).toBeTruthy();
    expect(screen.getByText('Constância 2026')).toBeTruthy();
    expect(screen.getByText('Open Source Squad')).toBeTruthy();
    expect(screen.queryByText('Algoritmos e Café')).toBeNull();
    expect(screen.getByText(/\+1 grupo/)).toBeTruthy();
  });

  it('expõe o progresso de cada grupo como barra acessível', () => {
    renderPanel();

    const progress = screen.getByRole('progressbar', {
      name: 'Constância 2026: 42 de 60 dias válidos',
    });
    expect(progress.getAttribute('aria-valuenow')).toBe('70');
  });

  it('mostra o estado vazio quando ainda não há grupos', () => {
    renderPanel({ groups: [] });

    expect(screen.getByText(/ainda não participa de nenhum grupo/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /criar o primeiro desafio/i })).toBeTruthy();
    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  it('usa placeholder nos totais enquanto os grupos carregam', () => {
    renderPanel({ groups: [], isLoading: true });

    expect(screen.getAllByText('—')).toHaveLength(3);
    expect(screen.queryByText('0d')).toBeNull();
  });

  it('permite tentar novamente quando a lista falha', () => {
    const onRetry = vi.fn();
    renderPanel({ groups: [], isError: true, onRetry });

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
