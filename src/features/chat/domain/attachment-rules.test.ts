// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { audioExtension, validateAttachment } from './attachment-rules';

describe('attachment rules', () => {
  it('accepts a valid JPEG', () => {
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
    expect(validateAttachment(file, 'IMAGE')).toBeNull();
  });

  it('rejects SVG and invalid image types', () => {
    const file = new File(['<svg/>'], 'foto.svg', { type: 'image/svg+xml' });
    expect(validateAttachment(file, 'IMAGE')).toContain('JPEG ou PNG');
  });

  it('rejects unsupported document extensions', () => {
    const file = new File(['x'], 'script.exe', { type: 'application/octet-stream' });
    expect(validateAttachment(file, 'FILE')).toContain('PDF');
  });

  it('accepts a PDF document', () => {
    const file = new File(['%PDF-1.7'], 'contrato.pdf', { type: 'application/pdf' });
    expect(validateAttachment(file, 'FILE')).toBeNull();
  });

  it('limits voice duration to five minutes', () => {
    const file = new File(['x'], 'voz.webm', { type: 'audio/webm' });
    expect(validateAttachment(file, 'VOICE', 301)).toContain('5 minutos');
  });

  it('derives the recording extension from the browser MIME type', () => {
    expect(audioExtension('audio/webm;codecs=opus')).toBe('webm');
    expect(audioExtension('audio/mp4')).toBe('m4a');
    expect(audioExtension('audio/ogg')).toBe('ogg');
    expect(audioExtension('audio/mpeg')).toBe('mp3');
  });
});
