import { createBrowserRouter } from 'react-router-dom';
import { RequireAnonymous, RequireAuth } from '@/core/auth/guards';
import { AppShell } from '@/components/layout/app-shell';
import { SplashScreen } from '@/components/feedback/splash-screen';
import { RootLayout } from '@/app/root-layout';
import { RouteErrorBoundary } from '@/features/errors/ui/route-error';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    hydrateFallbackElement: <SplashScreen />,
    children: [
      {
        path: '/',
        lazy: async () => ({
          Component: (await import('@/features/landing/ui/landing-page')).default,
        }),
      },
      {
        element: <RequireAnonymous />,
        children: [
          {
            path: '/login',
            lazy: async () => ({ Component: (await import('@/features/auth/ui/login-page')).default }),
          },
          {
            path: '/register',
            lazy: async () => ({ Component: (await import('@/features/auth/ui/register-page')).default }),
          },
          {
            path: '/forgot-password',
            lazy: async () => ({
              Component: (await import('@/features/auth/ui/forgot-password-page')).default,
            }),
          },
          {
            path: '/reset-password',
            lazy: async () => ({
              Component: (await import('@/features/auth/ui/reset-password-page')).default,
            }),
          },
        ],
      },
      {
        path: '/invites/:token',
        lazy: async () => ({ Component: (await import('@/features/invites/ui/invite-page')).default }),
      },
      {
        path: '/termos',
        lazy: async () => ({ Component: (await import('@/features/legal/ui/terms-page')).default }),
      },
      {
        path: '/privacidade',
        lazy: async () => ({ Component: (await import('@/features/legal/ui/privacy-page')).default }),
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: '/onboarding',
            lazy: async () => ({ Component: (await import('@/features/onboarding/ui/onboarding-page')).default }),
          },
          {
            element: <AppShell />,
            children: [
              {
                path: '/app',
                lazy: async () => ({ Component: (await import('@/features/dashboard/ui/dashboard-page')).default }),
              },
              {
                path: '/app/challenges',
                lazy: async () => ({
                  Component: (await import('@/features/challenges/ui/challenges-page')).default,
                }),
              },
              {
                path: '/app/groups/new',
                lazy: async () => ({
                  Component: (await import('@/features/challenges/ui/create-challenge-page')).default,
                }),
              },
              {
                path: '/app/groups/:groupId',
                lazy: async () => ({ Component: (await import('@/features/groups/ui/group-page')).default }),
              },
              {
                path: '/app/groups/:groupId/settings',
                lazy: async () => ({
                  Component: (await import('@/features/groups/ui/group-settings-page')).default,
                }),
              },
              {
                path: '/app/notifications',
                lazy: async () => ({
                  Component: (await import('@/features/notifications/ui/notifications-page')).default,
                }),
              },
              {
                path: '/app/profile',
                lazy: async () => ({ Component: (await import('@/features/profile/ui/profile-page')).default }),
              },
              {
                path: '/app/settings/integrations',
                lazy: async () => ({
                  Component: (await import('@/features/github/ui/integrations-page')).default,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/403',
        lazy: async () => ({
          Component: (await import('@/features/errors/ui/error-pages')).ForbiddenPage,
        }),
      },
      {
        path: '*',
        lazy: async () => ({
          Component: (await import('@/features/errors/ui/error-pages')).NotFoundPage,
        }),
      },
    ],
  },
]);
