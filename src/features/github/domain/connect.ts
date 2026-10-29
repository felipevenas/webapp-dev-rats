import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { githubApi } from '@/features/github/data/github-api';

export type GitHubFlow = 'authorize' | 'install';

/** Starts the GitHub OAuth/install flow and remembers where to return after the redirect. */
export async function startGitHubFlow(flow: GitHubFlow, returnTo = '/app/settings/integrations') {
  try {
    sessionStorage.setItem('ds-github-return', returnTo);
    const url = flow === 'authorize' ? await githubApi.authorizeUrl() : await githubApi.installUrl();
    window.location.assign(url);
  } catch (error) {
    sessionStorage.removeItem('ds-github-return');
    toast.error(toAppError(error).detail);
  }
}
