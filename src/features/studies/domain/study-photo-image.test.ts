import { describe, expect, it } from 'vitest';
import { validateStudyPhotoFile } from './study-photo-image';

describe('validateStudyPhotoFile', () => {
  it('accepts a JPEG file', () => {
    const file = new File([new Uint8Array(16)], 'estudo.jpg', { type: 'image/jpeg' });
    expect(validateStudyPhotoFile(file)).toBeNull();
  });

  it('accepts a PNG file', () => {
    const file = new File([new Uint8Array(16)], 'estudo.png', { type: 'image/png' });
    expect(validateStudyPhotoFile(file)).toBeNull();
  });

  it('rejects unsupported formats', () => {
    const file = new File([new Uint8Array(16)], 'estudo.gif', { type: 'image/gif' });
    expect(validateStudyPhotoFile(file)).toMatch(/JPEG ou PNG/);
  });

  it('rejects empty files', () => {
    const file = new File([], 'vazia.jpg', { type: 'image/jpeg' });
    expect(validateStudyPhotoFile(file)).toMatch(/vazia/);
  });

  it('rejects files above 8 MB', () => {
    const file = new File([new Uint8Array(8 * 1024 * 1024 + 1)], 'grande.jpg', {
      type: 'image/jpeg',
    });
    expect(validateStudyPhotoFile(file)).toMatch(/8 MB/);
  });
});
