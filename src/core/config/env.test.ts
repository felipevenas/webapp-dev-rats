import { describe, expect, it } from 'vitest';
import { resolveWsUrl } from './env';

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
    expect(resolveWsUrl('https://api.devrats.app/api/v1', null)).toContain('/ws');
  });
});
