import { readFile, writeFile } from "node:fs/promises";

import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  Prisma,
  PrismaClient,
  PublishStatus,
} from "../src/generated/prisma/client";

config({ path: ".env.local" });

const mediaIdsPath = "/tmp/media-ids.json";
const reportPath = "/tmp/task4-report.md";

const requiredMediaKeys = [
  "hit-logo-dark",
  "hit-logo-light",
  "hero-indonesia-main",
  "hero-program",
  "hero-job",
  "hero-tentang-kami",
  "hero-karir",
  "avatar-director",
  "avatar-staff-1",
  "avatar-staff-2",
] as const;

const requiredPageKeys = [
  "homepage",
  "program_page",
  "job_page",
  "blog_page",
  "tentang_kami",
  "karir_page",
] as const;

const requiredGlobalConfigKeys = [
  "brand_header",
  "whatsapp_contact",
  "footer",
] as const;

type MediaKey = (typeof requiredMediaKeys)[number];
type MediaIds = Record<MediaKey, string>;
type JsonRecord = Record<string, unknown>;
type VerificationRow = {
  page_key: string;
  status: string;
};
type OptionSummary = {
  key: string;
  id: string;
  values: Array<{
    id: string;
    value: string;
    label: string;
  }>;
};

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required to seed Indonesia content.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function toPrismaJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
}

async function loadMediaIds() {
  const parsed = JSON.parse(await readFile(mediaIdsPath, "utf8")) as unknown;

  assertRecord(parsed, mediaIdsPath);

  const missingKeys = requiredMediaKeys.filter((key) => typeof parsed[key] !== "string");

  if (missingKeys.length > 0) {
    throw new Error(`Missing media IDs in ${mediaIdsPath}: ${missingKeys.join(", ")}`);
  }

  return Object.fromEntries(
    requiredMediaKeys.map((key) => [key, parsed[key]]),
  ) as MediaIds;
}

function buildGlobalConfigs(media: MediaIds) {
  return {
    brand_header: {
      brand: {
        lpk_name: "Hashimoto Indo Trust",
        logo_image_id: media["hit-logo-dark"],
        logo_light_image_id: media["hit-logo-light"],
      },
      navbar: [
        {
          key: "home",
          label: "Beranda",
          href: "/",
          is_enabled: true,
          sort_order: 1,
        },
        {
          key: "program",
          label: "Program",
          href: "/program",
          is_enabled: true,
          sort_order: 2,
        },
        {
          key: "job",
          label: "Info Job",
          href: "/job",
          is_enabled: true,
          sort_order: 3,
        },
        {
          key: "about",
          label: "Tentang Kami",
          href: "/tentang-kami",
          is_enabled: true,
          sort_order: 4,
        },
        {
          key: "blog",
          label: "Blog",
          href: "/blog",
          is_enabled: true,
          sort_order: 5,
        },
      ],
      variant_switch: {
        is_enabled: true,
        target_variant_key: "japan",
        target_behavior: "homepage",
      },
      header_cta: {
        label: "Konsultasi Gratis",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya tertarik dengan program pelatihan kerja ke Jepang dan ingin konsultasi lebih lanjut.",
      },
      header_behavior: {
        sticky_header: true,
        header_style: "transparent_on_hero",
      },
    },
    whatsapp_contact: {
      whatsapp: {
        number: "6281234567890",
        default_message_template:
          "Halo Hashimoto Indo Trust, saya tertarik dengan program pelatihan kerja ke Jepang.",
        floating_is_enabled: true,
        floating_icon_only_label: "WhatsApp",
        floating_label_after_scroll: "Konsultasi Sekarang",
        floating_position: "bottom_right",
      },
      contact: {
        phone_label: "+62 812-3456-7890",
        email: "info@hashimotoindotrust.co.id",
        address: "Jl. Raya Soreang No. 45, Soreang, Bandung, Jawa Barat 40911",
        map_url:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63384.09!2d107.52!3d-7.02",
        operational_hours:
          "Senin–Jumat: 08.00–17.00 WIB | Sabtu: 08.00–13.00 WIB",
      },
      social_links: {
        instagram: "https://instagram.com/hashimotoindotrust",
        youtube: "https://youtube.com/@hashimotoindotrust",
        tiktok: "https://tiktok.com/@hit.lpk",
        facebook: "https://facebook.com/hashimotoindotrust",
        line: "",
      },
    },
    footer: {
      brand: {
        logo_image_id: media["hit-logo-light"],
        lpk_name: "Hashimoto Indo Trust",
        short_description:
          "LPK resmi terpercaya yang membantu tenaga kerja Indonesia meraih karir profesional di Jepang sejak 2015.",
      },
      quick_links: [
        {
          key: "home",
          label: "Beranda",
          href: "/",
          is_enabled: true,
          sort_order: 1,
        },
        {
          key: "program",
          label: "Program",
          href: "/program",
          is_enabled: true,
          sort_order: 2,
        },
        {
          key: "job",
          label: "Info Job",
          href: "/job",
          is_enabled: true,
          sort_order: 3,
        },
        {
          key: "about",
          label: "Tentang Kami",
          href: "/tentang-kami",
          is_enabled: true,
          sort_order: 4,
        },
        {
          key: "blog",
          label: "Blog",
          href: "/blog",
          is_enabled: true,
          sort_order: 5,
        },
        {
          key: "career",
          label: "Karir di HIT",
          href: "/karir",
          is_enabled: true,
          sort_order: 6,
        },
      ],
      program_links: {
        source: "featured",
        max_items: 4,
      },
      contact: {
        use_global_contact: true,
      },
      legal: {
        copyright_text: "© 2026 Hashimoto Indo Trust. Semua hak dilindungi.",
        show_powered_by: true,
      },
    },
  } satisfies Record<(typeof requiredGlobalConfigKeys)[number], JsonRecord>;
}

function buildPageData(media: MediaIds) {
  return {
    homepage: {
      hero: {
        media_type: "image",
        media_id: media["hero-indonesia-main"],
        headline: "Wujudkan Impianmu Bekerja di Jepang",
        subheadline:
          "Hashimoto Indo Trust hadir untuk membimbing kamu dari nol hingga siap kerja di Jepang. Program terstruktur, legal, dan didampingi instruktur berpengalaman.",
        primary_cta_label: "Konsultasi Gratis via WhatsApp",
        primary_cta_whatsapp_message:
          "Halo Hashimoto Indo Trust, saya tertarik dengan program pelatihan kerja ke Jepang. Boleh saya mendapatkan informasi lebih lanjut?",
        secondary_cta_label: "Lihat Program",
        secondary_cta_href: "/program",
      },
      offer_section: {
        is_enabled: false,
        source: "active_featured_offer",
        fallback_badge_label: "PROMO",
        fallback_headline: "Promo Spesial Pendaftaran",
        fallback_description: "Daftar sekarang dan dapatkan potongan biaya administrasi.",
        fallback_image_id: null,
      },
      stats: [
        {
          icon_key: "users",
          value: "2.500+",
          label: "Alumni Berhasil ke Jepang",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "building",
          value: "150+",
          label: "Mitra Perusahaan di Jepang",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "graduation_cap",
          value: "10+",
          label: "Tahun Pengalaman",
          sort_order: 3,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          value: "95%",
          label: "Tingkat Penempatan",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      trust_cards: [
        {
          icon_key: "graduation_cap",
          headline: "Kurikulum Terstruktur",
          description:
            "Materi pelatihan bahasa Jepang dan skill teknis dirancang bersama mitra perusahaan Jepang.",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          headline: "Legal & Resmi",
          description:
            "Terdaftar di Kemnaker RI, berizin resmi, dan semua program menggunakan jalur legal.",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "users",
          headline: "Pendampingan Penuh",
          description:
            "Dari pelatihan hingga adaptasi di Jepang, tim HIT selalu siap mendampingi kamu.",
          sort_order: 3,
          is_enabled: true,
        },
        {
          icon_key: "plane",
          headline: "Jaringan Luas di Jepang",
          description:
            "Lebih dari 150 perusahaan mitra di berbagai kota Jepang siap menerima lulusan HIT.",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      featured_programs: {
        source: "featured",
        max_items: 3,
      },
      latest_jobs: {
        source: "latest_active",
        max_items: 5,
      },
      steps: [
        {
          icon_key: "users",
          title: "Daftar & Konsultasi",
          description:
            "Hubungi tim HIT via WhatsApp. Kami bantu kamu memilih program yang paling sesuai.",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "graduation_cap",
          title: "Ikuti Seleksi",
          description: "Tes kemampuan dasar, wawancara, dan pemeriksaan kesehatan.",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          title: "Pelatihan Intensif",
          description:
            "Belajar bahasa Jepang N4-N3, skill teknis, dan budaya kerja Jepang selama 6-12 bulan.",
          sort_order: 3,
          is_enabled: true,
        },
        {
          icon_key: "plane",
          title: "Keberangkatan ke Jepang",
          description:
            "HIT urus semua dokumen: visa, izin kerja, tiket, dan akomodasi awal.",
          sort_order: 4,
          is_enabled: true,
        },
        {
          icon_key: "building",
          title: "Bekerja & Berkembang",
          description:
            "Mulai berkarir di perusahaan mitra Jepang dengan gaji dan kondisi kerja yang layak.",
          sort_order: 5,
          is_enabled: true,
        },
      ],
      faqs: [
        {
          question: "Berapa biaya untuk mengikuti program HIT?",
          answer:
            "Biaya program bervariasi tergantung jenis program yang dipilih. Program Magang dan Tokutei Ginou memiliki struktur biaya yang berbeda. Hubungi kami untuk informasi biaya terkini dan kemungkinan cicilan.",
          sort_order: 1,
          is_enabled: true,
        },
        {
          question: "Apakah saya harus sudah bisa bahasa Jepang untuk mendaftar?",
          answer:
            "Tidak harus. Sebagian besar program kami menerima peserta dari level N5 (pemula). Kami akan melatih bahasa Jepang kamu dari dasar hingga level yang dibutuhkan.",
          sort_order: 2,
          is_enabled: true,
        },
        {
          question: "Berapa lama proses dari pendaftaran hingga berangkat ke Jepang?",
          answer:
            "Rata-rata 8-12 bulan, termasuk pelatihan dan proses administrasi. Beberapa program ekspres bisa lebih cepat untuk kandidat yang sudah memenuhi syarat.",
          sort_order: 3,
          is_enabled: true,
        },
        {
          question: "Apakah ada garansi penempatan kerja?",
          answer:
            "HIT memiliki tingkat penempatan 95% untuk lulusan yang memenuhi syarat keberangkatan. Kami bekerja keras memastikan setiap peserta mendapatkan penempatan di perusahaan yang sesuai.",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      testimonials: [
        {
          name: "Rizki Firmansyah",
          role_or_program: "Alumni Program Magang — Manufaktur, Osaka",
          quote:
            "Saya tidak menyangka bisa kerja di Jepang. Berkat HIT, semua proses jadi mudah dan saya kini sudah 2 tahun bekerja di pabrik otomotif di Osaka dengan gaji yang sangat memuaskan.",
          image_id: null,
          sort_order: 1,
          is_enabled: true,
        },
        {
          name: "Dewi Rahayu",
          role_or_program: "Alumni Tokutei Ginou — Perhotelan, Tokyo",
          quote:
            "HIT bukan sekadar LPK biasa. Mereka benar-benar mendampingi saya dari awal sampai saya settle di Tokyo. Instrukturnya sabar dan profesional.",
          image_id: null,
          sort_order: 2,
          is_enabled: true,
        },
      ],
      latest_blogs: {
        source: "latest_published",
        max_items: 5,
      },
      contact_section: {
        headline: "Siap Memulai Perjalananmu ke Jepang?",
        description:
          "Tim konsultan kami siap membantu menjawab semua pertanyaanmu. Hubungi kami sekarang dan jadwalkan konsultasi gratis.",
        use_global_contact: true,
      },
    },
    program_page: {
      hero: {
        headline: "Program Pelatihan Kerja ke Jepang",
        subheadline:
          "Temukan program yang paling sesuai dengan latar belakang dan impianmu. Semua program HIT resmi, terstruktur, dan didampingi profesional.",
        image_id: media["hero-program"],
        primary_cta_label: "Tanya Program via WhatsApp",
        primary_cta_whatsapp_message:
          "Halo Hashimoto Indo Trust, saya ingin mengetahui lebih lanjut tentang program pelatihan kerja ke Jepang.",
        secondary_cta_label: "Lihat Semua Program",
      },
      stats: [
        {
          icon_key: "graduation_cap",
          value: "4 Program",
          label: "Pilihan Program Unggulan",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "users",
          value: "500+",
          label: "Pendaftar Setiap Tahun",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          value: "N4-N2",
          label: "Level Bahasa Jepang Tercapai",
          sort_order: 3,
          is_enabled: true,
        },
      ],
      filter_config: {
        enable_program_type_filter: true,
        enable_gender_filter: true,
        enable_education_filter: true,
        enable_language_filter: true,
      },
      faq: [
        {
          question: "Apa perbedaan Program Magang dan Tokutei Ginou?",
          answer:
            "Program Magang (Ginou Jisshu) cocok untuk kamu yang baru pertama ke Jepang, durasi 3-5 tahun. Tokutei Ginou (Specified Skilled Worker) memberikan lebih banyak kebebasan dan fleksibilitas, ideal untuk yang sudah punya pengalaman kerja.",
          sort_order: 1,
          is_enabled: true,
        },
        {
          question: "Apakah ada tes masuk yang harus saya ikuti?",
          answer:
            "Ya, ada tes kemampuan dasar, tes kesehatan, dan wawancara. Tidak perlu khawatir — tim HIT akan membantu kamu mempersiapkan diri.",
          sort_order: 2,
          is_enabled: true,
        },
      ],
      final_cta: {
        headline: "Belum Yakin Program Mana yang Tepat?",
        description:
          "Konsultasikan kebutuhan dan tujuanmu dengan tim ahli HIT. Gratis, tanpa komitmen.",
        cta_label: "Konsultasi Gratis Sekarang",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya ingin konsultasi untuk memilih program yang tepat untuk saya.",
      },
    },
    job_page: {
      hero: {
        headline: "Lowongan Kerja Terbaru di Jepang",
        subheadline:
          "Update lowongan setiap minggu dari perusahaan mitra terpercaya di seluruh wilayah Jepang.",
        image_id: media["hero-job"],
        primary_cta_label: "Tanya Lowongan via WhatsApp",
        primary_cta_whatsapp_message:
          "Halo Hashimoto Indo Trust, saya ingin mengetahui lowongan kerja di Jepang yang tersedia saat ini.",
      },
      filter_config: {
        enable_job_type_filter: true,
        enable_job_field_filter: true,
        enable_gender_filter: true,
        enable_language_filter: true,
      },
      faq: [
        {
          question: "Bagaimana cara melamar lowongan di sini?",
          answer:
            "Klik tombol WhatsApp pada lowongan yang kamu minati. Tim HIT akan memandu langkah selanjutnya termasuk tes seleksi dan persyaratan dokumen.",
          sort_order: 1,
          is_enabled: true,
        },
        {
          question: "Apakah ada biaya untuk melamar?",
          answer:
            "Tidak ada biaya pendaftaran untuk melihat dan melamar lowongan. Biaya hanya dikenakan jika kamu resmi bergabung dalam program pelatihan.",
          sort_order: 2,
          is_enabled: true,
        },
      ],
      final_cta: {
        headline: "Tidak Menemukan Lowongan yang Cocok?",
        description:
          "Daftarkan dirimu dan tim HIT akan menghubungimu saat ada lowongan yang sesuai profilmu.",
        cta_label: "Daftarkan Profil via WhatsApp",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya ingin mendaftarkan profil saya untuk dihubungi jika ada lowongan yang sesuai.",
      },
    },
    blog_page: {
      hero: {
        headline: "Blog & Informasi Seputar Kerja di Jepang",
        subheadline:
          "Tips, pengalaman, dan berita terkini yang membantu kamu mempersiapkan diri untuk kerja di Jepang.",
        image_id: null,
      },
      filter_config: {
        enable_category_filter: true,
        enable_tag_filter: true,
      },
      offer_section: {
        is_enabled: false,
      },
    },
    tentang_kami: {
      hero: {
        headline: "Tentang Hashimoto Indo Trust",
        subheadline:
          "Lebih dari 10 tahun mendampingi putra-putri terbaik Indonesia meraih karir internasional di Jepang.",
        image_id: media["hero-tentang-kami"],
      },
      proof_stats: [
        {
          value: "2.500+",
          label: "Alumni di Jepang",
          sort_order: 1,
          is_enabled: true,
        },
        {
          value: "150+",
          label: "Perusahaan Mitra",
          sort_order: 2,
          is_enabled: true,
        },
        {
          value: "10+",
          label: "Tahun Berpengalaman",
          sort_order: 3,
          is_enabled: true,
        },
        {
          value: "95%",
          label: "Tingkat Penempatan",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      story: {
        image_id: media["hero-tentang-kami"],
        eyebrow_label: "Kisah Kami",
        headline: "Dimulai dari Sebuah Mimpi Sederhana",
        body: "Hashimoto Indo Trust (HIT) didirikan pada tahun 2015 oleh Bapak Hiroshi Shimizu bersama tim pendiri yang percaya bahwa setiap anak muda Indonesia berhak mendapatkan kesempatan berkarir di panggung internasional. Bermula dari kantor kecil di Soreang, Bandung, HIT kini telah berkembang menjadi salah satu LPK (Lembaga Pelatihan Kerja) terpercaya yang melayani ratusan peserta setiap tahunnya. Kami percaya bahwa bekerja di Jepang bukan sekadar tentang gaji — melainkan tentang pertumbuhan karakter, disiplin, dan pengalaman hidup yang tidak ternilai.",
      },
      vision_mission: {
        vision_headline: "Visi",
        vision_description:
          "Menjadi lembaga pelatihan kerja terdepan di Indonesia yang menghasilkan tenaga kerja profesional, berkarakter, dan berdaya saing global.",
        mission_headline: "Misi",
        mission_description:
          "1. Menyelenggarakan pelatihan bahasa dan keahlian teknis berkualitas tinggi.\n2. Membangun jaringan kemitraan yang kuat dengan perusahaan Jepang terpercaya.\n3. Mendampingi peserta dari masa pelatihan hingga keberhasilan di tempat kerja.\n4. Berkontribusi pada peningkatan kesejahteraan keluarga Indonesia.",
      },
      values: [
        {
          icon_key: "graduation_cap",
          headline: "Integritas",
          description:
            "Kami berkomitmen untuk transparan dan jujur dalam setiap proses, mulai dari rekrutmen hingga penempatan.",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "users",
          headline: "Kepedulian",
          description:
            "Setiap peserta adalah individu unik yang berhak mendapat perhatian penuh dari tim kami.",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          headline: "Profesionalisme",
          description:
            "Standar operasional kami mengacu pada best practice industri LPK internasional.",
          sort_order: 3,
          is_enabled: true,
        },
        {
          icon_key: "plane",
          headline: "Kolaborasi",
          description:
            "Kesuksesan peserta adalah hasil kerja tim — kami, peserta, dan keluarga, bekerja bersama.",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      team_members: [
        {
          name: "Hiroshi Shimizu",
          role: "Direktur Utama",
          bio: "Pendiri HIT dengan pengalaman 20 tahun di industri penempatan tenaga kerja Indonesia-Jepang.",
          image_id: media["avatar-director"],
          sort_order: 1,
          is_enabled: true,
        },
        {
          name: "Sari Anggraini",
          role: "Manajer Program & Pelatihan",
          bio: "Lulusan Universitas Pendidikan Indonesia, spesialis kurikulum bahasa Jepang dan persiapan budaya kerja.",
          image_id: media["avatar-staff-1"],
          sort_order: 2,
          is_enabled: true,
        },
        {
          name: "Budi Wijaya",
          role: "Manajer Penempatan",
          bio: "Berpengalaman 8 tahun mengelola hubungan dengan 150+ perusahaan mitra di Jepang.",
          image_id: media["avatar-staff-2"],
          sort_order: 3,
          is_enabled: true,
        },
      ],
      legalities: [
        {
          icon_key: "briefcase",
          title: "Izin Operasional LPK",
          description:
            "Terdaftar dan berizin resmi di Kementerian Ketenagakerjaan Republik Indonesia.",
          document_label: null,
          document_url: null,
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "building",
          title: "Anggota APJATI",
          description: "Anggota aktif Asosiasi Perusahaan Jasa Tenaga Kerja Indonesia.",
          document_label: null,
          document_url: null,
          sort_order: 2,
          is_enabled: true,
        },
      ],
      contact_section: {
        headline: "Ada Pertanyaan Tentang HIT?",
        description: "Kami terbuka untuk menerima pertanyaan, kunjungan, dan kolaborasi.",
        use_global_contact: true,
      },
    },
    karir_page: {
      hero: {
        headline: "Bergabung dengan Tim HIT",
        subheadline:
          "Kami mencari individu bersemangat yang ingin berkontribusi dalam mendorong perubahan positif bagi tenaga kerja Indonesia.",
        image_id: media["hero-karir"],
        primary_cta_label: "Lamar via WhatsApp",
        primary_cta_whatsapp_message:
          "Halo Hashimoto Indo Trust, saya tertarik untuk bergabung sebagai tim HIT.",
      },
      filter_config: {
        enable_department_filter: true,
        enable_employment_type_filter: true,
        enable_work_arrangement_filter: true,
      },
      faq: [
        {
          question: "Apakah perlu pengalaman di industri LPK untuk melamar?",
          answer:
            "Tidak wajib. Kami menghargai semangat belajar dan kemampuan komunikasi yang baik. Pengalaman di bidang pendidikan, HR, atau pemasaran juga sangat relevan.",
          sort_order: 1,
          is_enabled: true,
        },
      ],
      final_cta: {
        headline: "Tidak Ada Posisi yang Cocok Saat Ini?",
        description:
          "Kirim CV kamu dan tim HR kami akan menghubungi saat ada posisi yang sesuai.",
        cta_label: "Kirim CV via WhatsApp",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya ingin mengirimkan CV sebagai kandidat spekulatif untuk posisi di HIT.",
      },
    },
  } satisfies Record<(typeof requiredPageKeys)[number], JsonRecord>;
}

async function writeReport(input: {
  tenantId: string;
  variantId: string;
  optionSets: OptionSummary[];
  verificationRows: VerificationRow[];
  equalityRows: VerificationRow[];
}) {
  const optionLines = input.optionSets.map(
    (optionSet) =>
      `- ${optionSet.key}: ${optionSet.id} (${optionSet.values.length} nilai)`,
  );
  const tableRows = input.verificationRows.map(
    (row) => `| ${row.page_key} | ${row.status} |`,
  );

  const report = [
    "# Laporan Task 4 - Konten Variant Indonesia",
    "",
    `Tenant: Hashimoto Indo Trust (${input.tenantId})`,
    `Variant Indonesia: ${input.variantId}`,
    `Sumber media: ${mediaIdsPath}`,
    "",
    "## Konfigurasi Global yang Diperbarui",
    "",
    "- brand_header",
    "- whatsapp_contact",
    "- footer",
    "",
    "## Option ID yang Dibaca dari Database",
    "",
    ...optionLines,
    "",
    "## Verifikasi Publish",
    "",
    "```sql",
    `SELECT page_key, status FROM content_pages WHERE variant_id = '${input.variantId}';`,
    "```",
    "",
    "| page_key | status |",
    "| --- | --- |",
    ...tableRows,
    "",
    input.equalityRows.length === 0
      ? "Hasil: PASS - keenam halaman berstatus PUBLISHED dan publishedDataJson sama dengan dataJson."
      : `Hasil: FAIL - halaman berikut memiliki publishedDataJson yang berbeda: ${input.equalityRows
          .map((row) => row.page_key)
          .join(", ")}`,
    "",
  ].join("\n");

  await writeFile(reportPath, report, "utf8");
}

async function main() {
  const media = await loadMediaIds();
  const globalConfigs = buildGlobalConfigs(media);
  const pageData = buildPageData(media);

  const result = await prisma.$transaction(
    async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { slug: "hit" },
        select: { id: true, name: true },
      });

      if (!tenant) {
        throw new Error('Tenant slug "hit" was not found.');
      }

      const indonesiaVariant = await tx.variant.findUnique({
        where: {
          tenantId_key: {
            tenantId: tenant.id,
            key: "indonesia",
          },
        },
        select: { id: true, key: true },
      });

      if (!indonesiaVariant) {
        throw new Error('Variant key "indonesia" was not found for tenant "hit".');
      }

      const optionSets = await tx.optionSet.findMany({
        where: {
          tenantId: tenant.id,
          variantId: indonesiaVariant.id,
        },
        orderBy: { key: "asc" },
        select: {
          id: true,
          key: true,
          values: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              value: true,
              label: true,
            },
          },
        },
      });

      const mediaAssets = await tx.mediaAsset.findMany({
        where: {
          tenantId: tenant.id,
          id: { in: Object.values(media) },
        },
        select: { id: true },
      });
      const foundMediaIds = new Set(mediaAssets.map((asset) => asset.id));
      const missingMediaIds = Object.entries(media)
        .filter(([, id]) => !foundMediaIds.has(id))
        .map(([key, id]) => `${key}=${id}`);

      if (missingMediaIds.length > 0) {
        throw new Error(`Media assets were not found for tenant "hit": ${missingMediaIds.join(", ")}`);
      }

      for (const [configKey, data] of Object.entries(globalConfigs)) {
        await tx.variantGlobalConfig.update({
          where: {
            variantId_configKey: {
              variantId: indonesiaVariant.id,
              configKey,
            },
          },
          data: {
            dataJson: toPrismaJson(data),
          },
        });
      }

      for (const [pageKey, data] of Object.entries(pageData)) {
        const json = toPrismaJson(data);

        await tx.contentPage.update({
          where: {
            variantId_pageKey: {
              variantId: indonesiaVariant.id,
              pageKey,
            },
          },
          data: {
            dataJson: json,
            publishedDataJson: json,
            status: PublishStatus.PUBLISHED,
          },
        });
      }

      const verificationRows = await tx.$queryRaw<VerificationRow[]>`
        SELECT page_key, status
        FROM content_pages
        WHERE variant_id = ${indonesiaVariant.id}
        ORDER BY page_key ASC
      `;

      const equalityRows = await tx.$queryRaw<VerificationRow[]>`
        SELECT page_key, status
        FROM content_pages
        WHERE variant_id = ${indonesiaVariant.id}
          AND data_json IS DISTINCT FROM published_data_json
        ORDER BY page_key ASC
      `;

      if (
        verificationRows.length !== requiredPageKeys.length ||
        verificationRows.some((row) => row.status !== PublishStatus.PUBLISHED) ||
        equalityRows.length > 0
      ) {
        throw new Error("Indonesia page verification failed after content update.");
      }

      return {
        tenantId: tenant.id,
        variantId: indonesiaVariant.id,
        optionSets,
        verificationRows,
        equalityRows,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 20_000,
      timeout: 120_000,
    },
  );

  await writeReport(result);

  console.log(
    JSON.stringify(
      {
        tenantId: result.tenantId,
        variantId: result.variantId,
        updatedGlobalConfigs: requiredGlobalConfigKeys,
        publishedPages: result.verificationRows,
        reportPath,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Gagal mengisi konten Variant Indonesia.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
