const MAX_SLUG_LENGTH = 80;

function trimHyphens(value: string) {
  return value.replace(/^-+|-+$/g, "");
}

function truncateAtWordBoundary(slug: string, maxLength = MAX_SLUG_LENGTH) {
  if (slug.length <= maxLength) {
    return slug;
  }

  const truncated = slug.slice(0, maxLength);
  const lastHyphen = truncated.lastIndexOf("-");

  if (lastHyphen > 0) {
    return trimHyphens(truncated.slice(0, lastHyphen));
  }

  return trimHyphens(truncated);
}

export function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

  return truncateAtWordBoundary(trimHyphens(slug));
}

export function generateUniqueSlug(
  title: string,
  existingSlugs: string[],
): string {
  const baseSlug = generateSlug(title);
  const existing = new Set(existingSlugs);

  if (!existing.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;
  let candidate = baseSlug;

  while (existing.has(candidate)) {
    const suffix = `-${index}`;
    const truncatedBase = truncateAtWordBoundary(
      baseSlug,
      MAX_SLUG_LENGTH - suffix.length,
    );

    candidate = `${truncatedBase}${suffix}`;
    index += 1;
  }

  return candidate;
}
