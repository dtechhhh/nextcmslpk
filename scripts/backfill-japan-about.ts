import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { tentangKamiJapanSchema } from "../src/lib/validations/pages/tentang-kami-japan";

const APPLY = process.argv.includes("--apply");
const TENANT_SLUG = getArgValue("--tenant") ?? "hit";
const PAGE_KEY = "tentang_kami";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL,
  }),
});

type JsonRecord = Record<string, unknown>;

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) {
    throw new Error(`Tenant "${TENANT_SLUG}" tidak ditemukan.`);
  }

  const variant = await prisma.variant.findUnique({
    where: { tenantId_key: { tenantId: tenant.id, key: "japan" } },
    select: { id: true, key: true },
  });

  if (!variant) {
    throw new Error(`Variant japan untuk tenant "${TENANT_SLUG}" tidak ditemukan.`);
  }

  const page = await prisma.contentPage.findUnique({
    where: { variantId_pageKey: { variantId: variant.id, pageKey: PAGE_KEY } },
    select: {
      id: true,
      title: true,
      status: true,
      dataJson: true,
      publishedDataJson: true,
      updatedAt: true,
    },
  });

  if (!page) {
    throw new Error(`Page "${PAGE_KEY}" variant japan tidak ditemukan.`);
  }

  const media = await prisma.mediaAsset.findMany({
    where: {
      tenantId: tenant.id,
      mediaType: "IMAGE",
      status: "ACTIVE",
    },
    select: { id: true, fileName: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  if (media.length === 0) {
    throw new Error("Tidak ada media IMAGE ACTIVE untuk dipakai mengisi field gambar.");
  }

  const fallbackData = buildJapanAboutFallbackData(media.map((item) => item.id));
  const currentDraft = toRecord(page.dataJson);
  const mergedDraft = mergeMissing(currentDraft, fallbackData);
  const draftValidation = tentangKamiJapanSchema.safeParse(mergedDraft);

  if (!draftValidation.success) {
    console.error(draftValidation.error.flatten());
    throw new Error("Data draft hasil backfill tidak valid.");
  }

  const shouldUpdatePublished = page.status === "PUBLISHED";
  const currentPublished = toRecord(page.publishedDataJson);
  const mergedPublished = shouldUpdatePublished
    ? mergeMissing(currentPublished, fallbackData)
    : currentPublished;

  if (shouldUpdatePublished) {
    const publishedValidation = tentangKamiJapanSchema.safeParse(mergedPublished);

    if (!publishedValidation.success) {
      console.error(publishedValidation.error.flatten());
      throw new Error("Data published hasil backfill tidak valid.");
    }
  }

  const draftBefore = countBlankFields(currentDraft, fallbackData);
  const draftAfter = countBlankFields(mergedDraft, fallbackData);
  const publishedBefore = shouldUpdatePublished
    ? countBlankFields(currentPublished, fallbackData)
    : null;
  const publishedAfter = shouldUpdatePublished
    ? countBlankFields(mergedPublished, fallbackData)
    : null;

  const summary = {
    mode: APPLY ? "apply" : "dry-run",
    tenant: tenant.slug,
    page: page.title,
    status: page.status,
    mediaUsed: media.map((item) => item.fileName),
    draftBlankFieldsBefore: draftBefore,
    draftBlankFieldsAfter: draftAfter,
    publishedBlankFieldsBefore: publishedBefore,
    publishedBlankFieldsAfter: publishedAfter,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!APPLY) {
    console.log("Dry-run selesai. Jalankan ulang dengan --apply untuk menyimpan.");
    return;
  }

  await prisma.contentPage.update({
    where: { id: page.id },
    data: {
      dataJson: draftValidation.data as Prisma.InputJsonValue,
      ...(shouldUpdatePublished
        ? { publishedDataJson: mergedPublished as Prisma.InputJsonValue }
        : {}),
    },
  });

  console.log("Backfill page japan/tentang_kami selesai.");
}

function buildJapanAboutFallbackData(mediaIds: string[]) {
  const media = (index: number) => mediaIds[index % mediaIds.length];

  return {
    hero: {
      media_type: "image",
      media_id: media(0),
      headline: "About HIT Japan Partnership",
      subheadline:
        "A practical bridge for Indonesian talent, Japanese employers, and long-term workforce readiness.",
      eyebrow_label: "Company profile",
    },
    proof_stats: [
      { value: "2015", label: "Founded", sort_order: 0, is_enabled: true },
      { value: "150+", label: "Partner companies", sort_order: 1, is_enabled: true },
      { value: "2,500+", label: "Candidates supported", sort_order: 2, is_enabled: true },
      { value: "95%", label: "Retention focus", sort_order: 3, is_enabled: true },
    ],
    story: {
      image_id: media(1),
      eyebrow_label: "Our story",
      headline: "Connecting preparation in Indonesia with workplace needs in Japan",
      body:
        "HIT supports Indonesian candidates with training, documentation guidance, and partner coordination before they enter Japanese workplaces. The team works with a simple principle: every placement should be clear, prepared, and useful for both the candidate and the employer.",
    },
    timeline: [
      {
        year_label: "2015",
        title: "Foundation",
        description: "The team began building training and placement support for Indonesian candidates.",
        sort_order: 0,
        is_enabled: true,
      },
      {
        year_label: "2018",
        title: "Partner network growth",
        description: "Employer coordination and candidate preparation workflows became more structured.",
        sort_order: 1,
        is_enabled: true,
      },
      {
        year_label: "2021",
        title: "Expanded training support",
        description: "Language, mindset, and workplace readiness modules were strengthened.",
        sort_order: 2,
        is_enabled: true,
      },
      {
        year_label: "2024",
        title: "Japan-facing service focus",
        description: "The Japan variant was prepared to make partner communication clearer.",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    vision_mission: {
      vision_headline: "Vision",
      vision_description:
        "To become a trusted bridge between Indonesia and Japan through responsible talent preparation and transparent partnership.",
      mission_headline: "Mission",
      mission_description:
        "We prepare candidates with practical training, support employers with clear information, and keep the placement process accountable from the first consultation to arrival readiness.",
    },
    values: [
      {
        icon_key: "handshake",
        title: "Trust",
        description: "We keep communication clear so partners and candidates understand each step.",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "graduation_cap",
        title: "Preparation",
        description: "We focus on language, discipline, work culture, and documentation readiness.",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "shield_check",
        title: "Responsibility",
        description: "We prefer careful matching and realistic expectations over short-term volume.",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "globe",
        title: "Partnership",
        description: "We connect both countries with respect for local rules, culture, and people.",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    facilities: [
      {
        title: "Training classroom",
        description: "A practical learning space for language, interview, and workplace habit preparation.",
        image_id: media(2),
        sort_order: 0,
        is_enabled: true,
      },
      {
        title: "Candidate briefing area",
        description: "Used for orientation, document review, and employer-specific preparation.",
        image_id: media(3),
        sort_order: 1,
        is_enabled: true,
      },
      {
        title: "Media and interview support",
        description: "A simple setup for profile checks, remote interviews, and communication support.",
        image_id: media(4),
        sort_order: 2,
        is_enabled: true,
      },
    ],
    team_members: [
      {
        name: "HIT Partnership Team",
        role: "Japan partner support",
        bio:
          "Coordinates communication with employers and keeps candidate information ready for review.",
        image_id: media(5),
        sort_order: 0,
        is_enabled: true,
      },
      {
        name: "Training Coordination Team",
        role: "Candidate preparation",
        bio:
          "Supports language practice, workplace orientation, and readiness tracking before placement.",
        image_id: media(6),
        sort_order: 1,
        is_enabled: true,
      },
      {
        name: "Document Support Team",
        role: "Administration and compliance",
        bio:
          "Helps keep document flow organized so the process is easier to check and follow.",
        image_id: media(7),
        sort_order: 2,
        is_enabled: true,
      },
    ],
    legal_overview: [
      {
        type_label: "Company",
        title: "Company profile",
        description: "Basic company and service overview for partners who need an introduction document.",
        document_label: "View profile",
        document_url: "https://example.com/company-profile.pdf",
        sort_order: 0,
        is_enabled: true,
      },
      {
        type_label: "Process",
        title: "Placement process note",
        description: "Summary of candidate preparation, partner coordination, and document handling.",
        document_label: "View process",
        document_url: "https://example.com/process-note.pdf",
        sort_order: 1,
        is_enabled: true,
      },
      {
        type_label: "Compliance",
        title: "Compliance overview",
        description: "A short reference for responsible recruitment and basic operating principles.",
        document_label: "View overview",
        document_url: "https://example.com/compliance-overview.pdf",
        sort_order: 2,
        is_enabled: true,
      },
    ],
    final_cta: {
      headline: "Talk with the HIT partnership team",
      description:
        "Send a short message and the team will help explain candidate preparation, documents, and next steps.",
      primary_cta_label: "Contact via LINE",
      primary_line_message_template:
        "I viewed the About page and would like to discuss partnership details.",
      secondary_cta_label: "Open contact page",
      secondary_href: "/contact",
    },
  };
}

function mergeMissing(target: unknown, fallback: unknown): unknown {
  if (Array.isArray(fallback)) {
    return mergeArrayMissing(target, fallback);
  }

  if (isRecord(fallback)) {
    if (!isRecord(target)) {
      return fallback;
    }

    const merged: JsonRecord = { ...target };

    for (const [key, value] of Object.entries(fallback)) {
      merged[key] = mergeMissing(merged[key], value);
    }

    return merged;
  }

  return isBlankScalar(target) ? fallback : target;
}

function mergeArrayMissing(target: unknown, fallback: unknown[]) {
  if (!Array.isArray(target) || target.length === 0) {
    return fallback;
  }

  return target.map((item, index) =>
    mergeMissing(item, fallback[Math.min(index, fallback.length - 1)]),
  ).concat(fallback.slice(target.length));
}

function countBlankFields(target: unknown, fallback: unknown): number {
  if (Array.isArray(fallback)) {
    if (!Array.isArray(target) || target.length === 0) {
      return countLeaves(fallback);
    }

    const targetLength = Math.max(target.length, fallback.length);
    let total = 0;

    for (let index = 0; index < targetLength; index += 1) {
      total += countBlankFields(
        target[index],
        fallback[Math.min(index, fallback.length - 1)],
      );
    }

    return total;
  }

  if (isRecord(fallback)) {
    return Object.entries(fallback).reduce(
      (total, [key, value]) =>
        total + countBlankFields(isRecord(target) ? target[key] : undefined, value),
      0,
    );
  }

  return isBlankScalar(target) ? 1 : 0;
}

function countLeaves(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce((total, item) => total + countLeaves(item), 0);
  }

  if (isRecord(value)) {
    return Object.values(value).reduce<number>(
      (total, item) => total + countLeaves(item),
      0,
    );
  }

  return 1;
}

function toRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBlankScalar(value: unknown) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function getArgValue(name: string) {
  const arg = process.argv.find((item) => item.startsWith(`${name}=`));

  return arg?.slice(name.length + 1);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
