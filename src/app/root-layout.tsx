import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NavigationProgress } from '@/components/feedback/navigation-progress';
import { RouteAnalytics } from '@/app/route-analytics';
import {
  GITHUB_RETURN_STORAGE_KEY,
  readGitHubCallback,
  resolveGitHubReturnTo,
} from '@/features/github/domain/callback';

export function RootLayout() {
  return (
    <>
      <RouteAnalytics />
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
      //---- O hash do reset (#token=...) não é um seletor CSS válido; getElementById evita exceção.
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

/** The backend redirects OAuth flows to the frontend root with `?github=connected|installed|error`. */
function GitHubCallbackCatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get('github');
    if (!result) return;

    const outcome = readGitHubCallback(result, params.get('reason'));
    const returnTo = resolveGitHubReturnTo(sessionStorage.getItem(GITHUB_RETURN_STORAGE_KEY));
    sessionStorage.removeItem(GITHUB_RETURN_STORAGE_KEY);

    if (outcome?.kind === 'error') {
      toast.error(outcome.message);
    } else if (outcome) {
      toast.success(outcome.message);
    }

    // Navigating to the stored route also drops the `github`/`reason` params from the URL.
    navigate(returnTo, { replace: true });
  }, [location.search, navigate]);

  return null;
}
