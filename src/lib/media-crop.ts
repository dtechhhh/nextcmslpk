export type MediaCropPreset = "thumbnail" | "hero" | "square" | "portrait";

export type MediaCropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MediaCropConfig = {
  preset: MediaCropPreset;
  label: string;
  aspectRatio: number;
  outputWidth: number;
  outputHeight: number;
};

export const MEDIA_CROP_PRESETS: Record<MediaCropPreset, MediaCropConfig> = {
  thumbnail: {
    preset: "thumbnail",
    label: "Thumbnail image",
    aspectRatio: 16 / 9,
    outputWidth: 1200,
    outputHeight: 675,
  },
  hero: {
    preset: "hero",
    label: "Hero image",
    aspectRatio: 16 / 9,
    outputWidth: 1920,
    outputHeight: 1080,
  },
  square: {
    preset: "square",
    label: "Square image",
    aspectRatio: 1,
    outputWidth: 900,
    outputHeight: 900,
  },
  portrait: {
    preset: "portrait",
    label: "Portrait image",
    aspectRatio: 4 / 5,
    outputWidth: 960,
    outputHeight: 1200,
  },
};

export function getMediaCropConfig(preset: MediaCropPreset) {
  return MEDIA_CROP_PRESETS[preset];
}

export function isMediaCropPreset(value: unknown): value is MediaCropPreset {
  return (
    value === "thumbnail" ||
    value === "hero" ||
    value === "square" ||
    value === "portrait"
  );
}
