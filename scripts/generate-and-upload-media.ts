import { randomBytes } from "node:crypto";
import dns from "node:dns";
import https from "node:https";
import { Resolver } from "node:dns/promises";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import sharp from "sharp";

import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const TMP_DIR = "/tmp";
const MEDIA_IDS_PATH = path.join(TMP_DIR, "media-ids.json");
const REPORT_PATH = path.join(TMP_DIR, "task3-report.md");

const MIME_TYPE = "image/png";
const MEDIA_TYPE = "IMAGE";
const GENERATED_AT = new Date().toISOString();
const REPORT_ONLY = process.argv.includes("--report-only");

type MediaSpec = {
  name: string;
  width: number;
  height: number;
  altText: string;
  svg: () => string;
};

type UploadedMedia = {
  name: string;
  mediaId: string;
  storagePath: string;
  publicUrl: string;
  fileSize: number;
  width: number;
  height: number;
  altText: string;
};

const connectionString = requiredEnv("DIRECT_URL", false) ?? requiredEnv("DATABASE_URL");
const r2AccountId = requiredEnv("R2_ACCOUNT_ID");
const r2AccessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
const r2SecretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
const r2BucketName = requiredEnv("R2_BUCKET_NAME");
const r2PublicUrl = requiredEnv("R2_PUBLIC_URL").replace(/\/+$/, "");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

const publicResolver = new Resolver();
publicResolver.setServers(["1.1.1.1", "8.8.8.8"]);

let cuidCounter = 0;

async function main() {
  await mkdir(TMP_DIR, { recursive: true });

  const tenantId = await resolveHitTenantId();
  const specs = createMediaSpecs();

  if (REPORT_ONLY) {
    await writeReportFromExistingMapping(tenantId, specs);
    return;
  }

  const mapping: Record<string, string> = {};
  const uploaded: UploadedMedia[] = [];

  console.log(`Generating ${specs.length} media assets for HIT tenant ${tenantId}.`);

  for (const spec of specs) {
    const buffer = await renderPng(spec.svg(), spec.width, spec.height);
    const mediaId = cuid();
    const storagePath = `tenants/${tenantId}/media/${mediaId}.png`;
    const publicUrl = `${r2PublicUrl}/${storagePath}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: storagePath,
        Body: buffer,
        ContentType: MIME_TYPE,
        ContentLength: buffer.length,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    await prisma.mediaAsset.create({
      data: {
        id: mediaId,
        tenantId,
        fileName: `${spec.name}.png`,
        mimeType: MIME_TYPE,
        fileSize: buffer.length,
        mediaType: MEDIA_TYPE,
        status: "ACTIVE",
        storagePath,
        altText: spec.altText,
        width: spec.width,
        height: spec.height,
      },
    });

    mapping[spec.name] = mediaId;
    uploaded.push({
      name: spec.name,
      mediaId,
      storagePath,
      publicUrl,
      fileSize: buffer.length,
      width: spec.width,
      height: spec.height,
      altText: spec.altText,
    });

    console.log(`Uploaded ${spec.name} -> ${mediaId}`);
  }

  await writeFile(MEDIA_IDS_PATH, `${JSON.stringify(mapping, null, 2)}\n`, "utf8");

  const countRows = await prisma.$queryRaw<{ count: number | bigint }[]>`
    SELECT COUNT(*)::int AS count
    FROM media_assets
    WHERE tenant_id = ${tenantId}
  `;
  const mediaCount = Number(countRows[0]?.count ?? 0);

  if (mediaCount < 25) {
    throw new Error(`Expected at least 25 media records for HIT tenant, found ${mediaCount}.`);
  }

  const sample = uploaded[0];
  if (!sample) {
    throw new Error("No media assets were uploaded.");
  }

  const statusCode = await verifyPublicUrl(sample.publicUrl);
  if (statusCode !== 200) {
    throw new Error(`Public R2 verification failed for ${sample.publicUrl}: HTTP ${statusCode}.`);
  }

  await writeReport({
    tenantId,
    uploaded,
    mediaCount,
    verifiedUrl: sample.publicUrl,
    verifiedStatusCode: statusCode,
  });

  console.log(`Verified ${sample.publicUrl} with HTTP ${statusCode}.`);
  console.log(`HIT media_assets count: ${mediaCount}`);
  console.log(`Wrote ${MEDIA_IDS_PATH}`);
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(JSON.stringify(mapping, null, 2));
}

async function writeReportFromExistingMapping(tenantId: string, specs: MediaSpec[]) {
  const mapping = JSON.parse(await readFile(MEDIA_IDS_PATH, "utf8")) as Record<string, string>;
  const specByName = new Map(specs.map((spec) => [spec.name, spec]));
  const ids = Object.values(mapping);
  const mediaRows = await prisma.mediaAsset.findMany({
    where: {
      tenantId,
      id: { in: ids },
    },
    select: {
      id: true,
      fileSize: true,
      storagePath: true,
      width: true,
      height: true,
      altText: true,
    },
  });
  const mediaById = new Map(mediaRows.map((media) => [media.id, media]));
  const uploaded = Object.entries(mapping).map(([name, mediaId]) => {
    const media = mediaById.get(mediaId);
    const spec = specByName.get(name);

    if (!media || !spec) {
      throw new Error(`Could not resolve media report data for ${name} (${mediaId}).`);
    }

    return {
      name,
      mediaId,
      storagePath: media.storagePath,
      publicUrl: `${r2PublicUrl}/${media.storagePath}`,
      fileSize: media.fileSize,
      width: media.width ?? spec.width,
      height: media.height ?? spec.height,
      altText: media.altText ?? spec.altText,
    };
  });

  const mediaCount = await queryTenantMediaCount(tenantId);

  if (mediaCount < 25) {
    throw new Error(`Expected at least 25 media records for HIT tenant, found ${mediaCount}.`);
  }

  const sample = uploaded[0];
  if (!sample) {
    throw new Error(`No media IDs found in ${MEDIA_IDS_PATH}.`);
  }

  const statusCode = await verifyPublicUrl(sample.publicUrl);
  if (statusCode !== 200) {
    throw new Error(`Public R2 verification failed for ${sample.publicUrl}: HTTP ${statusCode}.`);
  }

  await writeReport({
    tenantId,
    uploaded,
    mediaCount,
    verifiedUrl: sample.publicUrl,
    verifiedStatusCode: statusCode,
  });

  console.log(`Verified ${sample.publicUrl} with HTTP ${statusCode}.`);
  console.log(`HIT media_assets count: ${mediaCount}`);
  console.log(`Wrote ${REPORT_PATH}`);
  console.log(JSON.stringify(mapping, null, 2));
}

async function resolveHitTenantId() {
  const reportTenantId = await readTenantIdFromTask2Report();

  if (reportTenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: reportTenantId },
      select: { id: true },
    });

    if (tenant) {
      return tenant.id;
    }
  }

  const hitTenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { slug: "hit" },
        { name: { equals: "Hashimoto Indo Trust", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  if (!hitTenant) {
    throw new Error("Could not find HIT tenant by /tmp/task2-report.md, slug 'hit', or name 'Hashimoto Indo Trust'.");
  }

  return hitTenant.id;
}

async function readTenantIdFromTask2Report() {
  try {
    const text = await readFile(path.join(TMP_DIR, "task2-report.md"), "utf8");
    const match =
      text.match(/tenant(?:\s+|-|_)?id\s*[:=]\s*(c[a-z0-9]{8,})/i) ??
      text.match(/hit(?:\s+|-|_)?tenant(?:\s+|-|_)?id\s*[:=]\s*(c[a-z0-9]{8,})/i);

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function renderPng(svg: string, width: number, height: number) {
  return sharp(Buffer.from(svg))
    .resize(width, height, { fit: "cover" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function queryTenantMediaCount(tenantId: string) {
  const countRows = await prisma.$queryRaw<{ count: number | bigint }[]>`
    SELECT COUNT(*)::int AS count
    FROM media_assets
    WHERE tenant_id = ${tenantId}
  `;

  return Number(countRows[0]?.count ?? 0);
}

async function verifyPublicUrl(url: string) {
  return new Promise<number>((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: "HEAD",
        timeout: 45_000,
        lookup: (hostname, options, callback) => {
          publicResolver
            .resolve4(hostname)
            .then((addresses) => {
              const address = addresses[0];

              if (address && options.all) {
                callback(null, [{ address, family: 4 }]);
                return;
              }

              if (address) {
                callback(null, address, 4);
                return;
              }

              dns.lookup(hostname, options, callback);
            })
            .catch(() => {
              dns.lookup(hostname, options, callback);
            });
        },
      },
      (response) => {
        response.resume();
        resolve(response.statusCode ?? 0);
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error(`Timed out verifying ${url}.`));
    });
    request.on("error", reject);
    request.end();
  });
}

async function writeReport(input: {
  tenantId: string;
  uploaded: UploadedMedia[];
  mediaCount: number;
  verifiedUrl: string;
  verifiedStatusCode: number;
}) {
  const lines = [
    "# Task 3 Media Upload Report",
    "",
    `Generated at: ${GENERATED_AT}`,
    `Tenant ID: ${input.tenantId}`,
    `Uploaded assets: ${input.uploaded.length}`,
    `Total HIT media_assets count after upload: ${input.mediaCount}`,
    `Verified public URL: ${input.verifiedUrl}`,
    `Verified status: HTTP ${input.verifiedStatusCode}`,
    "",
    "## Uploaded Media",
    "",
    "| Name | Media ID | Size | Bytes | URL |",
    "| --- | --- | ---: | ---: | --- |",
    ...input.uploaded.map((media) =>
      [
        media.name,
        media.mediaId,
        `${media.width}x${media.height}`,
        media.fileSize.toString(),
        media.publicUrl,
      ].join(" | "),
    ),
    "",
  ];

  await writeFile(REPORT_PATH, `${lines.join("\n")}\n`, "utf8");
}

function createMediaSpecs(): MediaSpec[] {
  return [
    {
      name: "hero-indonesia-main",
      width: 1200,
      height: 630,
      altText: "Wujudkan Impianmu Bekerja di Jepang",
      svg: () =>
        heroLandscape({
          width: 1200,
          height: 630,
          name: "hero-indonesia-main",
          startColor: "#4FB5E5",
          endColor: "#1e8ac4",
          pattern: diagonalPattern("#ffffff", 0.13),
          title: "Wujudkan Impianmu\nBekerja di Jepang",
          subtitle: "Hashimoto Indo Trust - LPK Terpercaya",
          titleColor: "#ffffff",
          subtitleColor: "#eaf7fd",
          icon: `${planeIcon(760, 250, 1.35, "#ffffff", "#E53935")}${flagPairIcon(900, 360, 1.05)}`,
        }),
    },
    {
      name: "hero-japan-main",
      width: 1200,
      height: 630,
      altText: "インドネシア人材で、貴社の成長を支援します",
      svg: () =>
        heroLandscape({
          width: 1200,
          height: 630,
          name: "hero-japan-main",
          startColor: "#1e3a5f",
          endColor: "#0f2035",
          pattern: geometricPattern("#ffffff", 0.08),
          title: "インドネシア人材で、\n貴社の成長を支援します",
          subtitle: "Hashimoto Indo Trust - Human Resources Partner",
          titleColor: "#ffffff",
          subtitleColor: "#b7d9f2",
          icon: `${risingSunIcon(840, 185, 1.25)}${candidateNetworkIcon(820, 320, 1.1, "#4FB5E5")}`,
        }),
    },
    {
      name: "hero-program",
      width: 1200,
      height: 500,
      altText: "Program Pelatihan Unggulan",
      svg: () =>
        compactHero({
          width: 1200,
          height: 500,
          name: "hero-program",
          background: "#eef7fc",
          pattern: dotPattern("#1e8ac4", 0.14),
          title: "Program Pelatihan Unggulan",
          titleColor: "#1e3a5f",
          accent: "#4FB5E5",
          icon: graduationCapIcon(820, 160, 2.25, "#1e8ac4", "#E53935"),
        }),
    },
    {
      name: "hero-job",
      width: 1200,
      height: 500,
      altText: "Info Lowongan Terbaru",
      svg: () =>
        compactHero({
          width: 1200,
          height: 500,
          name: "hero-job",
          background: gradientDef("hero-job-bg", "#f8fafc", "#eef7fc"),
          pattern: diagonalPattern("#1e8ac4", 0.08),
          title: "Info Lowongan Terbaru",
          titleColor: "#1e3a5f",
          accent: "#E53935",
          icon: briefcaseIcon(835, 145, 2.35, "#334155", "#4FB5E5"),
        }),
    },
    {
      name: "hero-tentang-kami",
      width: 1200,
      height: 500,
      altText: "Tentang Hashimoto Indo Trust",
      svg: () =>
        compactHero({
          width: 1200,
          height: 500,
          name: "hero-tentang-kami",
          background: gradientDef("hero-about-bg", "#f8fafc", "#cfeeff"),
          pattern: gridLinePattern("#1e8ac4", 0.08),
          title: "Tentang Hashimoto Indo Trust",
          titleColor: "#1e3a5f",
          accent: "#4FB5E5",
          icon: trustBuildingIcon(840, 120, 2.15, "#1e8ac4", "#E53935"),
        }),
    },
    {
      name: "hero-karir",
      width: 1200,
      height: 500,
      altText: "Bergabunglah Bersama Kami",
      svg: () =>
        compactHero({
          width: 1200,
          height: 500,
          name: "hero-karir",
          background: gradientDef("hero-career-bg", "#fff7df", "#ffd37a"),
          pattern: dotPattern("#E53935", 0.1),
          title: "Bergabunglah Bersama Kami",
          titleColor: "#1e3a5f",
          accent: "#E53935",
          icon: teamIcon(840, 125, 2.15, "#1e8ac4", "#E53935"),
        }),
    },
    japaneseHero("hero-japan-about", "会社概要", "#1e3a5f", "#0f2035", companyIcon(840, 130, 2.2, "#4FB5E5")),
    japaneseHero("hero-japan-training", "研修プログラム", "#1e3a5f", "#123a63", graduationCapIcon(835, 130, 2.2, "#4FB5E5", "#E53935")),
    japaneseHero("hero-japan-candidate", "人材プロフィール", "#182b47", "#0f2035", candidateIcon(850, 120, 2.25, "#4FB5E5")),
    japaneseHero("hero-japan-network", "採用ネットワーク", "#1e3a5f", "#0f2035", simpleMapIcon(790, 120, 2.1, "#4FB5E5")),
    japaneseHero("hero-japan-contact", "お問い合わせ", "#1e3a5f", "#101827", contactIcon(840, 125, 2.2, "#4FB5E5", "#E53935")),
    thumb({
      name: "program-magang-thumb",
      width: 400,
      height: 300,
      background: "#4FB5E5",
      title: "Program\nMagang",
      subtitle: "",
      titleColor: "#ffffff",
      icon: factoryIcon(235, 88, 1.15, "#ffffff", "#1e3a5f"),
      badge: "POPULER",
      badgeColor: "#E53935",
      altText: "Program Magang",
    }),
    thumb({
      name: "program-tokutei-thumb",
      width: 400,
      height: 300,
      background: "#2e9fd6",
      title: "Tokutei\nGinou",
      subtitle: "",
      titleColor: "#ffffff",
      icon: skillIcon(235, 82, 1.15, "#ffffff", "#1e3a5f"),
      altText: "Tokutei Ginou",
    }),
    thumb({
      name: "program-kelas-bahasa-thumb",
      width: 400,
      height: 300,
      background: "#72c2eb",
      title: "Kelas Bahasa\nJepang",
      subtitle: "",
      titleColor: "#16344d",
      icon: bookIcon(230, 82, 1.18, "#ffffff", "#1e8ac4"),
      altText: "Kelas Bahasa Jepang",
    }),
    thumb({
      name: "job-manufaktur-thumb",
      width: 400,
      height: 300,
      background: "#334155",
      title: "Operator\nProduksi",
      subtitle: "Nihon Seiki Co.",
      titleColor: "#ffffff",
      icon: factoryIcon(235, 82, 1.1, "#94a3b8", "#4FB5E5"),
      badge: "FULL-TIME",
      badgeColor: "#4FB5E5",
      altText: "Operator Produksi",
    }),
    thumb({
      name: "job-pertanian-thumb",
      width: 400,
      height: 300,
      background: "#4a7c59",
      title: "Pertanian\nOrganik",
      subtitle: "Green Farm Japan",
      titleColor: "#ffffff",
      icon: plantIcon(242, 70, 1.3, "#d9f99d", "#ffffff"),
      altText: "Pertanian Organik",
    }),
    thumb({
      name: "job-perawatan-thumb",
      width: 400,
      height: 300,
      background: "#e2e8f0",
      title: "Caregiver /\nPerawat",
      subtitle: "Sakura Care Home",
      titleColor: "#1e3a5f",
      icon: medicalIcon(240, 80, 1.2, "#E53935", "#1e8ac4"),
      altText: "Caregiver / Perawat",
    }),
    blogThumb({
      name: "blog-tips-thumb",
      background: "#fef9f0",
      title: "5 Tips\nPersiapan",
      titleColor: "#1e3a5f",
      icon: checklistIcon(575, 120, 1.55, "#E53935", "#4FB5E5"),
      altText: "5 Tips Persiapan",
    }),
    blogThumb({
      name: "blog-gaji-thumb",
      background: "#f0fdf4",
      title: "Gaji di\nJepang",
      titleColor: "#14532d",
      icon: yenIcon(575, 120, 1.65, "#16a34a", "#1e3a5f"),
      altText: "Gaji di Jepang",
    }),
    blogThumb({
      name: "blog-kehidupan-thumb",
      background: "#f3e8ff",
      title: "Kehidupan\ndi Jepang",
      titleColor: "#3b0764",
      icon: sakuraIcon(565, 105, 1.55, "#ef6aa5", "#7e22ce"),
      altText: "Kehidupan di Jepang",
    }),
    thumb({
      name: "offer-kelas-gratis-thumb",
      width: 400,
      height: 300,
      background: gradientDef("offer-free-bg", "#E53935", "#ef5350"),
      title: "KELAS\nGRATIS",
      subtitle: "",
      titleColor: "#ffffff",
      icon: bookIcon(235, 82, 1.1, "#ffffff", "#ffd7d7"),
      badge: "TERBATAS",
      badgeColor: "#1e3a5f",
      altText: "Kelas Gratis",
    }),
    thumb({
      name: "offer-promo-thumb",
      width: 400,
      height: 300,
      background: "#1e3a5f",
      title: "Promo\nSpesial",
      subtitle: "",
      titleColor: "#ffffff",
      icon: percentIcon(240, 80, 1.2, "#4FB5E5", "#ffffff"),
      altText: "Promo Spesial",
    }),
    sectorThumb("sector-manufacturing-thumb", "#1e3a5f", "製造業", gearIcon(238, 83, 1.22, "#4FB5E5", "#ffffff"), "製造業"),
    sectorThumb("sector-nursing-thumb", "#2d5a87", "介護", heartIcon(242, 83, 1.25, "#E53935", "#ffffff"), "介護"),
    sectorThumb("sector-agriculture-thumb", "#2d5a40", "農業", leafIcon(242, 80, 1.28, "#a7f3d0", "#ffffff"), "農業"),
    logo("hit-logo-dark", false),
    logo("hit-logo-light", true),
    avatar("avatar-director", "#4FB5E5", "HS", "Hiroshi Shimizu"),
    avatar("avatar-staff-1", "#2e9fd6", "SA", "Sari Anggraini"),
    avatar("avatar-staff-2", "#72c2eb", "BW", "Budi Wijaya"),
    avatar("avatar-japan-manager", "#1e3a5f", "TN", "Tanaka Naoko"),
  ];
}

function heroLandscape(input: {
  width: number;
  height: number;
  name: string;
  startColor: string;
  endColor: string;
  pattern: string;
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  icon: string;
}) {
  const gradientId = `${input.name}-gradient`;
  return svgDoc({
    width: input.width,
    height: input.height,
    defs: [
      linearGradient(gradientId, input.startColor, input.endColor),
      input.pattern,
      softShadow(),
    ],
    body: `
      <rect width="${input.width}" height="${input.height}" fill="url(#${gradientId})"/>
      <rect width="${input.width}" height="${input.height}" fill="url(#pattern)"/>
      <circle cx="1015" cy="115" r="260" fill="#ffffff" opacity="0.08"/>
      <circle cx="1120" cy="530" r="180" fill="#ffffff" opacity="0.06"/>
      <path d="M0 500 C240 420 430 560 680 500 S1040 410 1200 480 L1200 630 L0 630Z" fill="#ffffff" opacity="0.11"/>
      ${input.icon}
      ${textLines(input.title, 84, 180, {
        fontSize: 60,
        lineHeight: 74,
        weight: 800,
        fill: input.titleColor,
        maxWidth: 680,
      })}
      <text x="88" y="390" font-family="${fontStack()}" font-size="28" font-weight="600" fill="${input.subtitleColor}">
        ${escapeXml(input.subtitle)}
      </text>
      <rect x="88" y="424" width="170" height="8" rx="4" fill="#E53935"/>
      <rect x="268" y="424" width="92" height="8" rx="4" fill="#ffffff" opacity="0.75"/>
    `,
  });
}

function compactHero(input: {
  width: number;
  height: number;
  name: string;
  background: string;
  pattern: string;
  title: string;
  titleColor: string;
  accent: string;
  icon: string;
}) {
  const hasBackgroundDefinition = isSvgDefinition(input.background);
  const background = hasBackgroundDefinition
    ? `url(#${getGradientId(input.background)})`
    : input.background;

  return svgDoc({
    width: input.width,
    height: input.height,
    defs: [
      hasBackgroundDefinition ? input.background : "",
      input.pattern,
      softShadow(),
    ],
    body: `
      <rect width="${input.width}" height="${input.height}" fill="${background}"/>
      <rect width="${input.width}" height="${input.height}" fill="url(#pattern)"/>
      <circle cx="1020" cy="120" r="245" fill="${input.accent}" opacity="0.12"/>
      <circle cx="1045" cy="325" r="120" fill="#ffffff" opacity="0.5"/>
      <rect x="80" y="322" width="210" height="10" rx="5" fill="${input.accent}"/>
      <rect x="80" y="350" width="110" height="10" rx="5" fill="#1e3a5f" opacity="0.16"/>
      ${input.icon}
      ${textLines(input.title, 80, 210, {
        fontSize: 58,
        lineHeight: 70,
        weight: 800,
        fill: input.titleColor,
        maxWidth: 720,
      })}
    `,
  });
}

function japaneseHero(
  name: string,
  title: string,
  startColor: string,
  endColor: string,
  icon: string,
): MediaSpec {
  return {
    name,
    width: 1200,
    height: 500,
    altText: title,
    svg: () =>
      compactHero({
        width: 1200,
        height: 500,
        name,
        background: gradientDef(`${name}-bg`, startColor, endColor),
        pattern: geometricPattern("#ffffff", 0.07),
        title,
        titleColor: "#ffffff",
        accent: "#4FB5E5",
        icon,
      }),
  };
}

function thumb(input: {
  name: string;
  width: number;
  height: number;
  background: string;
  title: string;
  subtitle: string;
  titleColor: string;
  icon: string;
  altText: string;
  badge?: string;
  badgeColor?: string;
}) {
  return {
    name: input.name,
    width: input.width,
    height: input.height,
    altText: input.altText,
    svg: () => {
      const hasBackgroundDefinition = isSvgDefinition(input.background);
      const background = hasBackgroundDefinition
        ? `url(#${getGradientId(input.background)})`
        : input.background;

      return svgDoc({
        width: input.width,
        height: input.height,
        defs: [
          hasBackgroundDefinition ? input.background : "",
          diagonalPattern("#ffffff", 0.11),
          softShadow(),
        ],
        body: `
          <rect width="${input.width}" height="${input.height}" fill="${background}"/>
          <rect width="${input.width}" height="${input.height}" fill="url(#pattern)"/>
          <circle cx="330" cy="55" r="112" fill="#ffffff" opacity="0.16"/>
          <circle cx="355" cy="255" r="92" fill="#ffffff" opacity="0.1"/>
          ${input.icon}
          ${input.badge ? badge(26, 26, input.badge, input.badgeColor ?? "#E53935") : ""}
          ${textLines(input.title, 28, 128, {
            fontSize: 37,
            lineHeight: 44,
            weight: 800,
            fill: input.titleColor,
            maxWidth: 225,
          })}
          ${
            input.subtitle
              ? `<text x="30" y="246" font-family="${fontStack()}" font-size="18" font-weight="650" fill="${input.titleColor}" opacity="0.82">${escapeXml(input.subtitle)}</text>`
              : ""
          }
        `,
      });
    },
  };
}

function blogThumb(input: {
  name: string;
  background: string;
  title: string;
  titleColor: string;
  icon: string;
  altText: string;
}) {
  return {
    name: input.name,
    width: 800,
    height: 450,
    altText: input.altText,
    svg: () =>
      svgDoc({
        width: 800,
        height: 450,
        defs: [dotPattern("#1e3a5f", 0.1), softShadow()],
        body: `
          <rect width="800" height="450" fill="${input.background}"/>
          <rect width="800" height="450" fill="url(#pattern)"/>
          <path d="M0 342 C130 300 230 375 360 330 S625 270 800 330 L800 450 L0 450Z" fill="#ffffff" opacity="0.72"/>
          <circle cx="660" cy="95" r="175" fill="#ffffff" opacity="0.62"/>
          <circle cx="724" cy="390" r="90" fill="#4FB5E5" opacity="0.12"/>
          ${input.icon}
          ${textLines(input.title, 58, 155, {
            fontSize: 66,
            lineHeight: 74,
            weight: 850,
            fill: input.titleColor,
            maxWidth: 480,
          })}
          <rect x="62" y="326" width="145" height="9" rx="5" fill="#E53935"/>
          <rect x="220" y="326" width="78" height="9" rx="5" fill="#4FB5E5"/>
        `,
      }),
  };
}

function sectorThumb(name: string, background: string, title: string, icon: string, altText: string) {
  return thumb({
    name,
    width: 400,
    height: 300,
    background,
    title,
    subtitle: "Hashimoto Indo Trust",
    titleColor: "#ffffff",
    icon,
    altText,
  });
}

function logo(name: string, light: boolean): MediaSpec {
  const textFill = light ? "#ffffff" : "#1e3a5f";
  return {
    name,
    width: 200,
    height: 80,
    altText: light ? "HIT logo light" : "HIT logo dark",
    svg: () =>
      svgDoc({
        width: 200,
        height: 80,
        body: `
          <circle cx="42" cy="40" r="30" fill="#4FB5E5"/>
          <path d="M19 42 C31 28 51 22 68 31" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.9"/>
          <path d="M20 42 C36 55 55 57 70 46" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.65"/>
          <path d="M14 40 H72" stroke="#ffffff" stroke-width="3" opacity="0.72"/>
          <path d="M35 18 C28 33 28 48 36 63" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.62"/>
          <path d="M51 18 C58 33 58 49 50 63" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.62"/>
          <path d="M56 28 L87 39 L58 50 L51 68 L44 54 L26 61 L38 44 L26 31 L47 37 Z" fill="#E53935" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
          <text x="86" y="49" font-family="${fontStack()}" font-size="36" font-weight="900" fill="${textFill}">HIT</text>
          <text x="88" y="66" font-family="${fontStack()}" font-size="10" font-weight="700" letter-spacing="0" fill="${textFill}" opacity="${light ? 0.82 : 0.7}">HASHIMOTO INDO TRUST</text>
        `,
      }),
  };
}

function avatar(name: string, color: string, initials: string, person: string): MediaSpec {
  return {
    name,
    width: 200,
    height: 200,
    altText: person,
    svg: () =>
      svgDoc({
        width: 200,
        height: 200,
        defs: [softShadow()],
        body: `
          <rect width="200" height="200" fill="#ffffff"/>
          <circle cx="100" cy="100" r="86" fill="${color}"/>
          <circle cx="56" cy="48" r="44" fill="#ffffff" opacity="0.16"/>
          <circle cx="152" cy="156" r="54" fill="#000000" opacity="0.08"/>
          <text x="100" y="119" text-anchor="middle" font-family="${fontStack()}" font-size="62" font-weight="850" fill="#ffffff">${escapeXml(initials)}</text>
        `,
      }),
  };
}

function svgDoc(input: {
  width: number;
  height: number;
  defs?: string[];
  body: string;
}) {
  const defs = input.defs?.filter(Boolean).join("\n") ?? "";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="0 0 ${input.width} ${input.height}">
      ${defs ? `<defs>${defs}</defs>` : ""}
      ${input.body}
    </svg>
  `;
}

function textLines(
  text: string,
  x: number,
  y: number,
  options: {
    fontSize: number;
    lineHeight: number;
    weight: number;
    fill: string;
    maxWidth: number;
  },
) {
  const lines = text.split("\n");
  return `
    <text x="${x}" y="${y}" font-family="${fontStack()}" font-size="${options.fontSize}" font-weight="${options.weight}" fill="${options.fill}">
      ${lines
        .map((line, index) =>
          `<tspan x="${x}" dy="${index === 0 ? 0 : options.lineHeight}">${escapeXml(line)}</tspan>`,
        )
        .join("")}
    </text>
  `;
}

function badge(x: number, y: number, label: string, fill: string) {
  const width = Math.max(92, label.length * 12 + 28);
  return `
    <rect x="${x}" y="${y}" width="${width}" height="34" rx="17" fill="${fill}" filter="url(#softShadow)"/>
    <text x="${x + width / 2}" y="${y + 23}" text-anchor="middle" font-family="${fontStack()}" font-size="14" font-weight="850" fill="#ffffff">${escapeXml(label)}</text>
  `;
}

function linearGradient(id: string, start: string, end: string) {
  return `
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${start}"/>
      <stop offset="100%" stop-color="${end}"/>
    </linearGradient>
  `;
}

function gradientDef(id: string, start: string, end: string) {
  return linearGradient(id, start, end);
}

function getGradientId(definition: string) {
  const match = definition.match(/id="([^"]+)"/);
  if (!match) {
    throw new Error("Gradient definition is missing an id.");
  }
  return match[1];
}

function isSvgDefinition(value: string) {
  return value.trimStart().startsWith("<");
}

function diagonalPattern(color: string, opacity: number) {
  return `
    <pattern id="pattern" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <rect width="32" height="32" fill="transparent"/>
      <rect x="0" y="0" width="7" height="32" fill="${color}" opacity="${opacity}"/>
    </pattern>
  `;
}

function dotPattern(color: string, opacity: number) {
  return `
    <pattern id="pattern" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="2.3" fill="${color}" opacity="${opacity}"/>
    </pattern>
  `;
}

function gridLinePattern(color: string, opacity: number) {
  return `
    <pattern id="pattern" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
    </pattern>
  `;
}

function geometricPattern(color: string, opacity: number) {
  return `
    <pattern id="pattern" width="86" height="86" patternUnits="userSpaceOnUse">
      <rect x="8" y="8" width="28" height="28" fill="none" stroke="${color}" stroke-width="3" opacity="${opacity}"/>
      <rect x="44" y="44" width="28" height="28" fill="none" stroke="${color}" stroke-width="3" opacity="${opacity}"/>
      <path d="M44 8H72V36H44Z" fill="${color}" opacity="${opacity * 0.55}"/>
    </pattern>
  `;
}

function softShadow() {
  return `
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.18"/>
    </filter>
  `;
}

function planeIcon(x: number, y: number, scale: number, fill: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <path d="M8 62 L154 18 C166 14 172 19 164 29 L122 78 L142 126 L124 132 L92 96 L54 122 L38 116 L68 80 L10 72 Z" fill="${fill}" opacity="0.92" filter="url(#softShadow)"/>
    <path d="M88 67 L164 25" stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity="0.9"/>
    <path d="M35 95 L17 118" stroke="${fill}" stroke-width="8" stroke-linecap="round" opacity="0.62"/>
  `);
}

function flagPairIcon(x: number, y: number, scale: number) {
  return wrapIcon(x, y, scale, `
    <line x1="28" y1="10" x2="28" y2="125" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
    <rect x="34" y="17" width="82" height="52" rx="5" fill="#ffffff" filter="url(#softShadow)"/>
    <rect x="34" y="17" width="82" height="26" rx="5" fill="#E53935"/>
    <line x1="137" y1="10" x2="137" y2="125" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
    <rect x="143" y="17" width="82" height="52" rx="5" fill="#ffffff" filter="url(#softShadow)"/>
    <circle cx="184" cy="43" r="16" fill="#E53935"/>
  `);
}

function risingSunIcon(x: number, y: number, scale: number) {
  return wrapIcon(x, y, scale, `
    <circle cx="98" cy="98" r="72" fill="#ffffff" opacity="0.92" filter="url(#softShadow)"/>
    <circle cx="98" cy="98" r="30" fill="#E53935"/>
    ${Array.from({ length: 12 }, (_, index) => {
      const rotate = index * 30;
      return `<rect x="94" y="12" width="8" height="40" rx="4" fill="#E53935" opacity="0.18" transform="rotate(${rotate} 98 98)"/>`;
    }).join("")}
  `);
}

function candidateNetworkIcon(x: number, y: number, scale: number, color: string) {
  return wrapIcon(x, y, scale, `
    <path d="M50 95 C86 55 126 55 162 95" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" opacity="0.82"/>
    <path d="M44 126 C83 92 132 92 172 126" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.75"/>
    <circle cx="50" cy="95" r="18" fill="#ffffff"/>
    <circle cx="162" cy="95" r="18" fill="#ffffff"/>
    <circle cx="106" cy="59" r="20" fill="${color}"/>
    <circle cx="44" cy="126" r="15" fill="${color}"/>
    <circle cx="172" cy="126" r="15" fill="${color}"/>
  `);
}

function graduationCapIcon(x: number, y: number, scale: number, color: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <path d="M102 22 L190 62 L102 102 L14 62 Z" fill="${color}" filter="url(#softShadow)"/>
    <path d="M48 83 V124 C78 150 128 150 158 124 V83 L102 109 Z" fill="#ffffff" opacity="0.94"/>
    <path d="M178 68 V118" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="178" cy="129" r="10" fill="${accent}"/>
  `);
}

function briefcaseIcon(x: number, y: number, scale: number, color: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <rect x="25" y="58" width="158" height="108" rx="18" fill="${color}" filter="url(#softShadow)"/>
    <path d="M74 58 V39 H134 V58" fill="none" stroke="${color}" stroke-width="18" stroke-linejoin="round"/>
    <path d="M25 94 H183" stroke="#ffffff" stroke-width="10" opacity="0.55"/>
    <rect x="88" y="83" width="31" height="24" rx="6" fill="${accent}"/>
  `);
}

function trustBuildingIcon(x: number, y: number, scale: number, color: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <path d="M104 20 L184 63 H24 Z" fill="${color}" filter="url(#softShadow)"/>
    <rect x="43" y="70" width="122" height="95" rx="10" fill="#ffffff" opacity="0.96"/>
    <rect x="62" y="88" width="20" height="56" rx="4" fill="${color}" opacity="0.82"/>
    <rect x="94" y="88" width="20" height="56" rx="4" fill="${accent}" opacity="0.85"/>
    <rect x="126" y="88" width="20" height="56" rx="4" fill="${color}" opacity="0.82"/>
    <rect x="36" y="157" width="136" height="14" rx="7" fill="${color}"/>
  `);
}

function teamIcon(x: number, y: number, scale: number, color: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <circle cx="104" cy="64" r="32" fill="${color}" filter="url(#softShadow)"/>
    <circle cx="54" cy="86" r="25" fill="#ffffff" opacity="0.95"/>
    <circle cx="154" cy="86" r="25" fill="#ffffff" opacity="0.95"/>
    <path d="M47 154 C51 116 79 101 104 101 C130 101 158 116 162 154 Z" fill="${color}"/>
    <path d="M14 158 C18 127 38 114 58 114 C75 114 89 123 96 139 L94 158 Z" fill="${accent}" opacity="0.9"/>
    <path d="M112 158 C119 123 135 114 153 114 C174 114 194 127 198 158 Z" fill="${accent}" opacity="0.9"/>
  `);
}

function companyIcon(x: number, y: number, scale: number, color: string) {
  return wrapIcon(x, y, scale, `
    <rect x="42" y="30" width="126" height="142" rx="18" fill="${color}" opacity="0.92" filter="url(#softShadow)"/>
    ${[0, 1, 2].map((row) =>
      [0, 1, 2].map((col) =>
        `<rect x="${67 + col * 33}" y="${54 + row * 31}" width="18" height="18" rx="4" fill="#ffffff" opacity="0.85"/>`,
      ).join(""),
    ).join("")}
    <rect x="88" y="137" width="34" height="35" rx="6" fill="#ffffff" opacity="0.9"/>
  `);
}

function candidateIcon(x: number, y: number, scale: number, color: string) {
  return wrapIcon(x, y, scale, `
    <rect x="42" y="26" width="128" height="156" rx="24" fill="#ffffff" opacity="0.95" filter="url(#softShadow)"/>
    <circle cx="106" cy="81" r="33" fill="${color}"/>
    <path d="M60 154 C67 124 82 113 106 113 C130 113 146 124 153 154 Z" fill="${color}" opacity="0.9"/>
    <path d="M70 43 H142" stroke="${color}" stroke-width="7" stroke-linecap="round" opacity="0.45"/>
  `);
}

function simpleMapIcon(x: number, y: number, scale: number, color: string) {
  return wrapIcon(x, y, scale, `
    <path d="M30 142 L68 46 L116 70 L166 38 L198 136 L149 168 L105 142 L58 174 Z" fill="#ffffff" opacity="0.92" filter="url(#softShadow)"/>
    <path d="M68 46 L58 174 M116 70 L105 142 M166 38 L149 168" stroke="${color}" stroke-width="6" opacity="0.72"/>
    <circle cx="69" cy="76" r="10" fill="#E53935"/>
    <circle cx="143" cy="111" r="10" fill="${color}"/>
    <path d="M69 76 C93 92 113 98 143 111" fill="none" stroke="#E53935" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 10"/>
  `);
}

function contactIcon(x: number, y: number, scale: number, color: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <rect x="28" y="48" width="168" height="108" rx="22" fill="#ffffff" opacity="0.95" filter="url(#softShadow)"/>
    <path d="M38 63 L112 117 L186 63" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="166" cy="52" r="23" fill="${accent}"/>
  `);
}

function factoryIcon(x: number, y: number, scale: number, fill: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <rect x="24" y="92" width="160" height="82" rx="13" fill="${fill}" opacity="0.94" filter="url(#softShadow)"/>
    <path d="M24 92 L66 65 V92 L108 65 V92 L151 65 V92" fill="${fill}" opacity="0.94"/>
    <rect x="134" y="42" width="30" height="50" rx="6" fill="${accent}" opacity="0.92"/>
    <rect x="50" y="116" width="24" height="22" rx="4" fill="${accent}" opacity="0.88"/>
    <rect x="90" y="116" width="24" height="22" rx="4" fill="${accent}" opacity="0.88"/>
    <rect x="130" y="116" width="24" height="22" rx="4" fill="${accent}" opacity="0.88"/>
  `);
}

function skillIcon(x: number, y: number, scale: number, fill: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <circle cx="104" cy="104" r="72" fill="${fill}" opacity="0.94" filter="url(#softShadow)"/>
    <path d="M71 112 L94 135 L143 77" fill="none" stroke="${accent}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M104 28 V52 M104 156 V180 M28 104 H52 M156 104 H180" stroke="${accent}" stroke-width="9" stroke-linecap="round" opacity="0.55"/>
  `);
}

function bookIcon(x: number, y: number, scale: number, fill: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <path d="M33 47 H92 C107 47 116 56 116 72 V168 C111 159 101 154 88 154 H33 Z" fill="${fill}" filter="url(#softShadow)"/>
    <path d="M116 72 C116 56 126 47 141 47 H196 V154 H141 C128 154 120 159 116 168 Z" fill="${fill}" opacity="0.88"/>
    <path d="M62 78 H92 M62 103 H92 M142 78 H170 M142 103 H170" stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity="0.82"/>
  `);
}

function plantIcon(x: number, y: number, scale: number, fill: string, accent: string) {
  return wrapIcon(x, y, scale, `
    <path d="M102 172 V88" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
    <path d="M99 96 C56 97 34 70 33 38 C74 34 104 54 109 88 Z" fill="${fill}" filter="url(#softShadow)"/>
    <path d="M110 117 C153 116 177 91 178 58 C136 54 107 76 102 111 Z" fill="${fill}" opacity="0.92"/>
    <path d="M54 72 C75 77 91 85 102 96 M157 90 C136 96 121 104 110 117" stroke="${accent}" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
  `);
}

function medicalIcon(x: number, y: number, scale: number, red: string, blue: string) {
  return wrapIcon(x, y, scale, `
    <circle cx="104" cy="104" r="75" fill="#ffffff" opacity="0.95" filter="url(#softShadow)"/>
    <rect x="89" y="55" width="31" height="98" rx="8" fill="${red}"/>
    <rect x="55" y="89" width="98" height="31" rx="8" fill="${red}"/>
    <path d="M42 158 C62 143 79 142 102 158 C126 174 146 172 168 154" fill="none" stroke="${blue}" stroke-width="8" stroke-linecap="round" opacity="0.75"/>
  `);
}

function checklistIcon(x: number, y: number, scale: number, red: string, blue: string) {
  return wrapIcon(x, y, scale, `
    <rect x="38" y="26" width="132" height="156" rx="22" fill="#ffffff" filter="url(#softShadow)"/>
    <rect x="75" y="18" width="58" height="30" rx="12" fill="${blue}"/>
    ${[72, 108, 144].map((cy) => `
      <path d="M63 ${cy} L75 ${cy + 11} L94 ${cy - 13}" fill="none" stroke="${red}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M108 ${cy - 2} H146" stroke="${blue}" stroke-width="7" stroke-linecap="round" opacity="0.6"/>
    `).join("")}
  `);
}

function yenIcon(x: number, y: number, scale: number, green: string, dark: string) {
  return wrapIcon(x, y, scale, `
    <circle cx="104" cy="104" r="78" fill="#ffffff" filter="url(#softShadow)"/>
    <text x="104" y="138" text-anchor="middle" font-family="${fontStack()}" font-size="100" font-weight="900" fill="${green}">¥</text>
    <circle cx="165" cy="49" r="21" fill="${dark}" opacity="0.88"/>
  `);
}

function sakuraIcon(x: number, y: number, scale: number, pink: string, purple: string) {
  return wrapIcon(x, y, scale, `
    <g filter="url(#softShadow)">
      ${Array.from({ length: 5 }, (_, index) => {
        const angle = index * 72;
        return `<ellipse cx="104" cy="65" rx="26" ry="44" fill="${pink}" transform="rotate(${angle} 104 104)"/>`;
      }).join("")}
      <circle cx="104" cy="104" r="14" fill="#ffd166"/>
    </g>
    <path d="M37 170 C83 138 130 138 177 170" fill="none" stroke="${purple}" stroke-width="9" stroke-linecap="round" opacity="0.55"/>
  `);
}

function percentIcon(x: number, y: number, scale: number, blue: string, white: string) {
  return wrapIcon(x, y, scale, `
    <circle cx="104" cy="104" r="77" fill="${blue}" filter="url(#softShadow)"/>
    <line x1="68" y1="145" x2="143" y2="64" stroke="${white}" stroke-width="16" stroke-linecap="round"/>
    <circle cx="69" cy="70" r="18" fill="${white}"/>
    <circle cx="141" cy="139" r="18" fill="${white}"/>
  `);
}

function gearIcon(x: number, y: number, scale: number, blue: string, white: string) {
  return wrapIcon(x, y, scale, `
    <g transform="translate(104 104)" filter="url(#softShadow)">
      ${Array.from({ length: 8 }, (_, index) =>
        `<rect x="-11" y="-86" width="22" height="38" rx="7" fill="${blue}" transform="rotate(${index * 45})"/>`,
      ).join("")}
      <circle r="62" fill="${blue}"/>
      <circle r="28" fill="${white}"/>
      <circle r="14" fill="#1e3a5f" opacity="0.75"/>
    </g>
  `);
}

function heartIcon(x: number, y: number, scale: number, red: string, white: string) {
  return wrapIcon(x, y, scale, `
    <path d="M104 169 C61 133 35 109 35 76 C35 51 53 35 77 35 C91 35 100 42 104 52 C108 42 119 35 132 35 C156 35 174 51 174 76 C174 109 147 133 104 169 Z" fill="${red}" filter="url(#softShadow)"/>
    <path d="M70 105 H93 L103 83 L120 128 L132 105 H153" fill="none" stroke="${white}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  `);
}

function leafIcon(x: number, y: number, scale: number, green: string, white: string) {
  return wrapIcon(x, y, scale, `
    <path d="M47 151 C43 84 95 42 166 45 C169 116 126 170 47 151 Z" fill="${green}" filter="url(#softShadow)"/>
    <path d="M56 143 C85 111 112 86 160 52" fill="none" stroke="#2d5a40" stroke-width="8" stroke-linecap="round" opacity="0.65"/>
    <path d="M91 106 C88 84 97 67 114 55 M111 87 C134 86 150 95 159 112" fill="none" stroke="${white}" stroke-width="6" stroke-linecap="round" opacity="0.78"/>
  `);
}

function wrapIcon(x: number, y: number, scale: number, body: string) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function fontStack() {
  return "Inter, Arial, 'Segoe UI', 'Yu Gothic', Meiryo, sans-serif";
}

function cuid() {
  const timestamp = Date.now().toString(36);
  const counter = (cuidCounter++ % 36 ** 4).toString(36).padStart(4, "0");
  const random = randomBytes(10)
    .toString("base64url")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .padEnd(12, "0")
    .slice(0, 12);

  return `c${timestamp}${counter}${random}`;
}

function requiredEnv(name: string, required?: true): string;
function requiredEnv(name: string, required: false): string | null;
function requiredEnv(name: string, required = true) {
  const value = process.env[name]?.trim();

  if (!value) {
    if (required) {
      throw new Error(`${name} is required.`);
    }

    return null;
  }

  return value;
}

main()
  .catch((error) => {
    console.error("Failed to generate and upload HIT media assets.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
