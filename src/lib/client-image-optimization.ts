export type ImageUploadOptimizationPreset = "logo";

export type ImageUploadOptimizationResult = {
  file: File;
  originalFile: File;
  optimized: boolean;
  originalSize: number;
  optimizedSize: number;
  originalWidth: number | null;
  originalHeight: number | null;
  width: number | null;
  height: number | null;
};

type OptimizeImageUploadOptions = {
  mediaPreset?: ImageUploadOptimizationPreset;
};

const OPTIMIZABLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const GENERAL_MAX_DIMENSION = 2400;
const LOGO_MAX_DIMENSION = 1200;
const MIN_OPTIMIZATION_BYTES = 250 * 1024;
const MIN_SAVING_BYTES = 32 * 1024;

export async function optimizeImageForUpload(
  file: File,
  options: OptimizeImageUploadOptions = {},
): Promise<ImageUploadOptimizationResult> {
  if (!isOptimizableImage(file)) {
    return buildSkippedResult(file);
  }

  try {
    const image = await loadImage(file);
    const maxDimension =
      options.mediaPreset === "logo" ? LOGO_MAX_DIMENSION : GENERAL_MAX_DIMENSION;
    const targetSize = constrainImageSize(
      image.naturalWidth,
      image.naturalHeight,
      maxDimension,
    );
    const shouldResize =
      targetSize.width !== image.naturalWidth ||
      targetSize.height !== image.naturalHeight;

    if (!shouldResize && file.size < MIN_OPTIMIZATION_BYTES) {
      return buildSkippedResult(file, image.naturalWidth, image.naturalHeight);
    }

    const blob = await renderImageToWebpBlob(
      image,
      targetSize.width,
      targetSize.height,
      options.mediaPreset === "logo" ? 0.96 : 0.92,
    );

    if (!blob) {
      return buildSkippedResult(file, image.naturalWidth, image.naturalHeight);
    }

    const minimumSaving = Math.max(
      MIN_SAVING_BYTES,
      Math.round(file.size * (options.mediaPreset === "logo" ? 0.12 : 0.08)),
    );
    const isWorthUsing =
      blob.size + minimumSaving < file.size || (shouldResize && blob.size < file.size);

    if (!isWorthUsing) {
      return buildSkippedResult(file, image.naturalWidth, image.naturalHeight);
    }

    const optimizedFile = new File([blob], toWebpFileName(file.name), {
      type: "image/webp",
      lastModified: file.lastModified || Date.now(),
    });

    return {
      file: optimizedFile,
      originalFile: file,
      optimized: true,
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
      originalWidth: image.naturalWidth,
      originalHeight: image.naturalHeight,
      width: targetSize.width,
      height: targetSize.height,
    };
  } catch {
    return buildSkippedResult(file);
  }
}

function isOptimizableImage(file: File) {
  return OPTIMIZABLE_IMAGE_TYPES.has(file.type.toLowerCase());
}

function buildSkippedResult(
  file: File,
  width: number | null = null,
  height: number | null = null,
): ImageUploadOptimizationResult {
  return {
    file,
    originalFile: file,
    optimized: false,
    originalSize: file.size,
    optimizedSize: file.size,
    originalWidth: width,
    originalHeight: height,
    width,
    height,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      resolve(image);
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be loaded."));
    });

    image.src = url;
  });
}

function constrainImageSize(width: number, height: number, maxDimension: number) {
  const longestSide = Math.max(width, height);

  if (longestSide <= maxDimension) {
    return { width, height };
  }

  const ratio = maxDimension / longestSide;

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function renderImageToWebpBlob(
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    return Promise.resolve(null);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", quality);
  });
}

function toWebpFileName(fileName: string) {
  const trimmed = fileName.trim();
  const withoutExtension = trimmed.replace(/\.[^.]+$/, "");
  const baseName = withoutExtension || "image";

  return `${baseName}.webp`;
}
