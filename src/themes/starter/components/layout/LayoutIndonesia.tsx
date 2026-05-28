import type { TenantModel } from "@/generated/prisma/models";
import type { ReactNode } from "react";
import { unstable_cache } from "next/cache";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  resolveCollectionList,
  resolveMediaUrls,
  type PublicJson,
} from "@/server/resolvers/public";
import { FloatingCTA } from "@/themes/starter/components/sections/FloatingCTA";
import { FooterIndonesia } from "@/themes/starter/components/layout/FooterIndonesia";
import { HeaderIndonesia } from "@/themes/starter/components/layout/HeaderIndonesia";
import { getVariantAppearanceStyle } from "@/themes/starter/design-system/appearance";

type LayoutIndonesiaProps = {
  globalConfig: Record<string, PublicJson>;
  tenant: TenantModel;
  variantId: string;
  variantSwitchUrl?: string;
  children: ReactNode;
};

export async function LayoutIndonesia({
  globalConfig,
  tenant,
  variantId,
  variantSwitchUrl,
  children,
}: LayoutIndonesiaProps) {
  const brandHeader = record(globalConfig.brand_header);
  const footer = record(globalConfig.footer);
  const whatsappContact = record(globalConfig.whatsapp_contact);
  const brand = record(brandHeader.brand);
  const footerBrand = record(footer.brand);
  const whatsapp = record(whatsappContact.whatsapp);
  const contact = record(whatsappContact.contact);
  const socialLinks = record(whatsappContact.social_links);
  const appearanceStyle = getVariantAppearanceStyle(
    "indonesia",
    brandHeader.appearance,
  );

  const lpkName = stringValue(brand.lpk_name) || tenant.name;
  const whatsappNumber = stringValue(whatsapp.number);
  const defaultMessage =
    stringValue(whatsapp.default_message_template) ||
    "Halo, saya ingin konsultasi dengan {lpk_name}.";
  const whatsappHref = whatsappNumber
    ? buildWhatsAppUrl(whatsappNumber, defaultMessage, { lpk_name: lpkName })
    : "#";
  const logoImageId = stringValue(brand.logo_image_id);
  const logoLightImageId = stringValue(brand.logo_light_image_id);
  const footerLogoImageId = stringValue(footerBrand.logo_image_id);
  const [mediaUrls, programLinks] = await Promise.all([
    resolveMediaUrls([logoImageId, logoLightImageId, footerLogoImageId]),
    resolveCachedFooterProgramLinks(variantId, footer),
  ]);
  const logoSrc = mediaUrl(mediaUrls, logoImageId);
  const logoLightSrc = mediaUrl(mediaUrls, logoLightImageId);
  const footerLogoSrc = mediaUrl(mediaUrls, footerLogoImageId);

  return (
    <div
      data-variant="indonesia"
      className="theme-indonesia min-h-screen bg-white"
      style={appearanceStyle}
    >
      <HeaderIndonesia
        lpkName={lpkName}
        logoSrc={logoSrc ?? undefined}
        logoLightSrc={logoLightSrc ?? undefined}
        navItems={arrayOfRecords(brandHeader.navbar).map((item) => ({
          key: stringValue(item.key),
          label: stringValue(item.label),
          href: stringValue(item.href) || "/",
          isEnabled: booleanValue(item.is_enabled, true),
          sortOrder: numberValue(item.sort_order),
        }))}
        variantSwitch={{
          isEnabled:
            booleanValue(record(brandHeader.variant_switch).is_enabled, false) &&
            !!variantSwitchUrl,
          targetHref: variantSwitchUrl ?? "/",
          label: "Japan",
        }}
        headerCTA={{
          label: stringValue(record(brandHeader.header_cta).label) || "Hubungi Kami",
          whatsappHref,
        }}
        sticky={booleanValue(record(brandHeader.header_behavior).sticky_header, true)}
        headerStyle={
          stringValue(record(brandHeader.header_behavior).header_style) ===
          "transparent_on_hero"
            ? "transparent_on_hero"
            : "solid"
        }
      />
      <main>{children}</main>
      <FooterIndonesia
        lpkName={stringValue(footerBrand.lpk_name) || lpkName}
        logoSrc={footerLogoSrc ?? logoSrc ?? undefined}
        shortDescription={stringValue(footerBrand.short_description)}
        quickLinks={arrayOfRecords(footer.quick_links).map((item) => ({
          label: stringValue(item.label),
          href: stringValue(item.href) || "/",
          isEnabled: booleanValue(item.is_enabled, true),
          sortOrder: numberValue(item.sort_order),
        }))}
        programLinks={programLinks}
        contact={{
          phone: stringValue(contact.phone_label),
          email: stringValue(contact.email),
          address: stringValue(contact.address),
          operationalHours: stringValue(contact.operational_hours),
        }}
        social={{
          instagram: stringValue(socialLinks.instagram),
          youtube: stringValue(socialLinks.youtube),
          tiktok: stringValue(socialLinks.tiktok),
          facebook: stringValue(socialLinks.facebook),
          line: stringValue(socialLinks.line),
        }}
        legal={{
          copyrightText:
            stringValue(record(footer.legal).copyright_text) ||
            `Copyright ${new Date().getFullYear()} ${lpkName}.`,
          showPoweredBy: booleanValue(record(footer.legal).show_powered_by, true),
        }}
      />
      {booleanValue(whatsapp.floating_is_enabled, true) && whatsappHref !== "#" ? (
        <FloatingCTA
          variant="whatsapp"
          href={whatsappHref}
          iconOnlyLabel={stringValue(whatsapp.floating_icon_only_label) || "WhatsApp"}
          labelAfterScroll={
            stringValue(whatsapp.floating_label_after_scroll) || "Chat WhatsApp"
          }
          position={
            stringValue(whatsapp.floating_position) === "bottom_left"
              ? "bottom-left"
              : "bottom-right"
          }
        />
      ) : null}
    </div>
  );
}

function resolveCachedFooterProgramLinks(variantId: string, footer: PublicJson) {
  const programConfig = record(footer.program_links);
  const source = stringValue(programConfig.source);
  const maxItems = numberValue(programConfig.max_items) || 3;

  if (source === "disabled") {
    return [];
  }

  return unstable_cache(
    () => resolveFooterProgramLinks(variantId, maxItems),
    ["public-layout-indonesia-footer-program-links", variantId, source, String(maxItems)],
    { revalidate: 60, tags: [`collection:${variantId}:program`, `variant:${variantId}`] },
  )();
}

async function resolveFooterProgramLinks(variantId: string, maxItems: number) {
  const collection = await resolveCollectionList(variantId, "program", {
    source: "featured",
    pageSize: maxItems,
  });

  return collection.items.map((item) => ({
    title: item.title,
    href: `/program/${item.slug}`,
  }));
}

function mediaUrl(mediaUrls: Map<string, string>, mediaId: string) {
  return mediaId ? mediaUrls.get(mediaId) : undefined;
}

function record(value: unknown): PublicJson {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as PublicJson)
    : {};
}

function arrayOfRecords(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function isRecord(value: unknown): value is PublicJson {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export type { LayoutIndonesiaProps };
export default LayoutIndonesia;
