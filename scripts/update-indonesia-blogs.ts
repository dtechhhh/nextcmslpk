import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import { Prisma, PrismaClient, PublishStatus } from "../src/generated/prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to update the Indonesia blogs.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const targetHost = readArgument("--host") || "hit-indonesia.lpk.local:3000";
const targetTenantSlug = readArgument("--tenant") || "hit";

type BlogArticleInput = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  category: string;
  tags: string[];
  readingTime: string;
  sortOrder: number;
  isFeatured: boolean;
  authorName: string;
  authorTitle: string;
  authorBio: string;
  reviewerName: string;
  reviewerTitle: string;
  keyTakeaways: string[];
  sources: Array<{
    title: string;
    description: string;
    sourceLabel: string;
    sourceUrl: string;
  }>;
  blocks: Array<{
    type: "heading" | "paragraph" | "quote";
    level?: "h2" | "h3";
    text: string;
    author?: string;
  }>;
};

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

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function json(value: Record<string, unknown>): Prisma.InputJsonObject {
  return value as Prisma.InputJsonObject;
}

function block(
  type: "heading" | "paragraph" | "quote" | "image" | "offer_callout" | "whatsapp_cta",
  data: Record<string, unknown>,
  sortOrder: number,
) {
  return {
    type,
    sort_order: sortOrder,
    data,
  };
}

const categorySeeds = [
  { value: "mulai-dari-nol", label: "Mulai dari Nol" },
  { value: "bahasa-interview", label: "Bahasa & Interview" },
  { value: "biaya-gaji-hidup", label: "Biaya, Gaji & Hidup Awal" },
  { value: "dokumen-visa", label: "Dokumen & Visa" },
  { value: "budaya-kerja", label: "Budaya Kerja Jepang" },
];

const tagSeeds = [
  { value: "pemula", label: "Pemula" },
  { value: "bahasa-jepang", label: "Bahasa Jepang" },
  { value: "interview", label: "Interview" },
  { value: "dokumen", label: "Dokumen" },
  { value: "biaya", label: "Biaya" },
  { value: "gaji", label: "Gaji" },
  { value: "kontrak-kerja", label: "Kontrak Kerja" },
  { value: "program-kerja-jepang", label: "Program Kerja Jepang" },
];

const articles: BlogArticleInput[] = [
  {
    title: "Mulai dari Nol: Langkah Pertama Menyiapkan Diri Kerja ke Jepang",
    slug: "mulai-dari-nol-persiapan-kerja-ke-jepang",
    subtitle: "Panduan awal untuk calon peserta yang belum bisa bahasa Jepang",
    excerpt:
      "Belum bisa bahasa Jepang bukan berarti harus berhenti. Artikel ini membantu kamu memahami langkah awal, data diri yang perlu dicek, dan kebiasaan belajar yang perlu dibangun sebelum memilih program kerja Jepang.",
    category: "mulai-dari-nol",
    tags: ["pemula", "bahasa-jepang", "program-kerja-jepang"],
    readingTime: "6 menit baca",
    sortOrder: 1,
    isFeatured: true,
    authorName: "Tim Akademik HIT",
    authorTitle: "Penyusun Materi Persiapan Kandidat",
    authorBio:
      "Tim akademik HIT menyusun materi persiapan bahasa, interview, dan budaya kerja untuk membantu kandidat memahami proses secara bertahap.",
    reviewerName: "Sarif Hidayatulloh",
    reviewerTitle: "Penanggung Jawab Pendidikan, JLPT N1",
    keyTakeaways: [
      "Pemula sebaiknya mulai dari pemeriksaan profil, bukan langsung memilih program.",
      "Bahasa Jepang dasar perlu dibangun bersama kebiasaan disiplin, pencatatan, dan latihan komunikasi.",
      "Tidak ada lembaga yang boleh menjanjikan pasti berangkat; hasil tetap bergantung pada kesiapan, dokumen, kesehatan, seleksi, dan kebutuhan perusahaan.",
    ],
    sources: [
      {
        title: "Status izin tinggal dan ruang kerja di Jepang",
        description:
          "Rujukan dasar untuk memahami bahwa bekerja di Jepang mengikuti status izin tinggal dan batas aktivitas yang berlaku.",
        sourceLabel: "Tokyo Employment Service Center for Foreigners",
        sourceUrl:
          "https://jsite.mhlw.go.jp/tokyo-foreigner/english/seekers_1/spec/spec_1a.html",
      },
      {
        title: "Specified Skilled Worker",
        description:
          "Halaman rujukan Immigration Services Agency of Japan untuk memahami sistem Specified Skilled Worker.",
        sourceLabel: "Immigration Services Agency of Japan",
        sourceUrl:
          "https://www.moj.go.jp/isa/policies/ssw/nyuukokukanri01_00130.html",
      },
    ],
    blocks: [
      {
        type: "heading",
        level: "h2",
        text: "Jawaban singkat",
      },
      {
        type: "paragraph",
        text:
          "Kalau kamu mulai dari nol, langkah pertama bukan langsung mengejar keberangkatan. Langkah pertama adalah memetakan profil: usia, pendidikan, pengalaman, kesehatan, kemampuan bahasa, minat bidang kerja, serta dukungan keluarga. Dari sana barulah program yang paling mungkin diperiksa satu per satu.",
      },
      {
        type: "paragraph",
        text:
          "HIT biasanya mengarahkan calon peserta untuk melihat proses ini sebagai persiapan bertahap. Bahasa Jepang penting, tetapi bukan satu-satunya bagian. Kandidat juga perlu membangun disiplin waktu, kemampuan menerima instruksi, kesiapan dokumen, dan keberanian berkomunikasi saat interview.",
      },
      {
        type: "heading",
        level: "h2",
        text: "1. Cek dulu kondisi awalmu",
      },
      {
        type: "paragraph",
        text:
          "Catat usia, pendidikan terakhir, pengalaman kerja, riwayat kesehatan, kemampuan bahasa Jepang, dan bidang kerja yang kamu minati. Informasi ini membantu tim membandingkan jalur yang mungkin, seperti Magang, Tokutei Ginou, atau Gijinkoku. Setiap jalur punya karakter persiapan yang berbeda.",
      },
      {
        type: "paragraph",
        text:
          "Jangan menyembunyikan kondisi yang berpengaruh pada proses. Lebih baik diketahui sejak awal agar arahan yang diberikan realistis. Misalnya, kandidat yang benar-benar pemula mungkin perlu fokus pada kebiasaan belajar bahasa dan kesiapan dasar sebelum membahas lowongan.",
      },
      {
        type: "heading",
        level: "h2",
        text: "2. Bangun rutinitas belajar 30 hari",
      },
      {
        type: "paragraph",
        text:
          "Dalam 30 hari pertama, targetnya bukan langsung lancar. Targetnya adalah konsisten. Latih hiragana dan katakana, hafalkan kosakata aktivitas sehari-hari, biasakan mendengar instruksi sederhana, dan tulis catatan belajar harian. Rutinitas kecil yang stabil lebih berguna daripada belajar banyak tetapi berhenti setelah seminggu.",
      },
      {
        type: "quote",
        text:
          "Kandidat yang kuat biasanya bukan yang paling cepat di awal, tetapi yang bisa menjaga ritme belajar dan menerima evaluasi.",
        author: "Tim Akademik HIT",
      },
      {
        type: "heading",
        level: "h2",
        text: "3. Pahami batas janji yang sehat",
      },
      {
        type: "paragraph",
        text:
          "Calon peserta perlu berhati-hati pada janji yang terdengar terlalu mudah. Mengikuti pelatihan tidak otomatis berarti diterima perusahaan atau pasti berangkat. Keputusan akhir dapat dipengaruhi oleh kemampuan, hasil interview, dokumen, kesehatan, kebutuhan perusahaan, dan aturan yang berlaku.",
      },
      {
        type: "paragraph",
        text:
          "Yang bisa dilakukan lembaga adalah membantu kamu memahami jalur, membangun kemampuan, menyiapkan dokumen, dan menghadapi proses dengan lebih rapi. Karena itu, konsultasi awal sebaiknya digunakan untuk bertanya jujur tentang peluang, risiko, biaya, timeline, dan syarat yang masih perlu dilengkapi.",
      },
    ],
  },
  {
    title: "Checklist Bahasa Jepang untuk Interview Kerja Jepang",
    slug: "checklist-bahasa-jepang-untuk-interview-kerja-jepang",
    subtitle: "Apa saja yang perlu dilatih sebelum bertemu perusahaan",
    excerpt:
      "Interview kerja Jepang tidak cukup dihafalkan dari contoh jawaban. Kamu perlu memahami pertanyaan, menjawab singkat, menunjukkan sikap sopan, dan menjelaskan pengalaman dengan bahasa yang aman.",
    category: "bahasa-interview",
    tags: ["bahasa-jepang", "interview", "pemula"],
    readingTime: "7 menit baca",
    sortOrder: 2,
    isFeatured: false,
    authorName: "Tim Akademik HIT",
    authorTitle: "Penyusun Materi Bahasa dan Interview",
    authorBio:
      "Tim akademik HIT menyusun latihan interview berbasis situasi umum seleksi, komunikasi dasar, dan kebiasaan kerja Jepang.",
    reviewerName: "Sarif Hidayatulloh",
    reviewerTitle: "Penanggung Jawab Pendidikan, JLPT N1",
    keyTakeaways: [
      "Interview perlu latihan pemahaman pertanyaan, bukan hanya menghafal jawaban.",
      "Jawaban yang aman biasanya singkat, jujur, sopan, dan sesuai pengalaman nyata.",
      "Latihan bahasa harus dibarengi postur, intonasi, salam, dan kemampuan memperbaiki jawaban saat gugup.",
    ],
    sources: [
      {
        title: "Ringkasan level JLPT N1 sampai N5",
        description:
          "Rujukan umum untuk memahami bahwa N5 dan N4 berada pada pemahaman bahasa Jepang dasar.",
        sourceLabel: "JLPT Official Worldwide Website",
        sourceUrl: "https://www.jlpt.jp/e/about/levelsummary.html",
      },
    ],
    blocks: [
      {
        type: "heading",
        level: "h2",
        text: "Interview bukan lomba menghafal",
      },
      {
        type: "paragraph",
        text:
          "Banyak kandidat ingin menghafal daftar pertanyaan dan jawaban. Hafalan boleh membantu, tetapi bisa menjadi masalah jika kamu tidak memahami pertanyaan sebenarnya. Saat interviewer mengubah urutan kata atau menanyakan hal tambahan, jawaban yang hanya dihafal biasanya mudah goyah.",
      },
      {
        type: "paragraph",
        text:
          "Latihan yang lebih sehat dimulai dari pola: dengarkan pertanyaan, pahami kata kunci, jawab dengan kalimat pendek, lalu beri contoh nyata. Jika belum mengerti, kandidat juga perlu belajar meminta pengulangan dengan sopan.",
      },
      {
        type: "heading",
        level: "h2",
        text: "Checklist latihan sebelum interview",
      },
      {
        type: "paragraph",
        text:
          "Pertama, latih perkenalan diri yang berisi nama, usia, pendidikan, pengalaman, dan alasan ingin bekerja di Jepang. Kedua, siapkan jawaban tentang kelebihan dan kelemahan dengan contoh perilaku, bukan hanya sifat umum. Ketiga, latih menjelaskan pengalaman kerja atau kegiatan sekolah secara sederhana.",
      },
      {
        type: "paragraph",
        text:
          "Keempat, siapkan alasan memilih bidang kerja. Jawaban seperti 'ingin gaji besar' biasanya belum cukup. Jelaskan kesiapan belajar, ketertarikan pada bidang, dan contoh kebiasaan yang mendukung pekerjaan. Kelima, latih menjawab pertanyaan tentang disiplin, kerja tim, dan keselamatan.",
      },
      {
        type: "heading",
        level: "h2",
        text: "Bahasa yang aman untuk pemula",
      },
      {
        type: "paragraph",
        text:
          "Untuk pemula, tujuan awal adalah menjawab dengan jelas dan tidak berlebihan. Gunakan kalimat yang benar-benar kamu pahami. Jika belum bisa menjelaskan detail dalam bahasa Jepang, siapkan versi pendek yang mudah dikembangkan saat latihan bersama pengajar.",
      },
      {
        type: "paragraph",
        text:
          "Contohnya, saat ditanya alasan ingin bekerja di Jepang, jangan hanya menjawab 'karena suka Jepang'. Jawaban yang lebih kuat adalah menjelaskan bahwa kamu ingin belajar disiplin kerja, membangun pengalaman, membantu keluarga, dan siap mengikuti aturan perusahaan.",
      },
      {
        type: "quote",
        text:
          "Jawaban interview yang baik tidak harus panjang. Yang penting jelas, jujur, dan bisa dipertanggungjawabkan saat ditanya lanjutan.",
        author: "Tim Akademik HIT",
      },
      {
        type: "heading",
        level: "h2",
        text: "Latihan sikap sama pentingnya",
      },
      {
        type: "paragraph",
        text:
          "Perhatikan salam, kontak mata yang wajar, posisi duduk, volume suara, dan cara menutup jawaban. Hal kecil seperti datang tepat waktu saat latihan, membawa catatan, dan memperbaiki jawaban setelah evaluasi ikut menunjukkan kesiapan kerja.",
      },
      {
        type: "paragraph",
        text:
          "Di HIT, latihan interview sebaiknya tidak dianggap sebagai sesi sekali jadi. Kandidat perlu beberapa putaran: simulasi, evaluasi, revisi jawaban, lalu simulasi lagi. Dari proses itu, pengajar bisa melihat apakah kandidat hanya hafal atau benar-benar memahami isi jawabannya.",
      },
    ],
  },
  {
    title: "Biaya Hidup Awal di Jepang: Hal yang Perlu Dihitung Calon Kandidat",
    slug: "biaya-hidup-awal-di-jepang-yang-perlu-dihitung",
    subtitle: "Cara membaca kebutuhan uang awal tanpa terjebak angka yang terlalu manis",
    excerpt:
      "Sebelum berangkat, calon kandidat perlu memahami bahwa gaji, potongan, tempat tinggal, makanan, transportasi, dan kebutuhan awal bisa berbeda menurut perusahaan serta wilayah. Ini cara membaca informasinya dengan lebih tenang.",
    category: "biaya-gaji-hidup",
    tags: ["biaya", "gaji", "kontrak-kerja"],
    readingTime: "8 menit baca",
    sortOrder: 3,
    isFeatured: true,
    authorName: "Tim Konsultan HIT",
    authorTitle: "Penyusun Materi Konsultasi Kandidat",
    authorBio:
      "Tim konsultan HIT membantu calon peserta membaca informasi program, biaya, gaji, dokumen, dan tahapan seleksi secara lebih realistis.",
    reviewerName: "Aris Supriyadi",
    reviewerTitle: "Direktur Utama HIT, pengalaman kerja 17 tahun di Jepang",
    keyTakeaways: [
      "Jangan menilai peluang hanya dari angka gaji kotor; pahami juga potongan dan biaya hidup.",
      "Tanyakan komponen biaya secara tertulis sebelum menyetujui proses berikutnya.",
      "Kontrak dan kondisi kerja perlu dibaca pelan-pelan, terutama bagian pekerjaan, jam kerja, lokasi, upah, dan tempat tinggal.",
    ],
    sources: [
      {
        title: "Ketentuan dasar hukum kerja di Jepang",
        description:
          "Rujukan umum tentang pentingnya penjelasan kondisi kerja, upah, jam kerja, libur, dan pembayaran upah.",
        sourceLabel: "Tokyo Employment Service Center for Foreigners",
        sourceUrl:
          "https://jsite.mhlw.go.jp/tokyo-foreigner/english/seekers_1/spec/spec_1c.html",
      },
    ],
    blocks: [
      {
        type: "heading",
        level: "h2",
        text: "Mulai dari gaji bersih, bukan gaji kotor",
      },
      {
        type: "paragraph",
        text:
          "Saat membaca informasi kerja, calon kandidat sering langsung melihat angka gaji. Itu wajar, tetapi angka yang paling penting untuk perencanaan pribadi adalah perkiraan uang yang bisa digunakan setelah potongan dan kebutuhan utama. Gaji kotor belum otomatis sama dengan uang yang tersisa.",
      },
      {
        type: "paragraph",
        text:
          "Potongan dapat berbeda menurut skema kerja, perusahaan, wilayah, asuransi, pajak, tempat tinggal, utilitas, dan aturan yang berlaku. Karena itu, pertanyaan yang sehat bukan hanya 'gajinya berapa', tetapi juga 'potongannya apa saja, dibayar kapan, dan biaya apa yang menjadi tanggung jawab kandidat'.",
      },
      {
        type: "heading",
        level: "h2",
        text: "Komponen yang perlu kamu tanyakan",
      },
      {
        type: "paragraph",
        text:
          "Tanyakan rincian pekerjaan, lokasi, jam kerja, sistem lembur, hari libur, tempat tinggal, transportasi, asuransi, pajak, dan biaya awal. Jika ada biaya program, minta penjelasan komponen dan waktu pembayarannya. Informasi yang jelas membantu keluarga ikut memahami keputusan yang diambil.",
      },
      {
        type: "paragraph",
        text:
          "Untuk biaya hidup, jangan memakai angka orang lain mentah-mentah. Kebutuhan kandidat di kota besar bisa berbeda dengan daerah yang lebih kecil. Pola makan, jarak tempat tinggal, fasilitas asrama, dan kebiasaan pribadi juga memengaruhi pengeluaran bulanan.",
      },
      {
        type: "heading",
        level: "h2",
        text: "Cara membaca kontrak dan penawaran",
      },
      {
        type: "paragraph",
        text:
          "Sebelum menyetujui proses, baca bagian pekerjaan, upah, jam kerja, masa kontrak, tempat kerja, tempat tinggal, dan aturan pengunduran diri. Jika ada istilah yang belum dipahami, jangan menebak. Tanyakan sampai jelas dan catat jawaban yang diberikan.",
      },
      {
        type: "paragraph",
        text:
          "Kandidat juga perlu memahami peran masing-masing pihak. Mana yang menjadi tanggung jawab perusahaan penerima, lembaga pengirim, kandidat, dan pihak pendukung lain. Semakin jelas pembagian peran, semakin kecil risiko salah paham di tengah proses.",
      },
      {
        type: "quote",
        text:
          "Angka yang realistis kadang terasa kurang menarik, tetapi justru membantu kandidat dan keluarga mengambil keputusan dengan kepala dingin.",
        author: "Tim Konsultan HIT",
      },
      {
        type: "heading",
        level: "h2",
        text: "Kapan perlu konsultasi",
      },
      {
        type: "paragraph",
        text:
          "Konsultasi diperlukan ketika kamu belum yakin membaca komponen biaya, belum memahami perbedaan jalur, atau belum bisa menilai apakah profilmu cocok dengan posisi tertentu. Bawa data diri, pendidikan, pengalaman, kemampuan bahasa, dan pertanyaan dari keluarga agar diskusi lebih konkret.",
      },
      {
        type: "paragraph",
        text:
          "HIT dapat membantu memberi arahan awal dan menjelaskan bagian yang perlu diperiksa. Namun, kandidat tetap perlu membaca dokumen akhir dan memastikan setiap keputusan dipahami sebelum melanjutkan proses.",
      },
    ],
  },
];

async function ensureOptionSet(tenantId: string, variantId: string, key: string, label: string) {
  return prisma.optionSet.upsert({
    where: { variantId_key: { variantId, key } },
    create: { tenantId, variantId, key, label },
    update: { label },
    select: { id: true },
  });
}

async function ensureOptionValue(optionSetId: string, value: string, label: string, sortOrder: number) {
  const option = await prisma.optionValue.upsert({
    where: { optionSetId_value: { optionSetId, value } },
    create: {
      optionSetId,
      value,
      label,
      sortOrder,
      isActive: true,
    },
    update: {
      label,
      sortOrder,
      isActive: true,
    },
    select: { id: true, value: true, label: true },
  });

  return option;
}

async function ensureOptions(tenantId: string, variantId: string) {
  const categorySet = await ensureOptionSet(
    tenantId,
    variantId,
    "blog_category",
    "Kategori Panduan",
  );
  const tagSet = await ensureOptionSet(tenantId, variantId, "blog_tag", "Tag Panduan");

  const categoryMap = new Map<string, string>();
  const tagMap = new Map<string, string>();

  for (const [index, item] of categorySeeds.entries()) {
    const option = await ensureOptionValue(categorySet.id, item.value, item.label, index);
    categoryMap.set(option.value, option.id);
  }

  for (const [index, item] of tagSeeds.entries()) {
    const option = await ensureOptionValue(tagSet.id, item.value, item.label, index);
    tagMap.set(option.value, option.id);
  }

  return { categoryMap, tagMap };
}

async function resolveMediaIds(tenantId: string) {
  const media = await prisma.mediaAsset.findMany({
    where: { tenantId, mediaType: "IMAGE", status: "ACTIVE" },
    orderBy: [{ createdAt: "desc" }],
    select: { id: true },
    take: 12,
  });

  if (media.length === 0) {
    throw new Error("No active image media was found for Indonesia blog covers.");
  }

  return media.map((item) => item.id);
}

async function resolveOfferId(variantId: string) {
  const offer = await prisma.contentItem.findFirst({
    where: {
      variantId,
      collectionKey: "offer",
      status: PublishStatus.PUBLISHED,
    },
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    select: { id: true },
  });

  return offer?.id ?? "";
}

function articleData(
  article: BlogArticleInput,
  categoryOptionId: string,
  tagOptionIds: string[],
  coverImageId: string,
  inlineImageId: string,
  offerId: string,
) {
  const contentBlocks = article.blocks.map((item, index) => {
    if (item.type === "heading") {
      return block("heading", { level: item.level ?? "h2", text: item.text }, index);
    }

    if (item.type === "quote") {
      return block("quote", { text: item.text, author: item.author ?? "" }, index);
    }

    return block("paragraph", { text: item.text }, index);
  });

  const imageInsertAt = Math.min(5, contentBlocks.length);
  contentBlocks.splice(
    imageInsertAt,
    0,
    block(
      "image",
      {
        image_id: inlineImageId,
        alt_text: article.title,
        caption: "Dokumentasi dan ilustrasi kegiatan persiapan kandidat HIT.",
      },
      imageInsertAt,
    ),
  );

  const tailStart = contentBlocks.length;

  if (offerId) {
    contentBlocks.push(block("offer_callout", { offer_id: offerId }, tailStart));
  }

  contentBlocks.push(
    block(
      "whatsapp_cta",
      {
        label: "Konsultasi langkah saya",
        whatsapp_message_template: `Halo Hashimoto Indo Trust, saya membaca artikel "${article.title}" dan ingin berkonsultasi tentang langkah yang sesuai untuk profil saya.`,
      },
      tailStart + 1,
    ),
  );

  return {
    title: article.title,
    slug: article.slug,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    cover_image_id: coverImageId,
    status: "PUBLISHED",
    is_featured: article.isFeatured,
    published_at: "2026-06-13T02:00:00.000Z",
    reading_time_label: article.readingTime,
    sort_order: article.sortOrder,
    category_option_id: categoryOptionId,
    tag_option_ids: tagOptionIds,
    author_name: article.authorName,
    author_title: article.authorTitle,
    author_bio: article.authorBio,
    author_image_id: "",
    key_takeaways: article.keyTakeaways,
    reviewer_name: article.reviewerName,
    reviewer_title: article.reviewerTitle,
    reviewed_at: "2026-06-13",
    source_items: article.sources.map((source, index) => ({
      title: source.title,
      description: source.description,
      source_label: source.sourceLabel,
      source_url: source.sourceUrl,
      is_enabled: true,
      sort_order: index,
    })),
    content_blocks: contentBlocks.map((item, index) => ({
      ...item,
      sort_order: index,
    })),
    related_source: "same_tags",
    manual_blog_ids: [],
    related_max_items: 3,
  };
}

function updateBlogPageData(value: unknown) {
  const current = record(value);
  const hero = record(current.hero);
  const filterConfig = record(current.filter_config);
  const offerSection = record(current.offer_section);

  return {
    ...current,
    hero: {
      ...hero,
      headline: "Panduan Kerja ke Jepang untuk Calon Peserta",
      subheadline:
        "Baca panduan yang membantu kamu memahami bahasa, interview, biaya, dokumen, dan kesiapan sebelum memilih jalur kerja Jepang.",
      primary_cta_label: "Konsultasi Arah Persiapan",
      primary_cta_whatsapp_message:
        "Halo Hashimoto Indo Trust, saya membaca panduan di website dan ingin berkonsultasi tentang langkah persiapan kerja Jepang yang sesuai.",
    },
    filter_config: {
      ...filterConfig,
      enable_category_filter: true,
      enable_tag_filter: true,
    },
    offer_section: {
      ...offerSection,
      is_enabled: true,
      source: stringValue(offerSection.source) || "active_featured_offer",
    },
    final_cta: {
      headline: "Masih bingung mulai dari mana?",
      description:
        "Ceritakan usia, pendidikan, kemampuan bahasa, dan bidang kerja yang kamu minati. Tim HIT akan membantu memberi arahan awal yang lebih sesuai dengan profilmu.",
      cta_label: "Tanya Admin HIT",
      whatsapp_message_template:
        "Halo Hashimoto Indo Trust, saya ingin bertanya setelah membaca panduan kerja Jepang di website.",
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

  await prisma.contentCollection.upsert({
    where: { variantId_key: { variantId: variant.id, key: "blog" } },
    create: {
      tenantId: variant.tenantId,
      variantId: variant.id,
      key: "blog",
      label: "Panduan Kerja Jepang",
      isEnabled: true,
    },
    update: {
      label: "Panduan Kerja Jepang",
      isEnabled: true,
    },
  });

  const [blogPage, mediaIds, offerId] = await Promise.all([
    prisma.contentPage.findUnique({
      where: { variantId_pageKey: { variantId: variant.id, pageKey: "blog_page" } },
      select: {
        id: true,
        title: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
      },
    }),
    resolveMediaIds(variant.tenantId),
    resolveOfferId(variant.id),
  ]);

  if (!blogPage) {
    throw new Error("Indonesia blog page was not found.");
  }

  const { categoryMap, tagMap } = await ensureOptions(variant.tenantId, variant.id);
  const targetSlugs = articles.map((article) => article.slug);
  const existingItems = await prisma.contentItem.findMany({
    where: {
      variantId: variant.id,
      collectionKey: "blog",
      OR: [{ slug: { startsWith: "demo-blog-" } }, { slug: { in: targetSlugs } }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      dataJson: true,
      publishedDataJson: true,
    },
    orderBy: [{ slug: "asc" }],
  });

  const nextPageDraft = updateBlogPageData(blogPage.dataJson);
  const nextPagePublished = updateBlogPageData(blogPage.publishedDataJson ?? blogPage.dataJson);
  const previewPath = join(tmpdir(), `nextcms-indonesia-blogs-${Date.now()}.json`);
  const preview = {
    mode: shouldApply ? "apply" : "dry-run",
    tenant: variant.tenant.slug,
    variantId: variant.id,
    pageTitle: nextPagePublished.hero,
    articleSlugs: targetSlugs,
    demoItemsToDraft: existingItems
      .filter((item) => item.slug.startsWith("demo-blog-") && !targetSlugs.includes(item.slug))
      .map((item) => item.slug),
    mediaIds: mediaIds.slice(0, 3),
    offerId: offerId || "not available",
  };

  await writeFile(
    previewPath,
    JSON.stringify({ preview, previousItems: existingItems }, null, 2),
  );
  console.log(JSON.stringify(preview, null, 2));
  console.log(`Preview written to ${previewPath}`);

  if (!shouldApply) {
    console.log("Dry run only. Re-run with --apply to update the database.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.contentPage.update({
      where: { id: blogPage.id },
      data: {
        title: "Panduan Kerja ke Jepang",
        status: PublishStatus.PUBLISHED,
        dataJson: json(nextPageDraft),
        publishedDataJson: json(nextPagePublished),
      },
    });

    await tx.contentItem.updateMany({
      where: {
        variantId: variant.id,
        collectionKey: "blog",
        slug: { startsWith: "demo-blog-" },
      },
      data: {
        status: PublishStatus.DRAFT,
        isFeatured: false,
      },
    });

    for (const [index, article] of articles.entries()) {
      const categoryOptionId = categoryMap.get(article.category);
      const tagOptionIds = article.tags
        .map((tag) => tagMap.get(tag))
        .filter((tag): tag is string => Boolean(tag));

      if (!categoryOptionId) {
        throw new Error(`Missing category option for ${article.category}.`);
      }

      const coverImageId = mediaIds[index % mediaIds.length];
      const inlineImageId = mediaIds[(index + 3) % mediaIds.length] ?? coverImageId;
      const data = articleData(
        article,
        categoryOptionId,
        tagOptionIds,
        coverImageId,
        inlineImageId,
        offerId,
      );

      await tx.contentItem.upsert({
        where: {
          variantId_collectionKey_slug: {
            variantId: variant.id,
            collectionKey: "blog",
            slug: article.slug,
          },
        },
        create: {
          tenantId: variant.tenantId,
          variantId: variant.id,
          collectionKey: "blog",
          title: article.title,
          slug: article.slug,
          status: PublishStatus.PUBLISHED,
          excerpt: article.excerpt,
          thumbnailImageId: coverImageId,
          heroImageId: null,
          isFeatured: article.isFeatured,
          publishedAt: new Date("2026-06-13T02:00:00.000Z"),
          sortOrder: article.sortOrder,
          dataJson: json(data),
          publishedDataJson: json(data),
        },
        update: {
          title: article.title,
          status: PublishStatus.PUBLISHED,
          excerpt: article.excerpt,
          thumbnailImageId: coverImageId,
          heroImageId: null,
          isFeatured: article.isFeatured,
          publishedAt: new Date("2026-06-13T02:00:00.000Z"),
          sortOrder: article.sortOrder,
          dataJson: json(data),
          publishedDataJson: json(data),
        },
      });
    }
  });

  console.log("Indonesia blog content updated successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to update Indonesia blog content.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
