import Image from "next/image";
import type { ReactNode } from "react";
import {
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { normalizeActionLabel } from "@/lib/display-label";
import { SocialIcon } from "@/themes/starter/components/icons/SocialIcon";

const JAPAN_FOOTER_DOWNLOAD_LABEL = "\u8cc7\u6599\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9";
const JAPAN_FOOTER_LINK_LABEL = "\u8a73\u7d30\u3092\u898b\u308b";

type FooterJapanProps = {
  lpkName: string;
  tagline?: string;
  logoSrc?: string;
  shortDescription?: string;
  companyLinks: Array<{
    label: string;
    href: string;
    isEnabled: boolean;
    sortOrder: number;
  }>;
  resourceLinks: Array<{
    label: string;
    href?: string;
    documentUrl?: string;
    isEnabled: boolean;
    sortOrder: number;
  }>;
  contact: { usedFromGlobal: boolean };
  contactData: {
    phone?: string;
    address?: string;
    operationalHours?: string;
    email?: string;
  };
  lineContact?: {
    href: string;
    displayLabel: string;
    isEnabled: boolean;
  };
  social: {
    line?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
  };
  legal: { copyrightText: string; showPoweredBy: boolean };
};

export function FooterJapan({
  lpkName,
  tagline,
  logoSrc,
  shortDescription,
  companyLinks,
  resourceLinks,
  contact,
  contactData,
  lineContact,
  social,
  legal,
}: FooterJapanProps) {
  const company = sortEnabled(companyLinks);
  const resources = sortEnabled(resourceLinks);
  const socialLinks = [
    { key: "line", href: social.line },
    { key: "linkedin", href: social.linkedin },
    { key: "youtube", href: social.youtube },
    { key: "instagram", href: social.instagram },
  ].filter((item): item is { key: string; href: string } =>
    Boolean(item.href),
  );

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex min-w-0 items-center gap-3">
            {logoSrc ? (
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden">
                <Image
                  src={logoSrc}
                  alt=""
                  width={56}
                  height={56}
                  className="max-h-12 max-w-14 object-contain"
                />
              </span>
            ) : null}
            <div className="min-w-0 leading-tight">
              <p className="truncate text-lg font-bold text-white">{lpkName}</p>
              {tagline ? (
                <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-neutral-400">
                  {tagline}
                </p>
              ) : null}
            </div>
          </div>
          {shortDescription ? (
            <p className="mt-4 text-sm leading-6 text-neutral-300">
              {shortDescription}
            </p>
          ) : null}
        </div>

        <FooterColumn title="Company">
          {company.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </FooterColumn>

        <FooterColumn title="Resources">
          {resources.map((item, index) => {
            const label = normalizeActionLabel(
              item.label,
              item.documentUrl ? JAPAN_FOOTER_DOWNLOAD_LABEL : JAPAN_FOOTER_LINK_LABEL,
              item.documentUrl || item.href,
            );

            return item.documentUrl ? (
              <a
                key={`${item.documentUrl}-${index}`}
                href={item.documentUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <Download aria-hidden="true" className="size-4" />
                {label}
              </a>
            ) : item.href ? (
              <a key={`${item.href}-${index}`} href={item.href} className="hover:text-white">
                {label}
              </a>
            ) : null;
          })}
        </FooterColumn>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Contact</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
            {contact.usedFromGlobal && lineContact?.isEnabled && lineContact.href ? (
              <a
                href={lineContact.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 font-semibold text-[#06C755] hover:text-white"
              >
                <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
                <span>{lineContact.displayLabel}</span>
              </a>
            ) : null}
            {contact.usedFromGlobal && contactData.email ? (
              <a
                href={`mailto:${contactData.email}`}
                className="flex gap-3 hover:text-white"
              >
                <Mail aria-hidden="true" className="mt-1 size-4 shrink-0" />
                <span>{contactData.email}</span>
              </a>
            ) : null}
            {contact.usedFromGlobal && contactData.phone ? (
              <a href={`tel:${contactData.phone}`} className="flex gap-3 hover:text-white">
                <Phone aria-hidden="true" className="mt-1 size-4 shrink-0" />
                <span>{contactData.phone}</span>
              </a>
            ) : null}
            {contact.usedFromGlobal && contactData.address ? (
              <p className="flex gap-3">
                <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />
                <span>{contactData.address}</span>
              </p>
            ) : null}
            {contact.usedFromGlobal && contactData.operationalHours ? (
              <p>{contactData.operationalHours}</p>
            ) : null}
          </div>

          {socialLinks.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={key}
                  className="flex size-9 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 transition hover:bg-primary-500 hover:text-white"
                >
                  <SocialIcon iconKey={key} aria-hidden="true" className="size-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-neutral-800 px-4 py-5 text-center text-xs text-neutral-400">
        <span>{legal.copyrightText}</span>
        {legal.showPoweredBy ? <span> Powered by NextCMS LPK.</span> : null}
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
      <div className="mt-4 flex flex-col gap-3 text-sm text-neutral-300">
        {children}
      </div>
    </div>
  );
}

function sortEnabled<T extends { isEnabled: boolean; sortOrder: number }>(items: T[]) {
  return items
    .filter((item) => item.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export type { FooterJapanProps };
