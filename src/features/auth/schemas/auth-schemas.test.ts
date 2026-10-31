import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth-schemas';

function identifierError(identifier: string) {
  const result = loginSchema.safeParse({ identifier, password: 'Senha@12345' });
  if (result.success) return null;
  return result.error.issues.find((issue) => issue.path.includes('identifier'))?.message ?? null;
}

describe('login schema', () => {
  it('aceita um e-mail válido', () => {
    const result = loginSchema.safeParse({ identifier: 'rat@devrats.dev', password: 'Senha@12345' });
    expect(result.success).toBe(true);
  });

  it('aceita um username válido', () => {
    const result = loginSchema.safeParse({ identifier: 'dev_rat01', password: 'Senha@12345' });
    expect(result.success).toBe(true);
  });

  it('aceita um username com prefixo @', () => {
    const result = loginSchema.safeParse({ identifier: '@dev_rat01', password: 'Senha@12345' });
    expect(result.success).toBe(true);
  });

  it('aceita username em maiúsculas', () => {
    const result = loginSchema.safeParse({ identifier: 'DevRat', password: 'Senha@12345' });
    expect(result.success).toBe(true);
  });

  it('remove espaços ao redor do identificador', () => {
    const result = loginSchema.safeParse({ identifier: '  dev_rat01  ', password: 'Senha@12345' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.identifier).toBe('dev_rat01');
  });

  it('rejeita identificador vazio', () => {
    expect(identifierError('')).toBe('Informe seu e-mail ou usuário');
    expect(identifierError('   ')).toBe('Informe seu e-mail ou usuário');
  });

  it('rejeita username curto, com espaço ou caractere inválido', () => {
    expect(identifierError('ab')).toBe('Use de 3 a 30 caracteres com letras, números ou _');
    expect(identifierError('dev rat')).toBe('Use de 3 a 30 caracteres com letras, números ou _');
    expect(identifierError('dev-rat')).toBe('Use de 3 a 30 caracteres com letras, números ou _');
    expect(identifierError('@ab')).toBe('Use de 3 a 30 caracteres com letras, números ou _');
  });

  it('rejeita e-mail inválido', () => {
    expect(identifierError('rat@')).toBe('Informe um e-mail válido');
    expect(identifierError('rat@devrats')).toBe('Informe um e-mail válido');
    expect(identifierError('rat devrats.dev')).not.toBeNull();
  });

  it('exige senha', () => {
    const result = loginSchema.safeParse({ identifier: 'dev_rat01', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('password'))).toBe(true);
    }
  });
});

const base = {
  displayName: 'Felipe Ferreira',
  username: 'felipe_dev',
  email: 'felipe@exemplo.com',
  password: 'Senha@12345',
  acceptTerms: true,
};

describe('register schema', () => {
  it('accepts a compact registration payload', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('requires the terms acceptance', () => {
    expect(registerSchema.safeParse({ ...base, acceptTerms: false }).success).toBe(false);
  });

  it('keeps profile fields out of the registration payload', () => {
    const result = registerSchema.safeParse({ ...base, bio: 'Backend em Java', primaryStack: ['JAVA'] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('bio');
      expect(result.data).not.toHaveProperty('primaryStack');
    }
  });
});
