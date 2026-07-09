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
  throw new Error("DATABASE_URL is required to update the Indonesia homepage.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const targetHost = readArgument("--host") || "hit-indonesia.lpk.local:3000";
const targetTenantSlug = readArgument("--tenant") || "hit";

function readArgument(name: string) {
  const prefix = `${name}=`;
  const value = process.argv.slice(2).find((argument) => argument.startsWith(prefix));
  return value?.slice(prefix.length).trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown) {
  return isRecord(value) ? value : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function updateBrandHeader(value: unknown) {
  const current = record(value);
  const brand = record(current.brand);
  const headerCta = record(current.header_cta);

  return {
    ...current,
    brand: {
      ...brand,
      tagline: "Persiapan Bahasa dan Kerja Jepang",
    },
    header_cta: {
      ...headerCta,
      label: "Konsultasi Program",
      whatsapp_message_template:
        "Halo Hashimoto Indo Trust, saya ingin berkonsultasi untuk mengetahui program persiapan kerja Jepang yang sesuai dengan profil saya.",
    },
  };
}

function updateWhatsappContact(value: unknown) {
  const current = record(value);
  const whatsapp = record(current.whatsapp);
  const contact = record(current.contact);

  return {
    ...current,
    whatsapp: {
      ...whatsapp,
      number: "62819046491922",
      default_message_template:
        "Halo Hashimoto Indo Trust, saya ingin berkonsultasi mengenai persiapan kerja ke Jepang.",
      floating_icon_only_label: "Konsultasi via WhatsApp",
      floating_label_after_scroll: "Konsultasi Sekarang",
    },
    contact: {
      ...contact,
      phone_label: "+62 819-0464-91922",
      email: "pthashimotoindotrust@gmail.com",
      address: "Tanjung, Celep, Kedawung, Kabupaten Sragen, Jawa Tengah 57292",
      map_url: "",
    },
  };
}

function updateFooter(value: unknown) {
  const current = record(value);
  const brand = record(current.brand);
  const legal = record(current.legal);

  return {
    ...current,
    brand: {
      ...brand,
      short_description:
        "Persiapan bahasa Jepang, budaya kerja, interview, dan kesiapan kandidat untuk mengikuti proses kerja di Jepang.",
    },
    legal: {
      ...legal,
      copyright_text: "\u00A9 2026 PT Hashimoto Indo Trust. Semua hak dilindungi.",
    },
  };
}

type WorkFieldImages = {
  manufacturing?: string;
  foodProcessing?: string;
  agriculture?: string;
  elderlyCare?: string;
};

function updateHomepageData(value: unknown, workFieldImages: WorkFieldImages) {
  const current = record(value);
  const hero = record(current.hero);
  const offerSection = record(current.offer_section);
  const featuredPrograms = record(current.featured_programs);
  const latestJobs = record(current.latest_jobs);
  const latestBlogs = record(current.latest_blogs);
  const contactSection = record(current.contact_section);
  const currentWorkFields = Array.isArray(current.work_fields)
    ? current.work_fields.map(record)
    : [];
  const existingWorkFieldImage = (title: string) =>
    stringValue(
      currentWorkFields.find((item) => stringValue(item.title) === title)?.image_id,
    );

  return {
    ...current,
    hero: {
      ...hero,
      eyebrow_label: "Persiapan Bahasa dan Kerja Jepang",
      headline: "Persiapkan Langkahmu untuk Bekerja di Jepang",
      subheadline:
        "Bangun kemampuan bahasa, pahami budaya kerja, dan siapkan diri menghadapi proses seleksi bersama tim yang memiliki pengalaman nyata di Jepang dan kompetensi pendidikan bahasa Jepang.",
      primary_cta_label: "Konsultasi Program",
      primary_cta_whatsapp_message:
        "Halo Hashimoto Indo Trust, saya ingin berkonsultasi untuk mengetahui program persiapan kerja Jepang yang sesuai dengan profil saya.",
      secondary_cta_label: "Lihat Lowongan Aktif",
      secondary_cta_href: "/job",
    },
    display_text: {
      audience_paths_title: "Pilih Kebutuhanmu",
      audience_paths_description:
        "Mulai dari tahap yang sesuai dengan kondisimu saat ini: membangun kesiapan dari dasar atau langsung mencari lowongan yang cocok.",
      trust_title: "Persiapan yang Dibangun dari Pengalaman Nyata",
      trust_description:
        "Kami memadukan pengalaman kerja di Jepang, kompetensi pendidikan bahasa, dan pendampingan yang disesuaikan dengan kesiapan setiap kandidat.",
      programs_title: "Pilih Jalur Program yang Sesuai",
      programs_description:
        "Setiap jalur memiliki persyaratan dan target persiapan yang berbeda. Pelajari pilihan program sebelum menentukan langkah berikutnya.",
      programs_cta_label: "Bandingkan Semua Program",
      work_fields_title: "Bidang Kerja yang Dapat Dipersiapkan",
      work_fields_description:
        "Pelatihan diarahkan pada bahasa, sikap kerja, dan komunikasi yang relevan dengan bidang tujuan. Ketersediaan posisi mengikuti kebutuhan perusahaan dan hasil seleksi.",
      jobs_title: "Lowongan yang Sedang Tersedia",
      jobs_description:
        "Sudah memiliki kemampuan atau pengalaman yang dibutuhkan? Periksa lowongan aktif dan pelajari persyaratannya sebelum melamar.",
      jobs_cta_label: "Lihat Semua Lowongan",
      steps_title: "Tahapan Menuju Proses Kerja di Jepang",
      steps_description:
        "Setiap kandidat melalui proses yang bertahap. Durasi dan hasilnya bergantung pada program, perkembangan kemampuan, kelengkapan dokumen, dan keputusan perusahaan penerima.",
      applicant_steps_title: "Sudah Siap Kerja? Begini Alur Melamar Lowongan",
      applicant_steps_description:
        "Kandidat yang telah memenuhi persyaratan dapat langsung memilih lowongan dan mengikuti proses seleksi tanpa harus memulai program dari dasar.",
      testimonials_title: "Pengalaman Peserta",
      faq_title: "Hal yang Perlu Kamu Ketahui Sebelum Mendaftar",
      faq_description:
        "Pahami persyaratan, waktu persiapan, biaya, dan proses seleksi sebelum memilih program.",
      blogs_title: "Panduan dan Informasi Terbaru",
      blogs_description:
        "Baca informasi seputar persyaratan, budaya kerja, proses seleksi, dan persiapan hidup serta bekerja di Jepang.",
      blogs_cta_label: "Lihat Semua Panduan",
    },
    offer_section: {
      ...offerSection,
      is_enabled: false,
      source: "manual",
      manual_offer_id: "",
      fallback_badge_label: "Mulai dari Sini",
      fallback_headline: "Kenali Jalur Kerja Jepang Sebelum Memilih Program",
      fallback_description:
        "Pelajari perbedaan jalur Magang, Tokutei Ginou, dan Gijinkoku beserta persyaratan dasarnya. Tim HIT akan membantu memeriksa jalur yang paling mendekati profil dan tujuanmu.",
      fallback_cta_label: "Pelajari Jalur Program",
      fallback_cta_href: "/program",
    },
    audience_paths: [
      {
        icon_key: "graduation_cap",
        title: "Saya Ingin Memulai dari Nol",
        description:
          "Cocok untuk kamu yang masih perlu membangun bahasa Jepang, memahami budaya kerja, dan mempersiapkan diri menghadapi seleksi.",
        cta_label: "Temukan Program",
        href: "/program",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "briefcase_business",
        title: "Saya Siap Mencari Lowongan",
        description:
          "Cocok untuk kamu yang sudah memiliki kemampuan, pengalaman, atau sertifikasi yang relevan dan ingin melihat kesempatan kerja yang tersedia.",
        cta_label: "Lihat Lowongan Aktif",
        href: "/job",
        sort_order: 1,
        is_enabled: true,
      },
    ],
    stats: [
      {
        icon_key: "briefcase",
        value: "17 Tahun",
        label: "Pengalaman kerja pendiri di Jepang",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "award",
        value: "JLPT N1",
        label: "Penanggung jawab pendidikan",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "graduation_cap",
        value: "7+ Tahun",
        label: "Pengalaman mengajar bahasa Jepang",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "network",
        value: "25+",
        label: "Jaringan rekrutmen regional",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    trust_cards: [
      {
        icon_key: "briefcase_business",
        headline: "Dibangun dari Pengalaman Kerja di Jepang",
        description:
          "Pendiri HIT membawa pengalaman 17 tahun bekerja di Jepang untuk membantu kandidat memahami disiplin, komunikasi, dan kebiasaan kerja yang dibutuhkan.",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "award",
        headline: "Pendidikan Dipimpin Pengajar JLPT N1",
        description:
          "Arah pembelajaran dan evaluasi berada di bawah penanggung jawab pendidikan JLPT N1 dengan pengalaman mengajar lebih dari tujuh tahun.",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "message_circle",
        headline: "Persiapan Lebih dari Sekadar Bahasa",
        description:
          "Kandidat berlatih interview, memahami instruksi, melakukan pelaporan kerja, menjaga keselamatan, dan membangun sikap profesional.",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "route",
        headline: "Pendampingan Sesuai Profil Kandidat",
        description:
          "Pilihan program dipertimbangkan berdasarkan usia, pendidikan, kemampuan bahasa, kesiapan belajar, dan tujuan kerja masing-masing kandidat.",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    foundation_section: {
      is_enabled: true,
      eyebrow_label: "Fondasi Hashimoto Indo Trust",
      headline: "Pengalaman Jepang dan Kualitas Pendidikan dalam Satu Pendampingan",
      description:
        "PT Hashimoto Indo Trust berbasis di Sragen, Jawa Tengah. Kami membangun persiapan kandidat dengan menggabungkan pemahaman dunia kerja Jepang, pendidikan bahasa yang terarah, dan jaringan rekrutmen regional.\n\nSebagai badan usaha Indonesia, HIT telah terdaftar melalui sistem OSS dan memiliki Nomor Induk Berusaha 2307250018253.",
      bullet_items: [
        "Pendiri memiliki pengalaman kerja selama 17 tahun di Jepang",
        "Pendidikan dipimpin penanggung jawab dengan kualifikasi JLPT N1",
        "Materi mencakup bahasa, komunikasi kerja, disiplin, dan keselamatan",
        "Profil dan perkembangan kandidat dievaluasi secara bertahap",
      ],
      cta_label: "Lihat Profil dan Legalitas HIT",
      cta_href: "/tentang-kami",
    },
    featured_programs: {
      ...featuredPrograms,
      source: "featured",
      max_items: 3,
    },
    latest_jobs: {
      ...latestJobs,
      is_enabled: true,
      source: "latest_active",
      max_items: 3,
    },
    work_fields: [
      {
        icon_key: "factory",
        image_id:
          workFieldImages.manufacturing || existingWorkFieldImage("Manufaktur"),
        title: "Manufaktur",
        description:
          "Persiapan kosakata kerja, pemahaman instruksi, ketelitian, keselamatan, dan kebiasaan bekerja dalam tim produksi.",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "utensils",
        image_id:
          workFieldImages.foodProcessing ||
          existingWorkFieldImage("Pengolahan Makanan"),
        title: "Pengolahan Makanan",
        description:
          "Pembelajaran diarahkan pada kebersihan, prosedur kerja, komunikasi dasar, konsistensi, dan tanggung jawab terhadap kualitas.",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "sprout",
        image_id:
          workFieldImages.agriculture || existingWorkFieldImage("Pertanian"),
        title: "Pertanian",
        description:
          "Kandidat dipersiapkan untuk memahami instruksi lapangan, ritme kerja, kedisiplinan, kerja fisik, dan koordinasi tim.",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "heart_handshake",
        image_id:
          workFieldImages.elderlyCare ||
          existingWorkFieldImage("Perawatan Lansia"),
        title: "Perawatan Lansia",
        description:
          "Persiapan menekankan komunikasi yang sopan, empati, tanggung jawab, pemahaman prosedur, dan bahasa sesuai kebutuhan bidang kaigo.",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    steps: [
      {
        icon_key: "message_circle",
        title: "Konsultasi dan Pemeriksaan Profil",
        description:
          "Ceritakan usia, pendidikan, pengalaman, kemampuan bahasa, dan tujuanmu agar tim dapat memberi arahan awal.",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "route",
        title: "Menentukan Jalur Program",
        description:
          "Tim membantu membandingkan persyaratan Magang, Tokutei Ginou, atau Gijinkoku berdasarkan profil kandidat.",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "clipboard_check",
        title: "Seleksi dan Pemeriksaan Kesiapan",
        description:
          "Kandidat mengikuti pemeriksaan kemampuan dasar, komitmen belajar, dokumen, dan persyaratan kesehatan sesuai program.",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "graduation_cap",
        title: "Pendidikan Bahasa dan Persiapan Kerja",
        description:
          "Pembelajaran mencakup bahasa Jepang, budaya kerja, komunikasi, interview, disiplin, dan materi yang relevan dengan bidang tujuan.",
        sort_order: 3,
        is_enabled: true,
      },
      {
        icon_key: "building_2",
        title: "Interview dan Proses Penempatan",
        description:
          "Kandidat yang memenuhi kesiapan mengikuti proses seleksi perusahaan. Keputusan penerimaan tetap berada pada perusahaan penerima.",
        sort_order: 4,
        is_enabled: true,
      },
      {
        icon_key: "plane",
        title: "Dokumen dan Persiapan Keberangkatan",
        description:
          "Setelah diterima, proses dilanjutkan dengan pemenuhan dokumen, persiapan keberangkatan, dan pembekalan akhir sesuai jalur program.",
        sort_order: 5,
        is_enabled: true,
      },
    ],
    applicant_steps: [
      {
        icon_key: "briefcase_business",
        title: "Pilih Lowongan",
        description:
          "Pelajari bidang kerja, lokasi, persyaratan bahasa, pengalaman, dan ketentuan lain pada lowongan yang tersedia.",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "file_check",
        title: "Kirim Profil dan Dokumen Awal",
        description:
          "Sampaikan data diri, riwayat pendidikan, kemampuan bahasa, pengalaman kerja, dan dokumen pendukung yang dimiliki.",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "clipboard_check",
        title: "Pemeriksaan Kesesuaian",
        description:
          "Tim memeriksa kecocokan profil dengan persyaratan lowongan dan memberi informasi jika ada bagian yang perlu dilengkapi.",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "building_2",
        title: "Ikuti Proses Seleksi",
        description:
          "Kandidat yang sesuai mengikuti tahapan seleksi perusahaan. Keputusan penerimaan tetap berada pada perusahaan penerima.",
        sort_order: 3,
        is_enabled: true,
      },
      {
        icon_key: "plane",
        title: "Lengkapi Proses Keberangkatan",
        description:
          "Setelah diterima, kandidat melanjutkan dokumen, pembekalan, dan persiapan keberangkatan sesuai jalur kerja yang digunakan.",
        sort_order: 4,
        is_enabled: true,
      },
    ],
    testimonials: [],
    faqs: [
      {
        question: "Apakah pemula yang belum bisa bahasa Jepang dapat mendaftar?",
        answer:
          "Bisa. Beberapa jalur dapat dimulai dari tingkat dasar. Tim akan memeriksa profil dan kemampuan awal untuk membantu menentukan target belajar serta program yang lebih sesuai.",
        sort_order: 0,
        is_enabled: true,
      },
      {
        question: "Program mana yang sesuai dengan pendidikan dan usia saya?",
        answer:
          "Kecocokan program dipengaruhi oleh usia, pendidikan, pengalaman, kemampuan bahasa, kondisi kesehatan, dan bidang kerja yang dituju. Konsultasi awal digunakan untuk membandingkan jalur Magang, Tokutei Ginou, dan Gijinkoku.",
        sort_order: 1,
        is_enabled: true,
      },
      {
        question: "Berapa lama proses persiapan hingga dapat mengikuti seleksi perusahaan?",
        answer:
          "Waktunya berbeda untuk setiap kandidat. Kemampuan bahasa awal, target program, perkembangan belajar, jadwal ujian, dan kebutuhan perusahaan dapat memengaruhi durasi. Tim akan memberikan gambaran tahapan setelah pemeriksaan profil.",
        sort_order: 2,
        is_enabled: true,
      },
      {
        question: "Apakah setelah mengikuti pelatihan saya pasti berangkat ke Jepang?",
        answer:
          "Tidak otomatis. Keberhasilan kandidat dipengaruhi oleh hasil belajar, evaluasi, kesehatan, kelengkapan dokumen, kelulusan interview, dan keputusan perusahaan penerima. HIT membantu kandidat mempersiapkan setiap tahap sebaik mungkin.",
        sort_order: 3,
        is_enabled: true,
      },
      {
        question: "Berapa biaya yang perlu dipersiapkan?",
        answer:
          "Komponen biaya berbeda menurut jalur program, kebutuhan belajar, ujian, dokumen, dan proses keberangkatan. Setelah profil dan program tujuan diketahui, tim akan menjelaskan komponen biaya yang relevan sebelum kandidat mengambil keputusan.",
        sort_order: 4,
        is_enabled: true,
      },
      {
        question: "Apa yang terjadi jika saya belum lolos interview perusahaan?",
        answer:
          "Tim akan membantu mengevaluasi bagian yang perlu diperbaiki, seperti bahasa, jawaban interview, kesiapan bidang kerja, atau kecocokan posisi. Kesempatan mengikuti proses berikutnya menyesuaikan hasil evaluasi dan ketersediaan kebutuhan perusahaan.",
        sort_order: 5,
        is_enabled: true,
      },
    ],
    latest_blogs: {
      ...latestBlogs,
      is_enabled: true,
      source: "latest_published",
      max_items: 3,
    },
    contact_section: {
      ...contactSection,
      headline: "Temukan Jalur Program yang Sesuai untukmu",
      description:
        "Ceritakan usia, pendidikan terakhir, kemampuan bahasa Jepang, dan bidang kerja yang diminati. Tim HIT akan membantu memberikan arahan awal sebelum kamu memilih program.",
      use_global_contact: true,
    },
  };
}

async function main() {
  const variantByDomain = await prisma.variant.findFirst({
    where: { key: "indonesia", domains: { some: { host: targetHost } } },
    select: { id: true },
  });
  const variant =
    variantByDomain ??
    (await prisma.variant.findFirst({
      where: { key: "indonesia", tenant: { slug: targetTenantSlug } },
      select: { id: true },
    }));

  if (!variant) {
    throw new Error(
      `Indonesia variant for ${targetHost} or tenant ${targetTenantSlug} was not found.`,
    );
  }

  const page = await prisma.contentPage.findUnique({
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "homepage" } },
    select: {
      id: true,
      title: true,
      status: true,
      dataJson: true,
      publishedDataJson: true,
    },
  });

  if (!page) {
    throw new Error("Indonesia homepage was not found.");
  }

  const globals = await prisma.variantGlobalConfig.findMany({
    where: {
      variantId: variant.id,
      configKey: { in: ["brand_header", "whatsapp_contact", "footer"] },
    },
    select: { id: true, configKey: true, dataJson: true },
  });

  const jobImages = await prisma.contentItem.findMany({
    where: {
      variantId: variant.id,
      collectionKey: "job",
      slug: {
        in: [
          "operator-produksi-komponen-otomotif-aichi",
          "staf-pengolahan-makanan-gifu",
          "care-worker-perawatan-lansia-fukuoka",
        ],
      },
    },
    select: { slug: true, thumbnailImageId: true },
  });
  const imageByJobSlug = new Map(
    jobImages.map((item) => [item.slug, item.thumbnailImageId || undefined]),
  );
  const workFieldImages: WorkFieldImages = {
    manufacturing: imageByJobSlug.get("operator-produksi-komponen-otomotif-aichi"),
    foodProcessing: imageByJobSlug.get("staf-pengolahan-makanan-gifu"),
    agriculture: undefined,
    elderlyCare: imageByJobSlug.get("care-worker-perawatan-lansia-fukuoka"),
  };

  const updatedDraft = updateHomepageData(page.dataJson, workFieldImages);
  const updatedPublished = updateHomepageData(
    isRecord(page.publishedDataJson) ? page.publishedDataJson : page.dataJson,
    workFieldImages,
  );
  const globalUpdates = globals.map((globalConfig) => {
    const transformer =
      globalConfig.configKey === "brand_header"
        ? updateBrandHeader
        : globalConfig.configKey === "whatsapp_contact"
          ? updateWhatsappContact
          : updateFooter;

    return {
      ...globalConfig,
      updatedData: transformer(globalConfig.dataJson),
    };
  });

  console.log(
    JSON.stringify(
      {
        mode: shouldApply ? "apply" : "dry-run",
        targetHost,
        pageId: page.id,
        pageTitle: page.title,
        globalConfigs: globalUpdates.map((item) => item.configKey),
        sections: [
          "hero",
          "offer_section",
          "audience_paths",
          "stats",
          "trust_cards",
          "foundation_section",
          "featured_programs",
          "work_fields",
          "steps",
          "applicant_steps",
          "faqs",
          "latest_jobs",
          "latest_blogs",
          "contact_section",
        ],
        workFieldImagesResolved: Object.values(workFieldImages).filter(Boolean).length,
        hiddenUntilRealContentIsReady: ["testimonials"],
      },
      null,
      2,
    ),
  );

  if (!shouldApply) {
    console.log("Dry run complete. Re-run with --apply to write changes.");
    return;
  }

  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const backupPath = join(
    tmpdir(),
    `nextcmslpk-indonesia-homepage-${timestamp}.json`,
  );
  await writeFile(
    backupPath,
    JSON.stringify({ targetHost, page, globals }, null, 2),
    "utf8",
  );

  await prisma.$transaction([
    prisma.contentPage.update({
      where: { id: page.id },
      data: {
        title: "Persiapan Kerja ke Jepang",
        dataJson: updatedDraft as Prisma.InputJsonValue,
        publishedDataJson: updatedPublished as Prisma.InputJsonValue,
      },
    }),
    ...globalUpdates.map((globalConfig) =>
      prisma.variantGlobalConfig.update({
        where: { id: globalConfig.id },
        data: { dataJson: globalConfig.updatedData as Prisma.InputJsonValue },
      }),
    ),
  ]);

  console.log(`Indonesia homepage content updated. Backup: ${backupPath}`);
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Indonesia homepage update failed.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
