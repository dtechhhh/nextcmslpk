import type { CollectionField, PublishStatus } from "@/lib/collection-definitions";
import {
  EXCERPT_MAX_LENGTH,
  SHORT_DESCRIPTION_MAX_LENGTH,
} from "@/lib/content-summary-limits";

export type CmsFieldGuidance = {
  helpText?: string;
  usage?: string;
  example?: string;
  requiredForPublish?: boolean;
};

const SECTION_LABELS: Record<string, string> = {
  Identity: "Identitas",
  Media: "Media",
  Classification: "Klasifikasi",
  "Card info": "Informasi kartu",
  "Detail content": "Konten detail",
  "Candidate requirements": "Syarat kandidat",
  Dates: "Tanggal",
  "Campaign info": "Informasi kampanye",
  Author: "Penulis",
  "Content blocks": "Blok konten",
  "Related articles": "Artikel terkait",
  "Sector content": "Konten sektor",
  CTA: "Tombol aksi",
};

const COLLECTION_LABELS: Record<string, string> = {
  Blog: "Blog",
  Job: "Lowongan",
  Karir: "Karir",
  News: "Berita",
  Offer: "Penawaran",
  Program: "Program",
  Sector: "Sektor",
};

const COLLECTION_PLURAL_LABELS: Record<string, string> = {
  Blogs: "Blog",
  Jobs: "Lowongan kerja",
  Karir: "Karir",
  News: "Berita",
  Offers: "Penawaran",
  Programs: "Program",
  Sectors: "Sektor",
};

const COLLECTION_EYEBROWS: Record<string, string> = {
  "Indonesia / Collections": "Indonesia / Koleksi",
  "Japan / Collections": "Jepang / Koleksi",
};

const TERM_LABELS: Record<string, string> = {
  "Add block": "Tambah blok",
  "Alt text": "Teks alternatif gambar",
  "Amount label": "Nominal biaya",
  "Article ID": "ID artikel",
  Author: "Penulis",
  "Author bio": "Bio penulis",
  "Author image": "Foto penulis",
  "Author name": "Nama penulis",
  "Author title": "Jabatan penulis",
  "Blog ID": "ID blog",
  Benefit: "Manfaat",
  "Benefit items": "Daftar manfaat",
  Benefits: "Manfaat",
  Bonus: "Bonus",
  "Bonus items": "Daftar bonus",
  "Brochure enabled": "Aktifkan brosur",
  "Brochure file": "File brosur",
  Caption: "Keterangan gambar",
  Category: "Kategori",
  Checklist: "Checklist",
  "Content blocks": "Blok konten",
  Cost: "Biaya",
  Curriculum: "Kurikulum",
  "Curriculum items": "Daftar kurikulum",
  Description: "Deskripsi",
  Document: "Dokumen",
  Enabled: "Aktif",
  FAQ: "FAQ",
  "Gallery images": "Galeri foto",
  Image: "Gambar",
  Item: "Item",
  "Media ID": "ID media",
  Opportunity: "Peluang",
  Label: "Label",
  Heading: "Judul bagian",
  Level: "Level judul bagian",
  "Manual blog IDs": "ID blog manual",
  "Manual news IDs": "ID berita manual",
  "Max items": "Jumlah maksimal",
  Name: "Nama",
  "News ID": "ID berita",
  Offer: "Penawaran",
  Paragraph: "Paragraf",
  Partner: "Partner",
  Position: "Posisi",
  Process: "Proses",
  Qualification: "Kualifikasi",
  Quote: "Kutipan",
  Question: "Pertanyaan",
  Answer: "Jawaban",
  Requirement: "Syarat",
  Requirements: "Syarat",
  Responsibility: "Tanggung jawab",
  Responsibilities: "Tanggung jawab",
  Sector: "Sektor",
  Source: "Sumber",
  Step: "Langkah",
  Tags: "Tag",
  Testimonial: "Testimoni",
  Testimonials: "Testimoni",
  Text: "Teks",
  Title: "Judul",
  Type: "Tipe blok",
};

const FIELD_LABELS_BY_PATH: Record<string, string> = {
  author_bio: "Bio penulis",
  author_image_id: "Foto penulis",
  author_name: "Nama penulis",
  author_title: "Jabatan penulis",
  benefits: "Manfaat",
  benefit_items: "Daftar manfaat",
  bonus_items: "Daftar bonus",
  brochure_enabled: "Aktifkan brosur",
  brochure_file_id: "File brosur",
  candidate_requirements: "Syarat kandidat",
  capacity_label: "Kapasitas",
  category_option_id: "Kategori",
  certificate_required_label: "Sertifikat yang dibutuhkan",
  content_blocks: "Blok konten",
  contract_label: "Kontrak",
  cost_items: "Rincian biaya",
  cover_image_id: "Gambar sampul",
  deadline_label: "Batas pendaftaran",
  department_option_id: "Departemen",
  detail_checklist: "Checklist detail",
  detail_description: "Deskripsi detail",
  duration_label: "Durasi",
  education_label: "Pendidikan",
  education_level_option_id: "Pendidikan terakhir",
  employment_type_option_id: "Tipe pekerjaan",
  example_positions: "Contoh posisi",
  excerpt: "Ringkasan",
  experience_label: "Pengalaman",
  experience_required_label: "Pengalaman yang dibutuhkan",
  expired_at: "Tanggal berakhir",
  ex_japan_required: "Wajib pernah ke Jepang",
  faqs: "FAQ",
  format_label: "Format",
  gallery_media_ids: "Galeri foto",
  gender_option_id: "Gender",
  hero_image_id: "Gambar hero",
  highlight_label: "Label sorotan",
  is_enabled: "Aktif",
  job_description: "Deskripsi pekerjaan",
  job_field_option_id: "Bidang pekerjaan",
  job_type_option_id: "Jenis pekerjaan",
  karir_type_option_id: "ID tipe karir",
  language_level_option_id: "Level bahasa",
  legality_partner_items: "Legalitas dan partner",
  line_message_template: "Template pesan LINE",
  location_label: "Lokasi",
  location_option_id: "ID lokasi",
  manual_blog_ids: "ID blog manual",
  manual_news_ids: "ID berita manual",
  max_age: "Usia maksimum",
  min_age: "Usia minimum",
  offer_type_option_id: "Jenis offer",
  original_price_label: "Harga normal",
  overview: "Gambaran umum",
  overview_items: "Poin gambaran umum",
  price_label: "Harga",
  primary_cta_label: "Label tombol utama",
  process_items: "Tahapan proses",
  program_type_option_id: "Jenis program",
  quota_label: "Kuota",
  reading_time_label: "Estimasi waktu baca",
  recruitment_steps: "Tahapan rekrutmen",
  related_articles: "Artikel terkait",
  related_max_items: "Jumlah artikel terkait",
  related_program_id: "ID program terkait",
  related_source: "Sumber artikel terkait",
  role_or_program: "Peran/program",
  requirements: "Syarat",
  required_documents: "Dokumen wajib",
  responsibilities: "Tanggung jawab",
  role_description: "Deskripsi peran",
  salary_label: "Gaji",
  salary_range_label: "Rentang gaji",
  schedule_label: "Jadwal",
  secondary_cta_label: "Label tombol kedua",
  secondary_document_url: "URL dokumen tombol kedua",
  sector_category_option_id: "Kategori sektor",
  short_description: "Deskripsi singkat",
  slug: "Slug URL",
  start_at: "Tanggal mulai",
  subtitle: "Subjudul",
  suitability_items: "Kecocokan kandidat",
  suitable_for_items: "Cocok untuk",
  tag_option_ids: "Tag",
  target_audience_option_id: "Target audiens",
  target_language_label: "Target bahasa",
  terms_conditions: "Syarat dan ketentuan",
  thumbnail_image_id: "Gambar thumbnail",
  timeline_items: "Timeline",
  title: "Judul",
  training_alignment_items: "Kesesuaian pelatihan",
  urgency_label: "Label urgensi",
  visa_path_label: "Jalur visa",
  whatsapp_message_template: "Template pesan WhatsApp",
  why_choose_items: "Alasan memilih",
  work_arrangement_option_id: "Sistem kerja",
};

const STATIC_OPTION_LABELS: Record<string, string> = {
  Manual: "Pilih manual",
  "Same category": "Kategori yang sama",
  "Same tags": "Tag yang sama",
};

const PLACEHOLDERS_BY_PATH: Record<string, string> = {
  author_name: "Contoh: Tim HIT Indonesia",
  author_title: "Contoh: Konsultan Program Jepang",
  capacity_label: "Contoh: Kuota 25 peserta",
  contract_label: "Contoh: Kontrak 3 tahun",
  deadline_label: "Contoh: Pendaftaran ditutup 30 Juni 2026",
  duration_label: "Contoh: 6 bulan pelatihan",
  excerpt: `Tulis ringkasan artikel singkat. Maks ${EXCERPT_MAX_LENGTH} karakter.`,
  format_label: "Contoh: Online dan offline",
  highlight_label: "Contoh: Paling diminati",
  line_message_template: "Contoh: Saya ingin konsultasi tentang {sector_name}.",
  location_label: "Contoh: Tokyo, Jepang",
  overview: "Tulis penjelasan utama yang akan dibaca pengunjung.",
  price_label: "Contoh: Gratis / Rp2.500.000",
  primary_cta_label: "Contoh: Daftar Sekarang",
  quota_label: "Contoh: Tersisa 10 kursi",
  reading_time_label: "Contoh: 5 menit",
  salary_label: "Contoh: JPY 180.000 per bulan",
  salary_range_label: "Contoh: JPY 160.000 - JPY 220.000 / bulan",
  schedule_label: "Contoh: Mulai setiap bulan",
  secondary_cta_label: "Contoh: Unduh Dokumen",
  secondary_document_url: "https://...",
  short_description: `Tulis deskripsi singkat untuk kartu/sidebar. Maks ${SHORT_DESCRIPTION_MAX_LENGTH} karakter.`,
  slug: "contoh-url-singkat",
  subtitle: "Tulis subjudul pendek yang mendukung judul.",
  target_language_label: "Contoh: JLPT N4",
  title: "Tulis judul yang jelas dan mudah dicari.",
  urgency_label: "Contoh: Terbatas sampai akhir bulan",
  visa_path_label: "Contoh: Tokutei Ginou",
  whatsapp_message_template: "Contoh: Halo, saya tertarik dengan {program_title}.",
};

const GUIDANCE_BY_PATH: Record<string, CmsFieldGuidance> = {
  category_option_id: {
    helpText: "Pilih kategori utama agar konten mudah difilter dan dikelompokkan.",
    usage: "Muncul di filter publik, daftar konten, dan halaman detail.",
  },
  content_blocks: {
    helpText: "Susun isi artikel dengan heading, paragraf, gambar, kutipan, atau tombol aksi.",
    usage: "Muncul sebagai isi utama halaman detail.",
  },
  cover_image_id: {
    helpText: "Pilih gambar sampul yang mewakili artikel atau berita.",
    usage: "Muncul di kartu daftar dan halaman detail.",
  },
  excerpt: {
    helpText: `Isi ringkasan singkat yang menjelaskan inti konten. Ideal 25-35 kata, maksimal ${EXCERPT_MAX_LENGTH} karakter.`,
    usage: "Muncul di kartu, daftar, SEO, dan beberapa hero halaman.",
  },
  hero_image_id: {
    helpText: "Pilih gambar besar untuk bagian atas halaman detail.",
    usage: "Muncul sebagai visual utama di halaman detail.",
  },
  line_message_template: {
    helpText: "Tulis pesan awal yang akan masuk ke LINE saat tombol diklik.",
    usage: "Muncul sebagai isi pesan otomatis ke admin.",
    example: "Saya ingin konsultasi tentang {sector_name}.",
  },
  overview: {
    helpText: "Tulis penjelasan utama yang memberi konteks lengkap kepada pengunjung.",
    usage: "Muncul di bagian pembuka halaman detail.",
  },
  primary_cta_label: {
    helpText: "Tulis teks pendek untuk tombol utama.",
    usage: "Muncul di tombol aksi pada halaman detail.",
    example: "Daftar Sekarang",
  },
  secondary_document_url: {
    helpText: "Isi URL dokumen publik jika tombol kedua harus membuka dokumen.",
    usage: "Muncul sebagai link dokumen di halaman detail.",
    example: "https://example.com/brosur.pdf",
  },
  short_description: {
    helpText: `Isi deskripsi pendek yang cepat dipahami saat user sedang scanning. Ideal 12-20 kata, maksimal ${SHORT_DESCRIPTION_MAX_LENGTH} karakter.`,
    usage: "Muncul di kartu daftar dan ringkasan detail.",
  },
  slug: {
    helpText: "Slug adalah bagian akhir URL. Gunakan huruf kecil, angka, dan tanda hubung.",
    usage: "Dipakai sebagai URL publik konten.",
    example: "program-magang-jepang",
  },
  subtitle: {
    helpText: "Tambahkan kalimat pendukung di bawah judul.",
    usage: "Muncul di hero atau bagian pembuka halaman.",
  },
  tag_option_ids: {
    helpText: "Pilih satu atau beberapa tag agar konten bisa dikelompokkan lebih detail.",
    usage: "Muncul di filter publik dan halaman detail.",
  },
  thumbnail_image_id: {
    helpText: "Pilih gambar kecil yang kuat untuk kartu daftar.",
    usage: "Muncul di kartu, list, dan beberapa section homepage.",
  },
  gallery_media_ids: {
    helpText: "Pilih satu atau beberapa gambar dari media library.",
    usage: "Muncul sebagai galeri foto di halaman detail lowongan.",
  },
  title: {
    helpText: "Isi judul utama yang akan dilihat pengunjung.",
    usage: "Muncul di kartu, daftar, detail, dan preview.",
    requiredForPublish: true,
  },
  whatsapp_message_template: {
    helpText: "Tulis pesan awal yang akan masuk ke WhatsApp saat tombol diklik.",
    usage: "Muncul sebagai isi pesan otomatis ke admin.",
    example: "Halo, saya tertarik dengan {program_title}.",
  },
};

const GUIDANCE_BY_KIND: Partial<Record<CollectionField["kind"], CmsFieldGuidance>> = {
  array: {
    helpText: "Tambahkan beberapa item, lalu atur urutannya sesuai kebutuhan tampilan.",
  },
  "content-blocks": {
    helpText: "Tambahkan blok konten sesuai urutan baca yang diinginkan.",
  },
  date: {
    helpText: "Pilih tanggal dengan format kalender.",
  },
  document: {
    helpText: "Pilih dokumen yang sudah diunggah ke media.",
  },
  media: {
    helpText: "Pilih media dari library. Crop akan mengikuti kebutuhan field ini.",
  },
  "media-array": {
    helpText: "Tambahkan beberapa gambar dari media library.",
  },
  multiselect: {
    helpText: "Pilih satu atau beberapa opsi yang paling sesuai.",
  },
  select: {
    helpText: "Pilih satu opsi yang paling sesuai.",
  },
  "string-array": {
    helpText: "Tambahkan poin satu per satu. Setiap baris akan tampil sebagai item terpisah.",
  },
  switch: {
    helpText: "Aktifkan jika item ini perlu ditampilkan atau digunakan.",
  },
};

export function getCmsSectionTitle(title: string) {
  return SECTION_LABELS[title] ?? translateCmsTerm(title);
}

export function getCmsCollectionLabel(label: string) {
  return COLLECTION_LABELS[label] ?? translateCmsTerm(label);
}

export function getCmsCollectionPluralLabel(label: string) {
  return COLLECTION_PLURAL_LABELS[label] ?? getCmsCollectionLabel(label);
}

export function getCmsCollectionEyebrow(label: string) {
  return COLLECTION_EYEBROWS[label] ?? label;
}

export function getCmsFilterLabel(path: string, label: string) {
  return FIELD_LABELS_BY_PATH[path] ?? translateCmsTerm(label);
}

export function getCmsPublishStatusLabel(status: PublishStatus | string) {
  const labels: Record<string, string> = {
    CLOSED: "Ditutup",
    DRAFT: "Draft",
    FILLED: "Terisi",
    PUBLISHED: "Terbit",
  };

  return labels[status] ?? status;
}

export function getCmsFieldLabel(field: CollectionField) {
  return FIELD_LABELS_BY_PATH[field.path] ?? translateCmsTerm(field.label);
}

export function getCmsItemLabel(label?: string) {
  return label ? translateCmsTerm(label) : "item";
}

export function getCmsAddLabel(
  field: Extract<CollectionField, { kind: "array" | "string-array" | "media-array" }>,
) {
  return field.addLabel
    ? translateCmsTerm(field.addLabel)
    : `Tambah ${getCmsItemLabel(field.itemLabel)}`;
}

export function getCmsEmptyLabel(field: CollectionField) {
  if (field.kind === "content-blocks") {
    return "Belum ada blok konten.";
  }

  return "Belum ada item.";
}

export function getCmsPlaceholder(field: CollectionField) {
  return (
    PLACEHOLDERS_BY_PATH[field.path] ??
    ("placeholder" in field ? field.placeholder : undefined)
  );
}

export function getCmsStaticOptionLabel(label: string) {
  return STATIC_OPTION_LABELS[label] ?? translateCmsTerm(label);
}

export function getCmsFieldGuidance(field: CollectionField): CmsFieldGuidance | null {
  const guidance = {
    ...GUIDANCE_BY_KIND[field.kind],
    ...GUIDANCE_BY_PATH[field.path],
    helpText: field.helpText ?? GUIDANCE_BY_PATH[field.path]?.helpText ?? GUIDANCE_BY_KIND[field.kind]?.helpText,
    usage: field.usage ?? GUIDANCE_BY_PATH[field.path]?.usage ?? GUIDANCE_BY_KIND[field.kind]?.usage,
    example: field.example ?? GUIDANCE_BY_PATH[field.path]?.example ?? GUIDANCE_BY_KIND[field.kind]?.example,
    requiredForPublish:
      field.requiredForPublish ??
      GUIDANCE_BY_PATH[field.path]?.requiredForPublish ??
      GUIDANCE_BY_KIND[field.kind]?.requiredForPublish,
  };

  return guidance.helpText || guidance.usage || guidance.example || guidance.requiredForPublish
    ? guidance
    : null;
}

export function getCmsBlockTypeLabel(type: string) {
  const labels: Record<string, string> = {
    heading: "Judul bagian",
    paragraph: "Paragraf",
    quote: "Kutipan",
    image: "Gambar",
    youtube_embed: "Video YouTube",
    offer_callout: "Tombol penawaran",
    whatsapp_cta: "Tombol WhatsApp",
    line_cta: "Tombol LINE",
    sector_callout: "Tombol sektor",
  };

  return labels[type] ?? translateCmsTerm(type);
}

function translateCmsTerm(value: string) {
  return TERM_LABELS[value] ?? value;
}
