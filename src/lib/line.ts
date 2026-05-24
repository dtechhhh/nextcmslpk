export function buildLineUrl(
  lineAccountId: string,
  messageTemplate: string,
  replacements: Record<string, string>,
): string {
  const message = Object.entries(replacements).reduce(
    (currentMessage, [key, value]) =>
      currentMessage.replaceAll(`{${key}}`, value),
    messageTemplate,
  );

  return `https://line.me/R/oaMessage/${lineAccountId}/?${encodeURIComponent(message)}`;
}
