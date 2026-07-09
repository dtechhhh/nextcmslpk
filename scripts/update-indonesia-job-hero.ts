import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import { Prisma, PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to update the Indonesia job hero.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const targetHost = readArgument("--host") || "hit-indonesia.lpk.local:3000";
const targetTenantSlug = readArgument("--tenant") || "hit";
const targetMediaId = readArgument("--media-id") || "cmqbwytxk0000mippudljymle";

function readArgument(name: string) {
  const prefix = `${name}=`;
  return process.argv
    .slice(2)
    .find((argument) => argument.startsWith(prefix))
    ?.slice(prefix.length)
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown) {
  return isRecord(value) ? value : {};
}

function json(value: Record<string, unknown>): Prisma.InputJsonObject {
  return value as Prisma.InputJsonObject;
}

function updateJobPageData(value: unknown) {
  const current = record(value);
  const hero = record(current.hero);

  return {
    ...current,
    hero: {
      ...hero,
      image_id: targetMediaId,
      media_id: targetMediaId,
      media_alt: "Ilustrasi kandidat membaca informasi peluang kerja Jepang",
    },
  };
}

async function main() {
  const variantByDomain = await prisma.variant.findFirst({
    where: { key: "indonesia", domains: { some: { host: targetHost } } },
    select: { id: true, tenantId: true, tenant: { select: { slug: true } } },
  });
  const variant =
    variantByDomain ??
    (await prisma.variant.findFirst({
      where: { key: "indonesia", tenant: { slug: targetTenantSlug } },
      select: { id: true, tenantId: true, tenant: { select: { slug: true } } },
    }));

  if (!variant) {
    throw new Error(
      `Indonesia variant for ${targetHost} or tenant ${targetTenantSlug} was not found.`,
    );
  }

  const [media, page] = await Promise.all([
    prisma.mediaAsset.findFirst({
      where: {
        id: targetMediaId,
        tenantId: variant.tenantId,
        mediaType: "IMAGE",
        status: "ACTIVE",
      },
      select: { id: true, storagePath: true },
    }),
    prisma.contentPage.findUnique({
      where: { variantId_pageKey: { variantId: variant.id, pageKey: "job_page" } },
      select: {
        id: true,
        title: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
      },
    }),
  ]);

  if (!media) {
    throw new Error(`Active image media ${targetMediaId} was not found for tenant ${variant.tenant.slug}.`);
  }

  if (!page) {
    throw new Error("Indonesia job page was not found.");
  }

  const nextDraft = updateJobPageData(page.dataJson);
  const nextPublished = updateJobPageData(page.publishedDataJson ?? page.dataJson);
  const preview = {
    mode: shouldApply ? "apply" : "dry-run",
    tenant: variant.tenant.slug,
    pageId: page.id,
    pageTitle: page.title,
    targetMediaId,
    storagePath: media.storagePath,
    nextHero: record(nextPublished.hero),
  };
  const previewPath = join(tmpdir(), `nextcms-indonesia-job-hero-${Date.now()}.json`);
  await writeFile(previewPath, JSON.stringify(preview, null, 2));
  console.log(JSON.stringify(preview, null, 2));
  console.log(`Preview written to ${previewPath}`);

  if (!shouldApply) {
    console.log("Dry run only. Re-run with --apply to update the database.");
    return;
  }

  await prisma.contentPage.update({
    where: { id: page.id },
    data: {
      dataJson: json(nextDraft),
      publishedDataJson: json(nextPublished),
    },
  });

  console.log("Indonesia job hero image updated successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to update Indonesia job hero image.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
