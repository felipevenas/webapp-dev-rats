export const DEFAULT_GITHUB_RETURN_TO = '/app/settings/integrations';
export const GITHUB_RETURN_STORAGE_KEY = 'ds-github-return';

type GitHubCallbackOutcome =
  | { kind: 'connected' | 'installed'; message: string }
  | { kind: 'error'; message: string };

const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'A autorização no GitHub foi cancelada. Nenhum dado foi alterado.',
  invalid_state: 'A sessão de conexão expirou. Tente conectar novamente.',
  not_connected: 'Nenhuma conta do GitHub está conectada. Conecte antes de instalar a App.',
  conflict: 'Este GitHub já está vinculado a outra conta do DevRats.',
  installation_not_owned: 'Esta instalação do GitHub pertence a outra conta. Instale a App na sua conta.',
};

const GENERIC_ERROR_MESSAGE =
  'Não foi possível concluir a integração com o GitHub. Tente novamente em instantes.';

/** Maps a backend `reason` code to a friendly message. Unknown codes never leak to the UI. */
export function gitHubCallbackErrorMessage(reason: string | null | undefined): string {
  const normalized = reason?.trim().toLowerCase() ?? '';
  return CALLBACK_ERROR_MESSAGES[normalized] ?? GENERIC_ERROR_MESSAGE;
}

/** Interprets the `github`/`reason` query params used by the OAuth callback redirect. */
export function readGitHubCallback(
  result: string | null | undefined,
  reason: string | null | undefined,
): GitHubCallbackOutcome | null {
  if (result === 'connected') {
    return { kind: 'connected', message: 'GitHub conectado. A verificação de commits está pronta.' };
  }
  if (result === 'installed') {
    return { kind: 'installed', message: 'GitHub App instalada. Os repositórios serão sincronizados.' };
  }
  if (result === 'error') {
    return { kind: 'error', message: gitHubCallbackErrorMessage(reason) };
  }
  return null;
}

/**
 * Only same-app absolute paths are accepted, so the callback can't be used as an open redirect.
 * Protocol-relative paths (`//host`) and backslash variants are rejected too.
 */
export function resolveGitHubReturnTo(
  candidate: string | null | undefined,
  fallback = DEFAULT_GITHUB_RETURN_TO,
): string {
  const value = candidate?.trim();
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  return value;
}
