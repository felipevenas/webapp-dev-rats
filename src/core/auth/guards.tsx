import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth/auth-provider';
import { SplashScreen } from '@/components/feedback/splash-screen';

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'booting') return <SplashScreen />;
  if (status === 'anonymous') {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return <Outlet />;
}

export function RequireAnonymous() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'booting') return <SplashScreen />;
  if (status === 'authenticated') {
    const params = new URLSearchParams(location.search);
    const next = params.get('next');
    //---- A brand-new account lands on the connection checklist, not straight in the dashboard.
    const fallback = location.pathname === '/register' ? '/onboarding' : '/app';
    return <Navigate to={next && next.startsWith('/') && !next.startsWith('//') ? next : fallback} replace />;
  }
  return <Outlet />;
}
