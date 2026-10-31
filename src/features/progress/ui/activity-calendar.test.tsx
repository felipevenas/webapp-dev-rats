// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivityCommit, ProgressEntry } from '@/core/types/api';
import {
  currentMonthKey,
  firstDayOfMonth,
  formatFullDate,
  lastDayOfMonth,
  todayInZone,
} from '@/core/lib/date';
import { useActivity, useActivityCommits } from '@/features/progress/data/use-progress';
import { ActivityCalendar } from './activity-calendar';

vi.mock('@/features/progress/data/use-progress', () => ({
  useActivity: vi.fn(),
  useActivityCommits: vi.fn(),
}));

const activityMock = vi.mocked(useActivity);
const commitsMock = vi.mocked(useActivityCommits);

const timezone = 'UTC';
const challengeId = 'challenge-1';
const userId = 'user-1';
const today = todayInZone(timezone);

const member: ProgressEntry = {
  participantId: 'participant-1',
  userId,
  displayName: 'Ana',
  username: 'ana',
  validDays: 1,
  targetValidDays: 30,
  percent: 3,
  currentStreak: 1,
  bestStreak: 1,
  rank: 1,
};

const commits: ActivityCommit[] = [
  {
    sha: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    repositoryFullName: 'devrats/api',
    commitUrl: 'https://github.com/devrats/api/commit/a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    committedAt: `${today}T14:32:00Z`,
    authorLogin: 'ana',
  },
  {
    sha: 'b2c3d4e5f60718293a4b5c6d7e8f90123456789',
    repositoryFullName: 'devrats/web',
    commitUrl: 'https://github.com/devrats/web/commit/b2c3d4e5f60718293a4b5c6d7e8f90123456789',
    committedAt: `${today}T18:05:00Z`,
    authorLogin: 'ana',
  },
];

function renderCalendar() {
  return render(
    <MemoryRouter>
      <ActivityCalendar
        challengeId={challengeId}
        timezone={timezone}
        members={[member]}
        currentUserId={userId}
      />
    </MemoryRouter>,
  );
}

async function selectValidDay() {
  const day = await screen.findByRole('gridcell', { name: `${formatFullDate(today)}, Dia válido` });
  await userEvent.click(day);
}

describe('ActivityCalendar commit list', () => {
  beforeEach(() => {
    activityMock.mockReset();
    commitsMock.mockReset();

    activityMock.mockReturnValue({
      data: {
        challengeId,
        userId,
        timezone,
        from: firstDayOfMonth(currentMonthKey(timezone)),
        to: lastDayOfMonth(currentMonthKey(timezone)),
        days: [{ date: today, status: 'VALID' }],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useActivity>);

    commitsMock.mockReturnValue({
      data: commits,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useActivityCommits>);
  });

  it('lists the commits only after a valid day is selected', async () => {
    renderCalendar();

    expect(screen.queryByText('Commits do dia')).toBeNull();
    expect(commitsMock).toHaveBeenLastCalledWith(
      challengeId,
      { userId, date: null },
      false,
    );

    await selectValidDay();

    expect(screen.getByText('Commits do dia')).toBeTruthy();
    expect(screen.getByText('Commit que validou o dia')).toBeTruthy();
    expect(commitsMock).toHaveBeenLastCalledWith(challengeId, { userId, date: today }, true);

    const link = screen.getByRole('link', { name: /Abrir commit a1b2c3d/ });
    expect(link.getAttribute('href')).toBe(commits[0]?.commitUrl);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer noopener');
    expect(within(link).getByText('a1b2c3d')).toBeTruthy();
    expect(within(link).getByText('devrats/api')).toBeTruthy();
    expect(within(link).getByText('14:32')).toBeTruthy();

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('b2c3d4e')).toBeTruthy();
  });

  it('shows a fallback when a valid day has no commits', async () => {
    commitsMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useActivityCommits>);

    renderCalendar();
    await selectValidDay();

    expect(screen.getByText(/Nenhum commit elegível encontrado para este dia/)).toBeTruthy();
    expect(screen.queryByText('Commit que validou o dia')).toBeNull();
  });
});
