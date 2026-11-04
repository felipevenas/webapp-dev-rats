// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import { UserSearch } from './user-search';

const mocks = vi.hoisted(() => ({
  search: vi.fn((_query: string) => ({
    data: [
      {
        id: 'user-1',
        username: 'ana',
        displayName: 'Ana Souza',
        avatarUrl: null,
        friendshipStatus: 'NONE' as const,
      },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/features/users/data/use-public-profile', () => ({
  useUserSearch: (query: string) => mocks.search(query),
}));

describe('UserSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.search.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces the query before calling the search hook', () => {
    renderWithProviders(<UserSearch />);
    const input = screen.getByLabelText('Buscar pessoas por nome de usuário');

    fireEvent.change(input, { target: { value: 'an' } });

    //---- The hook only receives the settled value after the 300 ms debounce.
    expect(mocks.search).not.toHaveBeenCalledWith('an');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mocks.search).toHaveBeenCalledWith('an');
  });

  it('renders results with a link to the public profile', () => {
    renderWithProviders(<UserSearch />);
    const input = screen.getByLabelText('Buscar pessoas por nome de usuário');

    fireEvent.change(input, { target: { value: 'ana' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getAllByText('Ana Souza').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Ana Souza/ })).toHaveAttribute(
      'href',
      '/app/users/ana',
    );
    expect(screen.getByRole('button', { name: 'Adicionar Ana Souza' })).toBeInTheDocument();
  });
});
