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
const reportPath = "/tmp/task5-report.md";

const requiredMediaKeys = [
  "hero-program",
  "program-magang-thumb",
  "program-tokutei-thumb",
  "program-kelas-bahasa-thumb",
  "job-manufaktur-thumb",
  "job-pertanian-thumb",
  "job-perawatan-thumb",
  "offer-kelas-gratis-thumb",
  "offer-promo-thumb",
  "blog-tips-thumb",
  "blog-gaji-thumb",
  "blog-kehidupan-thumb",
] as const;

const optionRequests = [
  { name: "programMagang", optionSetKey: "program_type", value: "magang" },
  {
    name: "programTokuteiGinou",
    optionSetKey: "program_type",
    value: "tokutei-ginou",
  },
  {
    name: "programKelasBahasa",
    optionSetKey: "program_type",
    value: "kelas-bahasa",
  },
  { name: "genderLakiLaki", optionSetKey: "gender", value: "laki-laki" },
  {
    name: "genderSemua",
    optionSetKey: "gender",
    value: "laki-laki-and-perempuan",
  },
  {
    name: "educationSmaSmk",
    optionSetKey: "education_level",
    value: "smasmk",
  },
  { name: "languageN5", optionSetKey: "language_level", value: "n5" },
  { name: "languageN4", optionSetKey: "language_level", value: "n4" },
  { name: "jobTypeFullTime", optionSetKey: "job_type", value: "full-time" },
  {
    name: "jobFieldManufaktur",
    optionSetKey: "job_field",
    value: "manufaktur",
  },
  {
    name: "jobFieldPertanian",
    optionSetKey: "job_field",
    value: "pertanian",
  },
  {
    name: "jobFieldPerawatan",
    optionSetKey: "job_field",
    value: "perawatan",
  },
  {
    name: "offerKelasGratis",
    optionSetKey: "offer_type",
    value: "kelas-gratis",
  },
  { name: "offerPromo", optionSetKey: "offer_type", value: "promo" },
  {
    name: "targetAudienceUmum",
    optionSetKey: "target_audience",
    value: "umum",
  },
  {
    name: "blogCategoryTips",
    optionSetKey: "blog_category",
    value: "tips",
  },
  {
    name: "blogCategoryEdukasi",
    optionSetKey: "blog_category",
    value: "edukasi",
  },
  {
    name: "blogCategoryPengalaman",
    optionSetKey: "blog_category",
    value: "pengalaman",
  },
  { name: "blogTagMagang", optionSetKey: "blog_tag", value: "magang" },
  { name: "blogTagGaji", optionSetKey: "blog_tag", value: "gaji" },
  {
    name: "blogTagKehidupanJepang",
    optionSetKey: "blog_tag",
    value: "kehidupan-di-jepang",
  },
  {
    name: "careerDepartmentPengajar",
    optionSetKey: "career_department",
    value: "pengajar",
  },
  {
    name: "careerDepartmentPemasaran",
    optionSetKey: "career_department",
    value: "pemasaran",
  },
  {
    name: "careerEmploymentFullTime",
    optionSetKey: "career_employment_type",
    value: "full-time",
  },
  {
    name: "careerWorkOnSite",
    optionSetKey: "career_work_arrangement",
    value: "on-site",
  },
  {
    name: "careerWorkHybrid",
    optionSetKey: "career_work_arrangement",
    value: "hybrid",
  },
] as const;

type CollectionKey = "program" | "job" | "offer" | "blog" | "karir";
type MediaKey = (typeof requiredMediaKeys)[number];
type MediaIds = Record<MediaKey, string>;
type OptionName = (typeof optionRequests)[number]["name"];
type OptionIds = Record<OptionName, string>;
type JsonRecord = Record<string, unknown>;

type SeedItem = {
  collectionKey: CollectionKey;
  title: string;
  slug: string;
  isFeatured?: boolean;
  sortOrder?: number;
  thumbnailImageId?: string;
  heroImageId?: string;
  publishedAt?: Date;
  startAt?: Date;
  expiredAt?: Date;
  dataJson: JsonRecord;
};

type CreatedItem = {
  id: string;
  collectionKey: string;
  title: string;
  slug: string;
};

type VerificationRow = {
  collection_key: string;
  count: number;
  published_count: number;
};

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required to seed Indonesia collections.");
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

async function loadOptionIds(
  tx: Prisma.TransactionClient,
  tenantId: string,
  variantId: string,
) {
  const entries = await Promise.all(
    optionRequests.map(async (request) => {
      const option = await tx.optionValue.findFirst({
        where: {
          value: request.value,
          optionSet: {
            tenantId,
            variantId,
            key: request.optionSetKey,
          },
        },
        select: { id: true },
      });

      if (!option) {
        throw new Error(
          `OptionValue not found for ${request.optionSetKey}.${request.value}.`,
        );
      }

      return [request.name, option.id] as const;
    }),
  );

  return Object.fromEntries(entries) as OptionIds;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function getExcerpt(dataJson: JsonRecord) {
  const value =
    typeof dataJson.excerpt === "string"
      ? dataJson.excerpt
      : typeof dataJson.short_description === "string"
        ? dataJson.short_description
        : typeof dataJson.subtitle === "string"
          ? dataJson.subtitle
          : "";

  return value.trim() || null;
}

function buildItems(media: MediaIds, options: OptionIds, now: Date): SeedItem[] {
  return [
    {
      collectionKey: "program",
      title: "Program Magang Manufaktur & Otomotif",
      slug: "magang-manufaktur-otomotif",
      isFeatured: true,
      sortOrder: 1,
      thumbnailImageId: media["program-magang-thumb"],
      heroImageId: media["hero-program"],
      dataJson: {
        subtitle: "Bekerja di pabrik manufaktur & otomotif terkemuka Jepang",
        short_description:
          "Program magang 3 tahun di sektor manufaktur dan otomotif. Cocok untuk lulusan SMK/SMA teknik yang ingin pengalaman kerja internasional.",
        overview:
          "Program ini dirancang khusus untuk kamu yang ingin bekerja di sektor manufaktur dan otomotif Jepang. Kamu akan mendapat pelatihan bahasa Jepang intensif selama 6 bulan sebelum keberangkatan, dilanjutkan magang langsung di pabrik mitra di kota-kota industri Jepang seperti Toyota City, Nagoya, dan Yokohama.",
        program_type_option_id: options.programMagang,
        gender_option_id: options.genderSemua,
        min_age: 18,
        max_age: 30,
        education_level_option_id: options.educationSmaSmk,
        language_level_option_id: options.languageN4,
        duration_label: "3 Tahun",
        contract_label: "Kontrak magang resmi",
        salary_range_label: "¥135.000 – ¥180.000/bulan",
        target_language_label: "Bahasa Jepang N4",
        visa_path_label: "Visa Ginou Jisshu (Teknik Khusus Industri)",
        highlight_label: "Pabrik otomotif terkemuka Jepang",
        why_choose_items: [
          "Gaji kompetitif mulai ¥135.000/bulan + lembur",
          "Akomodasi disediakan perusahaan",
          "Asuransi kesehatan lengkap",
          "Kesempatan perpanjangan dan beralih ke Tokutei Ginou",
        ],
        curriculum_items: [
          "Bahasa Jepang Intensif (Bulan 1-3): Hiragana, Katakana, Kanji dasar, percakapan kerja",
          "Budaya Kerja Jepang (Bulan 4): Etos kerja, keselamatan, tata krama",
          "Skill Teknis Manufaktur (Bulan 5-6): Operasi mesin, QC, protokol keselamatan",
          "Simulasi Kerja & Evaluasi (Bulan 6): Praktik terpadu sebelum keberangkatan",
        ],
        timeline_items: [
          "Pendaftaran & Seleksi: 2 minggu",
          "Pelatihan Pra-Keberangkatan: 6 bulan",
          "Pengurusan Dokumen & Visa: 2-3 bulan",
          "Keberangkatan ke Jepang",
          "Masa Magang: 3 tahun",
        ],
        requirements: [
          "Usia 18-30 tahun",
          "Pendidikan minimal SMA/SMK sederajat",
          "Sehat jasmani dan rohani (bebas penyakit menular)",
          "Tidak memiliki tato yang terlihat",
          "Lulus tes seleksi HIT",
        ],
        cost_items: [
          "Biaya pelatihan: hubungi HIT untuk informasi terkini",
          "Biaya pengurusan dokumen: termasuk dalam paket",
          "Biaya akomodasi selama pelatihan: terjangkau",
        ],
        career_opportunity_items: [
          "Operator Produksi Senior",
          "Tokutei Ginou di bidang Manufaktur",
          "Wirausaha bidang industri setelah kembali ke Indonesia",
        ],
        testimonials: [
          {
            name: "Rizki F.",
            role_or_program: "Alumni 2021 — Manufaktur, Aichi",
            quote:
              "Setelah 3 tahun di Jepang, saya pulang dengan tabungan dan pengalaman yang tidak ternilai. Terima kasih HIT!",
            image_id: null,
          },
        ],
        faqs: [
          {
            question: "Apakah saya bisa membawa keluarga ke Jepang?",
            answer:
              "Untuk program magang (Ginou Jisshu), peserta tidak diperbolehkan membawa anggota keluarga. Namun untuk Tokutei Ginou tahap 2, hal ini dimungkinkan.",
          },
        ],
        primary_cta_label: "Daftar Program Ini",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya tertarik dengan program Program Magang Manufaktur & Otomotif. Boleh saya mendapatkan informasi lebih lanjut?",
        brochure_file_id: null,
        brochure_enabled: false,
      },
    },
    {
      collectionKey: "program",
      title: "Tokutei Ginou — Perhotelan & Restoran",
      slug: "tokutei-ginou-perhotelan-restoran",
      isFeatured: true,
      sortOrder: 2,
      thumbnailImageId: media["program-tokutei-thumb"],
      dataJson: {
        subtitle: "Program Pekerja Berketerampilan Spesifik di sektor perhotelan",
        short_description:
          "Bekerja di hotel bintang 4-5 dan restoran premium di Jepang. Kontrak dapat diperpanjang untuk peserta dengan performa terbaik.",
        program_type_option_id: options.programTokuteiGinou,
        gender_option_id: options.genderSemua,
        min_age: 18,
        max_age: 35,
        education_level_option_id: options.educationSmaSmk,
        language_level_option_id: options.languageN4,
        duration_label: "1-5 Tahun (dapat diperpanjang)",
        contract_label: "Kontrak kerja langsung dengan perusahaan Jepang",
        salary_range_label: "¥150.000 – ¥220.000/bulan",
        target_language_label: "Bahasa Jepang N4 + Ujian Kemampuan Spesifik",
        visa_path_label: "Visa Tokutei Ginou Tipe 1",
        highlight_label: "Hotel & restoran berbintang Tokyo, Osaka, Kyoto",
        why_choose_items: [
          "Gaji lebih tinggi dari program magang standar",
          "Bisa berganti perusahaan dan tidak terikat satu pemberi kerja",
          "Peluang naik ke Tokutei Ginou Tipe 2 untuk status tinggal lebih panjang",
          "Bekerja di kota-kota besar: Tokyo, Osaka, Kyoto",
        ],
        requirements: [
          "Usia 18-35 tahun",
          "Lulus ujian kemampuan bahasa Jepang N4",
          "Lulus ujian keahlian bidang perhotelan (Omotenashi)",
          "Pengalaman di bidang perhotelan diutamakan",
        ],
        primary_cta_label: "Daftar Program Ini",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya tertarik dengan program Tokutei Ginou Perhotelan & Restoran.",
      },
    },
    {
      collectionKey: "program",
      title: "Kelas Bahasa Jepang Intensif",
      slug: "kelas-bahasa-jepang-intensif",
      isFeatured: false,
      sortOrder: 3,
      thumbnailImageId: media["program-kelas-bahasa-thumb"],
      dataJson: {
        subtitle: "Persiapan bahasa Jepang dari N5 hingga N3 dalam 6 bulan",
        short_description:
          "Kelas bahasa Jepang terstruktur sebagai fondasi sebelum mengikuti program magang atau Tokutei Ginou. Tersedia kelas reguler dan intensif.",
        program_type_option_id: options.programKelasBahasa,
        gender_option_id: options.genderSemua,
        min_age: 17,
        max_age: 40,
        education_level_option_id: options.educationSmaSmk,
        language_level_option_id: options.languageN5,
        duration_label: "3-6 Bulan",
        contract_label: "Program pelatihan bersertifikat",
        salary_range_label: "Tidak berlaku (program pelatihan)",
        target_language_label: "Target: N3 dalam 6 bulan",
        visa_path_label: "Persiapan untuk program kerja ke Jepang",
        highlight_label: "Instruktur penutur asli + latihan JLPT",
        primary_cta_label: "Daftar Kelas",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya tertarik mengikuti Kelas Bahasa Jepang Intensif.",
      },
    },
    {
      collectionKey: "job",
      title: "Operator Produksi — Pabrik Otomotif, Aichi",
      slug: "operator-produksi-pabrik-otomotif-aichi",
      isFeatured: true,
      expiredAt: addMonths(now, 3),
      thumbnailImageId: media["job-manufaktur-thumb"],
      dataJson: {
        subtitle: "Posisi Magang — Gijutsu Jisshu",
        short_description:
          "Dicari operator produksi untuk pabrik suku cadang otomotif di Aichi, Jepang. Kuota 15 orang, keberangkatan angkatan Oktober 2026.",
        job_type_option_id: options.jobTypeFullTime,
        job_field_option_id: options.jobFieldManufaktur,
        gender_option_id: options.genderLakiLaki,
        language_level_option_id: options.languageN4,
        education_level_option_id: options.educationSmaSmk,
        min_age: 18,
        max_age: 30,
        ex_japan_required: false,
        required_documents: [
          "KTP",
          "Ijazah terakhir",
          "SKCK",
          "Surat keterangan sehat",
          "Paspor (kami bantu proses)",
          "Foto 4x6 terbaru",
        ],
        location_label: "Prefektur Aichi, Jepang",
        salary_range_label: "¥150.000 – ¥180.000/bulan + lembur",
        contract_label: "Magang 3 tahun (Gijutsu Jisshu)",
        deadline_label: "31 Juli 2026",
        quota_label: "15 orang",
        job_description:
          "Kamu akan bertugas sebagai operator produksi di lini perakitan suku cadang otomotif. Tugas meliputi: operasi mesin press, quality control visual, pengemasan, dan pelaporan produksi harian.",
        benefit_items: [
          "Akomodasi disediakan perusahaan (asrama bersih dekat pabrik)",
          "Asuransi kesehatan dan ketenagakerjaan",
          "Makan siang di kantin perusahaan",
          "Bonus hadir dan lembur",
          "Tiket pesawat PP ditanggung (kondisi tertentu)",
        ],
        qualification_items: [
          "Laki-laki, usia 18-30 tahun",
          "Pendidikan minimal SMA/SMK sederajat",
          "Sehat jasmani, bebas tato di area yang terlihat",
          "Mampu bahasa Jepang minimal N4 (atau siap mengikuti pelatihan HIT)",
          "Bersedia bekerja shift dan lembur",
        ],
        recruitment_steps: [
          "Daftar via WhatsApp HIT → Tim HIT menghubungimu dalam 24 jam",
          "Seleksi administrasi dokumen",
          "Tes tertulis dan wawancara",
          "Pemeriksaan kesehatan",
          "Pelatihan pra-keberangkatan di HIT (6 bulan)",
          "Keberangkatan ke Jepang",
        ],
        primary_cta_label: "Lamar Sekarang via WhatsApp",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya ingin melamar lowongan Operator Produksi Pabrik Otomotif di Aichi. Mohon informasi lebih lanjut.",
      },
    },
    {
      collectionKey: "job",
      title: "Pekerja Pertanian Organik — Hokkaido",
      slug: "pekerja-pertanian-organik-hokkaido",
      isFeatured: false,
      expiredAt: addMonths(now, 2),
      thumbnailImageId: media["job-pertanian-thumb"],
      dataJson: {
        subtitle: "Program Magang Pertanian Organik",
        short_description:
          "Kesempatan emas bekerja di kebun pertanian organik premium di Hokkaido. Lingkungan kerja bersih, makan organik, dan pemandangan alam indah.",
        job_type_option_id: options.jobTypeFullTime,
        job_field_option_id: options.jobFieldPertanian,
        gender_option_id: options.genderSemua,
        language_level_option_id: options.languageN4,
        education_level_option_id: options.educationSmaSmk,
        min_age: 18,
        max_age: 30,
        location_label: "Hokkaido, Jepang",
        salary_range_label: "¥140.000 – ¥160.000/bulan",
        contract_label: "Magang 3 tahun",
        deadline_label: "15 Juni 2026",
        quota_label: "8 orang",
        primary_cta_label: "Lamar via WhatsApp",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya ingin melamar lowongan Pekerja Pertanian Organik di Hokkaido.",
      },
    },
    {
      collectionKey: "job",
      title: "Caregiver / Perawat Lansia — Tokyo",
      slug: "caregiver-perawat-lansia-tokyo",
      isFeatured: true,
      expiredAt: addMonths(now, 4),
      thumbnailImageId: media["job-perawatan-thumb"],
      dataJson: {
        subtitle: "Tokutei Ginou — Sektor Perawatan (Kaigo)",
        short_description:
          "Bergabunglah sebagai caregiver profesional di panti wreda modern Tokyo. Permintaan sangat tinggi, peluang karir jangka panjang.",
        job_type_option_id: options.jobTypeFullTime,
        job_field_option_id: options.jobFieldPerawatan,
        gender_option_id: options.genderSemua,
        language_level_option_id: options.languageN4,
        education_level_option_id: options.educationSmaSmk,
        min_age: 18,
        max_age: 35,
        location_label: "Tokyo, Jepang",
        salary_range_label: "¥160.000 – ¥200.000/bulan",
        contract_label: "Tokutei Ginou 1 (1-5 tahun, dapat diperpanjang)",
        deadline_label: "Rekrutmen terbuka (bergulir)",
        quota_label: "5 orang/angkatan",
        benefit_items: [
          "Gaji pokok + tunjangan kehadiran",
          "Asuransi kesehatan lengkap",
          "Pelatihan kaigo intensif sebelum berangkat",
          "Peluang naik ke Tokutei Ginou Tipe 2",
        ],
        primary_cta_label: "Lamar via WhatsApp",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya ingin melamar posisi Caregiver Perawat Lansia di Tokyo.",
      },
    },
    {
      collectionKey: "offer",
      title: "Kelas Bahasa Jepang Gratis — Batch Juli 2026",
      slug: "kelas-bahasa-jepang-gratis-juli-2026",
      isFeatured: true,
      startAt: addDays(now, 1),
      expiredAt: addDays(now, 45),
      thumbnailImageId: media["offer-kelas-gratis-thumb"],
      dataJson: {
        subtitle:
          "Terbatas 30 kursi! Kelas bahasa Jepang N5 GRATIS untuk pendaftar program magang",
        short_description:
          "Daftar program magang HIT sekarang dan dapatkan akses kelas bahasa Jepang N5 selama 1 bulan secara GRATIS.",
        offer_type_option_id: options.offerKelasGratis,
        target_audience_option_id: options.targetAudienceUmum,
        schedule_label: "Setiap Senin, Rabu, Jumat — Pukul 09.00-11.00 WIB",
        duration_label: "1 Bulan (12 pertemuan)",
        format_label: "Daring via Zoom + rekaman tersedia",
        quota_label: "30 kursi (tersisa 12)",
        price_label: "GRATIS",
        original_price_label: "Rp 1.200.000",
        urgency_label: "Penawaran berakhir 15 Juli 2026 atau kuota habis",
        benefit_items: [
          "12 sesi langsung dengan instruktur bersertifikat",
          "Materi PDF + kamus saku GRATIS",
          "Akses rekaman 30 hari",
          "Sertifikat keikutsertaan dari HIT",
        ],
        detail_description:
          "Ini adalah kesempatan emas untuk kamu yang ingin mulai belajar bahasa Jepang tapi belum yakin harus mulai dari mana. Kelas ini GRATIS untuk 30 pendaftar pertama yang mendaftarkan diri pada program magang HIT.",
        suitable_for_items: [
          "Lulusan SMA/SMK yang ingin kerja ke Jepang",
          "Lulusan baru yang belum punya pengalaman bahasa Jepang",
          "Siapa pun yang ingin mencoba belajar bahasa Jepang sebelum berkomitmen",
        ],
        primary_cta_label: "Daftar Sekarang — GRATIS",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya tertarik dengan penawaran Kelas Bahasa Jepang Gratis Batch Juli 2026. Apakah masih ada kursi?",
      },
    },
    {
      collectionKey: "offer",
      title: "Promo Spesial — Diskon 20% Biaya Administrasi",
      slug: "promo-spesial-diskon-biaya-administrasi",
      isFeatured: false,
      startAt: now,
      expiredAt: addDays(now, 30),
      thumbnailImageId: media["offer-promo-thumb"],
      dataJson: {
        subtitle: "Diskon 20% untuk biaya administrasi semua program HIT",
        short_description:
          "Daftar program HIT sekarang dan hemat 20% biaya administrasi. Berlaku terbatas.",
        offer_type_option_id: options.offerPromo,
        target_audience_option_id: options.targetAudienceUmum,
        price_label: "Hemat 20% dari normal",
        urgency_label: "Berakhir akhir bulan ini!",
        primary_cta_label: "Manfaatkan Promo Ini",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya tertarik dengan penawaran Promo Diskon 20% Biaya Administrasi.",
      },
    },
    {
      collectionKey: "blog",
      title: "5 Tips Persiapan Mental Sebelum Berangkat ke Jepang",
      slug: "5-tips-persiapan-mental-sebelum-berangkat-ke-jepang",
      isFeatured: true,
      publishedAt: now,
      thumbnailImageId: media["blog-tips-thumb"],
      dataJson: {
        subtitle: "Persiapan mental sama pentingnya dengan persiapan dokumen",
        excerpt:
          "Banyak calon pekerja hanya fokus pada persiapan dokumen dan bahasa. Padahal persiapan mental adalah kunci keberhasilan jangka panjang di Jepang.",
        cover_image_id: media["blog-tips-thumb"],
        category_option_id: options.blogCategoryTips,
        tag_option_ids: [options.blogTagKehidupanJepang, options.blogTagMagang],
        author_name: "Sari Anggraini",
        author_title: "Manajer Program & Pelatihan HIT",
        author_bio:
          "Berpengalaman 8 tahun membimbing ratusan peserta HIT yang sukses di Jepang.",
        reading_time_label: "5 menit",
        content_blocks: [
          {
            type: "heading",
            sort_order: 1,
            data: { level: "h2", text: "Mengapa Persiapan Mental Sangat Penting?" },
          },
          {
            type: "paragraph",
            sort_order: 2,
            data: {
              text: "Banyak orang yang sudah bekerja keras mempersiapkan dokumen, belajar bahasa Jepang berbulan-bulan, tapi akhirnya kesulitan beradaptasi ketika sudah di Jepang. Penyebabnya sering bukan soal kemampuan, tapi soal kesiapan mental menghadapi perbedaan budaya dan gaya hidup yang drastis.",
            },
          },
          {
            type: "heading",
            sort_order: 3,
            data: { level: "h2", text: "1. Terima Bahwa Awal Pasti Berat" },
          },
          {
            type: "paragraph",
            sort_order: 4,
            data: {
              text: "Bulan pertama di Jepang hampir selalu jadi yang paling berat. Bahasa yang belum fasih, makanan yang berbeda, dan jauh dari keluarga bisa membuat homesick. Sadari bahwa ini normal dan semua orang melewati fase ini.",
            },
          },
          {
            type: "quote",
            sort_order: 5,
            data: {
              text: "Kesulitan di awal bukan tanda bahwa kamu salah pilih. Itu tanda bahwa kamu sedang tumbuh.",
              author: "Budi Wijaya, Alumni HIT",
            },
          },
          {
            type: "heading",
            sort_order: 6,
            data: { level: "h2", text: "2. Bangun Rutinitas Baru Secepat Mungkin" },
          },
          {
            type: "paragraph",
            sort_order: 7,
            data: {
              text: "Rutinitas memberikan rasa aman di lingkungan baru. Usahakan dalam 2 minggu pertama kamu sudah punya jadwal harian: bangun jam berapa, jam berapa makan, jam berapa belajar bahasa Jepang ekstra.",
            },
          },
          {
            type: "heading",
            sort_order: 8,
            data: { level: "h2", text: "3. Jaga Komunikasi dengan Keluarga" },
          },
          {
            type: "paragraph",
            sort_order: 9,
            data: {
              text: "Panggilan video dengan keluarga 2-3 kali seminggu sangat membantu stabilitas emosional. Tapi jangan terlalu sering — fokuslah juga pada kehidupan barumu di sana.",
            },
          },
          {
            type: "heading",
            sort_order: 10,
            data: { level: "h2", text: "4. Cari Teman Sesama Magang Indonesia" },
          },
          {
            type: "paragraph",
            sort_order: 11,
            data: {
              text: "Komunitas sesama WNI di Jepang sangat aktif. Bergabunglah dengan grup WhatsApp atau Line komunitas Indonesia di kotamu. Mereka bisa jadi sumber informasi dan dukungan yang berharga.",
            },
          },
          {
            type: "heading",
            sort_order: 12,
            data: { level: "h2", text: "5. Tetapkan Target Finansial yang Jelas" },
          },
          {
            type: "paragraph",
            sort_order: 13,
            data: {
              text: "Punya tujuan finansial yang konkret (misal: tabung ¥5.000.000 dalam 2 tahun untuk modal usaha) akan membuatmu lebih termotivasi melewati masa-masa sulit.",
            },
          },
          {
            type: "whatsapp_cta",
            sort_order: 14,
            data: {
              label: "Konsultasi Lebih Lanjut dengan Tim HIT",
              whatsapp_message_template:
                "Halo Hashimoto Indo Trust, saya membaca artikel tentang persiapan mental dan ingin konsultasi lebih lanjut.",
            },
          },
        ],
        related_articles: { source: "same_category", max_items: 3 },
      },
    },
    {
      collectionKey: "blog",
      title: "Berapa Gaji Kerja di Jepang? Panduan Lengkap 2026",
      slug: "berapa-gaji-kerja-di-jepang-panduan-lengkap-2026",
      isFeatured: true,
      publishedAt: now,
      thumbnailImageId: media["blog-gaji-thumb"],
      dataJson: {
        subtitle: "Rincian gaji, potongan, dan estimasi tabungan per bulan di Jepang",
        excerpt:
          "Salah satu pertanyaan paling sering dari calon peserta: berapa sebenarnya gaji yang diterima di Jepang setelah semua potongan? Kami rincikan selengkapnya.",
        cover_image_id: media["blog-gaji-thumb"],
        category_option_id: options.blogCategoryEdukasi,
        tag_option_ids: [options.blogTagGaji, options.blogTagMagang],
        author_name: "Budi Wijaya",
        author_title: "Manajer Penempatan HIT",
        reading_time_label: "7 menit",
        content_blocks: [
          {
            type: "heading",
            sort_order: 1,
            data: { level: "h2", text: "Gaji Pokok vs Gaji Bersih" },
          },
          {
            type: "paragraph",
            sort_order: 2,
            data: {
              text: "Gaji kotor (sebelum potongan) untuk pekerja magang di Jepang berkisar ¥130.000–¥180.000 per bulan tergantung sektor dan lokasi. Dari angka ini, ada beberapa potongan wajib.",
            },
          },
          {
            type: "heading",
            sort_order: 3,
            data: { level: "h2", text: "Potongan yang Perlu Kamu Ketahui" },
          },
          {
            type: "paragraph",
            sort_order: 4,
            data: {
              text: "Asuransi kesehatan (Kenko Hoken): sekitar 5% dari gaji pokok. Asuransi ketenagakerjaan (Kosei Nenkin): sekitar 9%. Pajak penghasilan: 5-10% tergantung total penghasilan. Biaya akomodasi (jika dipotong): ¥10.000–¥30.000/bulan.",
            },
          },
          {
            type: "heading",
            sort_order: 5,
            data: { level: "h2", text: "Estimasi Uang yang Bisa Ditabung" },
          },
          {
            type: "paragraph",
            sort_order: 6,
            data: {
              text: "Dengan gaji ¥150.000 dan hidup hemat (makan memasak sendiri, tidak boros), kamu bisa menabung ¥80.000–¥100.000 per bulan. Dalam 3 tahun, estimasi tabungan bisa mencapai Rp 400-600 juta.",
            },
          },
          {
            type: "whatsapp_cta",
            sort_order: 7,
            data: {
              label: "Tanya Lebih Detail tentang Gaji dan Program",
              whatsapp_message_template:
                "Halo Hashimoto Indo Trust, saya ingin mengetahui lebih detail tentang estimasi gaji dan tabungan di Jepang.",
            },
          },
        ],
        related_articles: { source: "same_tags", max_items: 3 },
      },
    },
    {
      collectionKey: "blog",
      title: "Kehidupan Sehari-hari di Jepang — Apa yang Harus Kamu Siapkan?",
      slug: "kehidupan-sehari-hari-di-jepang-apa-yang-harus-disiapkan",
      isFeatured: false,
      publishedAt: now,
      thumbnailImageId: media["blog-kehidupan-thumb"],
      dataJson: {
        subtitle: "Panduan praktis kehidupan sehari-hari di Jepang untuk pekerja Indonesia",
        excerpt:
          "Dari cara berbelanja, transportasi, hingga mengurus SIM dan rekening bank — semua yang perlu kamu ketahui sebelum berangkat ke Jepang.",
        cover_image_id: media["blog-kehidupan-thumb"],
        category_option_id: options.blogCategoryPengalaman,
        tag_option_ids: [options.blogTagKehidupanJepang],
        author_name: "Sari Anggraini",
        author_title: "Manajer Program HIT",
        reading_time_label: "8 menit",
        content_blocks: [
          {
            type: "heading",
            sort_order: 1,
            data: { level: "h2", text: "Transportasi di Jepang" },
          },
          {
            type: "paragraph",
            sort_order: 2,
            data: {
              text: "Transportasi umum Jepang sangat efisien dan tepat waktu. Kereta dan bus adalah moda utama. Kamu akan perlu membeli kartu IC (seperti Suica atau Pasmo) untuk naik transportasi umum dengan mudah.",
            },
          },
          {
            type: "heading",
            sort_order: 3,
            data: { level: "h2", text: "Belanja Kebutuhan Sehari-hari" },
          },
          {
            type: "paragraph",
            sort_order: 4,
            data: {
              text: "Supermarket seperti AEON, Seiyu, dan OK Store menawarkan harga terjangkau. Untuk makanan Indonesia (tempe, bumbu, dan lainnya), cari di toko Asia terdekat atau beli daring di situs seperti Amazon Japan.",
            },
          },
          {
            type: "heading",
            sort_order: 5,
            data: { level: "h2", text: "Membuka Rekening Bank" },
          },
          {
            type: "paragraph",
            sort_order: 6,
            data: {
              text: "Setelah mendapat My Number Card dan Residence Card, kamu bisa membuka rekening di Japan Post Bank (Yucho Bank) — paling mudah untuk WNA baru. Rekening ini penting untuk menerima gaji.",
            },
          },
        ],
      },
    },
    {
      collectionKey: "karir",
      title: "Instruktur Bahasa Jepang",
      slug: "instruktur-bahasa-jepang",
      isFeatured: true,
      expiredAt: addMonths(now, 3),
      dataJson: {
        subtitle: "Penuh waktu | Kerja di kantor | Soreang, Bandung",
        short_description:
          "HIT membuka posisi Instruktur Bahasa Jepang untuk mengajar peserta program magang dan Tokutei Ginou.",
        department_option_id: options.careerDepartmentPengajar,
        employment_type_option_id: options.careerEmploymentFullTime,
        work_arrangement_option_id: options.careerWorkOnSite,
        location_label: "Soreang, Bandung, Jawa Barat",
        salary_label: "Rp 4.000.000 – Rp 6.000.000/bulan",
        experience_label: "Minimal 1 tahun mengajar",
        education_label: "S1 Pendidikan Bahasa Jepang / Studi Jepang",
        deadline_label: "Rekrutmen terbuka",
        role_description:
          "Kamu akan bertanggung jawab merancang dan menyampaikan materi bahasa Jepang mulai level N5 hingga N3 untuk peserta program kerja ke Jepang.",
        responsibilities: [
          "Mengajar bahasa Jepang (membaca, menulis, mendengar, berbicara) 5-6 jam/hari",
          "Merancang modul pembelajaran yang interaktif dan terstruktur",
          "Mempersiapkan peserta menghadapi ujian JLPT",
          "Memberikan masukan dan laporan perkembangan peserta",
          "Berkoordinasi dengan tim program dalam penyesuaian kurikulum",
        ],
        requirements: [
          "Memiliki sertifikasi JLPT N2 atau N1",
          "Berpengalaman mengajar bahasa Jepang minimal 1 tahun",
          "Komunikatif, sabar, dan memiliki jiwa pendidik",
          "Diutamakan yang pernah tinggal di Jepang",
          "Familiar dengan metode pengajaran bahasa modern",
        ],
        benefits: [
          "Gaji pokok kompetitif + tunjangan kehadiran",
          "BPJS Kesehatan dan Ketenagakerjaan",
          "Fasilitas pengembangan profesional",
          "Lingkungan kerja internasional yang dinamis",
        ],
        primary_cta_label: "Lamar Posisi Ini via WhatsApp",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya tertarik melamar posisi Instruktur Bahasa Jepang. Mohon informasi proses seleksinya.",
      },
    },
    {
      collectionKey: "karir",
      title: "Staf Pemasaran & Rekrutmen",
      slug: "staf-pemasaran-rekrutmen",
      isFeatured: false,
      expiredAt: addMonths(now, 2),
      dataJson: {
        subtitle: "Penuh waktu | Kerja campuran | Soreang, Bandung",
        department_option_id: options.careerDepartmentPemasaran,
        employment_type_option_id: options.careerEmploymentFullTime,
        work_arrangement_option_id: options.careerWorkHybrid,
        location_label: "Soreang, Bandung (campuran)",
        salary_label: "Rp 3.500.000 – Rp 5.000.000 + komisi",
        experience_label: "Lulusan baru diterima",
        deadline_label: "31 Agustus 2026",
        role_description:
          "Membantu tim HIT dalam kegiatan pemasaran digital dan rekrutmen peserta program.",
        responsibilities: [
          "Mengelola media sosial HIT (Instagram, TikTok, YouTube)",
          "Membuat konten pemasaran yang menarik",
          "Merespons pertanyaan calon peserta via WhatsApp dan DM",
          "Mengorganisir acara sosialisasi program di sekolah-sekolah",
        ],
        primary_cta_label: "Lamar via WhatsApp",
        whatsapp_message_template:
          "Halo Hashimoto Indo Trust, saya tertarik melamar posisi Staf Pemasaran & Rekrutmen.",
      },
    },
  ];
}

async function writeReport(input: {
  tenantId: string;
  variantId: string;
  createdItems: CreatedItem[];
  verificationRows: VerificationRow[];
}) {
  const itemRows = input.createdItems.map(
    (item) => `| ${item.collectionKey} | ${item.title} | ${item.slug} | ${item.id} |`,
  );
  const verificationRows = input.verificationRows.map(
    (row) => `| ${row.collection_key} | ${row.count} | ${row.published_count} |`,
  );

  const report = [
    "# Laporan Task 5 - Collection Items Variant Indonesia",
    "",
    `Tenant HIT: ${input.tenantId}`,
    `Variant Indonesia: ${input.variantId}`,
    `Sumber media: ${mediaIdsPath}`,
    "",
    "## Item yang Dibuat",
    "",
    "| Collection | Title | Slug | ID |",
    "| --- | --- | --- | --- |",
    ...itemRows,
    "",
    "## Verifikasi",
    "",
    "```sql",
    `SELECT collection_key, count(*), sum(case when status='PUBLISHED' then 1 else 0 end)`,
    `FROM content_items WHERE variant_id = '${input.variantId}' GROUP BY collection_key;`,
    "```",
    "",
    "| collection_key | count | published_count |",
    "| --- | ---: | ---: |",
    ...verificationRows,
    "",
  ].join("\n");

  await writeFile(reportPath, report, "utf8");
}

async function main() {
  const media = await loadMediaIds();
  const now = new Date();

  const result = await prisma.$transaction(
    async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { slug: "hit" },
        select: { id: true },
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
        select: { id: true },
      });

      if (!indonesiaVariant) {
        throw new Error('Variant key "indonesia" was not found for tenant "hit".');
      }

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

      const optionIds = await loadOptionIds(tx, tenant.id, indonesiaVariant.id);
      const seedItems = buildItems(media, optionIds, now);
      const createdItems: CreatedItem[] = [];

      for (const item of seedItems) {
        const json = toPrismaJson(item.dataJson);
        const created = await tx.contentItem.create({
          data: {
            tenantId: tenant.id,
            variantId: indonesiaVariant.id,
            collectionKey: item.collectionKey,
            title: item.title,
            slug: item.slug,
            status: PublishStatus.PUBLISHED,
            excerpt: getExcerpt(item.dataJson),
            thumbnailImageId: item.thumbnailImageId ?? null,
            heroImageId: item.heroImageId ?? null,
            isFeatured: item.isFeatured ?? false,
            publishedAt: item.publishedAt ?? null,
            startAt: item.startAt ?? null,
            expiredAt: item.expiredAt ?? null,
            sortOrder: item.sortOrder ?? 0,
            dataJson: json,
            publishedDataJson: json,
          },
          select: {
            id: true,
            collectionKey: true,
            title: true,
            slug: true,
          },
        });

        createdItems.push(created);
      }

      const verificationRows = await tx.$queryRaw<VerificationRow[]>`
        SELECT
          collection_key,
          count(*)::int AS count,
          sum(case when status='PUBLISHED' then 1 else 0 end)::int AS published_count
        FROM content_items
        WHERE variant_id = ${indonesiaVariant.id}
        GROUP BY collection_key
        ORDER BY collection_key ASC
      `;

      return {
        tenantId: tenant.id,
        variantId: indonesiaVariant.id,
        createdItems,
        verificationRows,
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
        createdItems: result.createdItems,
        verification: result.verificationRows,
        reportPath,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Gagal mengisi item collection Variant Indonesia.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
