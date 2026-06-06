const FILE_URL_PATTERN = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z)([?#].*)?$/i;

export function normalizeActionLabel(
  label: string | null | undefined,
  fallback: string,
  urlToAvoid?: string | null,
) {
  const trimmedLabel = label?.trim() ?? "";

  if (!trimmedLabel || isLikelyUrlLabel(trimmedLabel, urlToAvoid)) {
    return fallback;
  }

  return trimmedLabel;
}

export function isLikelyUrlLabel(value: string, urlToAvoid?: string | null) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return false;
  }

  if (urlToAvoid && stripTrailingSlash(trimmedValue) === stripTrailingSlash(urlToAvoid)) {
    return true;
  }

  if (/^(https?:\/\/|www\.)/i.test(trimmedValue)) {
    return true;
  }

  if (trimmedValue.startsWith("/") && FILE_URL_PATTERN.test(trimmedValue)) {
    return true;
  }

  if (trimmedValue.length > 80 && !/\s/.test(trimmedValue) && /[/?=&]/.test(trimmedValue)) {
    return true;
  }

  return false;
}

function stripTrailingSlash(value: string) {
  return value.trim().replace(/\/+$/, "");
}
