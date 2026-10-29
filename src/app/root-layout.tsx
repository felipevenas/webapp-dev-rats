import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NavigationProgress } from '@/components/feedback/navigation-progress';

export function RootLayout() {
  return (
    <>
      <NavigationProgress />
      <ScrollToTop />
      <GitHubCallbackCatcher />
      <Outlet />
    </>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

/** The backend redirects OAuth flows to the frontend root with `?github=connected|installed`. */
function GitHubCallbackCatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get('github');
    if (!result) return;

    const returnTo = sessionStorage.getItem('ds-github-return') ?? '/app/settings/integrations';
    sessionStorage.removeItem('ds-github-return');

    if (result === 'connected') {
      toast.success('GitHub conectado. A verificação de commits está pronta.');
    } else if (result === 'installed') {
      toast.success('GitHub App instalada. Os repositórios serão sincronizados.');
    }

    navigate(returnTo.startsWith('/') ? returnTo : '/app/settings/integrations', { replace: true });
  }, [location.search, navigate]);

  return null;
}
