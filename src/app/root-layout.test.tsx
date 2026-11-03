// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RootLayout } from './root-layout';

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('sonner', () => ({ toast: toastMock }));

vi.mock('@/components/feedback/navigation-progress', () => ({
  NavigationProgress: () => null,
}));

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname + location.search}</p>;
}

function renderRoot(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="*" element={<LocationProbe />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('GitHubCallbackCatcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    sessionStorage.clear();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('shows a success toast and returns to the stored route after github=connected', async () => {
    sessionStorage.setItem('ds-github-return', '/app/onboarding?step=github');

    renderRoot('/?github=connected');

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/app/onboarding?step=github'));
    expect(toastMock.success).toHaveBeenCalledWith('GitHub conectado. A verificação de commits está pronta.');
    expect(toastMock.error).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('ds-github-return')).toBeNull();
  });

  it('maps github=error&reason=access_denied to a friendly error toast', async () => {
    renderRoot('/?github=error&reason=access_denied');

    await waitFor(() => expect(toastMock.error).toHaveBeenCalledTimes(1));

    const message = String(toastMock.error.mock.calls[0]?.[0]);
    expect(message).toContain('cancelada');
    expect(message).not.toContain('access_denied');
    expect(toastMock.success).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/app/settings/integrations'));
  });

  it('drops the callback params and falls back when the stored returnTo is not a safe path', async () => {
    sessionStorage.setItem('ds-github-return', 'https://evil.example/app');

    renderRoot('/?github=connected');

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/app/settings/integrations'));
    expect(screen.getByTestId('location')).not.toHaveTextContent('github=');
    expect(screen.getByTestId('location')).not.toHaveTextContent('evil.example');
  });
});
