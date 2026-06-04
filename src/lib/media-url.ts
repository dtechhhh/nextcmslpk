export function getMediaProxyUrl(mediaId: string) {
  return `/api/media/${encodeURIComponent(mediaId)}`;
}
