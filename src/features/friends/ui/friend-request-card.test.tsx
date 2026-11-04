// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { FriendRequest } from '@/core/types/api';
import { renderWithProviders } from '@/tests/test-utils';
import { FriendRequestCard } from './friend-request-card';

const received: FriendRequest = {
  id: 'request-1',
  direction: 'RECEIVED',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
  user: {
    id: 'user-1',
    username: 'ana',
    displayName: 'Ana Souza',
    avatarUrl: null,
  },
};

const sent: FriendRequest = { ...received, id: 'request-2', direction: 'SENT' };

describe('FriendRequestCard', () => {
  it('accepts and declines a received request', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    const onDecline = vi.fn();

    renderWithProviders(
      <FriendRequestCard request={received} onAccept={onAccept} onDecline={onDecline} />,
    );

    expect(screen.getByText('quer adicionar você', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Aceitar' }));
    expect(onAccept).toHaveBeenCalledWith(received);

    await user.click(screen.getByRole('button', { name: 'Recusar' }));
    expect(onDecline).toHaveBeenCalledWith(received);
  });

  it('cancels a sent request', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    renderWithProviders(<FriendRequestCard request={sent} onCancel={onCancel} />);

    expect(screen.getByText('Aguardando')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar solicitação' }));
    expect(onCancel).toHaveBeenCalledWith(sent);
  });

  it('links the requester to the public profile', () => {
    renderWithProviders(<FriendRequestCard request={received} />);

    expect(screen.getByRole('link', { name: 'Ana Souza' })).toHaveAttribute(
      'href',
      '/app/users/ana',
    );
  });
});
