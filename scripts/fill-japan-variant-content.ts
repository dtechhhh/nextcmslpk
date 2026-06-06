import "dotenv/config";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";

import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import {
  COLLECTIONS_JAPAN,
  CONFIG_KEYS_JAPAN,
  PAGE_KEYS_JAPAN,
  type JapanCollectionKey,
  type JapanPageKey,
} from "../src/lib/constants";
import {
  COLLECTION_DEFINITIONS,
} from "../src/lib/collection-definitions";
import {
  GLOBAL_CONFIG_EDITOR_DEFINITIONS,
} from "../src/lib/global-config-editor-definitions";
import {
  PAGE_EDITOR_DEFINITIONS,
} from "../src/lib/page-editor-definitions";
import { getCollectionSchema } from "../src/lib/validations/collections";
import { getGlobalConfigSchema } from "../src/lib/validations/global";
import { getContentPageSchema } from "../src/lib/validations/pages";
import { R2_BUCKET_NAME, r2Client } from "../src/lib/r2";

const APPLY = process.argv.includes("--apply");
const AUDIT_DETAILS = process.argv.includes("--audit-details");
const AUDIT_ONLY = process.argv.includes("--audit-only");
const TENANT_SLUG = getArgValue("--tenant") ?? "hit";
const MEDIA_DIR = getArgValue("--media-dir") ?? "dummy image";
const MIN_COLLECTION_ITEMS = Number(getArgValue("--min-items") ?? 3);
const SAMPLE_DOC_URL = "https://example.com/dokumen-contoh-variant-jepang.pdf";
const SAMPLE_MAP_URL = "https://maps.google.com/?q=Jakarta";
const SAMPLE_LINE_URL = "https://line.me/R/ti/p/@hitindonesia";
const SAMPLE_YOUTUBE_ID = "dQw4w9WgXcQ";
const JAPANESE_TEXT_PATTERN = /[\u3040-\u30ff\u3400-\u9fff]/u;
const ICON_KEYS = [
  "check",
  "building",
  "users",
  "globe",
  "award",
  "briefcase",
  "book",
  "clock",
  "star",
  "plane",
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL,
  }),
});

type JsonRecord = Record<string, unknown>;
type AnyField = {
  kind: string;
  path: string;
  label?: string;
  placeholder?: string;
  inputType?: "text" | "email" | "url" | "tel";
  min?: number;
  max?: number;
  optionSetKey?: string;
  options?: Array<{ value: string; label: string }>;
  defaultItem?: JsonRecord;
  fields?: AnyField[];
  blockTypes?: string[];
};

type EditorDefinition = {
  title: string;
  label?: string;
  defaultData: JsonRecord;
  sections: Array<{ fields: AnyField[] }>;
};

type OptionValueRef = {
  id: string;
  value: string;
  label: string;
};

type FillContext = {
  scopeLabel: string;
  imageIds: string[];
  optionValuesBySet: Map<string, OptionValueRef[]>;
  collectionIdsByKey: Map<string, string[]>;
  fullPath?: string;
  itemIndex?: number;
  slug?: string;
  title?: string;
};

const JAPAN_OPTION_SETS: Record<string, { label: string; values: Array<{ value: string; label: string }> }> = {
  japan_news_category: {
    label: "Kategori Berita Jepang",
    values: [
      { value: "news", label: "Berita Umum" },
      { value: "event", label: "Acara Kemitraan" },
      { value: "notice", label: "Pengumuman" },
      { value: "partner-visit", label: "Kunjungan Mitra" },
      { value: "training-activity", label: "Aktivitas Pelatihan" },
      { value: "candidate-dispatch", label: "Penempatan Kandidat" },
    ],
  },
  japan_news_tag: {
    label: "Tag Berita Jepang",
    values: [
      { value: "rekrutmen", label: "Rekrutmen" },
      { value: "pelatihan", label: "Pelatihan" },
      { value: "kemitraan", label: "Kemitraan" },
      { value: "kandidat", label: "Kandidat" },
    ],
  },
  japan_sector_category: {
    label: "Kategori Sektor Jepang",
    values: [
      { value: "manufacturing", label: "Manufaktur" },
      { value: "construction", label: "Konstruksi" },
      { value: "agriculture", label: "Pertanian" },
      { value: "caregiving", label: "Perawatan Lansia" },
      { value: "food-processing", label: "Pengolahan Makanan" },
      { value: "restaurant", label: "Restoran" },
      { value: "accommodation", label: "Perhotelan" },
    ],
  },
};

const PAGE_TITLES: Record<JapanPageKey, string> = {
  homepage: "Beranda Jepang",
  tentang_kami: "Tentang Kami Jepang",
  metode_pelatihan: "Metode Pelatihan",
  profil_kandidat: "Profil Kandidat",
  jaringan_rekrutmen: "Jaringan Rekrutmen",
  sector_page: "Halaman Sektor",
  news_page: "Halaman Berita",
  contact: "Kontak Kemitraan",
};

const PAGE_SLUGS: Record<JapanPageKey, string> = {
  homepage: "beranda-jepang",
  tentang_kami: "tentang-kami-jepang",
  metode_pelatihan: "metode-pelatihan",
  profil_kandidat: "profil-kandidat",
  jaringan_rekrutmen: "jaringan-rekrutmen",
  sector_page: "sektor",
  news_page: "berita",
  contact: "kontak-kemitraan",
};

const SECTOR_TITLES = [
  "Sektor Manufaktur",
  "Sektor Perawatan Lansia",
  "Sektor Perhotelan",
  "Sektor Pengolahan Makanan",
  "Sektor Konstruksi",
];

const NEWS_TITLES = [
  "Kabar Rekrutmen Kandidat Indonesia",
  "Aktivitas Pelatihan Bahasa dan Budaya Kerja",
  "Kunjungan Mitra untuk Persiapan Penempatan",
  "Pembaruan Proses Seleksi Kandidat",
  "Cerita Kolaborasi Pelatihan dan Industri",
];

async function main() {
  console.log(APPLY ? "Mode APPLY: data akan diperbarui." : "Mode DRY-RUN: tidak ada perubahan DB/R2.");

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

  if (AUDIT_ONLY) {
    const audit = await auditJapanVariant(variant.id);
    console.log(
      JSON.stringify(
        {
          tenant: tenant.slug,
          variant: variant.key,
          auditOnly: true,
          audit,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log("Menyiapkan media dummy...");
  const imageIds = await ensureDummyImages(tenant.id);
  console.log(`Media dummy siap: ${imageIds.length} gambar.`);

  console.log("Menyiapkan option set Jepang...");
  const optionValuesBySet = await ensureJapanOptionSets(tenant.id, variant.id);
  console.log("Option set Jepang siap.");

  console.log("Menyiapkan koleksi Jepang...");
  await ensureJapanCollections(tenant.id, variant.id);

  const collectionIdsByKey = new Map<string, string[]>();
  for (const collectionKey of COLLECTIONS_JAPAN.map((item) => item.key)) {
    const items = await ensureMinimumItems(tenant.id, variant.id, collectionKey);
    collectionIdsByKey.set(collectionKey, items.map((item) => item.id));
  }
  console.log("Item koleksi minimum siap.");

  const context: FillContext = {
    scopeLabel: "Variant Jepang",
    imageIds,
    optionValuesBySet,
    collectionIdsByKey,
  };

  console.log("Mengisi global config Jepang...");
  const globalResult = await fillGlobalConfigs(tenant.id, variant.id, context);

  console.log("Mengisi halaman Jepang...");
  const pageResult = await fillPages(tenant.id, variant.id, context);

  console.log("Mengisi koleksi Jepang...");
  const collectionResult = await fillCollections(tenant.id, variant.id, context);

  console.log("Menjalankan audit hasil...");
  const audit = await auditJapanVariant(variant.id);

  console.log(
    JSON.stringify(
      {
        tenant: tenant.slug,
        variant: variant.key,
        apply: APPLY,
        dummyImages: imageIds.length,
        globalConfigs: globalResult,
        pages: pageResult,
        collections: collectionResult,
        audit,
      },
      null,
      2,
    ),
  );
}

async function ensureDummyImages(tenantId: string) {
  const mediaDir = path.resolve(process.cwd(), MEDIA_DIR);
  const entries = await fs.readdir(mediaDir, { withFileTypes: true });
  const imageFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .slice(0, 6);

  if (imageFiles.length === 0) {
    throw new Error(`Tidak ada gambar di folder "${MEDIA_DIR}".`);
  }

  const ids: string[] = [];

  for (const [index, fileName] of imageFiles.entries()) {
    const storedFileName = `dummy-japan-${index + 1}-${sanitizeFileName(fileName)}`;
    const existing = await prisma.mediaAsset.findFirst({
      where: {
        tenantId,
        fileName: storedFileName,
        mediaType: "IMAGE",
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (existing) {
      console.log(`- pakai media existing: ${storedFileName}`);
      ids.push(existing.id);
      continue;
    }

    if (!APPLY) {
      console.log(`- dry-run media: ${storedFileName}`);
      ids.push(`dry-run-media-${index + 1}`);
      continue;
    }

    console.log(`- upload media: ${storedFileName}`);
    const filePath = path.join(mediaDir, fileName);
    const bytes = await fs.readFile(filePath);
    const mimeType = getMimeType(fileName);
    const extension = getExtension(fileName);
    const metadata = await sharp(bytes).metadata();
    const mediaId = createCuidLike();
    const storagePath = `tenants/${tenantId}/media/${mediaId}.${extension}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: storagePath,
        Body: bytes,
        ContentType: mimeType,
      }),
    );

    await prisma.mediaAsset.create({
      data: {
        id: mediaId,
        tenantId,
        fileName: storedFileName,
        mimeType,
        fileSize: bytes.length,
        mediaType: "IMAGE",
        status: "ACTIVE",
        storagePath,
        altText: "Gambar dummy untuk pratinjau konten Jepang",
        width: metadata.width ?? null,
        height: metadata.height ?? null,
      },
    });

    ids.push(mediaId);
  }

  return ids;
}

async function ensureJapanOptionSets(tenantId: string, variantId: string) {
  const optionValuesBySet = new Map<string, OptionValueRef[]>();

  for (const [key, definition] of Object.entries(JAPAN_OPTION_SETS)) {
    const optionSet = APPLY
      ? await prisma.optionSet.upsert({
          where: { variantId_key: { variantId, key } },
          update: { label: definition.label },
          create: { tenantId, variantId, key, label: definition.label },
          select: { id: true },
        })
      : await prisma.optionSet.findUnique({
          where: { variantId_key: { variantId, key } },
          select: { id: true },
        });

    const optionSetId = optionSet?.id ?? `dry-run-option-set-${key}`;
    const refs: OptionValueRef[] = [];

    for (const [index, value] of definition.values.entries()) {
      const option = APPLY
        ? await prisma.optionValue.upsert({
            where: {
              optionSetId_value: {
                optionSetId,
                value: value.value,
              },
            },
            update: {
              label: value.label,
              sortOrder: index,
              isActive: true,
            },
            create: {
              optionSetId,
              value: value.value,
              label: value.label,
              sortOrder: index,
              isActive: true,
            },
            select: { id: true, value: true, label: true },
          })
        : {
            id: `dry-run-${key}-${value.value}`,
            value: value.value,
            label: value.label,
          };

      refs.push(option);
    }

    if (APPLY) {
      const extraValues = await prisma.optionValue.findMany({
        where: {
          optionSetId,
          value: { notIn: definition.values.map((item) => item.value) },
        },
        select: { id: true, value: true },
      });

      for (const extra of extraValues) {
        const sanitizedValue = `pilihan-tambahan-${extra.id.slice(-8).toLowerCase()}`;
        await prisma.optionValue.update({
          where: { id: extra.id },
          data: {
            value: sanitizedValue,
            label: `Pilihan tambahan ${extraValues.indexOf(extra) + 1}`,
            sortOrder: definition.values.length + extraValues.indexOf(extra),
            isActive: false,
          },
        });
      }
    }

    optionValuesBySet.set(key, refs);
  }

  return optionValuesBySet;
}

async function ensureJapanCollections(tenantId: string, variantId: string) {
  for (const collection of COLLECTIONS_JAPAN) {
    if (!APPLY) {
      continue;
    }

    await prisma.contentCollection.upsert({
      where: {
        variantId_key: {
          variantId,
          key: collection.key,
        },
      },
      update: {
        label: collection.key === "news" ? "Berita" : "Sektor",
        isEnabled: true,
      },
      create: {
        tenantId,
        variantId,
        key: collection.key,
        label: collection.key === "news" ? "Berita" : "Sektor",
        isEnabled: true,
      },
    });
  }
}

async function ensureMinimumItems(
  tenantId: string,
  variantId: string,
  collectionKey: JapanCollectionKey,
) {
  const existing = await prisma.contentItem.findMany({
    where: { tenantId, variantId, collectionKey },
    select: { id: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  if (!APPLY || existing.length >= MIN_COLLECTION_ITEMS) {
    return existing;
  }

  const created = [...existing];
  for (let index = existing.length; index < MIN_COLLECTION_ITEMS; index += 1) {
    const title = sampleCollectionTitle(collectionKey, index);
    const slug = `${collectionKey}-contoh-${index + 1}`;
    const item = await prisma.contentItem.create({
      data: {
        tenantId,
        variantId,
        collectionKey,
        title,
        slug,
        status: "DRAFT",
        excerpt: "",
        isFeatured: index === 0,
        sortOrder: index,
        dataJson: {},
      },
      select: { id: true },
    });
    created.push(item);
  }

  return created;
}

async function fillGlobalConfigs(tenantId: string, variantId: string, context: FillContext) {
  const result: Record<string, string> = {};

  for (const configKey of CONFIG_KEYS_JAPAN) {
    const definition = (GLOBAL_CONFIG_EDITOR_DEFINITIONS as unknown as Record<string, EditorDefinition>)[`japan.${configKey}`];
    const fields = definition.sections.flatMap((section: { fields: AnyField[] }) => section.fields) as AnyField[];
    const data = cloneRecord(definition.defaultData);
    const scopedContext = {
      ...context,
      scopeLabel: `Global ${definition.title}`,
    };

    fillFields(data, fields, scopedContext);
    fillResidualValues(data, scopedContext);

    const schema = getGlobalConfigSchema("japan", configKey);
    const parsed = parseFilledOrThrow(schema, data, `global ${configKey}`, scopedContext);

    if (APPLY) {
      await prisma.variantGlobalConfig.upsert({
        where: {
          variantId_configKey: {
            variantId,
            configKey,
          },
        },
        update: {
          dataJson: parsed as Prisma.InputJsonValue,
        },
        create: {
          tenantId,
          variantId,
          configKey,
          dataJson: parsed as Prisma.InputJsonValue,
        },
      });
    }

    result[configKey] = `${countVisibleEmptyFields(parsed, fields)} kosong`;
  }

  return result;
}

async function fillPages(tenantId: string, variantId: string, context: FillContext) {
  const result: Record<string, string> = {};

  for (const pageKey of PAGE_KEYS_JAPAN) {
    const definition = (PAGE_EDITOR_DEFINITIONS as unknown as Record<string, EditorDefinition>)[`japan.${pageKey}`];
    const fields = definition.sections.flatMap((section: { fields: AnyField[] }) => section.fields) as AnyField[];
    const title = PAGE_TITLES[pageKey];
    const slug = PAGE_SLUGS[pageKey];
    const data = cloneRecord(definition.defaultData);
    const scopedContext = {
      ...context,
      scopeLabel: `Halaman ${title}`,
      slug,
      title,
    };

    fillFields(data, fields, scopedContext);
    fillResidualValues(data, scopedContext);

    const schema = getContentPageSchema("japan", pageKey);
    const parsed = parseFilledOrThrow(schema, data, `page ${pageKey}`, scopedContext);

    if (APPLY) {
      await prisma.contentPage.upsert({
        where: {
          variantId_pageKey: {
            variantId,
            pageKey,
          },
        },
        update: {
          title,
          slug,
          status: "PUBLISHED",
          dataJson: parsed as Prisma.InputJsonValue,
          publishedDataJson: parsed as Prisma.InputJsonValue,
        },
        create: {
          tenantId,
          variantId,
          pageKey,
          title,
          slug,
          status: "PUBLISHED",
          dataJson: parsed as Prisma.InputJsonValue,
          publishedDataJson: parsed as Prisma.InputJsonValue,
        },
      });
    }

    result[pageKey] = `${countVisibleEmptyFields(parsed, fields)} kosong`;
  }

  return result;
}

async function fillCollections(tenantId: string, variantId: string, context: FillContext) {
  const result: Record<string, string> = {};

  for (const collectionKey of COLLECTIONS_JAPAN.map((item) => item.key)) {
    const definition = (COLLECTION_DEFINITIONS as unknown as Record<string, EditorDefinition>)[collectionKey];
    const fields = definition.sections.flatMap((section: { fields: AnyField[] }) => section.fields) as AnyField[];
    const items = await prisma.contentItem.findMany({
      where: { tenantId, variantId, collectionKey },
      select: { id: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    let emptyCount = 0;

    for (const [index, item] of items.entries()) {
      const title = sampleCollectionTitle(collectionKey, index);
      const slug = `${collectionKey === "news" ? "berita" : "sektor"}-contoh-${index + 1}`;
      const data = cloneRecord(definition.defaultData);
      const scopedContext = {
        ...context,
        scopeLabel: `${definition.label ?? definition.title} ${index + 1}`,
        itemIndex: index,
        slug,
        title,
      };

      fillFields(data, fields, scopedContext);
      fillResidualValues(data, scopedContext);
      applyCollectionOverrides(data, collectionKey, title, slug, index, context);

      const schema = getCollectionSchema(collectionKey);
      const parsed = parseFilledOrThrow(
        schema,
        data,
        `collection ${collectionKey} item ${index + 1}`,
        scopedContext,
      );
      emptyCount += countVisibleEmptyFields(parsed, fields);

      if (APPLY) {
        await prisma.contentItem.update({
          where: { id: item.id },
          data: {
            title,
            slug,
            status: "PUBLISHED",
            excerpt: getCollectionExcerpt(collectionKey, index),
            thumbnailImageId: pickImageId(context.imageIds, index),
            heroImageId: pickImageId(context.imageIds, index + 1),
            isFeatured: index === 0,
            publishedAt: new Date(),
            sortOrder: index,
            dataJson: parsed as Prisma.InputJsonValue,
            publishedDataJson: parsed as Prisma.InputJsonValue,
          },
        });
      }
    }

    result[collectionKey] = `${items.length} item, ${emptyCount} field kosong`;
  }

  return result;
}

function fillFields(container: JsonRecord, fields: AnyField[], context: FillContext) {
  for (const field of fields) {
    fillField(container, field, context);
  }
}

function fillField(container: JsonRecord, field: AnyField, context: FillContext) {
  const fullPath = joinPath(context.fullPath, field.path);

  if (field.kind === "array") {
    const currentValue = getAtPath(container, field.path);
    const currentItems = Array.isArray(currentValue) ? currentValue : [];
    const targetLength = Math.max(currentItems.length, field.defaultItem ? 3 : 1);
    const nextItems = Array.from({ length: targetLength }, (_, index) => {
      const sourceItem = isRecord(currentItems[index]) ? currentItems[index] : {};
      const item = {
        ...cloneRecord(field.defaultItem),
        ...cloneRecord(sourceItem),
      };
      const itemContext = {
        ...context,
        fullPath: `${fullPath}.${index}`,
        itemIndex: index,
      };

      fillFields(item, field.fields ?? [], itemContext);

      if ("sort_order" in item) {
        item.sort_order = index;
      }
      if ("is_enabled" in item) {
        item.is_enabled = true;
      }

      return item;
    });

    setAtPath(container, field.path, nextItems);
    return;
  }

  if (field.kind === "string-array") {
    setAtPath(container, field.path, [
      `Poin ${context.scopeLabel} 1`,
      `Poin ${context.scopeLabel} 2`,
    ]);
    return;
  }

  if (field.kind === "media-array") {
    setAtPath(container, field.path, [
      pickImageId(context.imageIds, 0),
      pickImageId(context.imageIds, 1),
      pickImageId(context.imageIds, 2),
    ]);
    return;
  }

  if (field.kind === "content-blocks") {
    setAtPath(container, field.path, buildContentBlocks(field.blockTypes ?? [], context));
    return;
  }

  if (field.kind === "multiselect") {
    const options = context.optionValuesBySet.get(field.optionSetKey ?? "") ?? [];
    setAtPath(container, field.path, options.slice(0, 2).map((option) => option.id));
    return;
  }

  setAtPath(container, field.path, scalarValue(field, context, container, fullPath));
}

function scalarValue(
  field: AnyField,
  context: FillContext,
  container: JsonRecord,
  fullPath: string,
) {
  const normalizedPath = fullPath.toLowerCase();
  const itemIndex = context.itemIndex ?? 0;

  switch (field.kind) {
    case "switch":
      return true;
    case "number":
      if (normalizedPath.endsWith("sort_order")) return itemIndex;
      if (normalizedPath.includes("max_items")) return clampNumber(3, field.min, field.max);
      return clampNumber(field.min ?? 1, field.min, field.max);
    case "date":
      return "2026-12-31";
    case "media":
      return pickImageId(context.imageIds, itemIndex);
    case "icon":
      return ICON_KEYS[itemIndex % ICON_KEYS.length];
    case "color":
      return colorValue(normalizedPath, field.placeholder);
    case "select": {
      if ("optionSetKey" in field && field.optionSetKey) {
        const options = context.optionValuesBySet.get(field.optionSetKey) ?? [];
        return options[itemIndex % Math.max(options.length, 1)]?.id ?? "";
      }

      const options = "options" in field ? field.options ?? [] : [];
      const key = readString(getAtPath(container, "key"));
      const matchingOption = key
        ? options.find((option: { value: string }) => option.value === key)
        : null;

      return matchingOption?.value ?? options[itemIndex % Math.max(options.length, 1)]?.value ?? "";
    }
    case "text":
    case "textarea":
      return textValue(field, context, container, normalizedPath);
  }
}

function textValue(
  field: AnyField,
  context: FillContext,
  container: JsonRecord,
  normalizedPath: string,
) {
  const key = readString(getAtPath(container, "key"));
  const label = key ? labelForKey(key) : "";
  const isTextArea = field.kind === "textarea";

  if (normalizedPath.endsWith("slug")) return context.slug ?? "contoh-variant-jepang";
  if (normalizedPath.endsWith("label") && label) return label;
  if (normalizedPath.endsWith("href") && key) return hrefForKey(key);
  if (normalizedPath.endsWith("href")) return "/contact";
  if ((field.kind === "text" && field.inputType === "email") || normalizedPath.includes("email")) {
    return "kemitraan@example.com";
  }
  if (
    (field.kind === "text" && field.inputType === "url") ||
    normalizedPath.endsWith("_url") ||
    normalizedPath.endsWith(".url") ||
    normalizedPath.includes("map_url") ||
    normalizedPath.includes("file_url")
  ) {
    return urlForPath(normalizedPath);
  }
  if (normalizedPath.includes("line_official_account_id")) return "@hitindonesia";
  if (normalizedPath.includes("phone")) return "+62 812 3456 7890";
  if (normalizedPath.includes("business_hours") || normalizedPath.includes("operational_hours")) {
    return "Senin-Jumat, 09.00-17.00 WIB";
  }
  if (normalizedPath.includes("copyright")) return "Copyright 2026 HIT Indonesia. Semua hak dilindungi.";
  if (normalizedPath.includes("video_id")) return SAMPLE_YOUTUBE_ID;
  if (normalizedPath.endsWith("title") || normalizedPath.endsWith("headline")) {
    return context.title ?? `Judul ${context.scopeLabel}`;
  }
  if (normalizedPath.includes("subtitle")) {
    return `Subjudul contoh untuk ${context.scopeLabel}`;
  }
  if (normalizedPath.includes("document_label")) return "Unduh dokumen contoh";
  if (normalizedPath.includes("button_label")) return "Unduh materi";
  if (normalizedPath.includes("cta_label") || normalizedPath.endsWith("label")) {
    return "Hubungi Tim Kami";
  }
  if (normalizedPath.includes("message_template")) {
    return "Halo, saya ingin berkonsultasi tentang kebutuhan kemitraan dan rekrutmen.";
  }
  if (normalizedPath.includes("address")) {
    return "Jl. Contoh Kemitraan No. 10, Jakarta, Indonesia";
  }
  if (normalizedPath.includes("year_label")) {
    return `202${(context.itemIndex ?? 0) + 1}`;
  }
  if (normalizedPath.includes("value")) {
    return `${((context.itemIndex ?? 0) + 1) * 25}+`;
  }
  if (normalizedPath.includes("reading_time")) return "5 menit baca";
  if (normalizedPath.includes("author_name")) return "Tim Kemitraan HIT";
  if (normalizedPath.includes("author_title")) return "Editor Konten";

  if (isTextArea) {
    return `Deskripsi lengkap untuk ${context.scopeLabel}. Konten ini sengaja ditulis dalam Bahasa Indonesia agar mudah direview sebelum diterjemahkan kembali.`;
  }

  return `${field.label} ${context.scopeLabel}`;
}

function buildContentBlocks(blockTypes: string[], context: FillContext) {
  return blockTypes.map((type, index) => {
    const base = { type, sort_order: index };

    if (type === "heading") {
      return { ...base, data: { level: "h2", text: `Bagian Utama ${context.scopeLabel}` } };
    }
    if (type === "paragraph") {
      return {
        ...base,
        data: {
          text: `Paragraf contoh untuk ${context.scopeLabel}. Semua teks menggunakan Bahasa Indonesia agar proses review konten lebih mudah.`,
        },
      };
    }
    if (type === "quote") {
      return {
        ...base,
        data: {
          text: "Kami menyiapkan kandidat dengan proses yang terukur dan mudah dipantau.",
          author: "Tim Kemitraan HIT",
        },
      };
    }
    if (type === "image") {
      return {
        ...base,
        data: {
          image_id: pickImageId(context.imageIds, index),
          alt_text: "Gambar dummy konten",
          caption: "Keterangan gambar dummy untuk pratinjau.",
        },
      };
    }
    if (type === "youtube_embed") {
      return {
        ...base,
        data: {
          video_id: SAMPLE_YOUTUBE_ID,
          caption: "Video contoh untuk pratinjau konten.",
        },
      };
    }
    if (type === "line_cta") {
      return {
        ...base,
        data: {
          label: "Hubungi via LINE",
          line_message_template: "Halo, saya ingin berkonsultasi tentang konten ini.",
        },
      };
    }
    if (type === "sector_callout") {
      return {
        ...base,
        data: {
          sector_id: context.collectionIdsByKey.get("sector")?.[0] ?? "",
        },
      };
    }
    if (type === "whatsapp_cta") {
      return {
        ...base,
        data: {
          label: "Hubungi via WhatsApp",
          whatsapp_message_template: "Halo, saya ingin berkonsultasi.",
        },
      };
    }
    if (type === "offer_callout") {
      return { ...base, data: { offer_id: "" } };
    }

    return { ...base, data: {} };
  });
}

function applyCollectionOverrides(
  data: JsonRecord,
  collectionKey: JapanCollectionKey,
  title: string,
  slug: string,
  index: number,
  context: FillContext,
) {
  data.title = title;
  data.slug = slug;
  data.subtitle = `Subjudul contoh untuk ${title}`;
  data.status = "PUBLISHED";
  data.is_featured = index === 0;
  data.sort_order = index;

  if (collectionKey === "news") {
    data.excerpt = getCollectionExcerpt(collectionKey, index);
    data.cover_image_id = pickImageId(context.imageIds, index);
    data.author_image_id = pickImageId(context.imageIds, index + 1);
    data.published_at = "2026-06-05";
    data.related_source = "same_category";
    data.related_max_items = 3;
    data.manual_news_ids = context.collectionIdsByKey
      .get("news")
      ?.filter((id) => id !== context.collectionIdsByKey.get("news")?.[index])
      .slice(0, 2) ?? [];
    data.related_articles = data.manual_news_ids;
  }

  if (collectionKey === "sector") {
    data.excerpt = getCollectionExcerpt(collectionKey, index);
    data.short_description = `Deskripsi singkat untuk ${title} dalam Bahasa Indonesia.`;
    data.overview = `Gambaran umum ${title}. Bagian ini menjelaskan kebutuhan mitra, kesiapan kandidat, dan alur kerja secara ringkas.`;
    data.thumbnail_image_id = pickImageId(context.imageIds, index);
    data.hero_image_id = pickImageId(context.imageIds, index + 1);
    data.primary_cta_label = "Konsultasi Sektor";
    data.secondary_cta_label = "Unduh Ringkasan Sektor";
    data.secondary_document_url = SAMPLE_DOC_URL;
    data.secondary_document_file_id = pickImageId(context.imageIds, index + 2);
  }
}

function fillResidualValues(value: unknown, context: FillContext, currentPath = ""): unknown {
  if (typeof value === "string") {
    if (value.trim() !== "") return value;
    return residualString(currentPath, context);
  }

  if (Array.isArray(value)) {
    if (value.length > 0) {
      return value.map((item, index) =>
        fillResidualValues(item, { ...context, itemIndex: index }, `${currentPath}.${index}`),
      );
    }

    if (currentPath.endsWith("_ids")) {
      if (currentPath.includes("news")) return context.collectionIdsByKey.get("news")?.slice(0, 2) ?? [];
      return [pickImageId(context.imageIds, 0), pickImageId(context.imageIds, 1)];
    }

    return value;
  }

  if (isRecord(value)) {
    for (const key of Object.keys(value)) {
      value[key] = fillResidualValues(
        value[key],
        context,
        currentPath ? `${currentPath}.${key}` : key,
      );
    }
    return value;
  }

  return value;
}

function residualString(currentPath: string, context: FillContext) {
  const pathKey = currentPath.toLowerCase();

  if (pathKey.endsWith("_id") || pathKey.endsWith("_file_id")) {
    return pickImageId(context.imageIds, context.itemIndex ?? 0);
  }
  if (pathKey.endsWith("_url") || pathKey.endsWith(".url") || pathKey.includes("href")) {
    return urlForPath(pathKey);
  }
  if (pathKey.includes("email")) return "kemitraan@example.com";
  if (pathKey.includes("phone")) return "+62 812 3456 7890";
  if (pathKey.includes("line")) return "@hitindonesia";
  return `Isi contoh ${context.scopeLabel}`;
}

async function auditJapanVariant(variantId: string) {
  const [configs, pages, items, optionSets] = await Promise.all([
    prisma.variantGlobalConfig.findMany({
      where: { variantId, configKey: { in: [...CONFIG_KEYS_JAPAN] } },
      select: { configKey: true, dataJson: true },
    }),
    prisma.contentPage.findMany({
      where: { variantId, pageKey: { in: [...PAGE_KEYS_JAPAN] } },
      select: { pageKey: true, title: true, dataJson: true, publishedDataJson: true },
    }),
    prisma.contentItem.findMany({
      where: { variantId, collectionKey: { in: COLLECTIONS_JAPAN.map((item) => item.key) } },
      select: { collectionKey: true, title: true, excerpt: true, dataJson: true, publishedDataJson: true },
    }),
    prisma.optionSet.findMany({
      where: { variantId, key: { in: Object.keys(JAPAN_OPTION_SETS) } },
      select: { key: true, label: true, values: { select: { label: true, value: true } } },
    }),
  ]);

  const strings = [
    ...configs.flatMap((item) => collectStrings(item.dataJson)),
    ...pages.flatMap((item) => [item.title, ...collectStrings(item.dataJson), ...collectStrings(item.publishedDataJson)]),
    ...items.flatMap((item) => [
      item.title,
      item.excerpt ?? "",
      ...collectStrings(item.dataJson),
      ...collectStrings(item.publishedDataJson),
    ]),
    ...optionSets.flatMap((set) => [set.label, ...set.values.flatMap((value) => [value.label, value.value])]),
  ];

  return {
    globalConfigs: configs.length,
    pages: pages.length,
    items: items.length,
    optionSets: optionSets.length,
    japaneseStringCount: strings.filter((value) => JAPANESE_TEXT_PATTERN.test(value)).length,
    emptyStringCount: strings.filter((value) => value.trim() === "").length,
    ...(AUDIT_DETAILS
      ? {
          details: [
            ...configs.flatMap((item) => collectFlaggedStrings(item.dataJson, `config.${item.configKey}`)),
            ...pages.flatMap((item) =>
              collectFlaggedStrings(
                {
                  title: item.title,
                  dataJson: item.dataJson,
                  publishedDataJson: item.publishedDataJson,
                },
                `page.${item.pageKey}`,
              ),
            ),
            ...items.flatMap((item) =>
              collectFlaggedStrings(
                {
                  title: item.title,
                  excerpt: item.excerpt ?? "",
                  dataJson: item.dataJson,
                  publishedDataJson: item.publishedDataJson,
                },
                `item.${item.collectionKey}.${item.title}`,
              ),
            ),
            ...optionSets.flatMap((set) =>
              collectFlaggedStrings(
                {
                  label: set.label,
                  values: set.values,
                },
                `optionSet.${set.key}`,
              ),
            ),
          ],
        }
      : {}),
  };
}

function countVisibleEmptyFields(data: unknown, fields: AnyField[]) {
  let count = 0;

  for (const field of fields) {
    const value = getAtPath(data, field.path);

    if (field.kind === "array") {
      const items = Array.isArray(value) ? value : [];
      if (items.length === 0) count += 1;
      for (const item of items) {
        count += countVisibleEmptyFields(item, field.fields ?? []);
      }
      continue;
    }

    if (field.kind === "string-array" || field.kind === "media-array" || field.kind === "content-blocks") {
      if (!Array.isArray(value) || value.length === 0) count += 1;
      continue;
    }

    if (field.kind === "multiselect") {
      if (!Array.isArray(value) || value.length === 0) count += 1;
      continue;
    }

    if (typeof value === "string" && value.trim() === "") {
      count += 1;
    }
  }

  return count;
}

function parseOrThrow(schema: z.ZodType | null, data: JsonRecord, label: string) {
  if (!schema) {
    throw new Error(`Schema tidak ditemukan untuk ${label}.`);
  }

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    console.error(JSON.stringify(parsed.error.flatten(), null, 2));
    throw new Error(`Data tidak valid untuk ${label}.`);
  }

  return parsed.data as JsonRecord;
}

function parseFilledOrThrow(
  schema: z.ZodType | null,
  data: JsonRecord,
  label: string,
  context: FillContext,
) {
  const parsed = parseOrThrow(schema, data, label);
  fillResidualValues(parsed, context);
  return parseOrThrow(schema, parsed, label);
}

function getCollectionExcerpt(collectionKey: JapanCollectionKey, index: number) {
  if (collectionKey === "news") {
    return `Ringkasan berita ${index + 1} tentang aktivitas rekrutmen, pelatihan, dan kemitraan Indonesia.`;
  }

  return `Ringkasan sektor ${index + 1} untuk melihat kesiapan kandidat, alur pelatihan, dan kebutuhan mitra.`;
}

function sampleCollectionTitle(collectionKey: JapanCollectionKey, index: number) {
  const titles = collectionKey === "news" ? NEWS_TITLES : SECTOR_TITLES;
  return titles[index % titles.length];
}

function urlForPath(normalizedPath: string) {
  if (normalizedPath.includes("line")) return SAMPLE_LINE_URL;
  if (normalizedPath.includes("linkedin")) return "https://www.linkedin.com/company/contoh-kemitraan";
  if (normalizedPath.includes("youtube")) return "https://www.youtube.com/@contohkemitraan";
  if (normalizedPath.includes("instagram")) return "https://www.instagram.com/contohkemitraan";
  if (normalizedPath.includes("map")) return SAMPLE_MAP_URL;
  if (normalizedPath.includes("href")) return "/contact";
  return SAMPLE_DOC_URL;
}

function labelForKey(key: string) {
  const labels: Record<string, string> = {
    about: "Tentang Kami",
    training_method: "Metode Pelatihan",
    candidate_profile: "Profil Kandidat",
    news: "Berita",
    recruitment_network: "Jaringan Rekrutmen",
    sectors: "Sektor",
    contact: "Kontak",
    curriculum: "Kurikulum",
  };

  return labels[key] ?? humanize(key);
}

function hrefForKey(key: string) {
  const hrefs: Record<string, string> = {
    about: "/about",
    training_method: "/training-method",
    candidate_profile: "/candidate-profile",
    news: "/news",
    recruitment_network: "/recruitment-network",
    sectors: "/sectors",
    contact: "/contact",
    curriculum: "/training-method",
  };

  return hrefs[key] ?? `/${key.replace(/_/g, "-")}`;
}

function colorValue(normalizedPath: string, placeholder?: string) {
  if (placeholder && /^#[0-9a-f]{6}$/i.test(placeholder)) return placeholder;
  if (normalizedPath.includes("hover")) return "#17435f";
  if (normalizedPath.includes("accent")) return "#e53935";
  if (normalizedPath.includes("cta")) return "#06c755";
  return "#1e3a5f";
}

function pickImageId(imageIds: string[], index: number) {
  if (imageIds.length === 0) {
    throw new Error("Tidak ada image id untuk pengisian media.");
  }

  return imageIds[index % imageIds.length];
}

function getAtPath(source: unknown, pathValue: string) {
  return pathValue
    .split(".")
    .filter(Boolean)
    .reduce<unknown>((value, segment) => {
      if (!isRecord(value)) return undefined;
      return value[segment];
    }, source);
}

function setAtPath(target: JsonRecord, pathValue: string, value: unknown) {
  const segments = pathValue.split(".").filter(Boolean);
  let cursor: JsonRecord = target;

  for (const segment of segments.slice(0, -1)) {
    if (!isRecord(cursor[segment])) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as JsonRecord;
  }

  cursor[segments.at(-1) ?? pathValue] = value;
}

function cloneRecord(value: unknown): JsonRecord {
  if (!isRecord(value)) return {};
  return JSON.parse(JSON.stringify(value)) as JsonRecord;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (isRecord(value)) return Object.values(value).flatMap(collectStrings);
  return [];
}

function collectFlaggedStrings(value: unknown, currentPath: string): Array<{
  kind: "empty" | "japanese";
  path: string;
  value: string;
}> {
  if (typeof value === "string") {
    if (value.trim() === "") {
      return [{ kind: "empty", path: currentPath, value }];
    }
    if (JAPANESE_TEXT_PATTERN.test(value)) {
      return [{ kind: "japanese", path: currentPath, value: value.slice(0, 120) }];
    }
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectFlaggedStrings(item, `${currentPath}[${index}]`));
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) =>
      collectFlaggedStrings(item, currentPath ? `${currentPath}.${key}` : key),
    );
  }

  return [];
}

function joinPath(prefix: string | undefined, fieldPath: string) {
  return prefix ? `${prefix}.${fieldPath}` : fieldPath;
}

function clampNumber(value: number, min?: number, max?: number) {
  let nextValue = value;
  if (typeof min === "number") nextValue = Math.max(nextValue, min);
  if (typeof max === "number") nextValue = Math.min(nextValue, max);
  return nextValue;
}

function humanize(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[\\/]/g, "")
    .replace(/[^a-zA-Z0-9._ -]/g, "_")
    .replace(/\s+/g, "-")
    .slice(0, 120);
}

function getMimeType(fileName: string) {
  const extension = getExtension(fileName);
  if (extension === "jpeg") return "image/jpeg";
  if (extension === "webp") return "image/webp";
  return "image/png";
}

function getExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "jpeg";
  if (extension === "webp") return "webp";
  return "png";
}

function createCuidLike() {
  return `c${Date.now().toString(36)}${randomBytes(10).toString("hex")}`.slice(0, 28);
}

function getArgValue(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
