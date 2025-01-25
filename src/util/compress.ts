import imageCompression from "browser-image-compression";

export async function compressUntilSize(file: File, maxSizeMB: number) {
  let quality = 0.8;
  let compressed;

  while (quality > 0.1) {
    compressed = await imageCompression(file, {
      maxSizeMB: maxSizeMB,
      maxWidthOrHeight: 1024,
      initialQuality: quality,
    });

    if (compressed.size / 1024 / 1024 <= maxSizeMB) {
      break;
    }

    quality -= 0.1;
  }

  return compressed;
}
