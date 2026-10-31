// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivityCommit } from '@/core/types/api';
import { progressApi } from './progress-api';
import { useActivityCommits } from './use-progress';

vi.mock('./progress-api', () => ({
  progressApi: { activityCommits: vi.fn() },
}));

const activityCommits = vi.mocked(progressApi.activityCommits);

const commits: ActivityCommit[] = [
  {
    sha: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    repositoryFullName: 'devrats/api',
    commitUrl: 'https://github.com/devrats/api/commit/a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
    committedAt: '2026-10-28T14:32:00Z',
    authorLogin: 'ana',
  },
];

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useActivityCommits', () => {
  beforeEach(() => {
    activityCommits.mockReset();
    activityCommits.mockResolvedValue(commits);
  });

  it('does not fetch without a selected day', () => {
    const { result } = renderHook(
      () => useActivityCommits('challenge-1', { userId: 'user-1', date: null }, true),
      { wrapper: createWrapper() },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(activityCommits).not.toHaveBeenCalled();
  });

  it('does not fetch when disabled for a non-valid day', () => {
    const { result } = renderHook(
      () => useActivityCommits('challenge-1', { userId: 'user-1', date: '2026-10-28' }, false),
      { wrapper: createWrapper() },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(activityCommits).not.toHaveBeenCalled();
  });

  it('fetches the commits of a valid day when enabled', async () => {
    const { result } = renderHook(
      () => useActivityCommits('challenge-1', { userId: 'user-1', date: '2026-10-28' }, true),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(activityCommits).toHaveBeenCalledWith('challenge-1', {
      userId: 'user-1',
      date: '2026-10-28',
    });
    expect(result.current.data).toEqual(commits);
  });
});
