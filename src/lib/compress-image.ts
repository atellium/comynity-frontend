const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ImageCompressionOptions = {
  maxWidth: number;
  quality: number;
};

/** Resizes an image in the browser and encodes the upload as WebP. */
export async function compressImage(
  file: File,
  { maxWidth = 1024, quality = 0.95 }: ImageCompressionOptions,
): Promise<File> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Please select a JPEG, PNG, or WebP image.");
  }
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    throw new Error("Maximum image width must be greater than zero.");
  }
  if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
    throw new Error("Image quality must be between 0 and 1.");
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare the selected image.");
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("Unable to compress the selected image.")),
        "image/webp",
        quality,
      );
    });

    const name = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${name}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
