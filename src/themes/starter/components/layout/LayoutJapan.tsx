import type { TenantModel } from "@/generated/prisma/models";
import type { ReactNode } from "react";

import { buildLineUrl } from "@/lib/line";
import {
  resolveMediaUrls,
  type PublicJson,
} from "@/server/resolvers/public";
import { FooterJapan } from "@/themes/starter/components/layout/FooterJapan";
import { HeaderJapan } from "@/themes/starter/components/layout/HeaderJapan";
import { getVariantAppearanceStyle } from "@/themes/starter/design-system/appearance";

type LayoutJapanProps = {
  globalConfig: Record<string, PublicJson>;
  tenant: TenantModel;
  children: ReactNode;
};

export async function LayoutJapan({
  globalConfig,
  tenant,
  children,
}: LayoutJapanProps) {
  const brandHeader = record(globalConfig.brand_header);
  const lineBusinessContact = record(globalConfig.line_business_contact);
  const footer = record(globalConfig.footer);
  const brand = record(brandHeader.brand);
  const topbar = record(brandHeader.topbar);
  const lineContact = record(lineBusinessContact.line_contact);
  const businessEmail = record(lineBusinessContact.business_email);
  const businessInfo = record(lineBusinessContact.business_info);
  const documents = record(lineBusinessContact.documents);
  const socialLinks = record(lineBusinessContact.social_links);
  const footerBrand = record(footer.brand);
  const footerContact = record(footer.contact);
  const headerPrimaryCta = record(brandHeader.header_primary_cta);
  const headerSecondaryCta = record(brandHeader.header_secondary_cta);
  const appearanceStyle = getVariantAppearanceStyle("japan", brandHeader.appearance);

  const lpkName = stringValue(brand.lpk_name) || tenant.name;
  const tagline = stringValue(brand.tagline);
  const isLineEnabled = booleanValue(lineContact.is_enabled, true);
  const isBusinessEmailEnabled = booleanValue(businessEmail.is_enabled, true);
  const lineAccountId = isLineEnabled ? stringValue(lineContact.line_official_account_id) : "";
  const defaultLineMessage =
    stringValue(lineContact.default_message_template) ||
    "お世話になっております。{lpk_name}へインドネシア人材の採用について相談を希望しております。";
  const logoImageId = stringValue(brand.logo_image_id);
  const logoLightImageId = stringValue(brand.logo_light_image_id);
  const companyProfileUrl = stringValue(documents.company_profile_url);
  const curriculumFileId = stringValue(documents.curriculum_file_id);
  const headerDocumentId = resolveHeaderDocumentId(headerSecondaryCta, documents);
  const headerHref = stringValue(headerSecondaryCta.href);
  const footerLogoImageId = stringValue(footerBrand.logo_image_id);
  const footerResourceItems = arrayOfRecords(footer.resource_links);
  const footerResourceDocumentIds = footerResourceItems.map((item) =>
    stringValue(item.document_file_id),
  );
  const mediaUrls = await resolveMediaUrls([
    logoImageId,
    logoLightImageId,
    headerDocumentId,
    curriculumFileId,
    footerLogoImageId,
    ...footerResourceDocumentIds,
  ]);
  const logoSrc = mediaUrl(mediaUrls, logoImageId);
  const logoLightSrc = mediaUrl(mediaUrls, logoLightImageId);
  const headerFallbackDocUrl = mediaUrl(mediaUrls, headerDocumentId);
  const headerDownloadUrl = headerHref || companyProfileUrl || headerFallbackDocUrl || undefined;
  const footerLogoSrc = mediaUrl(mediaUrls, footerLogoImageId);
  const footerResourceLinks = resolveFooterResourceLinks(footerResourceItems, mediaUrls, documents);

  return (
    <div
      data-variant="japan"
      className="theme-japan font-japanese min-h-screen bg-white text-neutral-900"
      style={appearanceStyle}
    >
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.lang="ja"' }} />
      <HeaderJapan
        lpkName={lpkName}
        tagline={tagline}
        logoSrc={logoSrc ?? undefined}
        logoLightSrc={logoLightSrc ?? undefined}
        topbar={{
          locationLabel: stringValue(topbar.location_label),
          emailLabel: stringValue(topbar.email_label),
          businessHoursLabel: stringValue(topbar.business_hours_label),
          isEnabled: booleanValue(topbar.is_enabled, true),
        }}
        navItems={arrayOfRecords(brandHeader.navbar).map((item) => ({
          key: stringValue(item.key),
          label: stringValue(item.label),
          href: stringValue(item.href) || "/",
          isEnabled: booleanValue(item.is_enabled, true),
          sortOrder: numberValue(item.sort_order),
        }))}
        primaryCTA={
          lineAccountId
            ? {
                label:
                  stringValue(headerPrimaryCta.label) ||
                  stringValue(lineContact.line_display_label) ||
                  "LINEで採用相談",
                lineAccountId,
                lineMessageTemplate:
                  stringValue(headerPrimaryCta.line_message_template) || defaultLineMessage,
              }
            : undefined
        }
        secondaryCTA={{
          label: stringValue(headerSecondaryCta.label) || "会社案内",
          type: headerDownloadUrl ? "document" : "internal_link",
          documentUrl: headerDownloadUrl,
          href: stringValue(headerSecondaryCta.href) || "/contact",
          isEnabled: booleanValue(headerSecondaryCta.is_enabled, true),
        }}
        sticky={booleanValue(record(brandHeader.header_behavior).sticky_header, true)}
      />
      <main>{children}</main>
      <FooterJapan
        lpkName={stringValue(footerBrand.lpk_name) || lpkName}
        tagline={tagline}
        logoSrc={footerLogoSrc ?? logoSrc ?? undefined}
        shortDescription={stringValue(footerBrand.short_description)}
        companyLinks={arrayOfRecords(footer.company_links).map((item) => ({
          label: stringValue(item.label),
          href: stringValue(item.href) || "/",
          isEnabled: booleanValue(item.is_enabled, true),
          sortOrder: numberValue(item.sort_order),
        }))}
        resourceLinks={footerResourceLinks}
        contact={{
          usedFromGlobal: booleanValue(footerContact.use_global_contact, true),
        }}
        contactData={{
          phone: stringValue(businessInfo.phone_label),
          address: stringValue(businessInfo.address),
          operationalHours: stringValue(businessInfo.operational_hours),
          email: isBusinessEmailEnabled ? stringValue(businessEmail.email) : "",
        }}
        lineContact={
          lineAccountId
            ? {
                href: buildLineUrl(lineAccountId, defaultLineMessage, {
                  lpk_name: lpkName,
                }),
                displayLabel:
                  stringValue(lineContact.line_display_label) ||
                  "LINEで採用相談",
                isEnabled: true,
              }
            : undefined
        }
        social={{
          line: stringValue(socialLinks.line),
          linkedin: stringValue(socialLinks.linkedin),
          youtube: stringValue(socialLinks.youtube),
          instagram: stringValue(socialLinks.instagram),
        }}
        legal={{
          copyrightText:
            stringValue(record(footer.legal).copyright_text) ||
            `Copyright ${new Date().getFullYear()} ${lpkName}.`,
          showPoweredBy: booleanValue(record(footer.legal).show_powered_by, true),
        }}
      />
    </div>
  );
}

function resolveHeaderDocumentId(
  headerSecondaryCta: PublicJson,
  documents: PublicJson,
) {
  const headerDocumentId = stringValue(headerSecondaryCta.document_file_id);
  const fallbackDocumentId = stringValue(documents.company_profile_file_id);

  return headerDocumentId || fallbackDocumentId;
}

function resolveFooterResourceLinks(
  items: PublicJson[],
  mediaUrls: Map<string, string>,
  documents: PublicJson,
) {
  const curriculumUrl = stringValue(documents.curriculum_url);
  const curriculumFileId = stringValue(documents.curriculum_file_id);
  const curriculumFallbackDocUrl =
    curriculumUrl || mediaUrl(mediaUrls, curriculumFileId) || undefined;

  return items.map((item) => {
    const key = stringValue(item.key);
    const href = stringValue(item.href);
    const docFileId = stringValue(item.document_file_id);
    const itemFallbackDocUrl = mediaUrl(mediaUrls, docFileId) || undefined;
    const fallbackDocUrl =
      itemFallbackDocUrl || (key === "curriculum" ? curriculumFallbackDocUrl : undefined);
    const effectiveUrl = href || fallbackDocUrl;
    return {
      label: stringValue(item.label),
      href: effectiveUrl || undefined,
      documentUrl: !href ? fallbackDocUrl : undefined,
      isEnabled: booleanValue(item.is_enabled, true),
      sortOrder: numberValue(item.sort_order),
    };
  });
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
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export type { LayoutJapanProps };
export default LayoutJapan;
