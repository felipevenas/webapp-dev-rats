export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MAX_LABEL = '2 MB';
export const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png'] as const;
export const AVATAR_ACCEPT = AVATAR_ACCEPTED_TYPES.join(',');
export const AVATAR_SIZE = 512;
export const AVATAR_JPEG_QUALITY = 0.85;

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type as (typeof AVATAR_ACCEPTED_TYPES)[number])) {
    return 'Envie uma imagem JPEG ou PNG.';
  }
  if (file.size === 0) {
    return 'O arquivo selecionado está vazio.';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return `A imagem deve ter no máximo ${AVATAR_MAX_LABEL}.`;
  }
  return null;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    image.src = url;
  });
}

/**
 * Center-crops the image into a square and resizes it to 512×512, re-encoding
 * as JPEG to keep the upload payload small. The backend still validates and
 * re-encodes the received file.
 */
export async function processAvatarImage(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const sourceSize = Math.floor(Math.min(width, height));
    if (sourceSize <= 0) {
      throw new Error('Não foi possível ler a imagem.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas não disponível.');
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      image,
      Math.floor((width - sourceSize) / 2),
      Math.floor((height - sourceSize) / 2),
      sourceSize,
      sourceSize,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', AVATAR_JPEG_QUALITY);
    });
    if (!blob) {
      throw new Error('Não foi possível converter a imagem.');
    }

    return new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
