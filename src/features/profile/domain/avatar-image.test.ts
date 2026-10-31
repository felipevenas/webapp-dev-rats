import { describe, expect, it } from 'vitest';
import { AVATAR_MAX_BYTES, validateAvatarFile } from './avatar-image';

function fileOf(type: string, bytes: number, name = 'avatar') {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe('validateAvatarFile', () => {
  it('aceita JPEG e PNG dentro do limite', () => {
    expect(validateAvatarFile(fileOf('image/jpeg', 1024))).toBeNull();
    expect(validateAvatarFile(fileOf('image/png', AVATAR_MAX_BYTES))).toBeNull();
  });

  it('rejeita formatos fora do contrato', () => {
    expect(validateAvatarFile(fileOf('image/gif', 1024))).toBe('Envie uma imagem JPEG ou PNG.');
    expect(validateAvatarFile(fileOf('image/webp', 1024))).toBe('Envie uma imagem JPEG ou PNG.');
    expect(validateAvatarFile(fileOf('application/pdf', 1024))).toBe('Envie uma imagem JPEG ou PNG.');
  });

  it('rejeita imagens acima de 2 MB', () => {
    expect(validateAvatarFile(fileOf('image/png', AVATAR_MAX_BYTES + 1))).toBe(
      'A imagem deve ter no máximo 2 MB.',
    );
  });

  it('rejeita arquivo vazio', () => {
    expect(validateAvatarFile(fileOf('image/jpeg', 0))).toBe('O arquivo selecionado está vazio.');
  });
});
