const WEBP_MIME = 'image/webp';
const WEBP_QUALITY = 0.82;

/** Convert browser-selected raster images before sending them to R2. */
export async function convertImageToWebp(input: File): Promise<File> {
  if (input.type === WEBP_MIME) return input;

  const bitmap = await createImageBitmap(input);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('CANVAS_UNAVAILABLE');
    context.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error('WEBP_CONVERSION_FAILED'))),
        WEBP_MIME,
        WEBP_QUALITY,
      );
    });
    return new File([blob], `${input.name.replace(/\.[^.]+$/, '')}.webp`, { type: WEBP_MIME });
  } finally {
    bitmap.close();
  }
}
