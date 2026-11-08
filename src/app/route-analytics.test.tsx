// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteAnalytics } from './route-analytics';

function NavigationProbe() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/app/groups/42')}>
      go to group
    </button>
  );
}

function renderApp(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <RouteAnalytics />
      <Routes>
        <Route path="*" element={<NavigationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RouteAnalytics', () => {
  const va = vi.fn();

  beforeEach(() => {
    va.mockReset();
    window.va = va;
  });

  it('reports the first page view for the current route', () => {
    renderApp('/');

    expect(va).toHaveBeenCalledWith('pageview', { route: '/', path: '/' });
  });

  it('reports every client-side navigation', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.click(screen.getByRole('button', { name: 'go to group' }));

    expect(va).toHaveBeenLastCalledWith('pageview', { route: '/app/groups/42', path: '/app/groups/42' });
  });
});
