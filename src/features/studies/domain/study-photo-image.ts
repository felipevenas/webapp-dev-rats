export const STUDY_PHOTO_MAX_BYTES = 8 * 1024 * 1024;
export const STUDY_PHOTO_MAX_LABEL = '8 MB';
export const STUDY_PHOTO_ACCEPTED_TYPES = ['image/jpeg', 'image/png'] as const;
export const STUDY_PHOTO_ACCEPT = STUDY_PHOTO_ACCEPTED_TYPES.join(',');
export const STUDY_PHOTO_MAX_DIMENSION = 2048;
export const STUDY_PHOTO_MAX_PIXELS = 24_000_000;
export const STUDY_PHOTO_JPEG_QUALITY = 0.85;

export function validateStudyPhotoFile(file: File): string | null {
  if (!STUDY_PHOTO_ACCEPTED_TYPES.includes(file.type as (typeof STUDY_PHOTO_ACCEPTED_TYPES)[number])) {
    return 'Envie uma foto JPEG ou PNG.';
  }
  if (file.size === 0) {
    return 'A foto selecionada está vazia.';
  }
  if (file.size > STUDY_PHOTO_MAX_BYTES) {
    return `A foto deve ter no máximo ${STUDY_PHOTO_MAX_LABEL}.`;
  }
  return null;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível ler a foto.'));
    image.src = url;
  });
}

async function loadSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      //---- Limita a largura na decodificação para não estourar memória com fotos de celular.
      return await createImageBitmap(file, { resizeWidth: STUDY_PHOTO_MAX_DIMENSION, resizeQuality: 'high' });
    } catch {
      //---- Fallback para navegadores que recusam as opções do bitmap (ex.: HEIC no Chrome).
    }
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    return await loadImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Normaliza a foto preservando o enquadramento: reduz para no máximo 2048 px,
 * compõe sobre branco e reencoda em JPEG. O backend valida e reencoda de novo.
 */
export async function normalizeStudyPhotoImage(file: File): Promise<File> {
  const image = await loadSource(file);
  const width = image.width;
  const height = image.height;
  if (width <= 0 || height <= 0 || width * height > STUDY_PHOTO_MAX_PIXELS) {
    throw new Error('Foto muito grande. Use no máximo 2048 px por lado.');
  }

  const ratio = Math.min(1, STUDY_PHOTO_MAX_DIMENSION / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * ratio));
  const targetHeight = Math.max(1, Math.round(height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas não disponível.');
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(image, 0, 0, targetWidth, targetHeight);
  if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
    image.close();
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', STUDY_PHOTO_JPEG_QUALITY);
  });
  if (!blob) {
    throw new Error('Não foi possível converter a foto.');
  }
  return new File([blob], 'estudo.jpg', { type: 'image/jpeg' });
}
