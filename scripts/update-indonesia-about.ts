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
  throw new Error("DATABASE_URL is required to update the Indonesia about page.");
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

function records(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function findRecord(items: Record<string, unknown>[], query: string) {
  const normalizedQuery = query.toLowerCase();
  return (
    items.find((item) =>
      [item.name, item.title, item.type_label]
        .map((value) => stringValue(value).toLowerCase())
        .some((value) => value.includes(normalizedQuery)),
    ) ?? {}
  );
}

function imageIdFrom(items: Record<string, unknown>[], name: string) {
  return stringValue(findRecord(items, name).image_id);
}

function documentUrlFrom(items: Record<string, unknown>[], query: string) {
  return stringValue(findRecord(items, query).document_url);
}

function updateAboutData(value: unknown, japanValue: unknown) {
  const current = record(value);
  const currentHero = record(current.hero);
  const currentStory = record(current.story);
  const japan = record(japanValue);
  const japanHero = record(japan.hero);
  const japanStory = record(japan.story);
  const japanTeam = records(japan.team_members);
  const japanLegalities = records(japan.legal_overview);

  return {
    ...current,
    hero: {
      ...currentHero,
      media_id: stringValue(currentHero.media_id) || stringValue(japanHero.media_id),
      eyebrow_label: "Tentang PT Hashimoto Indo Trust",
      headline: "Persiapkan Dirimu untuk Tumbuh dan Bekerja di Jepang",
      subheadline:
        "Bersama tim yang memiliki pengalaman kerja nyata di Jepang dan kompetensi pendidikan JLPT N1, HIT membantu kamu membangun kemampuan bahasa, kesiapan interview, dan pemahaman budaya kerja Jepang.",
      primary_cta_label: "Konsultasi Program",
      primary_cta_whatsapp_message:
        "Halo Hashimoto Indo Trust, saya ingin berkonsultasi tentang kesiapan dan jalur program kerja Jepang yang sesuai dengan profil saya.",
      secondary_cta_label: "Lihat Pilihan Program",
      secondary_cta_href: "/program",
    },
    proof_stats: [
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
        label: "Kualifikasi penanggung jawab pendidikan",
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
    company_status: {
      eyebrow_label: "Fondasi Hashimoto Indo Trust",
      headline: "Pengalaman Jepang dan Pendidikan Terarah dalam Satu Pendampingan",
      description:
        "PT Hashimoto Indo Trust hadir di Sragen untuk membantu generasi muda Indonesia mempersiapkan diri menghadapi peluang kerja di Jepang. Pendampingan kami menggabungkan pengalaman 17 tahun bekerja di Jepang, pendidikan bahasa yang dipimpin pengajar JLPT N1, serta pembinaan komunikasi dan budaya kerja.\n\nSetiap kandidat diarahkan berdasarkan kemampuan awal, latar belakang, dan bidang kerja yang dituju agar proses persiapannya lebih relevan dan terukur.",
      status_label: "Persiapan bahasa dan kesiapan kerja Jepang",
      last_updated_label: "Diperbarui Juni 2026",
      facts: [
        {
          icon_key: "building_2",
          value: "PT",
          label: "Badan usaha Indonesia",
          description:
            "Terdaftar sebagai PT Hashimoto Indo Trust melalui sistem administrasi badan usaha Indonesia.",
          sort_order: 0,
          is_enabled: true,
        },
        {
          icon_key: "map_pin",
          value: "Sragen",
          label: "Pusat persiapan kandidat",
          description:
            "Konsultasi, pembelajaran, dan persiapan kandidat dilaksanakan dari Kabupaten Sragen, Jawa Tengah.",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "award",
          value: "JLPT N1",
          label: "Pendidikan yang terarah",
          description:
            "Arah pembelajaran dan evaluasi bahasa berada di bawah penanggung jawab pendidikan dengan kualifikasi JLPT N1.",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "network",
          value: "25+",
          label: "Jaringan rekrutmen regional",
          description:
            "Jaringan regional membantu HIT menjangkau calon kandidat dan memperluas akses terhadap konsultasi serta pembinaan awal.",
          sort_order: 3,
          is_enabled: true,
        },
      ],
    },
    story: {
      ...currentStory,
      image_id: stringValue(japanStory.image_id) || stringValue(currentStory.image_id),
      badge_label: "Latar belakang pendirian",
      headline: "Pengalaman bekerja di Jepang menjadi dasar cara kami mempersiapkan kandidat",
      body:
        "Aris Supriyadi, Direktur Utama PT Hashimoto Indo Trust, bekerja di Jepang selama 17 tahun. Dari pengalaman tersebut, ia memahami bahwa kesiapan kerja tidak hanya ditentukan oleh kemampuan bahasa, tetapi juga oleh disiplin, ketepatan waktu, pemahaman instruksi, komunikasi, keselamatan, dan kemampuan bekerja bersama orang lain.\n\nSelama bekerja di Jepang, Aris berada di bawah kepemimpinan Hashimoto Shigeto, pendiri HAP JAPAN. Hubungan profesional dan kepercayaan yang dibangun selama bertahun-tahun kemudian menjadi salah satu fondasi berdirinya HIT di Indonesia.\n\nPengalaman tersebut kini diterapkan dalam pendampingan kandidat, mulai dari pembelajaran bahasa dan budaya kerja hingga persiapan interview serta komunikasi di lingkungan kerja Jepang.",
    },
    japan_relationship: {
      eyebrow_label: "Fondasi hubungan dengan Jepang",
      headline: "Pengalaman Langsung di Jepang yang Membentuk Pendampingan HIT",
      description:
        "Hubungan HIT dengan Jepang lahir dari pengalaman kerja nyata dan kepercayaan profesional yang dibangun dalam jangka panjang. Pengalaman tersebut digunakan untuk membantu kandidat memahami ekspektasi tempat kerja Jepang secara lebih konkret.",
      people: [
        {
          side_label: "Perspektif Jepang",
          name: "Hashimoto Shigeto",
          role: "Pendiri HAP JAPAN",
          organization: "Penasihat dan penghubung sisi Jepang",
          summary:
            "Mengenal kinerja dan karakter Aris selama masa kerjanya di Jepang serta memberi perspektif mengenai kebutuhan perusahaan, budaya kerja, dan arah pembinaan kandidat.",
          sort_order: 0,
          is_enabled: true,
        },
        {
          side_label: "Operasional Indonesia",
          name: "Aris Supriyadi",
          role: "Direktur Utama PT Hashimoto Indo Trust",
          organization: "Pengelola operasional dan hubungan perusahaan",
          summary:
            "Menggunakan pengalaman 17 tahun bekerja di Jepang untuk mengarahkan persiapan kandidat, komunikasi dengan perusahaan, dan pengembangan sistem pendidikan HIT.",
          sort_order: 1,
          is_enabled: true,
        },
      ],
      cooperation_scope: [
        "Penjelasan mengenai disiplin, komunikasi, dan kebiasaan kerja di Jepang",
        "Masukan terhadap materi persiapan berdasarkan kebutuhan tempat kerja",
        "Persiapan interview dan cara memahami instruksi kerja",
        "Komunikasi mengenai perkembangan dan kesiapan kandidat",
      ],
      clarification_note:
        "Setiap jalur memiliki tahapan dan pihak yang berbeda. Tim HIT membantu kandidat memahami alurnya sesuai program dan peluang kerja yang dipilih.",
    },
    education_quality: {
      image_id: imageIdFrom(japanTeam, "Sarif Hidayatulloh"),
      eyebrow_label: "Penanggung jawab pendidikan",
      qualification_label: "JLPT N1",
      headline: "Pembelajaran Dipimpin Pengajar JLPT N1 yang Berpengalaman",
      description:
        "Sarif Hidayatulloh memegang kualifikasi JLPT N1 dan memiliki pengalaman lebih dari tujuh tahun dalam pengajaran bahasa Jepang di lembaga pelatihan kerja. Ia bertanggung jawab atas arah pembelajaran, evaluasi perkembangan, serta persiapan komunikasi yang dibutuhkan kandidat di lingkungan kerja Jepang.",
      leader_name: "Sarif Hidayatulloh",
      leader_role: "Penanggung Jawab Pendidikan dan Pengajar Bahasa Jepang",
      experience_label: "Pengalaman mengajar lebih dari 7 tahun",
      focus_items: [
        "Evaluasi perkembangan bahasa setiap kandidat secara berkala",
        "Kosakata dan instruksi yang relevan dengan bidang kerja tujuan",
        "Latihan interview, pelaporan, komunikasi, dan respons di tempat kerja",
        "Pembiasaan disiplin, ketepatan waktu, keselamatan, dan tanggung jawab",
      ],
    },
    operational_readiness: {
      headline: "Pendampingan yang Dirancang untuk Kesiapan Kandidat",
      description:
        "HIT menghubungkan pendidikan bahasa, pemahaman budaya kerja, evaluasi perkembangan, dan perluasan akses peluang dalam satu proses persiapan yang saling mendukung.",
      items: [
        {
          status: "completed",
          status_label: "Fondasi resmi",
          icon_key: "building_2",
          title: "Lembaga berbadan usaha Indonesia",
          description:
            "PT Hashimoto Indo Trust memiliki Nomor Induk Berusaha dan persetujuan pendirian badan hukum sebagai fondasi operasional perusahaan di Indonesia.",
          target_label: "Informasi legalitas tersedia pada halaman ini",
          sort_order: 0,
          is_enabled: true,
        },
        {
          status: "completed",
          status_label: "Dipimpin tenaga berpengalaman",
          icon_key: "graduation_cap",
          title: "Pendidikan bahasa dan komunikasi kerja",
          description:
            "Pendidikan dipimpin pengajar JLPT N1 dengan pengalaman mengajar lebih dari tujuh tahun. Materi mencakup bahasa dan kesiapan komunikasi kerja.",
          target_label: "Perkembangan kandidat dievaluasi secara bertahap",
          sort_order: 1,
          is_enabled: true,
        },
        {
          status: "in_progress",
          status_label: "Akses regional",
          icon_key: "network",
          title: "Jaringan kandidat di berbagai wilayah",
          description:
            "HIT membangun jaringan regional untuk memperluas akses konsultasi, pemeriksaan profil, dan pembinaan awal bagi calon kandidat.",
          target_label: "Jaringan diperluas mengikuti kebutuhan program",
          sort_order: 2,
          is_enabled: true,
        },
        {
          status: "in_progress",
          status_label: "Terus diperluas",
          icon_key: "handshake",
          title: "Akses terhadap kebutuhan tenaga kerja Jepang",
          description:
            "HIT memperluas komunikasi dan kerja sama untuk menghubungkan persiapan kandidat dengan kebutuhan tenaga kerja Jepang yang relevan.",
          target_label: "Peluang disesuaikan dengan profil dan hasil seleksi kandidat",
          sort_order: 3,
          is_enabled: true,
        },
      ],
    },
    values: [
      {
        icon_key: "shield_check",
        headline: "Informasi yang Jelas",
        description:
          "Tim membantu kandidat memahami pilihan program, tahapan, persyaratan, dan persiapan yang dibutuhkan sejak awal.",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "clipboard_check",
        headline: "Perkembangan yang Terukur",
        description:
          "Kemampuan bahasa dan kesiapan kerja dievaluasi secara bertahap agar kandidat mengetahui perkembangan serta fokus perbaikannya.",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "message_circle",
        headline: "Persiapan yang Menyeluruh",
        description:
          "Pendampingan mencakup bahasa, interview, komunikasi kerja, disiplin, serta pemahaman proses menuju kesempatan kerja di Jepang.",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "user_check",
        headline: "Pendekatan Sesuai Profil",
        description:
          "Arahan program mempertimbangkan usia, pendidikan, kemampuan, pengalaman, kondisi kesehatan, dan kesiapan belajar setiap kandidat.",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    team_members: [
      {
        name: "Hashimoto Shigeto",
        role: "Penasihat dan Penghubung Sisi Jepang",
        organization_name: "Pendiri HAP JAPAN",
        credentials: "Mengenal kinerja Aris Supriyadi selama masa kerjanya di Jepang",
        responsibility:
          "Memberikan perspektif perusahaan Jepang mengenai kebutuhan kandidat, budaya kerja, dan arah pembinaan.",
        bio: "",
        image_id: imageIdFrom(japanTeam, "Hashimoto Shigeto"),
        sort_order: 0,
        is_enabled: true,
      },
      {
        name: "Aris Supriyadi",
        role: "Direktur Utama",
        organization_name: "PT Hashimoto Indo Trust",
        credentials: "Pengalaman bekerja di Jepang selama 17 tahun",
        responsibility:
          "Memimpin operasional, hubungan perusahaan, pengembangan jaringan kandidat, dan arah persiapan kerja.",
        bio: "",
        image_id: imageIdFrom(japanTeam, "Aris Supriyadi"),
        sort_order: 1,
        is_enabled: true,
      },
      {
        name: "Sarif Hidayatulloh",
        role: "Penanggung Jawab Pendidikan dan Pengajar Bahasa Jepang",
        organization_name: "PT Hashimoto Indo Trust",
        credentials: "JLPT N1 / pengalaman mengajar bahasa Jepang lebih dari 7 tahun",
        responsibility:
          "Mengelola arah pembelajaran, evaluasi perkembangan, dan persiapan komunikasi kerja kandidat.",
        bio: "",
        image_id: imageIdFrom(japanTeam, "Sarif Hidayatulloh"),
        sort_order: 2,
        is_enabled: true,
      },
      {
        name: "Anton Tri Anggono, S.Psi., S.H.",
        role: "Penasihat Hukum dan Kepatuhan",
        organization_name: "PT Hashimoto Indo Trust",
        credentials: "Latar belakang psikologi dan hukum",
        responsibility:
          "Memberikan dukungan terkait kepatuhan, kontrak, dan perlindungan dalam penanganan kandidat.",
        bio: "",
        image_id: imageIdFrom(japanTeam, "Anton Tri"),
        sort_order: 3,
        is_enabled: true,
      },
      {
        name: "Ernawan, S.T., M.M.",
        role: "Penasihat Hubungan Administrasi Daerah",
        organization_name: "Wilayah Sragen",
        credentials: "Pengetahuan praktis mengenai administrasi ketenagakerjaan daerah",
        responsibility:
          "Memberikan masukan mengenai koordinasi daerah dan pelaksanaan prosedur yang sesuai.",
        bio: "",
        image_id: imageIdFrom(japanTeam, "Ernawan"),
        sort_order: 4,
        is_enabled: true,
      },
      {
        name: "Ading Riyanto",
        role: "Jaringan Rekrutmen dan Pendamping Pembelajaran",
        organization_name: "PT Hashimoto Indo Trust",
        credentials: "Jaringan kandidat regional",
        responsibility:
          "Membangun kontak dengan calon kandidat, membantu pemeriksaan awal, dan mendukung kegiatan pembelajaran.",
        bio: "",
        image_id: imageIdFrom(japanTeam, "Ading Riyanto"),
        sort_order: 5,
        is_enabled: true,
      },
    ],
    timeline: [
      {
        year_label: "2008",
        title: "Aris Supriyadi mulai bekerja di Jepang",
        description:
          "Pengalaman kerja langsung menjadi awal pemahaman mengenai disiplin, mutu, komunikasi, dan kerja sama di lingkungan Jepang.",
        sort_order: 0,
        is_enabled: true,
      },
      {
        year_label: "2008-2024",
        title: "Tujuh belas tahun pengalaman dan hubungan profesional",
        description:
          "Aris bekerja di Jepang dan membangun hubungan kepercayaan dengan Hashimoto Shigeto serta memahami tuntutan nyata terhadap pekerja asing.",
        sort_order: 1,
        is_enabled: true,
      },
      {
        year_label: "Juli 2025",
        title: "PT Hashimoto Indo Trust didirikan",
        description:
          "HIT mulai membangun operasional di Sragen untuk pendidikan bahasa, persiapan kerja, dan pengembangan kandidat.",
        sort_order: 2,
        is_enabled: true,
      },
      {
        year_label: "2026",
        title: "Penguatan pendidikan dan kemitraan",
        description:
          "HIT memperkuat sistem evaluasi, jaringan kandidat regional, serta komunikasi dengan pihak dan perusahaan Jepang.",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    vision_mission: {
      vision_headline: "Tujuan Kami",
      vision_description:
        "Menjadi lembaga persiapan kerja Jepang yang dipercaya melalui pendidikan berkualitas, pendampingan yang relevan, dan perhatian terhadap perkembangan setiap kandidat.",
      mission_headline: "Peran Kami",
      mission_description:
        "Membantu kandidat memilih jalur yang sesuai, meningkatkan kemampuan bahasa dan komunikasi kerja, mempersiapkan interview, serta membangun sikap yang dibutuhkan untuk tumbuh di lingkungan kerja Jepang.",
    },
    gallery: { media_ids: [] },
    partners: [],
    legalities: [
      {
        icon_key: "file_check",
        type_label: "NIB 2307250018253",
        title: "Nomor Induk Berusaha",
        description:
          "Nomor registrasi pelaku usaha yang diterbitkan melalui sistem OSS Pemerintah Indonesia.",
        issuing_authority: "Pemerintah Indonesia melalui OSS / BKPM",
        issued_date_label: "Terdaftar pada 2025",
        status_label: "Terdaftar",
        document_label: "Periksa dokumen NIB",
        document_url: documentUrlFrom(japanLegalities, "NIB"),
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "landmark",
        type_label: "AHU-0037284.AH.01.01.TAHUN 2025",
        title: "Persetujuan Pendirian Badan Hukum",
        description:
          "Informasi persetujuan pendirian PT Hashimoto Indo Trust sebagai badan hukum Indonesia.",
        issuing_authority: "Kementerian Hukum Republik Indonesia",
        issued_date_label: "Disetujui pada 2025",
        status_label: "Terdaftar",
        document_label: "Periksa dokumen AHU",
        document_url: documentUrlFrom(japanLegalities, "AHU"),
        sort_order: 1,
        is_enabled: true,
      },
    ],
    contact_section: {
      headline: "Temukan Jalur Persiapan yang Sesuai untukmu",
      description:
        "Ceritakan usia, pendidikan, kemampuan bahasa Jepang, pengalaman, dan bidang kerja yang diminati. Tim HIT akan membantu memberikan arahan awal dan menjelaskan pilihan program yang relevan.",
      use_global_contact: true,
    },
    final_cta: {
      headline: "Mulai Persiapanmu Bersama HIT",
      description:
        "Konsultasikan profil dan tujuanmu untuk mengetahui jalur program serta langkah persiapan yang paling sesuai.",
      primary_cta_label: "Konsultasi Program",
      primary_whatsapp_message:
        "Halo Hashimoto Indo Trust, saya ingin berkonsultasi bersama tim mengenai profil, program, biaya, dan tahapan persiapan kerja Jepang.",
      secondary_cta_label: "Lihat Pilihan Program",
      secondary_href: "/program",
    },
  };
}

async function main() {
  const indonesiaVariantByDomain = await prisma.variant.findFirst({
    where: { key: "indonesia", domains: { some: { host: targetHost } } },
    select: { id: true, tenantId: true },
  });
  const indonesiaVariant =
    indonesiaVariantByDomain ??
    (await prisma.variant.findFirst({
      where: { key: "indonesia", tenant: { slug: targetTenantSlug } },
      select: { id: true, tenantId: true },
    }));

  if (!indonesiaVariant) {
    throw new Error(
      `Indonesia variant for ${targetHost} or tenant ${targetTenantSlug} was not found.`,
    );
  }

  const japanVariant = await prisma.variant.findFirst({
    where: { key: "japan", tenantId: indonesiaVariant.tenantId },
    select: { id: true },
  });

  if (!japanVariant) {
    throw new Error("Japan variant for the same tenant was not found.");
  }

  const [indonesiaPage, japanPage] = await Promise.all([
    prisma.contentPage.findUnique({
      where: {
        variantId_pageKey: {
          variantId: indonesiaVariant.id,
          pageKey: "tentang_kami",
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
      },
    }),
    prisma.contentPage.findUnique({
      where: {
        variantId_pageKey: {
          variantId: japanVariant.id,
          pageKey: "tentang_kami",
        },
      },
      select: { dataJson: true, publishedDataJson: true },
    }),
  ]);

  if (!indonesiaPage) {
    throw new Error("Indonesia about page was not found.");
  }

  if (!japanPage) {
    throw new Error("Japan about page was not found.");
  }

  const japanSource = isRecord(japanPage.publishedDataJson)
    ? japanPage.publishedDataJson
    : japanPage.dataJson;
  const updatedDraft = updateAboutData(indonesiaPage.dataJson, japanSource);
  const updatedPublished = updateAboutData(
    isRecord(indonesiaPage.publishedDataJson)
      ? indonesiaPage.publishedDataJson
      : indonesiaPage.dataJson,
    japanSource,
  );

  console.log(
    JSON.stringify(
      {
        mode: shouldApply ? "apply" : "dry-run",
        targetHost,
        pageId: indonesiaPage.id,
        pageStatus: indonesiaPage.status,
        nextHeadline: stringValue(record(updatedPublished.hero).headline),
        sourceOfFacts: "japan.tentang_kami",
        sections: [
          "hero",
          "proof_stats",
          "company_status",
          "story",
          "japan_relationship",
          "education_quality",
          "operational_readiness",
          "values",
          "team_members",
          "timeline",
          "vision_mission",
          "legalities",
          "contact_section",
          "final_cta",
        ],
        removedDummyClaims: ["2.500+ alumni", "150+ mitra", "95% penempatan", "berdiri 2015"],
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
  const backupPath = join(tmpdir(), `nextcmslpk-indonesia-about-${timestamp}.json`);
  await writeFile(
    backupPath,
    JSON.stringify({ targetHost, indonesiaPage, japanSource }, null, 2),
    "utf8",
  );

  await prisma.contentPage.update({
    where: { id: indonesiaPage.id },
    data: {
      title: "Tentang Hashimoto Indo Trust",
      dataJson: updatedDraft as Prisma.InputJsonValue,
      publishedDataJson: updatedPublished as Prisma.InputJsonValue,
    },
  });

  console.log(`Indonesia about content updated. Backup: ${backupPath}`);
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Indonesia about update failed.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
