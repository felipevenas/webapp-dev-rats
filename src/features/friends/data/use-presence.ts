import { useEffect } from 'react';
import { useAuth } from '@/core/auth/auth-provider';
import { friendsApi } from './friends-api';

export const PRESENCE_HEARTBEAT_MS = 60_000;

/**
 * Keeps `last_seen_at` fresh while the tab is visible and the session is authenticated.
 * Only the JWT identifies the user; the request carries no body and never stores PII.
 */
export function usePresenceHeartbeat() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'authenticated') return;

    let cancelled = false;

    const beat = () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      //---- Presence is best effort: failures must never disturb the UI.
      void friendsApi.heartbeat().catch(() => undefined);
    };

    beat();
    const interval = window.setInterval(beat, PRESENCE_HEARTBEAT_MS);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') beat();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [status]);
}
