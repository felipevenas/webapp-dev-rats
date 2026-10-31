import { describe, expect, it } from 'vitest';
import { buildLoginPayload } from './login-payload';

describe('buildLoginPayload', () => {
  it('sends the legacy email field for e-mail identifiers', () => {
    expect(buildLoginPayload('  rat@devrats.dev  ', 'Senha@12345')).toEqual({
      email: 'rat@devrats.dev',
      password: 'Senha@12345',
    });
  });

  it('sends identifier for usernames, including @username', () => {
    expect(buildLoginPayload('dev_rat', 'Senha@12345')).toEqual({
      identifier: 'dev_rat',
      password: 'Senha@12345',
    });
    expect(buildLoginPayload('@dev_rat', 'Senha@12345')).toEqual({
      identifier: '@dev_rat',
      password: 'Senha@12345',
    });
  });
});
