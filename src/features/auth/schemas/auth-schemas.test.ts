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

const base = {
  displayName: 'Felipe Ferreira',
  username: 'felipe_dev',
  email: 'felipe@exemplo.com',
  password: 'Senha@12345',
  acceptTerms: true,
};

describe('register schema — perfil profissional', () => {
  it('accepts a registration without the optional fields', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('accepts the professional fields when valid', () => {
    const result = registerSchema.safeParse({
      ...base,
      bio: 'Backend em Java e Kotlin, constância todo dia.',
      location: 'São Paulo, Brasil',
      websiteUrl: 'https://devrats.dev',
      experienceLevel: 'PLENO',
      primaryStack: ['JAVA', 'KOTLIN', 'SPRING', 'SQL', 'AWS'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty optional text fields', () => {
    const result = registerSchema.safeParse({
      ...base,
      bio: '',
      location: '',
      websiteUrl: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a bio longer than 280 characters', () => {
    const result = registerSchema.safeParse({ ...base, bio: 'a'.repeat(281) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('bio'))).toBe(true);
    }
  });

  it('rejects a location longer than 120 characters', () => {
    expect(registerSchema.safeParse({ ...base, location: 'a'.repeat(121) }).success).toBe(false);
  });

  it('rejects a website that is not http(s)', () => {
    for (const websiteUrl of ['devrats.dev', 'ftp://devrats.dev', 'javascript:alert(1)']) {
      const result = registerSchema.safeParse({ ...base, websiteUrl });
      expect(result.success, websiteUrl).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('websiteUrl'))).toBe(true);
      }
    }
  });

  it('rejects a website longer than 300 characters', () => {
    const websiteUrl = `https://devrats.dev/${'a'.repeat(300)}`;
    expect(registerSchema.safeParse({ ...base, websiteUrl }).success).toBe(false);
  });

  it('rejects more than five technologies', () => {
    const result = registerSchema.safeParse({
      ...base,
      primaryStack: ['JAVA', 'KOTLIN', 'SPRING', 'SQL', 'AWS', 'DOCKER'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('primaryStack'))).toBe(true);
    }
  });

  it('rejects unknown experience levels and stacks', () => {
    expect(registerSchema.safeParse({ ...base, experienceLevel: 'STAFF' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, primaryStack: ['COBOL'] }).success).toBe(false);
  });
});
