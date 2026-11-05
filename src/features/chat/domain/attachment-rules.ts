export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VOICE_BYTES = 16 * 1024 * 1024;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_VOICE_SECONDS = 300;

export type AttachmentInputKind = 'IMAGE' | 'VOICE' | 'FILE';

export function acceptFor(kind: AttachmentInputKind): string {
  switch (kind) {
    case 'IMAGE':
      return 'image/jpeg,image/png';
    case 'VOICE':
      return 'audio/*';
    default:
      return '.pdf,.docx,.xlsx,.pptx,.txt,.csv';
  }
}

export function validateAttachment(
  file: File,
  kind: AttachmentInputKind,
  durationSeconds?: number,
): string | null {
  if (file.size <= 0) return 'O arquivo está vazio.';
  if (kind === 'IMAGE') {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return 'Envie uma imagem JPEG ou PNG.';
    }
    if (file.size > MAX_IMAGE_BYTES) return 'A imagem deve ter no máximo 8 MB.';
  }
  if (kind === 'VOICE') {
    if (file.size > MAX_VOICE_BYTES) return 'O áudio deve ter no máximo 16 MB.';
    if (durationSeconds != null && durationSeconds > MAX_VOICE_SECONDS) {
      return 'A mensagem de voz deve ter no máximo 5 minutos.';
    }
  }
  if (kind === 'FILE') {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'csv'].includes(extension)) {
      return 'Envie PDF, DOCX, XLSX, PPTX, TXT ou CSV.';
    }
    if (file.size > MAX_FILE_BYTES) return 'O documento deve ter no máximo 20 MB.';
  }
  return null;
}

export function audioExtension(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mpeg')) return 'mp3';
  return 'webm';
}
