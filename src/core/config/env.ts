export const appName = 'DevRats';
// Empty means "/api/v1" (same-origin, proxied by Vite in development).
// In production point it to the API origin, e.g. https://api.devrats.app/api/v1
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const termsVersion = '1.0';
export const maxRepositories = 3;
export const maxTargetDays = 365;
export const supportEmail = 'contato@devrats.app';

interface LocationLike {
  protocol: string;
  host: string;
}

/**
 * Deriva a URL do WebSocket a partir da URL da API.
 *
 * Em desenvolvimento a API é relativa (`/api/v1`), então o socket usa a mesma
 * origem e o proxy do Vite encaminha `/ws`. Em produção, uma URL absoluta da API
 * vira `wss://host/ws`, sem reutilizar o path `/api/v1`.
 */
export function resolveWsUrl(apiBase: string, location: LocationLike | null): string {
  const configured = import.meta.env.VITE_WS_URL;
  if (configured) return configured;

  //---- Produção: o REST passa pelo rewrite da Vercel, mas o WebSocket vai direto para a API.
  if (location?.host === 'devrats.app' || location?.host === 'www.devrats.app') {
    return 'wss://api.devrats.app/ws';
  }

  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    const url = new URL(apiBase);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/ws';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  }

  const protocol = location?.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = location?.host ?? 'localhost:8080';
  return `${protocol}//${host}/ws`;
}

export const wsUrl = resolveWsUrl(
  apiBaseUrl,
  typeof window === 'undefined' ? null : window.location,
);
