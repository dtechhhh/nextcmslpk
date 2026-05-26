import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import slugify from "slugify";

import { Prisma, PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required to seed the HIT tenant.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const tenantSeed = {
  name: "Hashimoto Indo Trust",
  slug: "hit",
  status: "ACTIVE" as const,
};

const variantSeeds = [
  {
    key: "indonesia",
    label: "Variant Indonesia",
    themeKey: "starter",
    status: "ACTIVE" as const,
  },
  {
    key: "japan",
    label: "Variant Jepang",
    themeKey: "starter",
    status: "ACTIVE" as const,
  },
] as const;

const contentCollections = {
  indonesia: [
    { key: "program", label: "Program" },
    { key: "job", label: "Job" },
    { key: "offer", label: "Offer" },
    { key: "blog", label: "Blog" },
    { key: "karir", label: "Karir" },
  ],
  japan: [
    { key: "news", label: "News" },
    { key: "sector", label: "Sector" },
  ],
} as const;

const optionSets = {
  indonesia: [
    {
      key: "program_type",
      label: "Tipe Program",
      values: ["Magang", "Tokutei Ginou", "Gijinkoku", "Kelas Bahasa"],
    },
    {
      key: "gender",
      label: "Gender",
      values: ["Laki-laki", "Perempuan", "Laki-laki & Perempuan"],
    },
    {
      key: "education_level",
      label: "Pendidikan Minimal",
      values: ["SMA/SMK", "D3", "S1"],
    },
    {
      key: "language_level",
      label: "Level Bahasa Jepang",
      values: ["N5", "N4", "N3", "N2", "N1"],
    },
    {
      key: "job_type",
      label: "Tipe Pekerjaan",
      values: ["Full-time", "Part-time", "Kontrak"],
    },
    {
      key: "job_field",
      label: "Bidang Pekerjaan",
      values: [
        "Manufaktur",
        "Konstruksi",
        "Pertanian",
        "Perikanan",
        "Makanan",
        "Perhotelan",
        "Perawatan",
      ],
    },
    {
      key: "blog_category",
      label: "Kategori Blog",
      values: ["Tips", "Pengalaman", "Berita", "Edukasi"],
    },
    {
      key: "blog_tag",
      label: "Tag Blog",
      values: ["Magang", "Bahasa Jepang", "Visa", "Gaji", "Kehidupan di Jepang"],
    },
    {
      key: "offer_type",
      label: "Tipe Penawaran",
      values: ["Promo", "Event", "Kelas Gratis", "Paket Kelas"],
    },
    {
      key: "target_audience",
      label: "Target Peserta",
      values: ["Umum", "Pelajar", "Fresh Graduate", "Eks Jepang"],
    },
    {
      key: "career_department",
      label: "Departemen",
      values: ["Operasional", "Pemasaran", "Administrasi", "Pengajar"],
    },
    {
      key: "career_employment_type",
      label: "Tipe Kerja",
      values: ["Full-time", "Part-time", "Magang"],
    },
    {
      key: "career_work_arrangement",
      label: "Mode Kerja",
      values: ["On-site", "Hybrid", "Remote"],
    },
  ],
  japan: [
    {
      key: "japan_news_category",
      label: "ニュースカテゴリ",
      values: [
        "ニュース",
        "イベント",
        "お知らせ",
        "パートナー訪問",
        "研修活動",
        "候補者派遣",
      ],
    },
    {
      key: "japan_news_tag",
      label: "ニュースタグ",
      values: ["インドネシア", "技能実習", "特定技能", "採用", "研修"],
    },
    {
      key: "japan_sector_category",
      label: "業種カテゴリ",
      values: ["製造業", "建設業", "農業", "介護", "食品加工", "外食業", "宿泊業"],
    },
    {
      key: "japan_candidate_pathway",
      label: "在留資格",
      values: ["技能実習", "特定技能", "技術・人文知識・国際業務"],
    },
    {
      key: "japan_language_support",
      label: "対応言語",
      values: ["日本語", "English", "Bahasa Indonesia"],
    },
  ],
} as const;

const contentPages = {
  indonesia: [
    { pageKey: "homepage", title: "Homepage", slug: "homepage" },
    { pageKey: "program_page", title: "Program", slug: "program-page" },
    { pageKey: "job_page", title: "Info Job", slug: "job-page" },
    { pageKey: "blog_page", title: "Blog", slug: "blog-page" },
    { pageKey: "tentang_kami", title: "Tentang Kami", slug: "tentang-kami" },
    { pageKey: "karir_page", title: "Karir", slug: "karir-page" },
  ],
  japan: [
    { pageKey: "homepage", title: "Homepage", slug: "homepage" },
    { pageKey: "tentang_kami", title: "会社概要", slug: "tentang-kami" },
    { pageKey: "metode_pelatihan", title: "研修方法", slug: "metode-pelatihan" },
    { pageKey: "profil_kandidat", title: "人材プロフィール", slug: "profil-kandidat" },
    { pageKey: "jaringan_rekrutmen", title: "採用ネットワーク", slug: "jaringan-rekrutmen" },
    { pageKey: "sector_page", title: "業種", slug: "sector-page" },
    { pageKey: "news_page", title: "ニュース", slug: "news-page" },
    { pageKey: "contact", title: "お問い合わせ", slug: "contact" },
  ],
} as const;

const globalConfigs = {
  indonesia: ["brand_header", "whatsapp_contact", "footer"],
  japan: ["brand_header", "line_business_contact", "footer"],
} as const;

type VariantKey = keyof typeof contentCollections;

function optionValueFromLabel(label: string) {
  const value = slugify(label, {
    lower: true,
    strict: true,
    locale: "id",
    trim: true,
  });

  return value || label;
}

async function main() {
  const result = await prisma.$transaction(
    async (tx) => {
      const existingTenant = await tx.tenant.findUnique({
        where: { slug: tenantSeed.slug },
        select: { id: true },
      });

      if (existingTenant) {
        throw new Error(`Tenant with slug "${tenantSeed.slug}" already exists.`);
      }

      const tenant = await tx.tenant.create({
        data: tenantSeed,
        select: { id: true },
      });

      const variants = new Map<VariantKey, { id: string }>();

      for (const variantSeed of variantSeeds) {
        const variant = await tx.variant.create({
          data: {
            tenantId: tenant.id,
            ...variantSeed,
          },
          select: { id: true, key: true },
        });

        variants.set(variant.key as VariantKey, { id: variant.id });
      }

      const indonesiaVariant = variants.get("indonesia");
      const japanVariant = variants.get("japan");

      if (!indonesiaVariant || !japanVariant) {
        throw new Error("HIT variants were not created.");
      }

      const domains = await Promise.all([
        tx.domain.create({
          data: {
            host: "hit-indonesia.lpk.local:3000",
            variantId: indonesiaVariant.id,
            status: "ACTIVE",
            isPrimary: true,
            verifiedAt: new Date(),
          },
          select: { id: true, host: true },
        }),
        tx.domain.create({
          data: {
            host: "hit-japan.lpk.local:3000",
            variantId: japanVariant.id,
            status: "ACTIVE",
            isPrimary: true,
            verifiedAt: new Date(),
          },
          select: { id: true, host: true },
        }),
      ]);

      for (const [variantKey, variant] of variants.entries()) {
        for (const collection of contentCollections[variantKey]) {
          await tx.contentCollection.create({
            data: {
              tenantId: tenant.id,
              variantId: variant.id,
              key: collection.key,
              label: collection.label,
              isEnabled: true,
            },
          });
        }

        for (const optionSetSeed of optionSets[variantKey]) {
          const optionSet = await tx.optionSet.create({
            data: {
              tenantId: tenant.id,
              variantId: variant.id,
              key: optionSetSeed.key,
              label: optionSetSeed.label,
            },
            select: { id: true },
          });

          await tx.optionValue.createMany({
            data: optionSetSeed.values.map((label, index) => ({
              optionSetId: optionSet.id,
              value: optionValueFromLabel(label),
              label,
              sortOrder: index,
              isActive: true,
            })),
          });
        }

        for (const page of contentPages[variantKey]) {
          await tx.contentPage.create({
            data: {
              tenantId: tenant.id,
              variantId: variant.id,
              pageKey: page.pageKey,
              title: page.title,
              slug: page.slug,
              status: "DRAFT",
              dataJson: {},
            },
          });
        }

        for (const configKey of globalConfigs[variantKey]) {
          await tx.variantGlobalConfig.create({
            data: {
              tenantId: tenant.id,
              variantId: variant.id,
              configKey,
              dataJson: {},
            },
          });
        }
      }

      const tenantAdmin = await tx.user.create({
        data: {
          username: "hit-admin",
          passwordHash: await bcrypt.hash("HitAdmin@2026!", 12),
          role: "TENANT_ADMIN",
          tenantId: tenant.id,
          mustChangePassword: false,
          totpVerified: false,
          isActive: true,
        },
        select: { id: true, username: true },
      });

      return {
        tenantId: tenant.id,
        variantIds: {
          indonesia: indonesiaVariant.id,
          japan: japanVariant.id,
        },
        domainIds: Object.fromEntries(domains.map((domain) => [domain.host, domain.id])),
        tenantAdminId: tenantAdmin.id,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 20_000,
      timeout: 120_000,
    },
  );

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error("Failed to seed HIT tenant.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
