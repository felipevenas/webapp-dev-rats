import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveWsUrl } from './env';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveWsUrl', () => {
  it('uses the current origin when the API is relative', () => {
    expect(resolveWsUrl('/api/v1', { protocol: 'http:', host: 'localhost:5174' })).toBe(
      'ws://localhost:5174/ws',
    );
  });

  it('derives wss from an absolute https API url', () => {
    expect(resolveWsUrl('https://api.devrats.app/api/v1', null)).toBe(
      'wss://api.devrats.app/ws',
    );
  });

  it('uses the production API host on the devrats.app domain', () => {
    expect(resolveWsUrl('/api/v1', { protocol: 'https:', host: 'devrats.app' })).toBe(
      'wss://api.devrats.app/ws',
    );
    expect(resolveWsUrl('/api/v1', { protocol: 'https:', host: 'www.devrats.app' })).toBe(
      'wss://api.devrats.app/ws',
    );
  });

  it('keeps a configured websocket url', () => {
    vi.stubEnv('VITE_WS_URL', 'wss://custom.example/ws');
    expect(resolveWsUrl('https://api.devrats.app/api/v1', null)).toBe('wss://custom.example/ws');
  });
});
