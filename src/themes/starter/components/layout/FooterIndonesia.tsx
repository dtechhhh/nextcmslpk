import Image from "next/image";
import type { ReactNode } from "react";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

type FooterIndonesiaProps = {
  lpkName: string;
  logoSrc?: string;
  shortDescription?: string;
  quickLinks: Array<{ label: string; href: string; isEnabled: boolean; sortOrder?: number }>;
  programLinks: Array<{ title: string; href: string }>;
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    operationalHours?: string;
  };
  social: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    facebook?: string;
    line?: string;
  };
  legal: { copyrightText: string; showPoweredBy: boolean };
};

export function FooterIndonesia({
  lpkName,
  logoSrc,
  shortDescription,
  quickLinks,
  programLinks,
  contact,
  social,
  legal,
}: FooterIndonesiaProps) {
  const links = quickLinks
    .filter((item) => item.isEnabled)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const socialLinks = Object.entries(social).filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  );

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={lpkName}
              width={180}
              height={48}
              className="h-12 w-auto object-contain"
            />
          ) : (
            <p className="text-xl font-bold">{lpkName}</p>
          )}
          {shortDescription ? (
            <p className="mt-4 text-sm leading-6 text-neutral-300">
              {shortDescription}
            </p>
          ) : null}
        </div>

        <FooterColumn title="Quick Links">
          {links.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </FooterColumn>

        <FooterColumn title="Program">
          {programLinks.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.title}
            </a>
          ))}
        </FooterColumn>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Kontak</h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
            {contact.phone ? (
              <a href={`tel:${contact.phone}`} className="flex gap-3 hover:text-white">
                <Phone aria-hidden="true" className="mt-1 size-4 shrink-0" />
                <span>{contact.phone}</span>
              </a>
            ) : null}
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="flex gap-3 hover:text-white">
                <Mail aria-hidden="true" className="mt-1 size-4 shrink-0" />
                <span>{contact.email}</span>
              </a>
            ) : null}
            {contact.address ? (
              <p className="flex gap-3">
                <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />
                <span>{contact.address}</span>
              </p>
            ) : null}
            {contact.operationalHours ? <p>{contact.operationalHours}</p> : null}
          </div>
          {socialLinks.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map(([key, href]) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={key}
                  className="flex size-9 items-center justify-center rounded-full bg-neutral-800 text-neutral-200 hover:bg-primary-500 hover:text-white"
                >
                  <ExternalLink aria-hidden="true" className="size-4" />
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

export type { FooterIndonesiaProps };
