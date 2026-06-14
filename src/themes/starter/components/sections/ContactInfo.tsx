import {
  Clock,
  Languages,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"
import { SocialIcon } from "@/themes/starter/components/icons/SocialIcon"
import { Button } from "@/themes/starter/components/ui/Button"
import { Container } from "@/themes/starter/components/ui/Container"

interface ContactInfoSocialLinks {
  instagram?: string
  youtube?: string
  tiktok?: string
  facebook?: string
  line?: string
  linkedin?: string
}

interface ContactInfoProps {
  headline?: string
  description?: string
  phone?: string
  email?: string
  emailSubject?: string
  address?: string
  mapUrl?: string
  operationalHours?: string
  languageSupport?: string[]
  socialLinks?: ContactInfoSocialLinks
  ctaLabel?: string
  ctaHref?: string
  ctaVariant?: "whatsapp" | "line" | "default"
}

function ContactInfo({
  headline,
  description,
  phone,
  email,
  emailSubject,
  address,
  mapUrl,
  operationalHours,
  languageSupport = [],
  socialLinks,
  ctaLabel,
  ctaHref,
  ctaVariant = "default",
}: ContactInfoProps) {
  const resolvedMapUrl = getEmbeddableMapUrl(mapUrl, address)
  const links = socialLinks
    ? Object.entries(socialLinks).filter((entry): entry is [keyof ContactInfoSocialLinks, string] =>
        Boolean(entry[1])
      )
    : []

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            {headline ? (
              <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                {headline}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-lg">
                {description}
              </p>
            ) : null}
            <div className="mt-8 space-y-4 text-neutral-700">
              {phone ? (
                <p className="flex gap-3">
                  <Phone aria-hidden="true" className="mt-1 size-5 text-primary-500" />
                  <a href={`tel:${phone}`} className="hover:text-primary-500">
                    {phone}
                  </a>
                </p>
              ) : null}
              {email ? (
                <p className="flex gap-3">
                  <Mail aria-hidden="true" className="mt-1 size-5 text-primary-500" />
                  <a
                    href={`mailto:${email}${
                      emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ""
                    }`}
                    className="hover:text-primary-500"
                  >
                    {email}
                  </a>
                </p>
              ) : null}
              {address ? (
                <p className="flex gap-3">
                  <MapPin aria-hidden="true" className="mt-1 size-5 text-primary-500" />
                  <span>{address}</span>
                </p>
              ) : null}
              {operationalHours ? (
                <p className="flex gap-3">
                  <Clock aria-hidden="true" className="mt-1 size-5 text-primary-500" />
                  <span>{operationalHours}</span>
                </p>
              ) : null}
              {languageSupport.length > 0 ? (
                <p className="flex gap-3">
                  <Languages aria-hidden="true" className="mt-1 size-5 text-primary-500" />
                  <span>{languageSupport.join(", ")}</span>
                </p>
              ) : null}
            </div>

            {links.length > 0 ? (
              <div className="mt-6 flex gap-3">
                {links.map(([key, href]) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={key}
                    className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition hover:bg-primary-500 hover:text-white"
                  >
                    <SocialIcon iconKey={key} aria-hidden="true" className="size-5" />
                  </a>
                ))}
              </div>
            ) : null}

            {ctaLabel && ctaHref ? (
              <Button
                render={<a href={ctaHref} />}
                variant={ctaVariant}
                size="lg"
                className="mt-8"
              >
                {ctaLabel}
              </Button>
            ) : null}
          </div>

          {resolvedMapUrl ? (
            <iframe
              src={resolvedMapUrl}
              title="所在地"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[300px] w-full rounded-xl border-0"
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
              地図を読み込めません
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

function getEmbeddableMapUrl(mapUrl?: string, address?: string) {
  const cleanMapUrl = mapUrl?.trim()
  const coordinateFallbackUrl = getCoordinateEmbedUrl(cleanMapUrl)
  const addressFallbackUrl = getSearchEmbedUrl(address)
  const fallbackUrl = coordinateFallbackUrl ?? addressFallbackUrl

  if (!cleanMapUrl) {
    return fallbackUrl
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(cleanMapUrl)
  } catch {
    return fallbackUrl
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return fallbackUrl
  }

  const hostname = parsedUrl.hostname.toLowerCase()
  const isGoogleMapsUrl =
    hostname === "maps.app.goo.gl" ||
    (hostname.includes("google.") && parsedUrl.pathname.includes("/maps"))

  if (!isGoogleMapsUrl) {
    return cleanMapUrl
  }

  if (parsedUrl.pathname.startsWith("/maps/embed")) {
    return isLikelyTruncatedGoogleMapsEmbed(parsedUrl) && fallbackUrl
      ? fallbackUrl
      : cleanMapUrl
  }

  return fallbackUrl ?? getSearchEmbedUrl(cleanMapUrl)
}

function isLikelyTruncatedGoogleMapsEmbed(url: URL) {
  const embedPayload = url.searchParams.get("pb")

  return url.pathname === "/maps/embed" && embedPayload !== null && embedPayload.length < 100
}

function getCoordinateEmbedUrl(value?: string) {
  if (!value) {
    return undefined
  }

  const pbCoordinates = value.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/)

  if (pbCoordinates) {
    return `https://www.google.com/maps?q=${pbCoordinates[2]},${pbCoordinates[1]}&output=embed`
  }

  const atCoordinates = value.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)

  if (atCoordinates) {
    return `https://www.google.com/maps?q=${atCoordinates[1]},${atCoordinates[2]}&output=embed`
  }

  return undefined
}

function getSearchEmbedUrl(query?: string) {
  const cleanQuery = query?.trim()

  if (!cleanQuery) {
    return undefined
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(cleanQuery)}&output=embed`
}

export { ContactInfo }
export type { ContactInfoProps, ContactInfoSocialLinks }
