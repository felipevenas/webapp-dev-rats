import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GITHUB_RETURN_TO,
  gitHubCallbackErrorMessage,
  readGitHubCallback,
  resolveGitHubReturnTo,
} from './callback';

describe('readGitHubCallback', () => {
  it('returns the success message used after the account authorization', () => {
    expect(readGitHubCallback('connected', null)).toEqual({
      kind: 'connected',
      message: 'GitHub conectado. A verificação de commits está pronta.',
    });
  });

  it('returns the success message used after the App installation', () => {
    expect(readGitHubCallback('installed', null)).toEqual({
      kind: 'installed',
      message: 'GitHub App instalada. Os repositórios serão sincronizados.',
    });
  });

  it('maps access_denied to a friendly message instead of the raw code', () => {
    const outcome = readGitHubCallback('error', 'access_denied');

    expect(outcome?.kind).toBe('error');
    expect(outcome?.message).toContain('cancelada');
    expect(outcome?.message).not.toContain('access_denied');
  });

  it('ignores unknown github values', () => {
    expect(readGitHubCallback('something-else', null)).toBeNull();
    expect(readGitHubCallback(null, null)).toBeNull();
  });
});

describe('gitHubCallbackErrorMessage', () => {
  it.each([
    ['access_denied'],
    ['invalid_state'],
    ['not_connected'],
    ['conflict'],
    ['installation_not_owned'],
  ])('maps the known reason %s to a non-empty message', (reason) => {
    const message = gitHubCallbackErrorMessage(reason);

    expect(message.length).toBeGreaterThan(0);
    expect(message).not.toContain(reason);
  });

  it('uses a generic message for unknown or missing reasons', () => {
    const generic = gitHubCallbackErrorMessage('unexpected_reason');

    expect(gitHubCallbackErrorMessage(undefined)).toBe(generic);
    expect(gitHubCallbackErrorMessage('')).toBe(generic);
    expect(generic).not.toContain('unexpected_reason');
  });

  it('normalizes casing and surrounding whitespace', () => {
    expect(gitHubCallbackErrorMessage('  ACCESS_DENIED ')).toBe(
      gitHubCallbackErrorMessage('access_denied'),
    );
  });

  it('never renders HTML from the reason parameter', () => {
    expect(gitHubCallbackErrorMessage('<img src=x onerror=alert(1)>')).not.toContain('<img');
  });
});

describe('resolveGitHubReturnTo', () => {
  it('keeps same-app paths, including their query string', () => {
    expect(resolveGitHubReturnTo('/app/settings/integrations')).toBe('/app/settings/integrations');
    expect(resolveGitHubReturnTo('/app/onboarding?step=github')).toBe('/app/onboarding?step=github');
  });

  it.each([
    ['absolute url', 'https://evil.example/app'],
    ['protocol-relative url', '//evil.example/app'],
    ['backslash trick', '/\\evil.example/app'],
    ['relative path', 'app/settings'],
    ['empty', ''],
    ['null', null],
  ])('falls back for %s', (_label, candidate) => {
    expect(resolveGitHubReturnTo(candidate)).toBe(DEFAULT_GITHUB_RETURN_TO);
  });

  it('uses the provided fallback', () => {
    expect(resolveGitHubReturnTo('https://evil.example', '/app')).toBe('/app');
  });
});
