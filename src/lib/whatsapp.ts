export function buildWhatsAppUrl(
  number: string,
  messageTemplate: string,
  replacements: Record<string, string>,
) {
  const message = Object.entries(replacements).reduce(
    (currentMessage, [key, value]) =>
      currentMessage.replaceAll(`{${key}}`, value),
    messageTemplate,
  );

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
