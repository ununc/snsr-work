import imageCompression from "browser-image-compression";

export async function compressUntilSize(file: File, maxSizeMB: number) {
  let quality = 1;
  let compressed;
  while (quality > 0.4) {
    compressed = await imageCompression(file, {
      maxSizeMB,
      initialQuality: quality,
    });
    console.log(compressed.size);

    if (compressed.size / 1024 / 1024 <= maxSizeMB) {
      break;
    }

    quality -= 0.1;
  }

  return compressed;
}
