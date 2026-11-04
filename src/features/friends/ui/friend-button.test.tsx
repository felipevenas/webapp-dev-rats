// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import { FriendButton } from './friend-button';

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  accept: vi.fn(),
  decline: vi.fn(),
  cancel: vi.fn(),
  remove: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock('@/features/friends/data/use-friends', () => ({
  useSendFriendRequest: () => ({ isPending: false, mutateAsync: mocks.send }),
  useAcceptFriendRequest: () => ({ isPending: false, mutateAsync: mocks.accept }),
  useDeclineFriendRequest: () => ({ isPending: false, mutateAsync: mocks.decline }),
  useCancelFriendRequest: () => ({ isPending: false, mutateAsync: mocks.cancel, variables: undefined }),
  useRemoveFriend: () => ({ isPending: false, mutateAsync: mocks.remove }),
  useFriendRequests: () => ({
    data: {
      content: [
        {
          id: 'request-1',
          user: { id: 'user-1', username: 'ana', displayName: 'Ana' },
          direction: 'RECEIVED',
          status: 'PENDING',
          createdAt: '2026-11-01T12:00:00Z',
        },
      ],
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1,
    },
    isLoading: false,
    refetch: mocks.refetch,
  }),
}));

const baseProps = {
  userId: 'user-1',
  username: 'ana',
  displayName: 'Ana Souza',
};

describe('FriendButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.send.mockResolvedValue(undefined);
    mocks.accept.mockResolvedValue(undefined);
    mocks.decline.mockResolvedValue(undefined);
    mocks.cancel.mockResolvedValue(undefined);
    mocks.remove.mockResolvedValue(undefined);
  });

  it('renders nothing for the current user', () => {
    const { container } = renderWithProviders(<FriendButton {...baseProps} status="SELF" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sends a request from the NONE state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FriendButton {...baseProps} status="NONE" />);

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await waitFor(() => expect(mocks.send).toHaveBeenCalledWith('ana'));
  });

  it('exposes the outgoing state as a static compact icon', () => {
    renderWithProviders(<FriendButton {...baseProps} status="PENDING_OUTGOING" compact />);

    expect(
      screen.getByRole('img', { name: 'Solicitação enviada para @ana' }),
    ).toBeInTheDocument();
  });

  it('shows an accessible compact icon for existing friends', () => {
    renderWithProviders(<FriendButton {...baseProps} status="FRIENDS" compact />);

    expect(screen.getByRole('img', { name: 'Você e @ana são amigos' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('accepts an incoming request using the request id', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FriendButton {...baseProps} status="PENDING_INCOMING" />);

    await user.click(screen.getByRole('button', { name: 'Aceitar' }));
    await waitFor(() => expect(mocks.accept).toHaveBeenCalledWith('request-1'));
  });

  it('declines an incoming request from the full state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FriendButton {...baseProps} status="PENDING_INCOMING" />);

    await user.click(screen.getByRole('button', { name: 'Recusar solicitação de Ana Souza' }));
    await waitFor(() => expect(mocks.decline).toHaveBeenCalledWith('request-1'));
  });

  it('renders the friends dropdown label in the full state', () => {
    renderWithProviders(<FriendButton {...baseProps} status="FRIENDS" />);

    expect(screen.getByRole('button', { name: /Amigos/ })).toBeInTheDocument();
  });

  it('renders the sent state with a cancel affordance in the full state', () => {
    renderWithProviders(<FriendButton {...baseProps} status="PENDING_OUTGOING" />);

    expect(screen.getByRole('button', { name: /Enviada/ })).toBeInTheDocument();
  });
});
