export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MAX_LABEL = '2 MB';
export const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png'] as const;
export const AVATAR_ACCEPT = AVATAR_ACCEPTED_TYPES.join(',');
export const AVATAR_SIZE = 512;
export const AVATAR_JPEG_QUALITY = 0.85;
export const AVATAR_MAX_DIMENSION = 4096;
export const AVATAR_MAX_PIXELS = 16_000_000;

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
 * Decodes the source with a bounded width when the browser supports it, so a
 * compressed image with huge dimensions cannot blow up memory before the crop.
 */
async function loadSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { resizeWidth: 1024, resizeQuality: 'high' });
    } catch {
      //---- Fall back to the regular image decode when the browser refuses the bitmap options.
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
 * Center-crops the image into a square and resizes it to 512×512, re-encoding
 * as JPEG to keep the upload payload small. The backend still validates and
 * re-encodes the received file.
 */
export async function processAvatarImage(file: File): Promise<File> {
  const image = await loadSource(file);
  const width = image.width;
  const height = image.height;
  if (width > AVATAR_MAX_DIMENSION || height > AVATAR_MAX_DIMENSION || width * height > AVATAR_MAX_PIXELS) {
    throw new Error('Imagem muito grande. Use no máximo 4096 px por lado.');
  }

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
  //---- PNG transparency becomes white in JPEG, matching the backend encoder.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
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
  if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
    image.close();
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', AVATAR_JPEG_QUALITY);
  });
  if (!blob) {
    throw new Error('Não foi possível converter a imagem.');
  }

  return new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
}
