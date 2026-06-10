import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PublishStatus } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the Prisma seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const tenantSeed = {
  name: "Hashimoto Indo Trust",
  slug: "hit",
};

const variantSeeds = [
  { key: "indonesia", label: "Variant Indonesia", themeKey: "starter" },
  { key: "japan", label: "Variant Jepang", themeKey: "starter" },
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
      label: "Program Type",
      values: ["Magang", "Tokutei Ginou", "Gijinkoku", "Kelas Bahasa"],
    },
    {
      key: "gender",
      label: "Gender",
      values: ["Laki-laki", "Perempuan", "Laki-laki & Perempuan"],
    },
    {
      key: "education_level",
      label: "Education Level",
      values: ["SMA/SMK", "D3", "S1"],
    },
    {
      key: "language_level",
      label: "Language Level",
      values: ["N5", "N4", "N3", "N2", "N1"],
    },
    {
      key: "job_type",
      label: "Job Type",
      values: ["Full-time", "Part-time", "Kontrak"],
    },
    {
      key: "job_field",
      label: "Job Field",
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
      label: "Blog Category",
      values: ["Tips", "Pengalaman", "Berita", "Edukasi"],
    },
    {
      key: "blog_tag",
      label: "Blog Tag",
      values: [],
    },
    {
      key: "offer_type",
      label: "Offer Type",
      values: ["Promo", "Event", "Kelas Gratis", "Paket Kelas"],
    },
    {
      key: "target_audience",
      label: "Target Audience",
      values: ["Umum", "Pelajar", "Fresh Graduate", "Eks Jepang"],
    },
    {
      key: "career_department",
      label: "Career Department",
      values: [],
    },
    {
      key: "career_employment_type",
      label: "Career Employment Type",
      values: ["Full-time", "Part-time", "Magang"],
    },
    {
      key: "career_work_arrangement",
      label: "Career Work Arrangement",
      values: ["On-site", "Hybrid", "Remote"],
    },
  ],
  japan: [
    {
      key: "japan_news_category",
      label: "Japan News Category",
      values: ["ニュース", "イベント", "お知らせ", "パートナー訪問", "研修活動", "候補者派遣"],
    },
    {
      key: "japan_news_tag",
      label: "Japan News Tag",
      values: [],
    },
    {
      key: "japan_sector_category",
      label: "Japan Sector Category",
      values: [
        "Perawatan Lansia",
        "Pengolahan Makanan",
        "Manufaktur",
        "Montir Kendaraan",
        "Pengelasan",
        "Pertanian",
        "Perikanan",
        "Perhotelan",
        "Building Cleaning",
        "Sopir Truk dan Bus",
        "CNC dan Machining",
        "Restoran",
        "Konstruksi",
      ],
    },
    {
      key: "japan_candidate_pathway",
      label: "Japan Candidate Pathway",
      values: ["技能実習", "特定技能", "技術・人文知識・国際業務"],
    },
    {
      key: "japan_language_support",
      label: "Japan Language Support",
      values: ["日本語", "English", "Bahasa Indonesia"],
    },
  ],
} as const;

const contentPages = {
  indonesia: [
    { pageKey: "homepage", title: "Homepage", slug: "homepage" },
    { pageKey: "program_page", title: "Program Page", slug: "program" },
    { pageKey: "job_page", title: "Job Page", slug: "job" },
    { pageKey: "blog_page", title: "Blog Page", slug: "blog" },
    { pageKey: "tentang_kami", title: "Tentang Kami", slug: "tentang-kami" },
    { pageKey: "karir_page", title: "Karir Page", slug: "karir" },
  ],
  japan: [
    { pageKey: "homepage", title: "Homepage", slug: "homepage" },
    { pageKey: "tentang_kami", title: "Tentang Kami", slug: "tentang-kami" },
    { pageKey: "metode_pelatihan", title: "Metode Pelatihan", slug: "metode-pelatihan" },
    { pageKey: "profil_kandidat", title: "Profil Kandidat", slug: "profil-kandidat" },
    { pageKey: "jaringan_rekrutmen", title: "Jaringan Rekrutmen", slug: "jaringan-rekrutmen" },
    { pageKey: "sector_page", title: "Sector Page", slug: "sector" },
    { pageKey: "news_page", title: "News Page", slug: "news" },
    { pageKey: "contact", title: "Contact", slug: "contact" },
  ],
} as const;

const globalConfigs = {
  indonesia: ["brand_header", "whatsapp_contact", "footer"],
  japan: ["brand_header", "line_business_contact", "footer"],
} as const;

type VariantKey = keyof typeof contentCollections;

async function seedTenant() {
  console.log("Seeding tenant...");

  return prisma.tenant.upsert({
    where: { slug: tenantSeed.slug },
    update: {
      name: tenantSeed.name,
      status: "ACTIVE",
    },
    create: {
      name: tenantSeed.name,
      slug: tenantSeed.slug,
    },
  });
}

async function seedVariants(tenantId: string) {
  console.log("Seeding variants...");

  const variants = new Map<VariantKey, { id: string }>();

  for (const variantSeed of variantSeeds) {
    const variant = await prisma.variant.upsert({
      where: {
        tenantId_key: {
          tenantId,
          key: variantSeed.key,
        },
      },
      update: {
        label: variantSeed.label,
        themeKey: variantSeed.themeKey,
        status: "ACTIVE",
      },
      create: {
        tenantId,
        key: variantSeed.key,
        label: variantSeed.label,
        themeKey: variantSeed.themeKey,
      },
      select: {
        id: true,
      },
    });

    variants.set(variantSeed.key, variant);
    console.log(`  - ${variantSeed.key}`);
  }

  return variants;
}

async function seedContentCollections(tenantId: string, variantKey: VariantKey, variantId: string) {
  console.log(`Seeding content collections for ${variantKey}...`);

  for (const collection of contentCollections[variantKey]) {
    await prisma.contentCollection.upsert({
      where: {
        variantId_key: {
          variantId,
          key: collection.key,
        },
      },
      update: {
        label: collection.label,
        isEnabled: true,
      },
      create: {
        tenantId,
        variantId,
        key: collection.key,
        label: collection.label,
      },
    });

    console.log(`  - ${collection.key}`);
  }
}

async function seedOptionSets(tenantId: string, variantKey: VariantKey, variantId: string) {
  console.log(`Seeding option sets for ${variantKey}...`);

  for (const optionSetSeed of optionSets[variantKey]) {
    const optionSet = await prisma.optionSet.upsert({
      where: {
        variantId_key: {
          variantId,
          key: optionSetSeed.key,
        },
      },
      update: {
        label: optionSetSeed.label,
      },
      create: {
        tenantId,
        variantId,
        key: optionSetSeed.key,
        label: optionSetSeed.label,
      },
      select: {
        id: true,
      },
    });

    for (const [index, value] of optionSetSeed.values.entries()) {
      await prisma.optionValue.upsert({
        where: {
          optionSetId_value: {
            optionSetId: optionSet.id,
            value,
          },
        },
        update: {
          label: value,
          sortOrder: index,
          isActive: true,
        },
        create: {
          optionSetId: optionSet.id,
          value,
          label: value,
          sortOrder: index,
        },
      });
    }

    console.log(`  - ${optionSetSeed.key} (${optionSetSeed.values.length} values)`);
  }
}

async function seedContentPages(tenantId: string, variantKey: VariantKey, variantId: string) {
  console.log(`Seeding content pages for ${variantKey}...`);

  for (const page of contentPages[variantKey]) {
    await prisma.contentPage.upsert({
      where: {
        variantId_pageKey: {
          variantId,
          pageKey: page.pageKey,
        },
      },
      update: {
        title: page.title,
        slug: page.slug,
      },
      create: {
        tenantId,
        variantId,
        pageKey: page.pageKey,
        title: page.title,
        slug: page.slug,
        status: PublishStatus.DRAFT,
        dataJson: {},
      },
    });

    console.log(`  - ${page.pageKey}`);
  }
}

async function seedGlobalConfigs(tenantId: string, variantKey: VariantKey, variantId: string) {
  console.log(`Seeding global configs for ${variantKey}...`);

  for (const configKey of globalConfigs[variantKey]) {
    await prisma.variantGlobalConfig.upsert({
      where: {
        variantId_configKey: {
          variantId,
          configKey,
        },
      },
      update: {},
      create: {
        tenantId,
        variantId,
        configKey,
        dataJson: {},
      },
    });

    console.log(`  - ${configKey}`);
  }
}

async function main() {
  console.log("Starting database seed...");

  const tenant = await seedTenant();
  const variants = await seedVariants(tenant.id);

  for (const [variantKey, variant] of variants.entries()) {
    await seedContentCollections(tenant.id, variantKey, variant.id);
    await seedOptionSets(tenant.id, variantKey, variant.id);
    await seedContentPages(tenant.id, variantKey, variant.id);
    await seedGlobalConfigs(tenant.id, variantKey, variant.id);
  }

  console.log("Database seed completed.");
}

main()
  .catch((error) => {
    console.error("Database seed failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
