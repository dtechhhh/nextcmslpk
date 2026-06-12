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
  throw new Error("DATABASE_URL is required to update Indonesia program content.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
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

function json(value: Record<string, unknown>): Prisma.InputJsonObject {
  return value as Prisma.InputJsonObject;
}

function item(title: string, description: string, sortOrder: number) {
  return {
    title,
    description,
    sort_order: sortOrder,
    is_enabled: true,
  };
}

function step(title: string, description: string, sortOrder: number, iconKey = "check") {
  return {
    icon_key: iconKey,
    title,
    description,
    sort_order: sortOrder,
    is_enabled: true,
  };
}

function textItem(text: string, sortOrder: number) {
  return {
    text,
    sort_order: sortOrder,
    is_enabled: true,
  };
}

function cost(title: string, amountLabel: string, sortOrder: number) {
  return {
    title,
    amount_label: amountLabel,
    sort_order: sortOrder,
    is_enabled: true,
  };
}

function faq(question: string, answer: string, sortOrder: number) {
  return {
    question,
    answer,
    sort_order: sortOrder,
    is_enabled: true,
  };
}

function comparison(
  title: string,
  bestFor: string,
  preparation: string,
  note: string,
  sortOrder: number,
) {
  return {
    title,
    best_for: bestFor,
    preparation,
    note,
    sort_order: sortOrder,
    is_enabled: true,
  };
}

type OptionLookup = Record<string, Record<string, string>>;

type ProgramDefinition = {
  title: string;
  slug: string;
  isFeatured: boolean;
  sortOrder: number;
  options: {
    programType: string;
    gender: string;
    education: string;
    language: string;
  };
  minAge: number;
  maxAge: number;
  subtitle: string;
  shortDescription: string;
  overview: string;
  duration: string;
  capacity: string;
  contract: string;
  salary: string;
  targetLanguage: string;
  visaPath: string;
  highlight: string;
  requirements: ReturnType<typeof textItem>[];
  benefits: ReturnType<typeof textItem>[];
  why: ReturnType<typeof item>[];
  curriculum: ReturnType<typeof item>[];
  timeline: ReturnType<typeof step>[];
  costs: ReturnType<typeof cost>[];
  careers: ReturnType<typeof item>[];
  legality: ReturnType<typeof item>[];
  faqs: ReturnType<typeof faq>[];
  ctaLabel: string;
  whatsappMessage: string;
};

function updateProgramPageData(value: unknown) {
  const current = record(value);
  const hero = record(current.hero);
  const finalCta = record(current.final_cta);

  return {
    ...current,
    hero: {
      ...hero,
      headline: "Pilih Jalur Persiapan Jepang yang Sesuai",
      subheadline:
        "Bandingkan jalur Magang, Tokutei Ginou, Gijinkoku, Kaigo, dan Ryugakusei berdasarkan profil, target bahasa, dan kesiapanmu. Tim HIT membantu membaca pilihan yang paling masuk akal sebelum kamu mengambil keputusan.",
      primary_cta_label: "Konsultasi Pilihan Program",
      primary_cta_whatsapp_message:
        "Halo Hashimoto Indo Trust, saya ingin konsultasi untuk memilih jalur program Jepang yang paling sesuai dengan usia, pendidikan, kemampuan bahasa, dan tujuan saya.",
      secondary_cta_label: "Bandingkan Program",
    },
    stats: [
      {
        icon_key: "layout_list",
        value: "5 Jalur",
        label: "Pilihan kerja dan studi Jepang",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "briefcase",
        value: "17 Tahun",
        label: "Pengalaman kerja pendiri di Jepang",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "award",
        value: "JLPT N1",
        label: "Arah belajar dipantau pengajar berkompetensi",
        sort_order: 2,
        is_enabled: true,
      },
    ],
    program_comparison: {
      title: "Bandingkan Jalur Sebelum Memilih",
      description:
        "Setiap program punya tujuan, syarat, dan ritme persiapan yang berbeda. Gunakan ringkasan ini sebagai titik awal, lalu konsultasikan profilmu untuk mengecek kecocokan lebih rinci.",
      items: [
        comparison(
          "Visa Magang",
          "Lulusan SMA/SMK atau pemula yang ingin membangun pengalaman kerja dari dasar.",
          "Bahasa Jepang dasar, disiplin kerja, dokumen awal, dan kesiapan interview.",
          "Cocok untuk mulai dari nol, tetapi tetap melalui seleksi dan kebutuhan perusahaan.",
          0,
        ),
        comparison(
          "Tokutei Ginou",
          "Kandidat yang siap mengejar skill test dan ingin kontrak kerja lebih profesional.",
          "Target bahasa setara N4, latihan sektor kerja, interview, dan dokumen SSW.",
          "Lebih kuat jika sudah punya dasar bahasa, pengalaman kerja, atau sektor tujuan jelas.",
          1,
        ),
        comparison(
          "Gijinkoku",
          "Lulusan D3/S1 atau profesional dengan bidang yang relevan dengan kebutuhan perusahaan.",
          "CV/rirekisho, bahasa bisnis dasar, portofolio, dan interview profesional.",
          "Bukan jalur paling ringan untuk pemula; kecocokan pendidikan dan pekerjaan sangat penting.",
          2,
        ),
        comparison(
          "Kaigo",
          "Kandidat yang tertarik pada bidang caregiver dan siap bekerja dengan empati serta fisik yang stabil.",
          "Bahasa N4, kosakata kaigo, etika pelayanan, dan simulasi aktivitas perawatan.",
          "Perlu komitmen kuat karena pekerjaan menuntut ketelitian, kesabaran, dan komunikasi.",
          3,
        ),
        comparison(
          "Ryugakusei",
          "Calon siswa yang ingin studi bahasa Jepang sebagai fondasi sebelum opsi karir berikutnya.",
          "Bahasa dasar, dokumen sekolah bahasa, rencana biaya, dan aturan visa pelajar.",
          "Ini jalur studi, bukan janji kerja langsung; rencana biaya dan tujuan lanjut perlu jelas.",
          4,
        ),
      ],
    },
    faq: [
      faq(
        "Bagaimana cara tahu program mana yang cocok untuk saya?",
        "Mulai dari usia, pendidikan terakhir, kemampuan bahasa Jepang saat ini, pengalaman kerja, kondisi kesehatan, dan tujuanmu. Dari situ tim HIT dapat membantu membandingkan jalur yang paling realistis untuk dipersiapkan.",
        0,
      ),
      faq(
        "Apakah saya harus sudah bisa bahasa Jepang?",
        "Tidak selalu. Program pemula dapat dimulai dari dasar, tetapi beberapa jalur seperti Tokutei Ginou, Kaigo, dan Gijinkoku akan lebih kuat jika kamu punya target bahasa yang jelas dan siap belajar intensif.",
        1,
      ),
      faq(
        "Apakah konsultasi berarti saya langsung harus mendaftar?",
        "Tidak. Konsultasi awal dipakai untuk memahami profil, pilihan program, estimasi proses, dan komponen biaya sebelum kamu dan keluarga mengambil keputusan.",
        2,
      ),
    ],
    final_cta: {
      ...finalCta,
      headline: "Masih Ragu Memilih Jalur?",
      description:
        "Ceritakan usia, pendidikan, kemampuan bahasa, pengalaman kerja, dan tujuanmu. Tim HIT akan membantu membaca program yang paling sesuai tanpa memaksa kamu langsung mendaftar.",
      cta_label: "Konsultasi Kecocokan Program",
      whatsapp_message_template:
        "Halo Hashimoto Indo Trust, saya ingin konsultasi kecocokan program. Profil saya: usia ..., pendidikan ..., kemampuan bahasa Jepang ..., pengalaman kerja ..., tujuan ke Jepang ...",
    },
  };
}

function sharedWhy() {
  return [
    item(
      "Asesmen profil sejak awal",
      "Kamu tidak langsung diarahkan ke satu jalur. Tim HIT membaca usia, pendidikan, bahasa, pengalaman, dan tujuan agar pilihan program lebih masuk akal.",
      0,
    ),
    item(
      "Belajar bahasa sekaligus sikap kerja",
      "Materi tidak berhenti pada kosakata. Peserta dibiasakan dengan ketepatan waktu, instruksi kerja, pelaporan, dan komunikasi yang dibutuhkan di lingkungan Jepang.",
      1,
    ),
    item(
      "Pendampingan dokumen dan interview",
      "HIT membantu peserta memahami dokumen dasar, alur seleksi, serta cara menjawab interview dengan lebih siap dan terarah.",
      2,
    ),
  ];
}

function sharedTimeline(programSpecificStep: string) {
  return [
    step(
      "Konsultasi dan cek profil",
      "Peserta menyampaikan usia, pendidikan, kemampuan bahasa, pengalaman, kondisi kesehatan, dan tujuan ke Jepang.",
      0,
      "clipboard_check",
    ),
    step(
      "Rencana belajar dan dokumen awal",
      programSpecificStep,
      1,
      "book_open",
    ),
    step(
      "Evaluasi kesiapan dan simulasi interview",
      "Perkembangan bahasa, sikap belajar, dan kesiapan komunikasi dievaluasi sebelum masuk proses seleksi atau pengajuan berikutnya.",
      2,
      "messages_square",
    ),
    step(
      "Seleksi, matching, dan persiapan akhir",
      "Peserta mengikuti proses sesuai jalur. Hasil akhir tetap mengikuti kebutuhan mitra, kelengkapan dokumen, kesehatan, dan keputusan pihak terkait.",
      3,
      "send",
    ),
  ];
}

function sharedCosts(programName: string) {
  return [
    cost("Konsultasi awal", "Gratis untuk cek kecocokan profil", 0),
    cost("Biaya pelatihan", `Dijelaskan resmi setelah profil dan jalur ${programName} dipastikan`, 1),
    cost("Biaya dokumen dan tes", "Mengikuti kebutuhan program, dokumen pribadi, medical check-up, dan tes yang berlaku", 2),
    cost("Biaya luar program", "Paspor, ujian, tiket, akomodasi, atau kebutuhan pribadi dijelaskan terpisah bila relevan", 3),
  ];
}

function sharedLegality() {
  return [
    item(
      "PT Hashimoto Indo Trust",
      "Pendampingan dilakukan oleh badan usaha Indonesia yang dapat diperiksa legalitasnya melalui NIB dan AHU pada halaman Tentang Kami.",
      0,
    ),
    item(
      "Proses sesuai jalur program",
      "Dokumen, seleksi, dan komunikasi peluang mengikuti ketentuan jalur visa, kebutuhan perusahaan atau sekolah, serta pihak terkait.",
      1,
    ),
    item(
      "Informasi sebelum keputusan",
      "Komponen biaya, pihak yang terlibat, dan tahapan proses dijelaskan sebelum peserta mengambil keputusan pendaftaran.",
      2,
    ),
  ];
}

const programs: ProgramDefinition[] = [
  {
    title: "Program Visa Magang",
    slug: "program-visa-magang",
    isFeatured: true,
    sortOrder: 0,
    options: {
      programType: "Magang",
      gender: "Laki-laki & Perempuan",
      education: "SMA/SMK",
      language: "Tanpa Level Bahasa",
    },
    minAge: 18,
    maxAge: 30,
    subtitle: "Jalur pemula untuk membangun bahasa, karakter kerja, dan pengalaman industri di Jepang.",
    shortDescription:
      "Persiapan visa magang untuk lulusan SMA/SMK atau pemula yang ingin memulai dari dasar.",
    overview:
      "Program Visa Magang cocok untuk calon peserta yang ingin membangun fondasi kerja Jepang secara bertahap. Fokus persiapan mencakup bahasa Jepang dasar, kedisiplinan, kebiasaan kerja, dokumen awal, dan latihan interview.\n\nJalur ini menarik untuk pemula karena proses belajarnya bisa dimulai dari dasar. Namun peserta tetap perlu menunjukkan perkembangan, kesehatan yang baik, komitmen belajar, dan kesiapan mengikuti seleksi perusahaan.",
    duration: "Persiapan 6-12 bulan",
    capacity: "Kelas kecil per batch",
    contract: "Kontrak magang teknis sesuai perusahaan",
    salary: "Estimasi bruto JPY 150.000 - 180.000/bulan mengikuti lowongan",
    targetLanguage: "Target N4 sebelum keberangkatan",
    visaPath: "Technical Intern Training Program",
    highlight: "Cocok untuk lulusan SMA/SMK atau fresh graduate",
    requirements: [
      textItem("Usia 18-30 tahun dan minimal lulusan SMA/SMK atau sederajat.", 0),
      textItem("Sehat jasmani dan rohani, serta siap mengikuti pemeriksaan kesehatan bila dibutuhkan.", 1),
      textItem("Bersedia belajar bahasa Jepang dari dasar sampai target program.", 2),
      textItem("Memiliki disiplin, izin keluarga, dan komitmen mengikuti proses sampai selesai.", 3),
    ],
    benefits: [
      textItem("Rencana belajar bahasa Jepang dasar sampai target N4.", 0),
      textItem("Pembiasaan disiplin, etika kerja, dan cara menerima instruksi.", 1),
      textItem("Simulasi interview dan pendampingan dokumen awal.", 2),
      textItem("Arahan memahami budaya kerja dan kehidupan harian di Jepang.", 3),
    ],
    why: sharedWhy(),
    curriculum: [
      item("Bahasa Jepang dasar sampai target N4", "Hiragana, katakana, kosakata kerja, pola kalimat dasar, percakapan harian, dan latihan pemahaman instruksi.", 0),
      item("Budaya kerja dan kedisiplinan Jepang", "Pembiasaan waktu, laporan sederhana, etika di tempat kerja, keselamatan dasar, dan tanggung jawab dalam tim.", 1),
      item("Interview dan orientasi keberangkatan", "Latihan memperkenalkan diri, menjawab motivasi kerja, memahami kontrak, dan mengenali kehidupan awal di Jepang.", 2),
    ],
    timeline: sharedTimeline(
      "Peserta mulai dari kelas bahasa dasar, pembiasaan karakter kerja, dan persiapan dokumen awal sesuai arahan program.",
    ),
    costs: sharedCosts("Magang"),
    careers: [
      item("Manufaktur dan perakitan", "Peluang mengikuti kebutuhan perusahaan pada bidang produksi, perakitan, atau pekerjaan teknis dasar.", 0),
      item("Pengolahan makanan", "Persiapan untuk bidang produksi makanan, kebersihan kerja, dan standar operasional dasar.", 1),
      item("Bidang kerja lain sesuai lowongan", "Pilihan sektor mengikuti kebutuhan mitra dan hasil seleksi, bukan pilihan sepihak dari peserta.", 2),
    ],
    legality: sharedLegality(),
    faqs: [
      faq("Apakah program Magang bisa mulai dari nol?", "Bisa. Jalur ini paling ramah untuk pemula, selama peserta siap mengikuti ritme belajar, disiplin kelas, dan evaluasi perkembangan.", 0),
      faq("Berapa lama sampai siap seleksi?", "Umumnya persiapan membutuhkan beberapa bulan. Durasi nyata bergantung pada kemampuan awal, kehadiran, perkembangan bahasa, dan kesiapan dokumen.", 1),
      faq("Apakah gaji yang tertulis sudah pasti?", "Angka gaji adalah kisaran bruto yang mengikuti lowongan dan perusahaan. Nominal bersih dapat berbeda karena wilayah, potongan, asrama, pajak, asuransi, dan aturan perusahaan.", 2),
    ],
    ctaLabel: "Konsultasi Program Magang",
    whatsappMessage:
      "Halo Hashimoto Indo Trust, saya tertarik dengan Program Visa Magang. Mohon bantu cek kecocokan profil, syarat, estimasi proses, dan biaya yang perlu saya siapkan.",
  },
  {
    title: "Program Visa Tokutei Ginou",
    slug: "program-visa-tokutei-ginou",
    isFeatured: true,
    sortOrder: 1,
    options: {
      programType: "Tokutei Ginou",
      gender: "Laki-laki & Perempuan",
      education: "SMA/SMK",
      language: "N5",
    },
    minAge: 18,
    maxAge: 35,
    subtitle: "Persiapan jalur kerja SSW untuk kandidat yang siap mengejar bahasa, skill test, dan interview.",
    shortDescription:
      "Persiapan Tokutei Ginou untuk kandidat yang ingin masuk jalur kerja dengan target bahasa dan skill test.",
    overview:
      "Program Visa Tokutei Ginou disiapkan untuk peserta yang ingin mengejar jalur kerja Specified Skilled Worker. Fokus utamanya adalah memperkuat bahasa Jepang, memahami sektor tujuan, mengenal pola skill test, dan menyiapkan interview kerja.\n\nJalur ini lebih cocok untuk peserta yang siap belajar intensif dan memiliki arah sektor yang jelas. Pengalaman kerja atau dasar bahasa akan menjadi nilai tambah, tetapi perkembangan selama pelatihan tetap menjadi faktor penting.",
    duration: "Persiapan 6-12 bulan",
    capacity: "Kelas kecil per batch",
    contract: "Kontrak kerja SSW dapat diperpanjang sesuai aturan",
    salary: "Estimasi bruto JPY 170.000 - 220.000/bulan mengikuti lowongan",
    targetLanguage: "Target minimal N4 atau JFT Basic A2",
    visaPath: "Specified Skilled Worker / Tokutei Ginou",
    highlight: "Untuk kandidat yang siap bahasa, skill test, dan interview kerja",
    requirements: [
      textItem("Usia 18-35 tahun dan minimal lulusan SMA/SMK atau sederajat.", 0),
      textItem("Siap mengejar target bahasa setara N4 atau JFT Basic A2.", 1),
      textItem("Bersedia mempelajari materi skill test sesuai sektor tujuan.", 2),
      textItem("Sehat jasmani dan rohani, disiplin, serta siap mengikuti proses seleksi.", 3),
    ],
    benefits: [
      textItem("Arahan memilih sektor Tokutei Ginou yang mendekati profil peserta.", 0),
      textItem("Latihan bahasa, interview, dan pola soal skill test.", 1),
      textItem("Pendampingan dokumen dasar dan pemahaman alur SSW.", 2),
      textItem("Evaluasi kesiapan sebelum masuk proses matching atau lowongan.", 3),
    ],
    why: sharedWhy(),
    curriculum: [
      item("Bahasa Jepang menuju N4/JFT Basic A2", "Latihan kosakata kerja, percakapan, pemahaman instruksi, dan komunikasi dasar di tempat kerja.", 0),
      item("Pengenalan skill test sektor tujuan", "Materi diarahkan pada sektor yang dibidik, seperti kaigo, restoran, perhotelan, manufaktur, atau pengolahan makanan.", 1),
      item("Interview kerja dan business manner", "Latihan motivasi kerja, pengalaman, rencana kerja, salam, respons, dan etika komunikasi dengan perusahaan Jepang.", 2),
    ],
    timeline: sharedTimeline(
      "Peserta menyusun target bahasa dan sektor, lalu mengikuti latihan bahasa, pengenalan skill test, dan dokumen dasar SSW.",
    ),
    costs: sharedCosts("Tokutei Ginou"),
    careers: [
      item("Restoran dan perhotelan", "Peluang mengikuti kebutuhan bidang layanan, dapur, housekeeping, atau operasional hotel sesuai lowongan.", 0),
      item("Kaigo atau caregiver", "Dapat diarahkan ke sektor kaigo jika peserta siap dengan bahasa, empati, dan karakter pelayanan.", 1),
      item("Manufaktur dan pengolahan makanan", "Persiapan untuk bidang produksi, pengolahan, dan pekerjaan operasional sesuai kebutuhan perusahaan.", 2),
    ],
    legality: sharedLegality(),
    faqs: [
      faq("Apa beda Tokutei Ginou dengan Magang?", "Tokutei Ginou adalah jalur kerja SSW yang biasanya menuntut kesiapan bahasa dan skill test lebih jelas. Magang lebih cocok untuk membangun pengalaman dari dasar.", 0),
      faq("Apakah wajib punya sertifikat bahasa?", "Target umumnya setara N4 atau JFT Basic A2. Kebutuhan dokumen dan bukti kemampuan dapat berbeda menurut sektor dan lowongan.", 1),
      faq("Apakah bisa memilih sektor sendiri?", "Peserta boleh menyampaikan minat, tetapi kecocokan akhir mengikuti profil, kemampuan, hasil belajar, dokumen, dan kebutuhan lowongan yang tersedia.", 2),
    ],
    ctaLabel: "Konsultasi Tokutei Ginou",
    whatsappMessage:
      "Halo Hashimoto Indo Trust, saya tertarik dengan Program Tokutei Ginou. Mohon bantu cek sektor yang cocok, target bahasa, skill test, estimasi proses, dan biaya.",
  },
  {
    title: "Program Visa Gijinkoku",
    slug: "program-visa-gijinkoku",
    isFeatured: true,
    sortOrder: 2,
    options: {
      programType: "Gijinkoku",
      gender: "Laki-laki & Perempuan",
      education: "D3/S1",
      language: "N4",
    },
    minAge: 21,
    maxAge: 38,
    subtitle: "Jalur persiapan kerja profesional untuk kandidat dengan pendidikan dan skill yang relevan.",
    shortDescription:
      "Persiapan Gijinkoku untuk lulusan D3/S1 atau profesional yang ingin membangun peluang kerja sesuai bidang.",
    overview:
      "Program Visa Gijinkoku diarahkan untuk kandidat dengan latar pendidikan D3/S1 atau pengalaman profesional yang relevan. Fokus persiapan mencakup penyusunan profil kerja, CV/rirekisho, komunikasi bisnis dasar, dan latihan interview sesuai bidang.\n\nJalur ini bukan sekadar program bahasa. Kecocokan jurusan, pengalaman, jenis pekerjaan, dan kemampuan komunikasi akan sangat menentukan apakah profil kandidat layak diproses lebih jauh.",
    duration: "Persiapan 6-10 bulan",
    capacity: "Kelas kecil dan konsultatif",
    contract: "Kontrak profesional sesuai bidang",
    salary: "Estimasi bruto JPY 200.000 - 280.000/bulan mengikuti lowongan",
    targetLanguage: "Target N3 atau komunikasi bisnis dasar",
    visaPath: "Engineer / Specialist in Humanities / International Services",
    highlight: "Untuk lulusan D3/S1 dan profesional dengan bidang yang relevan",
    requirements: [
      textItem("Usia 21-38 tahun dengan pendidikan D3/S1 atau pengalaman profesional yang relevan.", 0),
      textItem("Memiliki bidang, jurusan, atau skill yang dapat dihubungkan dengan pekerjaan tujuan.", 1),
      textItem("Siap memperkuat bahasa Jepang menuju komunikasi kerja dasar sampai menengah.", 2),
      textItem("Bersedia menyiapkan CV/rirekisho, dokumen pendidikan, dan portofolio bila diperlukan.", 3),
    ],
    benefits: [
      textItem("Konsultasi kesesuaian pendidikan, pengalaman, dan jalur visa profesional.", 0),
      textItem("Pendampingan CV/rirekisho dan cerita pengalaman kerja.", 1),
      textItem("Latihan interview profesional dan komunikasi bisnis dasar.", 2),
      textItem("Arahan dokumen untuk proses kerja sesuai bidang.", 3),
    ],
    why: [
      item("Fokus pada kecocokan profil", "Gijinkoku membutuhkan hubungan yang masuk akal antara pendidikan, pengalaman, dan pekerjaan yang dituju. HIT membantu membaca kecocokan itu sejak awal.", 0),
      item("Persiapan dokumen profesional", "Peserta diarahkan menyiapkan CV/rirekisho, riwayat pendidikan, pengalaman, dan portofolio yang mudah dipahami pihak Jepang.", 1),
      item("Latihan interview sesuai bidang", "Simulasi tidak hanya soal motivasi, tetapi juga cara menjelaskan skill, pengalaman, dan kontribusi kerja.", 2),
    ],
    curriculum: [
      item("Bahasa Jepang bisnis dasar", "Salam, email sederhana, pelaporan, keigo dasar, dan respons dalam situasi kerja profesional.", 0),
      item("CV/rirekisho dan portofolio", "Penyusunan riwayat pendidikan, pengalaman, skill, pencapaian, dan alasan melamar secara lebih rapi.", 1),
      item("Simulasi interview profesional", "Latihan menjawab pertanyaan bidang kerja, studi kasus sederhana, dan ekspektasi perusahaan Jepang.", 2),
    ],
    timeline: sharedTimeline(
      "Peserta memetakan jurusan, pengalaman, dokumen pendidikan, CV/rirekisho, dan target komunikasi kerja.",
    ),
    costs: sharedCosts("Gijinkoku"),
    careers: [
      item("Engineering dan technical staff", "Peluang untuk kandidat teknik atau skill profesional yang sesuai kebutuhan perusahaan.", 0),
      item("Interpreter atau administrasi bilingual", "Cocok untuk kandidat dengan kemampuan bahasa dan komunikasi lintas budaya yang kuat.", 1),
      item("Hospitality dan layanan internasional", "Dapat dipertimbangkan jika pendidikan, pengalaman, dan kemampuan komunikasi mendukung.", 2),
    ],
    legality: sharedLegality(),
    faqs: [
      faq("Apakah Gijinkoku cocok untuk pemula?", "Tidak selalu. Jalur ini lebih cocok untuk lulusan D3/S1 atau kandidat dengan skill yang bisa dihubungkan dengan pekerjaan profesional di Jepang.", 0),
      faq("Apakah jurusan harus sama dengan pekerjaan?", "Semakin relevan jurusan atau pengalaman dengan pekerjaan tujuan, semakin kuat profil kandidat. Detailnya perlu dicek dari dokumen dan kebutuhan lowongan.", 1),
      faq("Apakah harus N3?", "Target idealnya N3 atau komunikasi bisnis dasar. Namun kebutuhan bahasa dapat berbeda menurut posisi dan perusahaan.", 2),
    ],
    ctaLabel: "Konsultasi Gijinkoku",
    whatsappMessage:
      "Halo Hashimoto Indo Trust, saya tertarik dengan Program Gijinkoku. Mohon bantu cek kecocokan jurusan, pengalaman, bahasa, dokumen, estimasi proses, dan biaya.",
  },
  {
    title: "Program Kaigo (Caregiver)",
    slug: "program-kaigocaregiver",
    isFeatured: false,
    sortOrder: 3,
    options: {
      programType: "Tokutei Ginou",
      gender: "Laki-laki & Perempuan",
      education: "SMA/SMK",
      language: "N5",
    },
    minAge: 18,
    maxAge: 35,
    subtitle: "Program khusus caregiver untuk peserta yang siap belajar bahasa, empati, dan dasar perawatan lansia.",
    shortDescription:
      "Persiapan kaigo untuk calon caregiver yang ingin bekerja di fasilitas perawatan lansia Jepang.",
    overview:
      "Program Kaigo (Caregiver) membantu peserta memahami dasar komunikasi, etika pelayanan, dan kebiasaan kerja di fasilitas perawatan lansia Jepang. Jalur ini cocok untuk peserta yang memiliki empati, kesabaran, dan kesiapan fisik yang baik.\n\nSelain bahasa Jepang, peserta perlu memahami cara merespons kebutuhan lansia, menjaga keselamatan, bekerja dalam tim, dan mengikuti instruksi dengan teliti.",
    duration: "Persiapan 8-12 bulan",
    capacity: "Kelas kecil per batch",
    contract: "Kontrak kerja caregiver Jepang",
    salary: "Estimasi bruto JPY 160.000 - 210.000/bulan mengikuti lowongan",
    targetLanguage: "Target N4 + kosakata kaigo dasar",
    visaPath: "Tokutei Ginou Kaigo / Caregiver",
    highlight: "Untuk kandidat yang siap berkarir di bidang perawatan lansia",
    requirements: [
      textItem("Usia 18-35 tahun dan minimal lulusan SMA/SMK atau sederajat.", 0),
      textItem("Siap belajar bahasa Jepang menuju N4 dan kosakata kaigo.", 1),
      textItem("Memiliki empati, kesabaran, ketelitian, dan kondisi fisik yang mendukung.", 2),
      textItem("Bersedia mengikuti latihan pelayanan, komunikasi, dan budaya kerja fasilitas perawatan.", 3),
    ],
    benefits: [
      textItem("Materi bahasa Jepang dasar dengan kosakata kaigo.", 0),
      textItem("Pengenalan etika merawat lansia dan komunikasi empatik.", 1),
      textItem("Simulasi aktivitas harian di fasilitas perawatan.", 2),
      textItem("Arahan skill test, interview, dan dokumen sesuai jalur kaigo.", 3),
    ],
    why: [
      item("Fokus khusus bidang kaigo", "Materi diarahkan pada komunikasi, karakter pelayanan, dan situasi kerja yang sering muncul di fasilitas lansia.", 0),
      item("Bahasa yang relevan dengan pekerjaan", "Peserta tidak hanya belajar bahasa umum, tetapi juga instruksi, laporan, dan ungkapan yang dekat dengan pekerjaan caregiver.", 1),
      item("Pembiasaan empati dan ketelitian", "Kaigo membutuhkan kesabaran, respons yang tenang, dan perhatian pada keselamatan. Hal ini dibiasakan sejak masa persiapan.", 2),
    ],
    curriculum: [
      item("Kosakata dan percakapan kaigo", "Latihan ungkapan dasar untuk membantu lansia, melapor ke staf, memahami instruksi, dan menjaga komunikasi sopan.", 0),
      item("Etika pelayanan dan keselamatan", "Pengenalan sikap kerja, privasi, kebersihan, keselamatan, serta cara berkomunikasi dengan lansia.", 1),
      item("Simulasi aktivitas harian", "Latihan situasi sederhana seperti pendampingan aktivitas, pelaporan kondisi, dan kerja sama di fasilitas perawatan.", 2),
    ],
    timeline: sharedTimeline(
      "Peserta membangun bahasa dasar, kosakata kaigo, etika pelayanan, dan kesiapan mengikuti evaluasi bidang caregiver.",
    ),
    costs: sharedCosts("Kaigo"),
    careers: [
      item("Caregiver di fasilitas lansia", "Peluang mengikuti kebutuhan fasilitas perawatan lansia sesuai hasil seleksi dan kesiapan bahasa.", 0),
      item("Asisten perawatan harian", "Persiapan untuk mendukung aktivitas harian, komunikasi, kebersihan, dan keselamatan pengguna layanan.", 1),
      item("Staf pendukung fasilitas kaigo", "Peran dapat berbeda menurut fasilitas, wilayah, kemampuan bahasa, dan kebutuhan perusahaan.", 2),
    ],
    legality: sharedLegality(),
    faqs: [
      faq("Apakah Kaigo harus punya pengalaman merawat?", "Pengalaman merawat menjadi nilai tambah, tetapi yang paling penting adalah kesiapan belajar, empati, kondisi fisik, dan kemampuan mengikuti instruksi.", 0),
      faq("Apa tantangan utama program Kaigo?", "Bahasa, kesabaran, ketelitian, dan kesiapan menghadapi pekerjaan pelayanan. Karena itu persiapan tidak hanya teori, tetapi juga karakter kerja.", 1),
      faq("Apakah Kaigo termasuk Tokutei Ginou?", "Ya, kaigo dapat masuk jalur Tokutei Ginou sektor caregiver dengan kebutuhan bahasa dan evaluasi bidang yang perlu dipenuhi.", 2),
    ],
    ctaLabel: "Konsultasi Program Kaigo",
    whatsappMessage:
      "Halo Hashimoto Indo Trust, saya tertarik dengan Program Kaigo. Mohon bantu cek kecocokan profil, target bahasa, skill test, estimasi proses, dan biaya.",
  },
  {
    title: "Program Ryugakusei",
    slug: "program-ryugakusei",
    isFeatured: false,
    sortOrder: 4,
    options: {
      programType: "Kelas Bahasa",
      gender: "Laki-laki & Perempuan",
      education: "SMA/SMK",
      language: "N5",
    },
    minAge: 18,
    maxAge: 30,
    subtitle: "Jalur persiapan studi bahasa Jepang untuk membangun fondasi sebelum langkah karir berikutnya.",
    shortDescription:
      "Persiapan bahasa, dokumen, dan orientasi hidup untuk calon siswa sekolah bahasa di Jepang.",
    overview:
      "Program Ryugakusei ditujukan untuk calon siswa yang ingin memperkuat bahasa Jepang melalui sekolah bahasa. Fokusnya adalah kemampuan bahasa dasar, dokumen studi, rencana biaya, mental hidup mandiri, dan pemahaman aturan visa pelajar.\n\nJalur ini bukan jalur kerja langsung. Peserta perlu memiliki tujuan studi yang jelas, kesiapan biaya, serta rencana lanjutan setelah kemampuan bahasa berkembang.",
    duration: "Persiapan 6-12 bulan",
    capacity: "Kelas kecil per batch",
    contract: "Persiapan studi bahasa Jepang",
    salary: "Part-time hanya jika memenuhi aturan visa pelajar",
    targetLanguage: "Target N5-N4 sebelum sekolah bahasa",
    visaPath: "Student Visa / Ryugakusei",
    highlight: "Untuk calon siswa yang ingin membangun fondasi bahasa Jepang",
    requirements: [
      textItem("Usia 18-30 tahun dan minimal lulusan SMA/SMK atau sederajat.", 0),
      textItem("Memiliki tujuan studi dan rencana lanjutan yang dapat dijelaskan.", 1),
      textItem("Siap menyiapkan dokumen pendidikan, keuangan, dan penjamin sesuai kebutuhan sekolah.", 2),
      textItem("Bersedia memahami aturan visa pelajar, sekolah, biaya hidup, dan batas kerja part-time.", 3),
    ],
    benefits: [
      textItem("Kelas bahasa Jepang dasar menuju N5-N4.", 0),
      textItem("Arahan dokumen sekolah bahasa dan visa pelajar.", 1),
      textItem("Orientasi biaya hidup, aturan part-time, dan budaya belajar di Jepang.", 2),
      textItem("Konsultasi rencana lanjut studi atau karir setelah sekolah bahasa.", 3),
    ],
    why: [
      item("Rencana studi lebih jelas", "Peserta dibantu memahami tujuan sekolah bahasa, kesiapan biaya, dan opsi lanjutan agar keputusan tidak hanya berdasarkan keinginan berangkat.", 0),
      item("Bahasa dasar sebelum masuk sekolah", "Persiapan awal membantu peserta lebih siap mengikuti kelas, aktivitas harian, dan komunikasi dasar saat tiba di Jepang.", 1),
      item("Orientasi hidup mandiri", "Peserta dikenalkan pada aturan visa pelajar, kehidupan harian, part-time sesuai aturan, dan tanggung jawab selama studi.", 2),
    ],
    curriculum: [
      item("Bahasa Jepang dasar", "Hiragana, katakana, kosakata harian, pola kalimat dasar, percakapan sekolah, dan latihan kebiasaan belajar.", 0),
      item("Dokumen sekolah dan visa pelajar", "Pengenalan dokumen pendidikan, keuangan, penjamin, formulir, dan alur komunikasi dengan sekolah.", 1),
      item("Orientasi biaya dan aturan part-time", "Pembahasan biaya hidup, batas kerja part-time, disiplin sekolah, dan risiko jika melanggar aturan visa.", 2),
    ],
    timeline: sharedTimeline(
      "Peserta menyusun rencana studi, belajar bahasa dasar, dan menyiapkan dokumen sekolah bahasa serta visa pelajar.",
    ),
    costs: [
      cost("Konsultasi awal", "Gratis untuk cek tujuan studi dan kesiapan profil", 0),
      cost("Biaya pelatihan bahasa", "Dijelaskan resmi setelah kebutuhan kelas dan target bahasa dipastikan", 1),
      cost("Biaya sekolah dan visa", "Mengikuti ketentuan sekolah bahasa, dokumen, COE/visa, dan kebutuhan administrasi", 2),
      cost("Biaya hidup dan keberangkatan", "Akomodasi, tiket, biaya hidup awal, dan kebutuhan pribadi perlu dihitung sejak awal", 3),
    ],
    careers: [
      item("Siswa sekolah bahasa Jepang", "Fokus utama program adalah mempersiapkan masuk sekolah bahasa dan mengikuti aturan studi.", 0),
      item("Part-time sesuai aturan visa", "Part-time hanya dapat dilakukan jika memenuhi izin dan batas jam kerja yang berlaku.", 1),
      item("Opsi lanjut studi atau kerja", "Pilihan setelah sekolah bahasa bergantung pada perkembangan bahasa, dokumen, kesempatan, dan aturan yang berlaku.", 2),
    ],
    legality: sharedLegality(),
    faqs: [
      faq("Apakah Ryugakusei sama dengan program kerja?", "Tidak. Ryugakusei adalah jalur studi bahasa. Opsi kerja setelahnya perlu direncanakan sesuai kemampuan, aturan visa, dan kesempatan yang tersedia.", 0),
      faq("Apakah boleh part-time di Jepang?", "Boleh hanya jika memenuhi izin dan aturan visa pelajar. Jam kerja, jenis pekerjaan, dan prioritas sekolah harus dipahami sejak awal.", 1),
      faq("Apa yang paling penting sebelum memilih Ryugakusei?", "Tujuan studi, kemampuan biaya, dokumen penjamin, kesiapan hidup mandiri, dan rencana setelah sekolah bahasa.", 2),
    ],
    ctaLabel: "Konsultasi Ryugakusei",
    whatsappMessage:
      "Halo Hashimoto Indo Trust, saya tertarik dengan Program Ryugakusei. Mohon bantu cek kesiapan studi, dokumen, estimasi biaya, dan rencana lanjut di Jepang.",
  },
];

async function ensureOptionValue(
  tenantId: string,
  variantId: string,
  optionSetKey: string,
  optionSetLabel: string,
  label: string,
  sortOrder: number,
) {
  const optionSet = await prisma.optionSet.upsert({
    where: {
      variantId_key: {
        variantId,
        key: optionSetKey,
      },
    },
    update: {
      label: optionSetLabel,
    },
    create: {
      tenantId,
      variantId,
      key: optionSetKey,
      label: optionSetLabel,
    },
    select: {
      id: true,
    },
  });

  const value = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

  const existingByLabel = await prisma.optionValue.findMany({
    where: {
      optionSetId: optionSet.id,
      label,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
    },
  });

  if (existingByLabel.length > 0) {
    const [primary, ...duplicates] = existingByLabel;

    await prisma.optionValue.update({
      where: {
        id: primary.id,
      },
      data: {
        label,
        sortOrder,
        isActive: true,
      },
    });

    if (duplicates.length > 0) {
      await prisma.optionValue.updateMany({
        where: {
          id: {
            in: duplicates.map((duplicate) => duplicate.id),
          },
        },
        data: {
          isActive: false,
        },
      });
    }

    return primary.id;
  }

  const optionValue = await prisma.optionValue.upsert({
    where: {
      optionSetId_value: {
        optionSetId: optionSet.id,
        value: value || label,
      },
    },
    update: {
      label,
      sortOrder,
      isActive: true,
    },
    create: {
      optionSetId: optionSet.id,
      value: value || label,
      label,
      sortOrder,
      isActive: true,
    },
    select: {
      id: true,
      label: true,
    },
  });

  return optionValue.id;
}

async function buildOptionLookup(tenantId: string, variantId: string): Promise<OptionLookup> {
  const definitions = [
    {
      key: "program_type",
      label: "Jenis Program",
      values: ["Magang", "Tokutei Ginou", "Gijinkoku", "Kelas Bahasa"],
    },
    {
      key: "gender",
      label: "Gender",
      values: ["Laki-laki", "Perempuan", "Laki-laki & Perempuan"],
    },
    {
      key: "education_level",
      label: "Pendidikan",
      values: ["SMA/SMK", "D3", "S1", "D3/S1"],
    },
    {
      key: "language_level",
      label: "Level Bahasa Awal",
      values: ["Tanpa Level Bahasa", "N5", "N4", "N3", "N2", "N1"],
    },
  ];

  const lookup: OptionLookup = {};

  for (const definition of definitions) {
    lookup[definition.key] = {};
    for (const [index, label] of definition.values.entries()) {
      lookup[definition.key][label] = await ensureOptionValue(
        tenantId,
        variantId,
        definition.key,
        definition.label,
        label,
        index,
      );
    }

    const optionSet = await prisma.optionSet.findUnique({
      where: {
        variantId_key: {
          variantId,
          key: definition.key,
        },
      },
      select: {
        id: true,
      },
    });

    if (optionSet) {
      await prisma.optionValue.updateMany({
        where: {
          optionSetId: optionSet.id,
          label: {
            notIn: definition.values,
          },
        },
        data: {
          isActive: false,
        },
      });
    }
  }

  return lookup;
}

function programData(program: ProgramDefinition, optionLookup: OptionLookup, currentData: unknown) {
  const current = record(currentData);

  return {
    ...current,
    title: program.title,
    slug: program.slug,
    subtitle: program.subtitle,
    short_description: program.shortDescription,
    overview: program.overview,
    status: "PUBLISHED",
    primary_cta_label: program.ctaLabel,
    whatsapp_message_template: program.whatsappMessage,
    program_type_option_id: optionLookup.program_type[program.options.programType],
    gender_option_id: optionLookup.gender[program.options.gender],
    education_level_option_id: optionLookup.education_level[program.options.education],
    language_level_option_id: optionLookup.language_level[program.options.language],
    min_age: program.minAge,
    max_age: program.maxAge,
    duration_label: program.duration,
    capacity_label: program.capacity,
    contract_label: program.contract,
    salary_range_label: program.salary,
    target_language_label: program.targetLanguage,
    visa_path_label: program.visaPath,
    highlight_label: program.highlight,
    requirements: program.requirements,
    benefits: program.benefits,
    why_choose_items: program.why,
    curriculum_items: program.curriculum,
    timeline_items: program.timeline,
    cost_items: program.costs,
    career_opportunity_items: program.careers,
    legality_partner_items: program.legality,
    testimonials: [],
    faqs: program.faqs,
    brochure_enabled: false,
  };
}

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: {
      slug: targetTenantSlug,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!tenant) {
    throw new Error(`Tenant '${targetTenantSlug}' was not found.`);
  }

  const variant = await prisma.variant.findUnique({
    where: {
      tenantId_key: {
        tenantId: tenant.id,
        key: "indonesia",
      },
    },
    select: {
      id: true,
    },
  });

  if (!variant) {
    throw new Error("Indonesia variant was not found.");
  }

  const optionLookup = await buildOptionLookup(tenant.id, variant.id);
  const page = await prisma.contentPage.findUnique({
    where: {
      variantId_pageKey: {
        variantId: variant.id,
        pageKey: "program_page",
      },
    },
    select: {
      id: true,
      title: true,
      dataJson: true,
    },
  });

  if (!page) {
    throw new Error("Program page was not found.");
  }

  const currentPrograms = await prisma.contentItem.findMany({
    where: {
      variantId: variant.id,
      collectionKey: "program",
    },
    select: {
      id: true,
      slug: true,
      title: true,
      dataJson: true,
      thumbnailImageId: true,
      heroImageId: true,
    },
  });
  const bySlug = new Map(currentPrograms.map((item) => [item.slug, item]));

  const updatedPageData = updateProgramPageData(page.dataJson);
  const updatedPrograms = programs.map((program) => {
    const current = bySlug.get(program.slug);
    return {
      ...program,
      currentTitle: current?.title,
      dataJson: programData(program, optionLookup, current?.dataJson),
      thumbnailImageId: current?.thumbnailImageId,
      heroImageId: current?.heroImageId,
    };
  });

  const preview = {
    tenant: tenant.slug,
    page: {
      title: "Program Page",
      hero: record(updatedPageData.hero),
      stats: updatedPageData.stats,
      comparisonCount: record(updatedPageData.program_comparison).items
        ? (record(updatedPageData.program_comparison).items as unknown[]).length
        : 0,
    },
    programs: updatedPrograms.map((program) => ({
      title: program.title,
      slug: program.slug,
      subtitle: program.subtitle,
      shortDescription: program.shortDescription,
      requirements: program.requirements.length,
      curriculum: program.curriculum.length,
      testimonials: 0,
      faqs: program.faqs.length,
    })),
  };

  const outputPath = join(tmpdir(), `nextcms-indonesia-programs-${Date.now()}.json`);
  await writeFile(outputPath, JSON.stringify(preview, null, 2));
  console.log(`Preview written to ${outputPath}`);

  if (!shouldApply) {
    console.log("Dry run only. Re-run with --apply to update the database.");
    return;
  }

  await prisma.contentPage.update({
    where: {
      id: page.id,
    },
    data: {
      title: "Program",
      slug: "program",
      status: PublishStatus.PUBLISHED,
      dataJson: json(updatedPageData),
      publishedDataJson: json(updatedPageData),
    },
  });

  for (const program of updatedPrograms) {
    const dataJson = json(program.dataJson);
    await prisma.contentItem.upsert({
      where: {
        variantId_collectionKey_slug: {
          variantId: variant.id,
          collectionKey: "program",
          slug: program.slug,
        },
      },
      update: {
        title: program.title,
        excerpt: program.shortDescription,
        status: PublishStatus.PUBLISHED,
        isFeatured: program.isFeatured,
        sortOrder: program.sortOrder,
        dataJson,
        publishedDataJson: dataJson,
      },
      create: {
        tenantId: tenant.id,
        variantId: variant.id,
        collectionKey: "program",
        title: program.title,
        slug: program.slug,
        excerpt: program.shortDescription,
        status: PublishStatus.PUBLISHED,
        isFeatured: program.isFeatured,
        sortOrder: program.sortOrder,
        thumbnailImageId: program.thumbnailImageId,
        heroImageId: program.heroImageId,
        dataJson,
        publishedDataJson: dataJson,
      },
    });
  }

  console.log(`Updated program page and ${updatedPrograms.length} program items.`);
}

main()
  .catch((error) => {
    console.error("Failed to update Indonesia program content.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
