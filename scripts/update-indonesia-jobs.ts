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
  throw new Error("DATABASE_URL is required to update Indonesia job content.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const targetTenantSlug = readArgument("--tenant") || "hit";
const publishedAt = new Date("2026-06-13T00:00:00.000Z");
const expiresAt = new Date("2026-12-31T23:59:59.000Z");

const obsoleteJobSlugs = [
  "demo-job-operator-manufaktur-otomotif",
  "demo-job-pengolahan-makanan-beku",
  "demo-job-asisten-perawatan-lansia-kaigo",
  "demo-job-pertanian-rumah-kaca",
  "operator-produksi-komponen-otomotif-aichi",
  "staf-pengolahan-makanan-gifu",
  "care-worker-perawatan-lansia-fukuoka",
];

const managedJobSlugs = [
  "engineer-cad-konstruksi-osaka-gijinkoku",
  "engineer-cad-konstruksi-nara-gijinkoku",
  "magang-teknik-besi-welding-osaka",
];

const requiredOptionValues = {
  job_type: ["Magang"],
  job_field: ["Engineering/CAD", "Teknik Besi/Welding"],
  language_level: ["Belum dikonfirmasi"],
  education_level: ["Belum dikonfirmasi"],
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

function step(title: string, description: string, sortOrder: number) {
  return {
    icon_key: "check",
    title,
    description,
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

type JobDefinition = {
  title: string;
  slug: string;
  shortDescription: string;
  subtitle: string;
  options: {
    jobType: string;
    jobField: string;
    gender: string;
    language: string;
    education: string;
  };
  minAge: number;
  maxAge: number;
  location: string;
  salary: string;
  takeHome: string;
  salaryBasis: string;
  visa: string;
  contract: string;
  quota: string;
  deadline: string;
  certificate: string;
  experience: string;
  preparationHref: string;
  listingNotice: string;
  verification: string;
  employerDisclosure: string;
  employmentModel: string;
  hitRole: string;
  candidateFit: string[];
  overview: ReturnType<typeof item>[];
  description: string;
  responsibilities: string[];
  workConditions: ReturnType<typeof item>[];
  compensation: ReturnType<typeof item>[];
  employerBenefits: ReturnType<typeof item>[];
  requirements: string[];
  qualifications: ReturnType<typeof item>[];
  processRoles: ReturnType<typeof item>[];
  costs: ReturnType<typeof item>[];
  hitSupport: ReturnType<typeof item>[];
  recruitment: ReturnType<typeof step>[];
  faqs: ReturnType<typeof faq>[];
};

const pageDeadlineCopy =
  "Masa tampil disetel sampai 31 Desember 2026 atau sampai kuota terpenuhi. Jadwal interview dan keberangkatan tetap dikonfirmasi ulang karena dokumen Jepang dapat berubah.";

const sharedRealProcessRoles = [
  item(
    "Perusahaan atau lembaga penerima di Jepang",
    "Nama pihak Jepang tidak ditampilkan di halaman publik. Identitas dan dokumen pendukung dibuka bertahap setelah profil kandidat lolos screening awal dan kandidat memahami aturan kerahasiaan.",
    0,
  ),
  item(
    "Pihak pendukung di Jepang",
    "Untuk jalur tertentu dapat ada organisasi pengawas, administrasi, atau pendukung lain. Nama pihak tersebut tidak disebar publik dan dijelaskan pada tahap screening sesuai izin dari pihak Jepang.",
    1,
  ),
  item(
    "PT Hashimoto Indo Trust",
    "HIT menjadi pintu screening profil, pengecekan kesiapan bahasa/dokumen, dan pendampingan komunikasi awal. HIT bukan pemberi kerja dan tidak menjamin kelulusan, COE, visa, atau keberangkatan.",
    2,
  ),
  item(
    "Kandidat",
    "Kandidat wajib memberi data jujur, memahami estimasi gaji/potongan, membaca penjelasan tertulis, dan tidak melakukan pembayaran sebelum tujuan, penerima, dan ketentuan pembayaran jelas.",
    3,
  ),
];

const sharedCosts = [
  item(
    "Screening profil awal",
    "Pengiriman profil awal ke HIT tidak dipungut biaya dan tidak berarti kandidat otomatis melamar langsung ke perusahaan Jepang.",
    0,
  ),
  item(
    "Program persiapan",
    "Jika kandidat perlu penguatan bahasa, interview, atau dokumen, pilihan program dan biaya harus dijelaskan sebelum kandidat menyetujui.",
    1,
  ),
  item(
    "Biaya pihak ketiga",
    "Medical check-up, paspor, penerjemahan, ujian, visa, tiket, asuransi, atau kebutuhan lain bergantung jalur visa dan dijelaskan terpisah sebelum proses berlanjut.",
    2,
  ),
  item(
    "Aturan pembayaran",
    "Jangan membayar hanya berdasarkan janji lisan. Minta rincian nominal, tujuan pembayaran, penerima dana, bukti pembayaran, dan ketentuan pembatalan atau pengembalian dana.",
    3,
  ),
];

const sharedSupport = [
  item(
    "Pemeriksaan profil",
    "Usia, pendidikan, bahasa, pengalaman, portofolio, sertifikat, dan kesiapan dokumen diperiksa sebelum kandidat diarahkan ke jalur yang relevan.",
    0,
  ),
  item(
    "Persiapan interview",
    "Kandidat dibantu memahami pertanyaan dasar, cara menjelaskan pengalaman, etika interview Jepang, dan risiko miskomunikasi.",
    1,
  ),
  item(
    "Pemeriksaan dokumen",
    "Tim membantu mengecek kelengkapan awal. Keputusan penerimaan dokumen tetap berada pada pihak Jepang dan otoritas terkait.",
    2,
  ),
  item(
    "Pembekalan kerja Jepang",
    "Kandidat diarahkan memahami disiplin kerja, pelaporan, keselamatan, komunikasi, kontrak, serta batas informasi yang boleh disebarkan.",
    3,
  ),
];

const sharedRecruitment = [
  step("Screening profil awal", "HIT memeriksa kecocokan dasar sebelum membuka detail pihak Jepang yang bersifat terbatas.", 0),
  step("Penjelasan jalur dan kerahasiaan", "Kandidat menerima penjelasan status visa, estimasi kondisi kerja, dan alasan detail perusahaan tidak ditampilkan publik.", 1),
  step("Pemeriksaan dokumen dan kemampuan", "Bahasa, pendidikan, pengalaman, portofolio, dan kesiapan dokumen diperiksa sesuai jalur kerja.", 2),
  step("Seleksi pihak Jepang", "Keputusan interview, penerimaan, dan jadwal berada pada pihak Jepang setelah dokumen kandidat dinilai.", 3),
  step("Konfirmasi kondisi tertulis", "Kandidat membaca kondisi kerja, estimasi gaji/potongan, biaya, dan pihak yang terlibat sebelum menyetujui proses berikutnya.", 4),
  step("COE, visa, atau administrasi jalur", "Proses administrasi mengikuti jalur visa masing-masing. Terbitnya COE atau visa tidak dapat dijanjikan.", 5),
  step("Persiapan keberangkatan", "Jadwal final hanya ditetapkan setelah dokumen, izin, dan konfirmasi pihak terkait selesai.", 6),
];

const jobs: JobDefinition[] = [
  {
    title: "Engineer CAD Konstruksi - Osaka",
    slug: "engineer-cad-konstruksi-osaka-gijinkoku",
    subtitle: "Info real dari Jepang - nama perusahaan dirahasiakan di publik",
    shortDescription:
      "Peluang engineer/CAD operator jalur Gijinkoku di Osaka untuk kandidat D3/S1 atau sekolah kejuruan yang punya dasar gambar teknik, pengalaman arsitektur/konstruksi, dan bahasa Jepang kuat.",
    options: {
      jobType: "Full-time",
      jobField: "Engineering/CAD",
      gender: "Laki-laki & Perempuan",
      language: "N3",
      education: "S1",
    },
    minAge: 24,
    maxAge: 0,
    location: "Osaka (area detail dibuka setelah screening)",
    salary: "Estimasi JPY 250.000/bulan bruto",
    takeHome: "Estimasi take-home JPY 214.734/bulan",
    salaryBasis:
      "Estimasi dari dokumen awal: gaji dasar JPY 230.000 + tunjangan tempat tinggal JPY 20.000 sebelum pajak, asuransi, dan potongan lain.",
    visa: "Gijinkoku / Engineer-Specialist in Humanities-International Services",
    contract: "Kontrak kerja langsung; detail masa kontrak dan pembaruan dikonfirmasi pada tahap screening",
    quota: "3 orang (berdasarkan dokumen awal)",
    deadline: pageDeadlineCopy,
    certificate:
      "Tidak dicantumkan sebagai sertifikat wajib di dokumen awal; bukti pendidikan, pengalaman, dan kemampuan bahasa tetap perlu disiapkan.",
    experience:
      "Diutamakan lulusan arsitektur/konstruksi atau punya pengalaman kerja terkait. N2 lebih baik, N3 minimum untuk screening awal.",
    preparationHref: "/program",
    listingNotice:
      "Nama perusahaan Jepang dan alamat detail tidak ditampilkan di halaman publik. Informasi ini dibuka bertahap setelah screening profil, karena dokumen dari Jepang tidak boleh disebar bebas.",
    verification:
      "Dokumen awal dari pihak Jepang diterima 28 April 2026; jadwal interview dan keberangkatan perlu dikonfirmasi ulang.",
    employerDisclosure:
      "Perusahaan CAD/konstruksi di Osaka. Nama perusahaan, URL, dan alamat lengkap dirahasiakan di halaman publik.",
    employmentModel:
      "Jalur kerja profesional Gijinkoku untuk pekerjaan yang memakai pengetahuan teknik, gambar, dan administrasi konstruksi.",
    hitRole:
      "HIT menerima profil awal, mengecek kecocokan bahasa/pendidikan/pengalaman, lalu menjelaskan detail pihak Jepang setelah kandidat masuk tahap screening.",
    candidateFit: [
      "Punya pendidikan D3/S1 atau sekolah kejuruan yang relevan dengan arsitektur, konstruksi, teknik, atau gambar.",
      "Mampu membaca atau membuat gambar kerja/CAD, atau punya pengalaman administrasi pelaksanaan konstruksi.",
      "Memiliki kemampuan bahasa Jepang minimal setara N3; N2 lebih disukai.",
      "Siap menunjukkan portofolio, riwayat kerja, ijazah, dan bukti kemampuan bahasa secara bertahap.",
      "Memahami bahwa nama perusahaan dibuka setelah screening, bukan di halaman publik.",
    ],
    overview: [
      item("Status peluang", "Info ini berasal dari dokumen job awal pihak Jepang dan dapat dipakai untuk screening kandidat real.", 0),
      item("Kerahasiaan pihak Jepang", "Nama perusahaan tidak ditampilkan karena tidak boleh disebar publik. Detail dibuka setelah profil kandidat dinilai cocok.", 1),
      item("Kandidat prioritas", "Kandidat dengan kemampuan CAD, latar arsitektur/konstruksi, pengalaman kerja, dan bahasa Jepang kuat.", 2),
      item("Jadwal", "Dokumen awal mencantumkan interview online pada Mei 2026 dan rencana masuk Jepang Agustus 2026. Jadwal aktif perlu dikonfirmasi ulang.", 3),
    ],
    description:
      "Pekerjaan berfokus pada administrasi pelaksanaan dan pembuatan gambar kerja/CAD operator untuk proyek konstruksi. Kandidat perlu mampu menjelaskan pengalaman teknis, membaca instruksi, dan bekerja dengan standar komunikasi Jepang.",
    responsibilities: [
      "Membantu pembuatan atau pembaruan gambar kerja/CAD sesuai arahan tim Jepang.",
      "Mendukung administrasi pelaksanaan proyek dan koordinasi dokumen teknis.",
      "Mengecek detail gambar, ukuran, revisi, dan informasi teknis sebelum digunakan.",
      "Melaporkan progres, kendala, dan kebutuhan data kepada atasan.",
      "Menjaga kerahasiaan dokumen proyek dan informasi perusahaan.",
    ],
    workConditions: [
      item("Jam kerja", "Dokumen awal mencantumkan 08:00-17:00 termasuk istirahat 60 menit.", 0),
      item("Hari kerja", "Rata-rata 22 hari kerja per bulan dengan libur Sabtu, Minggu, Golden Week, dan akhir tahun sesuai kalender perusahaan.", 1),
      item("Lembur", "Dokumen awal menyebut ada lembur sekitar 20 jam per bulan, tetapi jumlah aktual tidak dijamin dan mengikuti kebutuhan perusahaan.", 2),
      item("Lokasi", "Osaka. Alamat detail tidak ditampilkan publik dan dijelaskan setelah screening.", 3),
    ],
    compensation: [
      item("Gaji bruto", "Estimasi JPY 250.000 per bulan dari dokumen awal, termasuk komponen tunjangan tempat tinggal.", 0),
      item("Potongan", "Estimasi potongan JPY 35.266 per bulan mencakup pajak, asuransi kesehatan, dan pensiun. Biaya asrama/utilitas dapat mengikuti kondisi aktual.", 1),
      item("Take-home pay", "Estimasi take-home JPY 214.734 per bulan. Angka ini bukan jaminan dan dapat berubah mengikuti pajak, asuransi, tempat tinggal, lembur, dan aturan perusahaan.", 2),
      item("Kenaikan", "Dokumen awal menyebut peluang kenaikan setahun sekali sekitar 3%, tetapi tetap mengikuti evaluasi dan kebijakan perusahaan.", 3),
    ],
    employerBenefits: [
      item("Tunjangan tempat tinggal", "Dokumen awal mencantumkan komponen JPY 20.000 per bulan sebagai tunjangan tempat tinggal.", 0),
      item("Transportasi", "Dokumen awal menyebut biaya perjalanan ditanggung penuh, perlu dikonfirmasi pada tahap screening.", 1),
      item("Cuti", "Dokumen awal menyebut cuti tahunan 10 hari pada tahun pertama.", 2),
      item("Asuransi sosial", "Estimasi potongan mencantumkan asuransi kesehatan dan pensiun Jepang.", 3),
    ],
    requirements: [
      "Lulus screening profil dan dokumen awal oleh HIT.",
      "Menyiapkan CV, ijazah, transkrip atau bukti pendidikan, portofolio/gambar kerja bila ada, dan sertifikat bahasa bila ada.",
      "Bersedia menjaga kerahasiaan nama perusahaan sampai tahap yang diizinkan.",
      "Memahami bahwa jadwal interview, kuota, dan estimasi gaji dapat berubah setelah konfirmasi Jepang.",
    ],
    qualifications: [
      item("Pendidikan", "D3/S1 atau sekolah kejuruan yang relevan dengan arsitektur, konstruksi, teknik, atau CAD.", 0),
      item("Bahasa Jepang", "N3 minimum untuk screening awal; N2 lebih disukai.", 1),
      item("Kemampuan teknis", "Pengalaman CAD, gambar konstruksi, administrasi proyek, atau pekerjaan arsitektur akan sangat membantu.", 2),
      item("Kesiapan dokumen", "Kandidat perlu menyiapkan bukti pendidikan dan riwayat kerja yang sesuai dengan jalur Gijinkoku.", 3),
    ],
    processRoles: sharedRealProcessRoles,
    costs: sharedCosts,
    hitSupport: sharedSupport,
    recruitment: sharedRecruitment,
    faqs: [
      faq("Mengapa nama perusahaan tidak ditampilkan?", "Karena dokumen pihak Jepang tidak boleh disebar bebas. Nama perusahaan dibuka bertahap setelah profil cocok dan kandidat memahami kerahasiaan informasi.", 0),
      faq("Apakah gaji ini pasti?", "Tidak. Semua nominal adalah estimasi dari dokumen awal dan dapat berubah setelah konfirmasi perusahaan, pajak, asuransi, tempat tinggal, dan lembur.", 1),
      faq("Saya belajar di LPK lain, apakah boleh ikut screening?", "Boleh. HIT dapat mengecek profil, bahasa, pengalaman, dan kesiapan dokumen meskipun kamu belajar di LPK lain.", 2),
    ],
  },
  {
    title: "Engineer CAD Konstruksi - Nara",
    slug: "engineer-cad-konstruksi-nara-gijinkoku",
    subtitle: "Info real dari Jepang - nama perusahaan dirahasiakan di publik",
    shortDescription:
      "Peluang engineer/CAD jalur Gijinkoku di Nara untuk kandidat laki-laki dengan kemampuan gambar konstruksi/CAD, lulusan universitas, bahasa Jepang N3+, dan kesiapan bekerja di lingkungan proyek.",
    options: {
      jobType: "Full-time",
      jobField: "Engineering/CAD",
      gender: "Laki-laki",
      language: "N3",
      education: "S1",
    },
    minAge: 24,
    maxAge: 0,
    location: "Nara (detail area dibuka setelah screening)",
    salary: "Estimasi JPY 228.800/bulan bruto",
    takeHome: "Estimasi take-home JPY 181.401/bulan",
    salaryBasis:
      "Estimasi dari dokumen awal: JPY 1.300/jam x 22 hari x 8 jam sebelum pajak, asuransi, asrama, utilitas, dan potongan lain.",
    visa: "Gijinkoku / Engineer-Specialist in Humanities-International Services",
    contract: "Kontrak kerja langsung; detail masa kontrak dan pembaruan dikonfirmasi pada tahap screening",
    quota: "1 orang laki-laki (berdasarkan dokumen awal)",
    deadline: pageDeadlineCopy,
    certificate:
      "Tidak dicantumkan sertifikat wajib di dokumen awal; bukti pendidikan, kemampuan gambar, dan bahasa Jepang perlu disiapkan.",
    experience:
      "Diutamakan kandidat yang bisa membuat gambar konstruksi/CAD. SIM menjadi nilai tambah bila dimiliki, tetapi bukan syarat utama.",
    preparationHref: "/program",
    listingNotice:
      "Nama perusahaan Jepang dan alamat detail tidak ditampilkan di halaman publik. Informasi ini dibuka bertahap setelah screening profil, karena dokumen dari Jepang tidak boleh disebar bebas.",
    verification:
      "Dokumen awal dari pihak Jepang diterima 17 April 2026; jadwal interview dan keberangkatan perlu dikonfirmasi ulang.",
    employerDisclosure:
      "Perusahaan konstruksi di Nara. Nama perusahaan, URL, dan alamat lengkap dirahasiakan di halaman publik.",
    employmentModel:
      "Jalur kerja profesional Gijinkoku untuk pekerjaan engineer/CAD yang memakai pengetahuan teknik dan gambar konstruksi.",
    hitRole:
      "HIT menerima profil awal, mengecek kecocokan bahasa/pendidikan/pengalaman, lalu menjelaskan detail pihak Jepang setelah kandidat masuk tahap screening.",
    candidateFit: [
      "Laki-laki usia 24 tahun ke atas sesuai dokumen awal.",
      "Lulusan universitas dengan kemampuan gambar konstruksi/CAD.",
      "Memiliki kemampuan bahasa Jepang percakapan minimal setara N3.",
      "Siap menunjukkan portofolio atau contoh pekerjaan gambar bila tersedia.",
      "Memiliki SIM menjadi nilai tambah bila ada.",
    ],
    overview: [
      item("Status peluang", "Info ini berasal dari dokumen job awal pihak Jepang dan dapat dipakai untuk screening kandidat real.", 0),
      item("Kerahasiaan pihak Jepang", "Nama perusahaan tidak ditampilkan karena tidak boleh disebar publik. Detail dibuka setelah profil kandidat dinilai cocok.", 1),
      item("Kandidat prioritas", "Kandidat dengan kemampuan gambar konstruksi, CAD, bahasa Jepang percakapan, dan latar pendidikan relevan.", 2),
      item("Jadwal", "Dokumen awal mencantumkan interview pertengahan Juni 2026 dan rencana masuk Jepang Oktober 2026. Jadwal aktif perlu dikonfirmasi ulang.", 3),
    ],
    description:
      "Pekerjaan berfokus pada pembuatan gambar CAD untuk konstruksi. Kandidat perlu memahami instruksi teknis, teliti terhadap ukuran/detail, dan mampu berkomunikasi dalam bahasa Jepang saat menerima arahan kerja.",
    responsibilities: [
      "Membuat atau memperbarui gambar CAD konstruksi berdasarkan arahan.",
      "Memeriksa detail gambar, ukuran, dan revisi sebelum diserahkan.",
      "Berkoordinasi dengan tim Jepang terkait kebutuhan data teknis.",
      "Mencatat perubahan, progres, dan kendala pekerjaan.",
      "Menjaga kerahasiaan dokumen proyek dan informasi pihak Jepang.",
    ],
    workConditions: [
      item("Jam kerja", "Dokumen awal mencantumkan 08:00-17:00 termasuk istirahat 60 menit.", 0),
      item("Hari kerja", "Rata-rata 22 hari kerja per bulan dengan libur Sabtu, Minggu, akhir tahun, dan libur perusahaan.", 1),
      item("Lokasi", "Nara. Area dan alamat detail tidak ditampilkan publik dan dijelaskan setelah screening.", 2),
      item("Lingkungan kerja", "Berhubungan dengan pekerjaan gambar konstruksi dan koordinasi proyek. Detail penempatan dikonfirmasi pada tahap screening.", 3),
    ],
    compensation: [
      item("Gaji bruto", "Estimasi JPY 228.800 per bulan dari dokumen awal.", 0),
      item("Potongan", "Estimasi potongan JPY 47.399 per bulan mencakup pajak, asuransi kesehatan, pensiun, dan biaya asrama. Utilitas dapat mengikuti biaya aktual.", 1),
      item("Take-home pay", "Estimasi take-home JPY 181.401 per bulan. Angka ini bukan jaminan dan dapat berubah mengikuti pajak, asuransi, asrama, utilitas, dan lembur.", 2),
      item("Bonus dan kenaikan", "Dokumen awal menyebut kenaikan ada dan bonus dapat mengikuti kinerja, tetapi nominal tidak dijamin.", 3),
    ],
    employerBenefits: [
      item("Asrama", "Dokumen awal mencantumkan estimasi biaya asrama JPY 15.000 per bulan.", 0),
      item("Libur", "Sabtu, Minggu, akhir tahun, dan kalender perusahaan; dokumen awal menyebut sekitar 120 hari libur per tahun.", 1),
      item("Tunjangan hari libur", "Dokumen awal menyebut ada tunjangan bila bekerja pada hari libur.", 2),
      item("Asuransi sosial", "Estimasi potongan mencantumkan asuransi kesehatan dan pensiun Jepang.", 3),
    ],
    requirements: [
      "Lulus screening profil dan dokumen awal oleh HIT.",
      "Menyiapkan CV, ijazah, transkrip atau bukti pendidikan, portofolio/gambar kerja bila ada, dan sertifikat bahasa bila ada.",
      "Bersedia menjaga kerahasiaan nama perusahaan sampai tahap yang diizinkan.",
      "Memahami bahwa jadwal interview, kuota, dan estimasi gaji dapat berubah setelah konfirmasi Jepang.",
    ],
    qualifications: [
      item("Pendidikan", "Lulusan universitas yang relevan dengan pekerjaan teknik, konstruksi, atau gambar.", 0),
      item("Bahasa Jepang", "Kemampuan percakapan minimal setara N3.", 1),
      item("Kemampuan teknis", "Mampu membuat gambar konstruksi/CAD.", 2),
      item("Tambahan", "SIM menjadi nilai tambah bila dimiliki.", 3),
    ],
    processRoles: sharedRealProcessRoles,
    costs: sharedCosts,
    hitSupport: sharedSupport,
    recruitment: sharedRecruitment,
    faqs: [
      faq("Apakah alamat perusahaan bisa diminta sekarang?", "Belum untuk publik. Detail perusahaan dan alamat dibuka setelah screening profil dan persetujuan alur informasi.", 0),
      faq("Apakah harus punya N3 resmi?", "Dokumen awal menekankan kemampuan percakapan N3+. Sertifikat membantu, tetapi kemampuan aktual tetap akan dicek.", 1),
      faq("Apakah angka take-home sudah final?", "Belum. Take-home adalah estimasi dari dokumen awal dan dapat berubah mengikuti potongan aktual, tempat tinggal, utilitas, dan lembur.", 2),
    ],
  },
  {
    title: "Magang Teknik Besi dan Welding - Osaka",
    slug: "magang-teknik-besi-welding-osaka",
    subtitle: "Info real jalur magang - detail perusahaan dan organisasi pengawas dirahasiakan",
    shortDescription:
      "Peluang magang Jepang bidang teknik besi/welding di Osaka untuk kandidat yang siap pekerjaan fabrikasi, pemotongan material, pengelasan, perakitan, dan finishing.",
    options: {
      jobType: "Magang",
      jobField: "Teknik Besi/Welding",
      gender: "Perempuan",
      language: "Belum dikonfirmasi",
      education: "Belum dikonfirmasi",
    },
    minAge: 18,
    maxAge: 0,
    location: "Osaka (detail area dibuka setelah screening)",
    salary: "Estimasi kompensasi dijelaskan saat screening",
    takeHome: "Estimasi take-home dirahasiakan di halaman publik",
    salaryBasis:
      "Dokumen awal memuat estimasi upah, potongan, dan take-home, tetapi angka khusus jalur magang tidak ditampilkan di halaman publik.",
    visa: "Gino Jisshu / Technical Intern Training / Magang Jepang",
    contract: "Masa magang 3 tahun berdasarkan dokumen awal",
    quota: "1 orang (berdasarkan dokumen awal; detail gender dikonfirmasi saat screening)",
    deadline: pageDeadlineCopy,
    certificate:
      "Syarat sertifikat dan level bahasa tidak ditulis rinci di dokumen awal; kesiapan bahasa, kesehatan, dan dokumen magang akan dicek saat screening.",
    experience:
      "Pengalaman praktik teknik, welding, fabrikasi, atau pekerjaan fisik terkait menjadi nilai tambah.",
    preparationHref: "/program",
    listingNotice:
      "Nama perusahaan penerima dan organisasi pengawas Jepang tidak ditampilkan di halaman publik. Detail dibuka bertahap setelah screening karena dokumen pihak Jepang tidak boleh disebar bebas.",
    verification:
      "Dokumen awal dari pihak Jepang diterima 28 April 2026; jadwal interview dan keberangkatan perlu dikonfirmasi ulang.",
    employerDisclosure:
      "Perusahaan fabrikasi/teknik besi di Osaka. Nama perusahaan, alamat lengkap, dan organisasi pengawas dirahasiakan di halaman publik.",
    employmentModel:
      "Jalur magang Jepang dengan perusahaan penerima dan organisasi pengawas. Detail pihak terkait dijelaskan setelah kandidat masuk screening.",
    hitRole:
      "HIT menerima profil awal, mengecek kesiapan bahasa/dokumen, dan menjelaskan alur magang tanpa membuka nama pihak Jepang di halaman publik.",
    candidateFit: [
      "Siap mengikuti jalur magang Jepang dan memahami bahwa statusnya berbeda dari Gijinkoku atau Tokutei Ginou.",
      "Siap bekerja di bidang teknik besi, pemotongan material, welding, perakitan, dan finishing.",
      "Memiliki dasar bahasa Jepang dan siap mengikuti pembekalan sebelum proses berlanjut.",
      "Sehat untuk pekerjaan fisik dan bersedia mengikuti pemeriksaan kesehatan bila diminta.",
      "Bersedia menjaga kerahasiaan nama perusahaan penerima dan organisasi pengawas sampai tahap yang diizinkan.",
    ],
    overview: [
      item("Status peluang", "Info ini berasal dari dokumen awal jalur magang Jepang dan dapat dipakai untuk screening kandidat real.", 0),
      item("Kerahasiaan pihak Jepang", "Nama perusahaan penerima dan organisasi pengawas tidak ditampilkan publik.", 1),
      item("Kandidat prioritas", "Kandidat yang sudah punya dasar bahasa atau pernah belajar di LPK lain tetap dapat mengirim profil untuk dicek.", 2),
      item("Masa magang", "Dokumen awal mencantumkan masa 3 tahun. Jadwal dan detail penerimaan dikonfirmasi ulang saat screening.", 3),
    ],
    description:
      "Pekerjaan magang berhubungan dengan fabrikasi besi, termasuk pemotongan dan pengolahan material, pengelasan, perakitan, dan pekerjaan finishing. Detail lokasi, pihak Jepang, dan estimasi kompensasi dibuka bertahap setelah screening.",
    responsibilities: [
      "Membantu pekerjaan pemotongan dan pengolahan material sesuai instruksi.",
      "Mengikuti pekerjaan welding atau perakitan sesuai batas pelatihan dan arahan.",
      "Menjaga keselamatan kerja, alat pelindung, dan kebersihan area.",
      "Melaporkan masalah kerja atau keselamatan kepada pembimbing.",
      "Mengikuti aturan perusahaan penerima dan organisasi pengawas.",
    ],
    workConditions: [
      item("Jam kerja", "Dokumen awal mencantumkan 08:00-17:00 termasuk istirahat 60 menit.", 0),
      item("Hari kerja", "Rata-rata 22 hari kerja per bulan dengan libur Minggu, hari libur nasional, Golden Week, libur musim panas, dan akhir tahun sesuai kalender perusahaan.", 1),
      item("Masa magang", "Dokumen awal mencantumkan masa 3 tahun.", 2),
      item("Lingkungan kerja", "Pekerjaan dapat melibatkan alat potong, welding, material berat, panas, percikan, dan kebutuhan alat pelindung.", 3),
    ],
    compensation: [
      item("Estimasi kompensasi", "Angka gaji untuk jalur magang tidak ditampilkan di halaman publik. Estimasi bruto, potongan, dan take-home dijelaskan saat screening.", 0),
      item("Potongan", "Dokumen awal memuat komponen seperti pajak, asuransi, pensiun, tempat tinggal, dan biaya aktual tertentu. Rincian dibuka pada tahap screening.", 1),
      item("Asrama dan utilitas", "Ketersediaan dan biaya tempat tinggal/utilitas harus dikonfirmasi tertulis sebelum kandidat menyetujui proses.", 2),
      item("Pembatalan", "Ketentuan biaya aktual atau pembatalan tidak boleh disimpulkan dari halaman publik dan harus dijelaskan tertulis sebelum kandidat lanjut.", 3),
    ],
    employerBenefits: [
      item("Asuransi magang", "Dokumen awal mencantumkan keikutsertaan asuransi untuk technical intern.", 0),
      item("Tempat tinggal", "Informasi tempat tinggal dibuka pada tahap screening dan harus dipahami sebelum kandidat menyetujui proses.", 1),
      item("Libur", "Libur mengikuti kalender perusahaan, termasuk hari libur nasional, GW, musim panas, dan akhir tahun.", 2),
      item("Pembimbingan", "Jalur magang melibatkan pihak penerima dan organisasi pengawas; nama pihak terkait tidak disebar publik.", 3),
    ],
    requirements: [
      "Lulus screening profil dan pemahaman jalur magang oleh HIT.",
      "Menyiapkan CV, riwayat pendidikan, riwayat pelatihan, sertifikat bahasa bila ada, dan dokumen identitas secara bertahap.",
      "Memahami perbedaan jalur magang dengan Gijinkoku atau Tokutei Ginou.",
      "Bersedia menjaga kerahasiaan nama perusahaan penerima dan organisasi pengawas.",
      "Tidak melakukan pembayaran sebelum menerima penjelasan tertulis mengenai tujuan, penerima, dan ketentuan biaya.",
    ],
    qualifications: [
      item("Bahasa Jepang", "Dasar bahasa Jepang dibutuhkan untuk keselamatan dan komunikasi kerja. Level final dikonfirmasi saat screening.", 0),
      item("Kesiapan fisik", "Pekerjaan teknik besi/welding membutuhkan kesehatan, disiplin keselamatan, dan kesiapan bekerja dengan alat.", 1),
      item("Pengalaman", "Pengalaman teknik, welding, fabrikasi, bengkel, atau praktik kerja terkait menjadi nilai tambah.", 2),
      item("Pemahaman jalur", "Kandidat perlu memahami bahwa ini jalur magang, bukan kontrak engineer Gijinkoku.", 3),
    ],
    processRoles: sharedRealProcessRoles,
    costs: sharedCosts,
    hitSupport: sharedSupport,
    recruitment: sharedRecruitment,
    faqs: [
      faq("Mengapa nama organisasi pengawas tidak ditampilkan?", "Karena nama perusahaan penerima dan organisasi pengawas dari dokumen Jepang tidak boleh disebar publik. Detail dibuka bertahap setelah screening.", 0),
      faq("Mengapa gaji magang tidak ditampilkan?", "Untuk jalur magang, angka kompensasi dan potongan dijelaskan saat screening agar tidak disalahsebar dan tidak dibaca sebagai jaminan publik.", 1),
      faq("Saya sudah belajar di LPK lain, apakah bisa ikut?", "Bisa. Kandidat yang sudah belajar di LPK lain dapat mengirim profil untuk dicek kecocokan jalur, bahasa, dan dokumennya.", 2),
    ],
  },
];

async function ensureOptionValues(variantId: string) {
  for (const [setKey, labels] of Object.entries(requiredOptionValues)) {
    const optionSet = await prisma.optionSet.findUnique({
      where: {
        variantId_key: {
          variantId,
          key: setKey,
        },
      },
      include: {
        values: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!optionSet) {
      throw new Error(`Option set '${setKey}' was not found.`);
    }

    const maxSortOrder = optionSet.values.reduce(
      (max, option) => Math.max(max, option.sortOrder),
      -1,
    );

    for (const [index, label] of labels.entries()) {
      await prisma.optionValue.upsert({
        where: {
          optionSetId_value: {
            optionSetId: optionSet.id,
            value: label,
          },
        },
        update: {
          label,
          isActive: true,
        },
        create: {
          optionSetId: optionSet.id,
          value: label,
          label,
          sortOrder: maxSortOrder + index + 1,
        },
      });
    }
  }
}

async function buildOptionLookup(variantId: string) {
  const optionSets = await prisma.optionSet.findMany({
    where: {
      variantId,
      key: { in: ["job_type", "job_field", "gender", "language_level", "education_level"] },
    },
    include: {
      values: {
        where: { isActive: true },
      },
    },
  });

  return optionSets.reduce<Record<string, Record<string, string>>>((lookup, optionSet) => {
    lookup[optionSet.key] = optionSet.values.reduce<Record<string, string>>((values, option) => {
      values[option.label] = option.id;
      return values;
    }, {});
    return lookup;
  }, {});
}

function requireOption(lookup: Record<string, Record<string, string>>, setKey: string, label: string) {
  const id = lookup[setKey]?.[label];
  if (!id) {
    throw new Error(`Option '${label}' in '${setKey}' was not found.`);
  }
  return id;
}

function addPreviewOptionValues(lookup: Record<string, Record<string, string>>) {
  for (const [setKey, labels] of Object.entries(requiredOptionValues)) {
    lookup[setKey] = lookup[setKey] ?? {};
    for (const label of labels) {
      lookup[setKey][label] = lookup[setKey][label] ?? `preview:${setKey}:${label}`;
    }
  }
}

function updateJobPageData(value: unknown) {
  const current = record(value);
  const hero = record(current.hero);
  const finalCta = record(current.final_cta);

  return {
    ...current,
    hero: {
      ...hero,
      headline: "Info Job dan Jalur Kerja Jepang",
      subheadline:
        "Temukan peluang kerja Jepang dari beberapa jalur visa, termasuk Gijinkoku, magang, dan peluang lain yang cocok untuk kandidat yang sudah belajar bahasa atau punya pengalaman kerja.",
      primary_cta_label: "Kirim Profil untuk Screening",
      primary_cta_whatsapp_message:
        "Halo Hashimoto Indo Trust, saya ingin screening profil untuk info job dan jalur kerja Jepang. Saya sudah belajar di ..., kemampuan bahasa saya ..., pengalaman saya ..., dan saya memahami bahwa screening tidak menjamin diterima.",
      secondary_cta_label: "Lihat Program Persiapan",
      secondary_cta_href: "/program",
    },
    information_notice: {
      eyebrow: "Pintu masuk screening job",
      headline: "Baca jalur visa, syarat, estimasi gaji, dan status informasi sebelum memilih",
      description:
        "Collection job ini menampilkan info peluang dari Jepang, bukan hanya satu jenis visa. Nama perusahaan, organisasi pengawas, atau pihak Jepang tertentu tidak selalu ditampilkan di halaman publik karena mengikuti aturan kerahasiaan dokumen. Semua nominal gaji bersifat estimasi dari dokumen awal, dan khusus jalur magang rincian kompensasi dibuka saat screening. Kandidat yang belajar di LPK lain tetap bisa mengirim profil untuk dicek kecocokannya.",
    },
    filter_config: {
      ...record(current.filter_config),
      enable_job_type_filter: true,
      enable_job_field_filter: true,
      enable_gender_filter: true,
      enable_language_filter: true,
    },
    faq: [
      faq(
        "Apakah info job di halaman ini hanya untuk Tokutei Ginou?",
        "Tidak. Collection job dipakai sebagai pintu masuk berbagai jalur kerja Jepang, termasuk Gijinkoku, magang, Tokutei Ginou, dan peluang lain bila tersedia.",
        0,
      ),
      faq(
        "Mengapa nama perusahaan Jepang tidak ditampilkan?",
        "Beberapa dokumen dari Jepang tidak boleh disebar bebas. Nama perusahaan, organisasi pengawas, alamat detail, atau pihak terkait dibuka bertahap setelah screening profil dan sesuai izin pihak Jepang.",
        1,
      ),
      faq(
        "Apakah gaji yang tertulis pasti diterima?",
        "Tidak. Semua angka gaji adalah estimasi dari dokumen awal. Take-home dapat berubah karena pajak, asuransi, tempat tinggal, utilitas, lembur, kurs, dan konfirmasi terbaru dari pihak Jepang.",
        2,
      ),
      faq(
        "Saya sudah belajar di LPK lain, apakah boleh ikut screening?",
        "Boleh. HIT dapat mengecek profil kandidat yang sudah belajar di tempat lain, terutama jika sudah punya dasar bahasa, pengalaman, sertifikat, atau dokumen yang relevan.",
        3,
      ),
    ],
    final_cta: {
      ...finalCta,
      headline: "Sudah punya dasar bahasa, pengalaman, atau pernah belajar di LPK lain?",
      description:
        "Kirim profil untuk screening awal. Tim HIT akan mengecek jalur yang paling masuk akal sebelum membuka detail pihak Jepang yang bersifat terbatas.",
      cta_label: "Kirim Profil via WhatsApp",
      whatsapp_message_template:
        "Halo Hashimoto Indo Trust, saya ingin screening profil untuk peluang kerja Jepang. Usia saya ..., pendidikan ..., kemampuan bahasa ..., pengalaman ..., pernah belajar di LPK ..., dan saya ingin tahu jalur yang cocok. Saya memahami screening tidak menjamin diterima.",
    },
  };
}

function buildJobData(
  job: JobDefinition,
  lookup: Record<string, Record<string, string>>,
  currentData: unknown,
) {
  return {
    ...record(currentData),
    title: job.title,
    slug: job.slug,
    subtitle: job.subtitle,
    short_description: job.shortDescription,
    overview:
      "Info ini dipublikasikan sebagai pintu screening awal. Detail pihak Jepang yang tidak boleh disebar publik akan dijelaskan bertahap setelah profil kandidat dinilai cocok.",
    status: "PUBLISHED",
    is_sample_listing: false,
    listing_notice_title: "INFORMASI AWAL - DETAIL PIHAK JEPANG DIBUKA BERTAHAP",
    listing_notice_description: job.listingNotice,
    verification_label: job.verification,
    visa_path_label: job.visa,
    employer_disclosure_label: job.employerDisclosure,
    employment_model_label: job.employmentModel,
    hit_role_label: job.hitRole,
    primary_cta_label: "Kirim Profil untuk Screening",
    whatsapp_message_template: `Halo Hashimoto Indo Trust, saya membaca info ${job.title}. Saya ingin mengirim profil untuk screening awal dan memahami bahwa nama pihak Jepang dibuka bertahap serta screening tidak menjamin diterima.`,
    preparation_cta_label: "Butuh Persiapan? Lihat Program",
    preparation_cta_href: job.preparationHref,
    job_type_option_id: requireOption(lookup, "job_type", job.options.jobType),
    job_field_option_id: requireOption(lookup, "job_field", job.options.jobField),
    gender_option_id: requireOption(lookup, "gender", job.options.gender),
    language_level_option_id: requireOption(lookup, "language_level", job.options.language),
    education_level_option_id: requireOption(lookup, "education_level", job.options.education),
    related_program_id: "",
    min_age: job.minAge,
    max_age: job.maxAge,
    certificate_required_label: job.certificate,
    experience_required_label: job.experience,
    ex_japan_required: false,
    required_documents: [
      "CV terbaru untuk screening awal",
      "Ringkasan kemampuan bahasa dan sertifikat yang dimiliki",
      "Ijazah, transkrip, portofolio, atau bukti pengalaman sesuai jalur",
      "KTP, paspor, dan dokumen sensitif diminta bertahap setelah tujuan penggunaannya dijelaskan",
    ],
    location_label: job.location,
    salary_label: job.salary,
    salary_range_label: job.salary,
    salary_basis_label: job.salaryBasis,
    estimated_take_home_label: job.takeHome,
    contract_label: job.contract,
    deadline_label: job.deadline,
    quota_label: job.quota,
    candidate_fit_items: job.candidateFit,
    overview_items: job.overview,
    job_description: job.description,
    responsibilities: job.responsibilities,
    work_condition_items: job.workConditions,
    compensation_items: job.compensation,
    employer_benefit_items: job.employerBenefits,
    requirements: job.requirements,
    qualification_items: job.qualifications,
    process_role_items: job.processRoles,
    cost_transparency_items: job.costs,
    benefits: [],
    benefit_items: job.hitSupport,
    recruitment_steps: job.recruitment,
    gallery_media_ids: [],
    faqs: job.faqs,
  };
}

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: targetTenantSlug },
    select: { id: true, slug: true },
  });

  if (!tenant) {
    throw new Error(`Tenant '${targetTenantSlug}' was not found.`);
  }

  const variant = await prisma.variant.findUnique({
    where: { tenantId_key: { tenantId: tenant.id, key: "indonesia" } },
    select: { id: true },
  });

  if (!variant) {
    throw new Error("Indonesia variant was not found.");
  }

  if (shouldApply) {
    await ensureOptionValues(variant.id);
  }

  const page = await prisma.contentPage.findUnique({
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "job_page" } },
    select: { id: true, dataJson: true },
  });

  if (!page) {
    throw new Error("Job page was not found.");
  }

  const lookup = await buildOptionLookup(variant.id);
  if (!shouldApply) {
    addPreviewOptionValues(lookup);
  }
  const existingItems = await prisma.contentItem.findMany({
    where: {
      variantId: variant.id,
      collectionKey: "job",
      slug: { in: [...obsoleteJobSlugs, ...managedJobSlugs] },
    },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      dataJson: true,
      thumbnailImageId: true,
      heroImageId: true,
    },
  });
  const bySlug = new Map(existingItems.map((item) => [item.slug, item]));
  const mediaFallbacks = [
    bySlug.get("operator-produksi-komponen-otomotif-aichi"),
    bySlug.get("staf-pengolahan-makanan-gifu"),
    bySlug.get("care-worker-perawatan-lansia-fukuoka"),
  ].filter(Boolean);

  const preparedJobs = jobs.map((job, index) => {
    const current = bySlug.get(job.slug);
    const mediaFallback = mediaFallbacks[index];
    return {
      ...job,
      dataJson: buildJobData(job, lookup, current?.dataJson),
      thumbnailImageId: current?.thumbnailImageId || mediaFallback?.thumbnailImageId,
      heroImageId: current?.heroImageId || mediaFallback?.heroImageId,
    };
  });

  const preview = {
    tenant: tenant.slug,
    removedSlugs: obsoleteJobSlugs,
    page: updateJobPageData(page.dataJson),
    jobs: preparedJobs.map((job) => ({
      title: job.title,
      slug: job.slug,
      status: "real_info",
      location: job.location,
      salary: job.salary,
      takeHome: job.takeHome,
      visa: job.visa,
      expiresAt: expiresAt.toISOString(),
    })),
  };

  const outputPath = join(tmpdir(), `nextcms-indonesia-jobs-${Date.now()}.json`);
  await writeFile(outputPath, JSON.stringify(preview, null, 2));
  console.log(`Preview written to ${outputPath}`);

  if (!shouldApply) {
    console.log("Dry run only. Re-run with --apply to update the database.");
    return;
  }

  const pageData = json(updateJobPageData(page.dataJson));
  await prisma.contentPage.update({
    where: { id: page.id },
    data: {
      title: "Info Job dan Jalur Kerja Jepang",
      slug: "job",
      status: PublishStatus.PUBLISHED,
      dataJson: pageData,
      publishedDataJson: pageData,
    },
  });

  for (const [index, job] of preparedJobs.entries()) {
    const dataJson = json(job.dataJson);
    await prisma.contentItem.upsert({
      where: {
        variantId_collectionKey_slug: {
          variantId: variant.id,
          collectionKey: "job",
          slug: job.slug,
        },
      },
      update: {
        title: job.title,
        excerpt: job.shortDescription,
        status: PublishStatus.PUBLISHED,
        isFeatured: index === 0,
        publishedAt,
        expiredAt: expiresAt,
        sortOrder: index + 1,
        thumbnailImageId: job.thumbnailImageId,
        heroImageId: job.heroImageId,
        dataJson,
        publishedDataJson: dataJson,
      },
      create: {
        tenantId: tenant.id,
        variantId: variant.id,
        collectionKey: "job",
        title: job.title,
        slug: job.slug,
        excerpt: job.shortDescription,
        status: PublishStatus.PUBLISHED,
        isFeatured: index === 0,
        publishedAt,
        expiredAt: expiresAt,
        sortOrder: index + 1,
        thumbnailImageId: job.thumbnailImageId,
        heroImageId: job.heroImageId,
        dataJson,
        publishedDataJson: dataJson,
      },
    });
  }

  const deleted = await prisma.contentItem.deleteMany({
    where: {
      variantId: variant.id,
      collectionKey: "job",
      slug: { in: obsoleteJobSlugs },
    },
  });

  console.log(
    `Updated job page, published ${preparedJobs.length} real job info items, and removed ${deleted.count} obsolete sample items.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to update Indonesia job content.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
