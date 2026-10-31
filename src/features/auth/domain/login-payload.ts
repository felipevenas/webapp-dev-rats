/**
 * Compatibilidade transitória: a API antiga só aceita `email`; a nova aceita
 * `identifier` (e-mail ou usuário) e também o campo legado.
 */
export function buildLoginPayload(identifier: string, password: string) {
  const value = identifier.trim();
  const isEmail = value.includes('@') && !value.startsWith('@');
  return isEmail ? { email: value, password } : { identifier: value, password };
}
