// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import { FriendRequestActions } from './friend-request-actions';

const mocks = vi.hoisted(() => ({
  accept: vi.fn(),
  decline: vi.fn(),
  markRead: vi.fn(),
}));

vi.mock('@/features/friends/data/use-friends', () => ({
  useAcceptFriendRequest: () => ({ isPending: false, mutateAsync: mocks.accept }),
  useDeclineFriendRequest: () => ({ isPending: false, mutateAsync: mocks.decline }),
}));

vi.mock('@/features/notifications/data/use-notifications', () => ({
  useMarkNotificationRead: () => ({ mutateAsync: mocks.markRead }),
}));

describe('FriendRequestActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.accept.mockResolvedValue(undefined);
    mocks.decline.mockResolvedValue(undefined);
    mocks.markRead.mockResolvedValue(undefined);
  });

  it('accepts, marks the notification as read and hides the actions', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <FriendRequestActions
        notificationId="notification-1"
        friendshipId="friendship-1"
        displayName="Ana Souza"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Aceitar' }));

    await waitFor(() => expect(mocks.accept).toHaveBeenCalledWith('friendship-1'));
    expect(mocks.markRead).toHaveBeenCalledWith('notification-1');
    expect(await screen.findByText(/Solicitação aceita/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aceitar' })).not.toBeInTheDocument();
  });

  it('declines and resolves the inline card', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <FriendRequestActions notificationId="notification-2" friendshipId="friendship-2" />,
    );

    await user.click(screen.getByRole('button', { name: 'Recusar' }));

    await waitFor(() => expect(mocks.decline).toHaveBeenCalledWith('friendship-2'));
    expect(mocks.markRead).toHaveBeenCalledWith('notification-2');
    expect(await screen.findByText(/Solicitação recusada/)).toBeInTheDocument();
  });
});
