import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import {
  MediaStatus,
  MediaType,
  Prisma,
  PrismaClient,
  PublishStatus,
} from "../src/generated/prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed Japan sector demo data.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type Position = {
  title: string;
  duties: string;
  skills: string;
  tools: string;
  safety: string;
  standard: string;
};

type SectorSeed = {
  categoryValue: string;
  categoryLabel: string;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  overview: string;
  pathway: string;
  language: string;
  skillTest: string;
  leadTime: string;
  availableCandidates: number;
  batchCapacity: number;
  trainingDuration: string;
  simulatedPassRate: string;
  positions: Position[];
  technicalModules: Array<{ title: string; description: string }>;
  requirements: string[];
};

const sectors: SectorSeed[] = [
  {
    categoryValue: "caregiving",
    categoryLabel: "Perawatan Lansia",
    title: "Perawatan Lansia (介護)",
    slug: "perawatan-lansia",
    subtitle: "Pelatihan caregiver untuk komunikasi, mobilitas, dan dukungan aktivitas harian",
    summary: "Kandidat dilatih untuk mendampingi lansia dengan komunikasi hormat, prosedur keselamatan, dan pencatatan kondisi dasar.",
    overview: "Program simulasi ini memperlihatkan bagaimana kebutuhan fasilitas kaigo diterjemahkan menjadi latihan aktivitas harian, transfer tubuh, pencegahan jatuh, kebersihan, komunikasi, dan pelaporan. Kurikulum dapat disesuaikan setelah job description dan kondisi pengguna layanan diterima dari mitra.",
    pathway: "Specified Skilled Worker: Nursing Care / jalur lain sesuai regulasi",
    language: "Target operasional JLPT N4/JFT-Basic dan kosakata kaigo",
    skillTest: "Evaluasi internal kaigo dan persiapan tes bidang yang berlaku",
    leadTime: "8-12 minggu setelah kebutuhan dikonfirmasi",
    availableCandidates: 28,
    batchCapacity: 32,
    trainingDuration: "5-7 bulan",
    simulatedPassRate: "86%",
    positions: [
      { title: "Care Worker", duties: "Mendukung makan, berpakaian, mobilitas, kebersihan diri, dan aktivitas harian sesuai instruksi fasilitas.", skills: "Transfer tempat tidur-kursi, bantuan berjalan, observasi kondisi, komunikasi dengan lansia, dan pencatatan sederhana.", tools: "Kursi roda, walker, transfer belt, tempat tidur perawatan, dan alat ukur dasar.", safety: "Pencegahan jatuh, body mechanics, privasi pengguna layanan, dan kontrol infeksi.", standard: "Menyelesaikan simulasi bantuan aktivitas harian tanpa pelanggaran keselamatan kritis dan mencapai minimal 80 pada rubrik praktik." },
      { title: "Care Support Staff", duties: "Menyiapkan ruang, membantu distribusi makan, membersihkan area, dan mendukung kegiatan rekreasi.", skills: "Sanitasi, komunikasi sopan, pengaturan perlengkapan, dan respons terhadap perubahan kondisi.", tools: "Peralatan sanitasi, perlengkapan makan, alat bantu aktivitas, dan formulir cek.", safety: "Higiene tangan, pemisahan alat bersih-kotor, dan pelaporan insiden.", standard: "Lulus observasi kerja berurutan selama 60 menit dengan kepatuhan SOP minimal 90%." },
    ],
    technicalModules: [
      { title: "Aktivitas Kehidupan Sehari-hari", description: "Simulasi makan, berpakaian, kebersihan, mobilitas, dan transfer tubuh." },
      { title: "Komunikasi dan Dementia Care", description: "Bahasa kerja, komunikasi empatik, respons perilaku, dan pelaporan kondisi." },
    ],
    requirements: ["Kondisi fisik memadai untuk pekerjaan shift", "Mampu berkomunikasi dengan tenang dan hormat", "Bersedia mengikuti pemeriksaan kesehatan", "Lulus evaluasi dasar bahasa dan praktik"],
  },
  {
    categoryValue: "food-processing",
    categoryLabel: "Pengolahan Makanan",
    title: "Industri Pengolahan Makanan (飲食料品製造業)",
    slug: "pengolahan-makanan",
    subtitle: "Kesiapan operator produksi dengan fokus higiene, mutu, dan kecepatan lini",
    summary: "Pelatihan mencakup higiene pangan, penimbangan, pemotongan, pengemasan, inspeksi mutu, dan disiplin kerja lini produksi.",
    overview: "Program disusun untuk lingkungan pabrik makanan yang menuntut konsistensi, sanitasi, ketepatan berat, dan kepatuhan terhadap instruksi visual. Simulasi menggunakan target output, pemeriksaan cacat, pergantian produk, dan prosedur pembersihan area kerja.",
    pathway: "Specified Skilled Worker: Food and Beverage Manufacturing",
    language: "Target JFT-Basic/JLPT N4 dengan kosakata produksi pangan",
    skillTest: "Persiapan tes bidang dan evaluasi internal higiene-produksi",
    leadTime: "6-10 minggu setelah job profile diterima",
    availableCandidates: 42,
    batchCapacity: 48,
    trainingDuration: "4-6 bulan",
    simulatedPassRate: "91%",
    positions: [
      { title: "Food Production Operator", duties: "Menimbang bahan, menjalankan tahapan produksi, memantau visual produk, dan mencatat hasil kerja.", skills: "Penimbangan, pemotongan dasar, pengaturan alur bahan, inspeksi cacat, dan 5S.", tools: "Timbangan digital, pisau produksi, sealer, conveyor simulasi, dan termometer pangan.", safety: "HACCP dasar, alergi, kontaminasi silang, benda asing, dan keselamatan pisau.", standard: "Mencapai akurasi berat sesuai toleransi latihan, nol kontaminasi silang, dan output simulasi minimal 90% target." },
      { title: "Packing and Quality Check Staff", duties: "Memeriksa label, berat, segel, tanggal, bentuk produk, lalu mengemas sesuai standar.", skills: "Visual inspection, sampling, pelabelan, penghitungan, dan pelaporan produk tidak sesuai.", tools: "Check sheet, timbangan, labeler, metal detector simulator, dan alat ukur sederhana.", safety: "Pemisahan produk NG, ergonomi pengangkatan, dan kontrol area bersih.", standard: "Mengidentifikasi minimal 95% cacat simulasi dan menyelesaikan pengemasan tanpa salah label." },
    ],
    technicalModules: [
      { title: "Higiene dan HACCP Dasar", description: "Kebersihan personal, zona bersih-kotor, alergi, suhu, dan pencegahan kontaminasi." },
      { title: "Produksi, Packing, dan QC", description: "Penimbangan, proses lini, pemeriksaan cacat, sealing, label, dan pencatatan." },
    ],
    requirements: ["Mampu bekerja berdiri dan mengikuti tempo lini", "Tidak memiliki hambatan terhadap lingkungan dingin sesuai posisi", "Teliti membaca label dan angka", "Lulus tes higiene dan inspeksi visual"],
  },
  {
    categoryValue: "manufacturing",
    categoryLabel: "Manufaktur",
    title: "Manufaktur (工業製品製造業)",
    slug: "manufaktur",
    subtitle: "Operator produksi yang disiapkan untuk standard work, 5S, kualitas, dan keselamatan",
    summary: "Kandidat berlatih membaca instruksi kerja, menggunakan alat ukur dasar, merakit, memeriksa kualitas, dan menjaga ritme produksi.",
    overview: "Program manufaktur menekankan kemampuan mengikuti standard work, ketelitian dimensi, pelaporan abnormality, dan perbaikan sederhana. Materi dapat diarahkan ke assembly, press, injection, machining support, atau inspection sesuai kebutuhan mitra.",
    pathway: "Specified Skilled Worker: Industrial Product Manufacturing",
    language: "Target JFT-Basic/JLPT N4 dan instruksi keselamatan pabrik",
    skillTest: "Evaluasi praktik manufaktur dan persiapan tes bidang yang berlaku",
    leadTime: "6-10 minggu untuk shortlist awal",
    availableCandidates: 36,
    batchCapacity: 40,
    trainingDuration: "5-7 bulan",
    simulatedPassRate: "88%",
    positions: [
      { title: "Assembly Operator", duties: "Merakit komponen berdasarkan urutan kerja, mengencangkan sesuai standar, dan memeriksa hasil.", skills: "Standard work, torque control, visual inspection, kanban dasar, dan pencatatan output.", tools: "Torque wrench, hand tools, jig, caliper, dan check sheet.", safety: "LOTO awareness, pinch point, ergonomi, PPE, dan pelaporan abnormality.", standard: "Menyelesaikan siklus assembly sesuai urutan, tanpa defect kritis, dan mencapai cycle time latihan." },
      { title: "Production Quality Inspector", duties: "Memeriksa dimensi, visual, fungsi sederhana, serta memisahkan produk tidak sesuai.", skills: "Caliper, micrometer dasar, sampling, defect classification, dan traceability.", tools: "Vernier caliper, micrometer, gauge, lampu inspeksi, dan form QC.", safety: "Penanganan komponen tajam, area mesin, dan kontrol barang NG.", standard: "Akurasi pembacaan alat ukur minimal 90% dan deteksi defect simulasi minimal 95%." },
    ],
    technicalModules: [
      { title: "Standard Work dan 5S", description: "Urutan kerja, cycle time, visual management, housekeeping, dan kaizen dasar." },
      { title: "Assembly dan Quality Control", description: "Hand tools, torque, alat ukur, defect, traceability, dan pelaporan abnormality." },
    ],
    requirements: ["Mampu membaca angka dan instruksi visual", "Koordinasi tangan-mata yang baik", "Bersedia bekerja shift", "Lulus evaluasi alat ukur dan keselamatan"],
  },
  {
    categoryValue: "automotive-maintenance",
    categoryLabel: "Montir Kendaraan",
    title: "Montir Kendaraan / Jidosha Seibi (自動車整備)",
    slug: "montir-kendaraan-jidosha-seibi",
    subtitle: "Pelatihan inspeksi, perawatan berkala, diagnosis dasar, dan keselamatan bengkel",
    summary: "Kandidat disiapkan untuk pemeriksaan kendaraan, servis berkala, penggantian komponen, dan dokumentasi pekerjaan bengkel.",
    overview: "Kurikulum menggunakan alur penerimaan pekerjaan, inspeksi visual, servis berkala, penggunaan torque specification, dan final check. Penyesuaian dilakukan berdasarkan jenis kendaraan, alat bengkel, serta tingkat pekerjaan yang dibutuhkan mitra.",
    pathway: "Specified Skilled Worker: Automobile Repair and Maintenance",
    language: "Target JFT-Basic/JLPT N4 dan istilah teknis otomotif",
    skillTest: "Evaluasi internal bengkel dan persiapan tes bidang otomotif",
    leadTime: "10-14 minggu untuk kandidat siap interview",
    availableCandidates: 18,
    batchCapacity: 24,
    trainingDuration: "6-8 bulan",
    simulatedPassRate: "84%",
    positions: [
      { title: "Automotive Maintenance Assistant", duties: "Melakukan inspeksi harian, penggantian oli/filter, pemeriksaan rem, ban, lampu, dan fluida.", skills: "Checklist inspection, jack-up, torque, pengukuran keausan, dan pencatatan servis.", tools: "Lift/jack, torque wrench, multimeter, tire gauge, scanner dasar, dan hand tools.", safety: "Jack stand, chemical handling, hot surface, rotating parts, dan housekeeping bengkel.", standard: "Menyelesaikan periodic inspection sesuai checklist tanpa melewatkan item keselamatan dan torque kritis." },
      { title: "Workshop Service Technician", duties: "Membantu diagnosis dasar, pembongkaran komponen, penggantian part, dan final inspection.", skills: "Troubleshooting dasar, wiring diagram sederhana, brake service, battery test, dan parts control.", tools: "Diagnostic scanner, multimeter, brake tools, puller, dan service manual.", safety: "Isolasi baterai, vehicle lifting, fluid spill, dan tool accountability.", standard: "Menemukan penyebab pada skenario diagnosis dasar dan menyelesaikan pekerjaan tanpa kerusakan tambahan." },
    ],
    technicalModules: [
      { title: "Periodic Inspection", description: "Checklist kendaraan, rem, ban, fluida, lampu, baterai, dan final check." },
      { title: "Basic Diagnosis and Repair", description: "Kelistrikan dasar, scanner, troubleshooting, pembongkaran, torque, dan dokumentasi." },
    ],
    requirements: ["Memiliki minat dan dasar mekanik", "Mampu membedakan warna kabel dan indikator", "Kondisi fisik memadai untuk pekerjaan bengkel", "Lulus evaluasi tool safety dan periodic inspection"],
  },
  {
    categoryValue: "welding",
    categoryLabel: "Pengelasan",
    title: "Pengelasan (溶接)",
    slug: "pengelasan",
    subtitle: "Welder trainee dengan fokus joint preparation, parameter, kualitas, dan keselamatan",
    summary: "Pelatihan mencakup SMAW/GMAW dasar, persiapan sambungan, posisi las, inspeksi visual, dan pengendalian bahaya kerja panas.",
    overview: "Program pengelasan diarahkan pada repeatability dan keselamatan. Kandidat berlatih membaca simbol sederhana, menyiapkan material, mengatur parameter, menjaga bead, mengidentifikasi cacat, dan melakukan rework sesuai instruksi.",
    pathway: "Jalur manufaktur atau konstruksi sesuai job scope dan regulasi",
    language: "Target JFT-Basic/JLPT N4 dan istilah keselamatan pengelasan",
    skillTest: "Uji kupon praktik internal dan persiapan tes bidang terkait",
    leadTime: "10-16 minggu tergantung spesifikasi proses",
    availableCandidates: 16,
    batchCapacity: 20,
    trainingDuration: "6-9 bulan",
    simulatedPassRate: "82%",
    positions: [
      { title: "Production Welder", duties: "Menyiapkan joint, melakukan tack, pengelasan sesuai WPS latihan, membersihkan, dan memeriksa hasil.", skills: "SMAW/GMAW dasar, fillet joint, butt joint dasar, parameter setting, dan visual inspection.", tools: "Welding machine, grinder, clamp, chipping hammer, gauge, dan PPE lengkap.", safety: "Hot work permit, fire prevention, fumes, electrical safety, dan cylinder handling.", standard: "Kupon las memenuhi batas visual latihan untuk porosity, undercut, overlap, dan dimensi bead." },
      { title: "Fabrication Assistant", duties: "Mengukur, marking, memotong, fit-up, tack weld, dan membantu kontrol dimensi fabrikasi.", skills: "Reading drawing dasar, measurement, cutting, fit-up, squareness, dan distortion control.", tools: "Tape, square, grinder, cutting tool, clamp, dan welding jig.", safety: "Spark direction, guarding, material handling, dan housekeeping area panas.", standard: "Fit-up sesuai toleransi latihan dan tidak ada pelanggaran keselamatan kritis selama fabrikasi." },
    ],
    technicalModules: [
      { title: "Joint Preparation and Welding Process", description: "Material preparation, fit-up, tack, parameter, bead control, dan posisi las." },
      { title: "Inspection and Hot Work Safety", description: "Visual defect, measurement, rework, fire watch, fumes, listrik, dan PPE." },
    ],
    requirements: ["Penglihatan dan koordinasi tangan memadai", "Bersedia menggunakan PPE penuh", "Mampu bekerja dengan panas dan percikan", "Lulus uji keselamatan dan kupon praktik"],
  },
  {
    categoryValue: "agriculture",
    categoryLabel: "Pertanian",
    title: "Pertanian (農業)",
    slug: "pertanian",
    subtitle: "Kandidat untuk budidaya, greenhouse, panen, sortasi, dan pemeliharaan area",
    summary: "Pelatihan menekankan ketepatan proses budidaya, penggunaan alat, kualitas panen, pencatatan, dan daya tahan kerja lapangan.",
    overview: "Program pertanian mensimulasikan persiapan lahan, penanaman, pemupukan, irigasi, pengendalian gulma, panen, serta sortasi. Kandidat juga dibiasakan membaca jadwal kerja dan menjaga peralatan setelah digunakan.",
    pathway: "Specified Skilled Worker: Agriculture",
    language: "Target JFT-Basic/JLPT N4 dan kosakata kerja pertanian",
    skillTest: "Evaluasi praktik budidaya dan persiapan tes bidang pertanian",
    leadTime: "6-10 minggu untuk shortlist",
    availableCandidates: 34,
    batchCapacity: 40,
    trainingDuration: "4-6 bulan",
    simulatedPassRate: "90%",
    positions: [
      { title: "Crop Production Worker", duties: "Menyiapkan media, menanam, merawat, memupuk, mengairi, dan memanen sesuai jadwal.", skills: "Plant spacing, irrigation, fertilizer measurement, pruning dasar, dan crop observation.", tools: "Hand tools, sprayer, irrigation equipment, scale, crate, dan PPE.", safety: "Chemical label awareness, heat stress, tool safety, dan lifting technique.", standard: "Menyelesaikan plot simulasi sesuai urutan, dosis, jarak, dan kualitas kerja yang ditetapkan." },
      { title: "Harvest and Sorting Staff", duties: "Memanen pada tingkat kematangan yang ditentukan, menyortir, menimbang, dan mengemas hasil.", skills: "Quality grading, careful handling, weight control, packing, dan traceability dasar.", tools: "Harvest knife/scissors, scale, grading table, crate, dan label.", safety: "Sharp tools, repetitive work, ergonomi, dan kebersihan produk.", standard: "Akurasi grading minimal 90% dan kerusakan produk di bawah batas simulasi." },
    ],
    technicalModules: [
      { title: "Crop Care and Greenhouse Work", description: "Penanaman, irigasi, pemupukan, pruning, pengamatan tanaman, dan jadwal kerja." },
      { title: "Harvest, Sorting, and Packing", description: "Kematangan, panen, grading, penimbangan, packing, dan traceability." },
    ],
    requirements: ["Kondisi fisik memadai untuk kerja luar ruang", "Bersedia menghadapi perubahan cuaca", "Mampu mengikuti dosis dan jadwal", "Lulus simulasi panen dan grading"],
  },
  {
    categoryValue: "fishery",
    categoryLabel: "Perikanan",
    title: "Perikanan (漁業・養殖業)",
    slug: "perikanan",
    subtitle: "Pelatihan kerja tangkap/budidaya, penanganan hasil, kebersihan, dan keselamatan",
    summary: "Kandidat diperkenalkan pada pekerjaan budidaya, penanganan hasil, penggunaan alat, rantai dingin, dan disiplin keselamatan area basah.",
    overview: "Program simulasi membedakan kebutuhan pekerjaan budidaya dan penanganan hasil. Fokus latihan meliputi pemberian pakan, pemantauan kondisi, pemilahan, pencucian, icing, pengemasan, kebersihan alat, dan kerja tim.",
    pathway: "Specified Skilled Worker: Fishery and Aquaculture",
    language: "Target JFT-Basic/JLPT N4 dan instruksi keselamatan perikanan",
    skillTest: "Evaluasi internal penanganan hasil dan persiapan tes bidang",
    leadTime: "8-12 minggu setelah lingkungan kerja dikonfirmasi",
    availableCandidates: 22,
    batchCapacity: 28,
    trainingDuration: "5-7 bulan",
    simulatedPassRate: "85%",
    positions: [
      { title: "Aquaculture Worker", duties: "Membantu pemberian pakan, pemeriksaan kolam, pemilahan, panen, dan kebersihan peralatan.", skills: "Feed measurement, observation, net handling, grading, record keeping, dan sanitation.", tools: "Net, scale, water test kit dasar, crate, pump support tools, dan PPE.", safety: "Slippery area, water hazard, lifting, biosecurity, dan weather awareness.", standard: "Melaksanakan siklus kerja budidaya simulasi dengan dosis dan catatan yang benar tanpa pelanggaran keselamatan." },
      { title: "Seafood Handling Staff", duties: "Menerima, mencuci, memilah, menimbang, memberi es, dan mengemas hasil perikanan.", skills: "Freshness check, cold chain, knife handling dasar, weighing, packing, dan cleaning.", tools: "Knife, cutting board, scale, ice box, crate, thermometer, dan sanitation tools.", safety: "Cold exposure, sharp tools, contamination, lifting, dan floor safety.", standard: "Menjaga suhu dan kebersihan simulasi serta mencapai akurasi sortasi minimal 90%." },
    ],
    technicalModules: [
      { title: "Aquaculture and Harvest Work", description: "Pakan, monitoring, jaring, grading, panen, pencatatan, dan biosecurity." },
      { title: "Seafood Handling and Cold Chain", description: "Kesegaran, pencucian, suhu, icing, pemotongan dasar, packing, dan sanitasi." },
    ],
    requirements: ["Mampu bekerja di area basah dan dingin", "Tidak takut air untuk posisi terkait", "Bersedia mengikuti standar kebersihan ketat", "Lulus tes tool safety dan cold-chain handling"],
  },
  {
    categoryValue: "accommodation",
    categoryLabel: "Perhotelan",
    title: "Perhotelan (宿泊)",
    slug: "perhotelan",
    subtitle: "Kandidat hospitality untuk front service, housekeeping, dan operasional tamu",
    summary: "Pelatihan menggabungkan omotenashi, komunikasi tamu, housekeeping, penanganan keluhan, dan koordinasi antardepartemen.",
    overview: "Program hospitality menilai penampilan, bahasa, ketelitian, dan konsistensi layanan. Simulasi mencakup greeting, check-in support, room preparation, inspection, penanganan permintaan, dan pelaporan barang tertinggal.",
    pathway: "Specified Skilled Worker: Accommodation",
    language: "Target JLPT N4 menuju N3 sesuai posisi layanan",
    skillTest: "Evaluasi hospitality internal dan persiapan tes bidang akomodasi",
    leadTime: "8-12 minggu untuk kandidat siap interview",
    availableCandidates: 26,
    batchCapacity: 30,
    trainingDuration: "5-7 bulan",
    simulatedPassRate: "87%",
    positions: [
      { title: "Hotel Service Staff", duties: "Menyambut tamu, membantu informasi, menangani permintaan sederhana, dan berkoordinasi dengan tim.", skills: "Greeting, telephone manners, reservation vocabulary, complaint escalation, dan service recovery dasar.", tools: "Reservation simulator, telephone, guest request log, dan POS dasar.", safety: "Privasi tamu, emergency response, cash handling awareness, dan informasi pribadi.", standard: "Menyelesaikan role play layanan dengan skor bahasa, sikap, akurasi informasi, dan eskalasi minimal 80%." },
      { title: "Hotel Housekeeping Staff", duties: "Menyiapkan kamar, mengganti linen, membersihkan fasilitas, memeriksa inventaris, dan melaporkan kerusakan.", skills: "Bed making, room sequence, bathroom sanitation, inspection, dan lost-and-found procedure.", tools: "Housekeeping cart, vacuum, linen, chemical set, room checklist, dan PPE.", safety: "Chemical dilution, ergonomi, guest property, sharps awareness, dan wet floor control.", standard: "Menyelesaikan mock room sesuai waktu dan checklist tanpa defect kebersihan kritis." },
    ],
    technicalModules: [
      { title: "Guest Service and Omotenashi", description: "Greeting, telephone, informasi, permintaan tamu, complaint handling, dan budaya layanan." },
      { title: "Housekeeping Operation", description: "Room sequence, bed making, sanitation, inspection, linen, lost-and-found, dan chemical safety." },
    ],
    requirements: ["Penampilan rapi dan komunikasi sopan", "Bersedia bekerja shift dan hari libur", "Teliti terhadap detail kebersihan", "Lulus role play layanan dan room inspection"],
  },
  {
    categoryValue: "building-cleaning",
    categoryLabel: "Building Cleaning",
    title: "Building Cleaning (ビルクリーニング)",
    slug: "building-cleaning",
    subtitle: "Pelatihan pembersihan profesional berbasis area, material, chemical, dan inspeksi mutu",
    summary: "Kandidat belajar memilih metode, alat, dan chemical sesuai permukaan serta melakukan inspeksi hasil dan pengamanan area.",
    overview: "Program building cleaning tidak berhenti pada kegiatan menyapu dan mengepel. Kandidat dilatih memahami jenis lantai, urutan kerja, dilution chemical, mesin pembersih dasar, restroom sanitation, signage, dan quality inspection.",
    pathway: "Specified Skilled Worker: Building Cleaning Management",
    language: "Target JFT-Basic/JLPT N4 dan kosakata alat serta chemical",
    skillTest: "Evaluasi praktik cleaning dan persiapan tes bidang yang berlaku",
    leadTime: "6-10 minggu untuk shortlist",
    availableCandidates: 30,
    batchCapacity: 36,
    trainingDuration: "4-6 bulan",
    simulatedPassRate: "92%",
    positions: [
      { title: "Building Cleaning Staff", duties: "Membersihkan lantai, kaca, area umum, toilet, dan titik sentuh sesuai zone plan.", skills: "Dusting, mopping, vacuuming, restroom sanitation, waste separation, dan final inspection.", tools: "Color-coded cloth, mop set, vacuum, floor machine simulator, scraper, dan signage.", safety: "Chemical dilution, wet floor, electrical cord, sharps, PPE, dan public area control.", standard: "Menyelesaikan area simulasi sesuai urutan, waktu, dan inspection score minimal 90%." },
      { title: "Floor Care Assistant", duties: "Membantu stripping, scrubbing, polishing, dan pemeliharaan rutin jenis lantai tertentu.", skills: "Machine preparation, pad selection, edge work, solution control, dan equipment cleaning.", tools: "Single-disc machine simulator, wet vacuum, pads, squeegee, dan measuring cup.", safety: "Machine cable, slip prevention, chemical label, barrier setup, dan lifting.", standard: "Mengoperasikan simulasi mesin sesuai checklist dan menghasilkan permukaan merata tanpa kerusakan." },
    ],
    technicalModules: [
      { title: "Area Cleaning and Sanitation", description: "Zone plan, urutan kerja, toilet, kaca, waste, touch point, dan final inspection." },
      { title: "Floor Material and Machine Work", description: "Jenis lantai, pad, chemical, scrubbing, polishing, equipment care, dan signage." },
    ],
    requirements: ["Mampu membedakan warna dan label chemical", "Bersedia melakukan pekerjaan fisik berulang", "Teliti terhadap detail kebersihan", "Lulus simulasi area dan chemical safety"],
  },
  {
    categoryValue: "road-transport",
    categoryLabel: "Sopir Truk dan Bus",
    title: "Sopir Truk dan Bus (自動車運送業)",
    slug: "sopir-truk-bus",
    subtitle: "Persiapan pengemudi profesional untuk keselamatan, inspeksi, layanan, dan kepatuhan",
    summary: "Program menekankan defensive driving, pemeriksaan harian, keselamatan penumpang/muatan, pencatatan, dan komunikasi operasional.",
    overview: "Data ini merupakan simulasi tampilan. Kelayakan aktual pengemudi harus disesuaikan dengan jenis lisensi, konversi, pengalaman, kategori kendaraan, dan ketentuan terbaru di Jepang. Pelatihan awal berfokus pada perilaku aman, inspeksi, hazard perception, dan disiplin operasional.",
    pathway: "Specified Skilled Worker: Automobile Transportation Business, sesuai persyaratan lisensi",
    language: "Target kemampuan bahasa sesuai ketentuan dan komunikasi keselamatan",
    skillTest: "Evaluasi defensive driving, inspeksi, dan persiapan tes/lisensi terkait",
    leadTime: "12-20 minggu, bergantung lisensi dan persyaratan posisi",
    availableCandidates: 14,
    batchCapacity: 18,
    trainingDuration: "6-10 bulan",
    simulatedPassRate: "80%",
    positions: [
      { title: "Truck Driver Candidate", duties: "Melakukan inspeksi harian, perencanaan rute, pengamanan muatan, berkendara aman, dan pencatatan perjalanan.", skills: "Pre-trip inspection, hazard prediction, reversing procedure, load awareness, eco-driving, dan reporting.", tools: "Vehicle checklist, route map, tie-down simulator, tachograph awareness, dan communication device.", safety: "Blind spot, fatigue, loading limit, pedestrian awareness, emergency stop, dan alcohol zero tolerance.", standard: "Lulus simulasi inspeksi tanpa melewatkan komponen kritis dan memperoleh skor defensive driving minimal 85%." },
      { title: "Bus Driver Candidate", duties: "Memeriksa kendaraan, memastikan keselamatan naik-turun, mengemudi halus, dan memberi informasi dasar.", skills: "Passenger safety, smooth braking, mirror scan, stop approach, announcement, dan incident response.", tools: "Vehicle checklist, mirror setup, route sheet, announcement script, dan emergency equipment.", safety: "Passenger fall prevention, door check, vulnerable road users, fatigue, dan emergency evacuation.", standard: "Lulus skenario keselamatan penumpang dan hazard perception sesuai rubrik simulasi." },
    ],
    technicalModules: [
      { title: "Defensive Driving and Hazard Prediction", description: "Scanning, blind spot, speed selection, following distance, fatigue, dan emergency response." },
      { title: "Daily Inspection and Transport Operation", description: "Vehicle check, route, load/passenger safety, records, communication, dan service conduct." },
    ],
    requirements: ["Memiliki pengalaman mengemudi yang dapat diverifikasi", "Memenuhi pemeriksaan kesehatan dan penglihatan", "Bersedia mengikuti proses lisensi yang berlaku", "Lulus evaluasi hazard perception dan inspeksi"],
  },
  {
    categoryValue: "cnc-machining",
    categoryLabel: "CNC dan Machining",
    title: "CNC dan Machining (機械加工)",
    slug: "cnc-machining",
    subtitle: "Operator machining untuk drawing dasar, setup, measurement, dan quality control",
    summary: "Kandidat dilatih membaca gambar sederhana, memahami koordinat, memasang benda kerja, mengukur hasil, dan menjaga keselamatan mesin.",
    overview: "Program CNC/machining memprioritaskan disiplin setup dan pengukuran, bukan sekadar menjalankan cycle. Kandidat berlatih membaca dimensi, zero point, tool offset awareness, clamping, first-piece inspection, chip control, dan abnormality reporting.",
    pathway: "Jalur manufaktur sesuai klasifikasi pekerjaan dan regulasi",
    language: "Target JFT-Basic/JLPT N4 dan istilah machining",
    skillTest: "Evaluasi internal machining dan persiapan tes bidang manufaktur",
    leadTime: "10-16 minggu tergantung mesin dan toleransi",
    availableCandidates: 17,
    batchCapacity: 20,
    trainingDuration: "7-10 bulan",
    simulatedPassRate: "81%",
    positions: [
      { title: "CNC Machine Operator", duties: "Memeriksa program yang disetujui, memasang material, melakukan zero check, menjalankan cycle, dan memeriksa hasil.", skills: "Coordinate awareness, clamping, tool offset dasar, first-piece inspection, dan abnormality stop.", tools: "CNC simulator, vice/chuck, edge finder concept, caliper, micrometer, dan gauge.", safety: "Machine door interlock, chip handling, rotating parts, tool breakage, dan housekeeping.", standard: "Menyelesaikan setup simulasi dan menghasilkan dimensi dalam toleransi latihan tanpa tindakan tidak aman." },
      { title: "Machining Quality Assistant", duties: "Membaca drawing, menentukan titik ukur, mengukur komponen, dan mencatat hasil inspeksi.", skills: "Drawing interpretation, tolerance, caliper, micrometer, bore/depth awareness, dan traceability.", tools: "Drawing, caliper, micrometer, height gauge concept, surface plate, dan inspection sheet.", safety: "Burr handling, calibrated tool care, material lifting, dan area mesin.", standard: "Akurasi pengukuran minimal 90% pada sampel dan pencatatan lengkap tanpa salah identifikasi." },
    ],
    technicalModules: [
      { title: "Drawing, Coordinate, and Setup", description: "Dimensi, toleransi, datum, coordinate, clamping, zero point, dan tool offset awareness." },
      { title: "Machining Measurement and Quality", description: "First-piece inspection, caliper, micrometer, defect, traceability, dan reaction plan." },
    ],
    requirements: ["Memiliki kemampuan numerik dasar", "Teliti membaca dimensi", "Mampu mengikuti larangan keselamatan mesin", "Lulus evaluasi drawing dan alat ukur"],
  },
  {
    categoryValue: "restaurant",
    categoryLabel: "Restoran",
    title: "Industri Restoran (外食業)",
    slug: "industri-restoran",
    subtitle: "Kandidat food service untuk kitchen support, layanan tamu, higiene, dan peak-hour operation",
    summary: "Pelatihan mencakup persiapan bahan, cooking support, plating, pelayanan, kasir dasar, kebersihan, dan komunikasi tim.",
    overview: "Program restoran mensimulasikan operasi sebelum buka, peak hour, pergantian menu, dan closing. Kandidat dinilai pada higiene, urutan kerja, kecepatan, komunikasi order, konsistensi porsi, serta respons terhadap komplain sederhana.",
    pathway: "Specified Skilled Worker: Food Service",
    language: "Target JFT-Basic/JLPT N4 dan percakapan layanan restoran",
    skillTest: "Evaluasi internal food service dan persiapan tes bidang",
    leadTime: "6-10 minggu untuk shortlist",
    availableCandidates: 38,
    batchCapacity: 44,
    trainingDuration: "4-6 bulan",
    simulatedPassRate: "89%",
    positions: [
      { title: "Kitchen Support Staff", duties: "Menyiapkan bahan, membantu cooking, portioning, plating, mencuci alat, dan menjaga station.", skills: "Knife basics, mise en place, timing, portion control, temperature awareness, dan cleaning.", tools: "Kitchen knife, scale, timer, thermometer, cooking utensils, dan sanitation set.", safety: "Knife, burn, cross contamination, allergen, hot oil, dan wet floor.", standard: "Menyelesaikan menu simulasi sesuai recipe, waktu, porsi, suhu, dan higiene yang ditentukan." },
      { title: "Restaurant Service Staff", duties: "Greeting, menerima order, menyajikan, menangani pembayaran dasar, membersihkan meja, dan memberi informasi.", skills: "Order confirmation, menu vocabulary, carrying, POS simulator, complaint escalation, dan teamwork.", tools: "Order terminal simulator, tray, table setting, POS, dan cleaning tools.", safety: "Hot dish, allergy communication, cash handling, spill response, dan customer privacy.", standard: "Lulus role play layanan dengan akurasi order 100% dan skor komunikasi minimal 80%." },
    ],
    technicalModules: [
      { title: "Kitchen Operation and Food Safety", description: "Mise en place, knife, portion, temperature, cooking support, allergen, dan sanitation." },
      { title: "Guest Service and Peak-hour Flow", description: "Greeting, order, serving, POS, teamwork, complaint, clearing, dan closing." },
    ],
    requirements: ["Bersedia bekerja shift dan akhir pekan", "Mampu bekerja cepat dalam tim", "Memenuhi standar higiene personal", "Lulus simulasi kitchen atau service"],
  },
  {
    categoryValue: "construction",
    categoryLabel: "Konstruksi",
    title: "Konstruksi (建設)",
    slug: "konstruksi",
    subtitle: "Pelatihan dasar proyek untuk keselamatan, pengukuran, alat, housekeeping, dan disiplin kerja",
    summary: "Kandidat dibentuk untuk memahami bahaya proyek, menggunakan alat dasar, membaca instruksi, menjaga area, dan bekerja dalam tim.",
    overview: "Program konstruksi menggunakan toolbox meeting, hazard prediction, pengukuran, material handling, hand/power tool dasar, scaffolding awareness, dan housekeeping. Spesialisasi akhir disesuaikan dengan pekerjaan seperti formwork, rebar, interior, piping support, atau pekerjaan umum.",
    pathway: "Specified Skilled Worker: Construction / jalur terkait sesuai scope",
    language: "Target JFT-Basic/JLPT N4 dan instruksi keselamatan proyek",
    skillTest: "Evaluasi praktik konstruksi dan persiapan tes bidang",
    leadTime: "8-14 minggu sesuai spesialisasi",
    availableCandidates: 31,
    batchCapacity: 36,
    trainingDuration: "5-8 bulan",
    simulatedPassRate: "85%",
    positions: [
      { title: "General Construction Worker", duties: "Menyiapkan area, mengukur, memotong/material handling, menggunakan alat dasar, dan menjaga housekeeping.", skills: "Measurement, marking, hand tools, power tool awareness, lifting, signaling, dan teamwork.", tools: "Tape, level, square, hammer, drill simulator, grinder awareness, dan PPE.", safety: "Fall prevention, dropped object, electricity, hot work awareness, lifting, dan KY activity.", standard: "Menyelesaikan task board sesuai dimensi latihan dan tidak melakukan pelanggaran keselamatan kritis." },
      { title: "Formwork and Rebar Assistant", duties: "Membantu marking, menyiapkan material, merakit sederhana, mengikat, dan membongkar sesuai instruksi.", skills: "Drawing awareness, measurement, tie wire, alignment, material sorting, dan tool care.", tools: "Tape, level, tie tool, hammer, hand saw awareness, clamp, dan PPE.", safety: "Sharp edge, form collapse awareness, working at height, material stacking, dan pinch point.", standard: "Mock-up memenuhi dimensi dan alignment latihan serta area kerja tetap aman dan rapi." },
    ],
    technicalModules: [
      { title: "Construction Safety and KY", description: "Toolbox meeting, hazard prediction, PPE, fall, lifting, electricity, hot work, dan emergency." },
      { title: "Measurement, Tools, and Mock-up", description: "Drawing awareness, measurement, marking, hand tools, material handling, dan quality check." },
    ],
    requirements: ["Kondisi fisik memadai untuk pekerjaan proyek", "Mampu bekerja pada prosedur keselamatan ketat", "Bersedia mengikuti spesialisasi tambahan", "Lulus KY dan task-board practice"],
  },
];

const commonQualityAssurance = [
  { title: "Screening awal", description: "Verifikasi identitas, riwayat pendidikan/kerja, motivasi, perilaku, dan kesesuaian fisik awal." },
  { title: "Evaluasi berkala", description: "Penilaian bahasa, kehadiran, disiplin, teori, praktik, keselamatan, dan catatan remedial." },
  { title: "Final practical assessment", description: "Simulasi tugas inti menggunakan rubrik posisi; kegagalan pada poin keselamatan kritis harus diulang." },
  { title: "Dokumen shortlist", description: "Ringkasan profil, hasil evaluasi, catatan interview, dan bukti kompetensi disiapkan untuk mitra." },
];

const commonPlacementSupport = [
  { title: "Kalibrasi kebutuhan", description: "Tim mencocokkan job description, alat, shift, target bahasa, lingkungan, dan standar mitra." },
  { title: "Pelatihan tambahan", description: "Gap kompetensi dari hasil interview diterjemahkan menjadi modul tambahan sebelum keberangkatan." },
  { title: "Persiapan keberangkatan", description: "Pembekalan budaya kerja, kontrak, aturan tempat kerja, komunikasi, dan administrasi terkait." },
  { title: "Monitoring pascapenempatan", description: "Follow-up terjadwal untuk memantau adaptasi, komunikasi, performa, dan kebutuhan perbaikan." },
];

const commonProcess = [
  { icon_key: "clipboard_list", title: "Kebutuhan mitra", description: "Mitra menyampaikan posisi, jumlah, lokasi, shift, alat, bahasa, dan target mulai kerja." },
  { icon_key: "target", title: "Gap analysis", description: "Tim memetakan kebutuhan terhadap kandidat, kurikulum, asesmen, dan waktu persiapan." },
  { icon_key: "users", title: "Shortlist dan interview", description: "Mitra menerima profil terstruktur dan memilih kandidat untuk interview atau skill check." },
  { icon_key: "graduation_cap", title: "Pelatihan penyesuaian", description: "Kandidat mengikuti modul tambahan berdasarkan feedback dan SOP perusahaan." },
  { icon_key: "handshake", title: "Dokumen dan monitoring", description: "Tim mendukung proses dokumen, keberangkatan, orientasi, serta evaluasi setelah penempatan." },
];

function withSortOrder<T extends Record<string, unknown>>(items: T[]) {
  return items.map((item, index) => ({
    ...item,
    is_enabled: true,
    sort_order: index,
  }));
}

function mediaAt(mediaIds: string[], index: number) {
  return mediaIds[index % mediaIds.length];
}

function buildSectorData(
  sector: SectorSeed,
  categoryId: string,
  mediaIds: string[],
  sectorIndex: number,
) {
  const mediaOffset = sectorIndex * 3;
  const commonModules = [
    { title: "Bahasa Jepang dan budaya kerja", description: "Instruksi kerja, laporan singkat, kosakata bidang, 5S, horenso, disiplin waktu, dan etika kerja.", theory_hours_label: "72 jam", practical_hours_label: "36 jam", evaluation_method: "Tes bahasa kerja, role play, dan observasi perilaku." },
    { title: "Keselamatan dan respons abnormality", description: "PPE, hazard prediction, stop-call-wait, pelaporan kejadian, keadaan darurat, dan housekeeping.", theory_hours_label: "24 jam", practical_hours_label: "40 jam", evaluation_method: "Safety drill dan checklist observasi tanpa pelanggaran kritis." },
  ];
  const technicalModules = sector.technicalModules.map((module, index) => ({
    ...module,
    theory_hours_label: index === 0 ? "36 jam" : "28 jam",
    practical_hours_label: index === 0 ? "120 jam" : "96 jam",
    evaluation_method: index === 0 ? "Practical task, check sheet, dan penilaian proses." : "Simulasi target kerja dan final practical assessment.",
  }));
  const capabilityStats = [
    { icon_key: "users", value: String(sector.availableCandidates), label: "Kandidat dalam pipeline simulasi" },
    { icon_key: "graduation_cap", value: String(sector.batchCapacity), label: "Kapasitas peserta per angkatan" },
    { icon_key: "calendar_clock", value: sector.trainingDuration, label: "Durasi persiapan umum" },
    { icon_key: "clipboard_check", value: sector.simulatedPassRate, label: "Target kelulusan asesmen internal" },
  ];
  const facilityItems = [
    { title: `Area praktik ${sector.categoryLabel}`, description: "Contoh media fasilitas untuk memperlihatkan format dokumentasi area praktik.", media_id: mediaAt(mediaIds, mediaOffset) },
    { title: "Peralatan dan simulasi kerja", description: `Contoh visual alat dan aktivitas yang nantinya diganti dengan dokumentasi khusus ${sector.categoryLabel}.`, media_id: mediaAt(mediaIds, mediaOffset + 1) },
    { title: "Area evaluasi kandidat", description: "Contoh ruang atau aktivitas yang digunakan untuk observasi praktik dan disiplin kerja.", media_id: mediaAt(mediaIds, mediaOffset + 2) },
  ];
  const evidenceGallery = [
    { title: "Briefing sebelum praktik", description: "Contoh dokumentasi instruksi, pembagian tugas, dan hazard check.", media_id: mediaAt(mediaIds, mediaOffset + 1) },
    { title: "Observasi kompetensi", description: "Contoh dokumentasi kandidat saat menjalankan task sesuai rubrik.", media_id: mediaAt(mediaIds, mediaOffset + 2) },
    { title: "Pemeriksaan hasil kerja", description: "Contoh dokumentasi quality check dan feedback instruktur.", media_id: mediaAt(mediaIds, mediaOffset + 3) },
    { title: "Evaluasi akhir", description: "Contoh dokumentasi final assessment dan pencatatan hasil.", media_id: mediaAt(mediaIds, mediaOffset + 4) },
  ];
  const candidateSnapshots = [
    { initials: "KA", name: "Kandidat A", profile_label: `Usia 23 tahun, fokus ${sector.categoryLabel}`, language_label: "Setara target JFT-Basic; latihan percakapan kerja berjalan", skill_status_label: "Lulus modul dasar, menunggu final practical assessment", experience_label: "Pengalaman lokal 1 tahun atau praktik setara", availability_label: sector.leadTime, image_id: mediaAt(mediaIds, mediaOffset + 2) },
    { initials: "KB", name: "Kandidat B", profile_label: `Usia 25 tahun, fokus ${sector.positions[0].title}`, language_label: "Kelas bahasa industri dan role play interview", skill_status_label: "Lulus safety gate dan evaluasi praktik tahap 2", experience_label: "Pengalaman lokal 2 tahun atau praktik setara", availability_label: sector.leadTime, image_id: mediaAt(mediaIds, mediaOffset + 3) },
  ];
  const faqs = [
    { question: `Apakah kurikulum ${sector.categoryLabel} dapat mengikuti SOP perusahaan?`, answer: "Ya. Setelah menerima job description, alat, target output, dan contoh SOP, tim melakukan gap analysis dan menambahkan modul penyesuaian." },
    { question: "Apakah mitra dapat melakukan skill check sendiri?", answer: "Ya. Skill check dapat dilakukan melalui video, kunjungan, atau rubrik yang dikirim mitra. Hasilnya menjadi dasar remedial dan shortlist akhir." },
    { question: "Berapa lama kandidat siap diwawancarai?", answer: `Estimasi simulasi saat ini adalah ${sector.leadTime}. Waktu aktual bergantung pada bahasa, skill gap, jumlah kandidat, dan ketentuan dokumen.` },
    { question: "Data apa yang diterima saat shortlist?", answer: "Mitra dapat menerima profil kandidat, riwayat latihan, hasil bahasa, hasil praktik, catatan perilaku, serta status dokumen yang relevan." },
  ];

  return {
    title: sector.title,
    slug: sector.slug,
    subtitle: sector.subtitle,
    short_description: sector.summary,
    overview: sector.overview,
    thumbnail_image_id: mediaAt(mediaIds, mediaOffset),
    hero_image_id: mediaAt(mediaIds, mediaOffset + 1),
    status: "PUBLISHED",
    is_featured: sectorIndex < 3,
    sort_order: sectorIndex,
    sector_category_option_id: categoryId,
    data_status_label: "DATA SIMULASI UNTUK REVIEW",
    pathway_label: sector.pathway,
    language_target_label: sector.language,
    skill_test_label: sector.skillTest,
    readiness_lead_time_label: sector.leadTime,
    last_verified_label: "Contoh verifikasi konten: Juni 2026",
    reference_url: "https://www.ssw.go.jp/en/about/visa/",
    capability_stats: withSortOrder(capabilityStats),
    position_competencies: withSortOrder(sector.positions.map((position) => ({
      title: position.title,
      duties: position.duties,
      practical_skills: position.skills,
      tools_equipment: position.tools,
      safety_focus: position.safety,
      pass_standard: position.standard,
    }))),
    curriculum_modules: withSortOrder([...commonModules, ...technicalModules]),
    facility_items: withSortOrder(facilityItems),
    candidate_snapshots: withSortOrder(candidateSnapshots),
    quality_assurance_items: withSortOrder(commonQualityAssurance),
    placement_support_items: withSortOrder(commonPlacementSupport),
    evidence_gallery: withSortOrder(evidenceGallery),
    suitability_items: withSortOrder([
      { title: "Kebutuhan mitra yang jelas", description: "Hasil terbaik diperoleh jika posisi, alat, shift, lingkungan, dan target kompetensi dapat dikalibrasi sejak awal." },
      { title: "Penyesuaian sebelum penempatan", description: "Kurikulum dan shortlist dapat diperbarui berdasarkan interview, skill check, dan feedback perusahaan." },
    ]),
    example_positions: withSortOrder(sector.positions.map((position) => ({ title: position.title, description: position.duties }))),
    training_alignment_items: withSortOrder([...commonModules, ...technicalModules].map((module) => ({ title: module.title, description: module.description }))),
    candidate_requirements: sector.requirements,
    process_items: withSortOrder(commonProcess),
    faqs: withSortOrder(faqs),
    primary_cta_label: "Minta Shortlist Kandidat",
    line_message_template: `Halo, kami ingin mendiskusikan kandidat untuk bidang ${sector.title}. Kebutuhan awal kami adalah: posisi ..., jumlah ... orang, lokasi ..., target mulai ....`,
    secondary_cta_label: "Unduh Capability Brief",
    secondary_document_url: "",
    secondary_document_file_id: "",
  };
}

async function main() {
  const targetHost = process.env.SECTOR_DEMO_HOST || "hit-japan.lpk.local";
  const targetTenantSlug = process.env.SECTOR_DEMO_TENANT_SLUG || "hit";
  const variantByDomain = await prisma.variant.findFirst({
    where: {
      key: "japan",
      domains: { some: { host: targetHost } },
    },
    select: { id: true, tenantId: true },
  });
  const variant =
    variantByDomain ??
    (await prisma.variant.findFirst({
      where: {
        key: "japan",
        tenant: { slug: targetTenantSlug },
      },
      select: { id: true, tenantId: true },
    }));

  if (!variant) {
    throw new Error(
      `Japan variant for ${targetHost} or tenant ${targetTenantSlug} was not found.`,
    );
  }

  const media = await prisma.mediaAsset.findMany({
    where: {
      tenantId: variant.tenantId,
      status: MediaStatus.ACTIVE,
      mediaType: MediaType.IMAGE,
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (media.length === 0) {
    throw new Error("No active image media is available for sector demo data.");
  }

  const mediaIds = media.map((item) => item.id);
  const optionSet = await prisma.optionSet.upsert({
    where: { variantId_key: { variantId: variant.id, key: "japan_sector_category" } },
    update: { label: "Japan Sector Category" },
    create: {
      tenantId: variant.tenantId,
      variantId: variant.id,
      key: "japan_sector_category",
      label: "Japan Sector Category",
    },
    select: { id: true },
  });

  const activeCategoryValues = sectors.map((sector) => sector.categoryValue);
  await prisma.optionValue.updateMany({
    where: {
      optionSetId: optionSet.id,
      value: { notIn: activeCategoryValues },
    },
    data: { isActive: false },
  });

  const categoryIds = new Map<string, string>();
  for (const [index, sector] of sectors.entries()) {
    const category = await prisma.optionValue.upsert({
      where: {
        optionSetId_value: {
          optionSetId: optionSet.id,
          value: sector.categoryValue,
        },
      },
      update: {
        label: sector.categoryLabel,
        sortOrder: index,
        isActive: true,
      },
      create: {
        optionSetId: optionSet.id,
        value: sector.categoryValue,
        label: sector.categoryLabel,
        sortOrder: index,
        isActive: true,
      },
      select: { id: true },
    });
    categoryIds.set(sector.categoryValue, category.id);
  }

  await prisma.contentItem.updateMany({
    where: {
      variantId: variant.id,
      collectionKey: "sector",
      slug: { startsWith: "sektor-contoh-" },
    },
    data: { status: PublishStatus.DRAFT },
  });

  const now = new Date();
  for (const [index, sector] of sectors.entries()) {
    const categoryId = categoryIds.get(sector.categoryValue);
    if (!categoryId) {
      throw new Error(`Category ${sector.categoryValue} was not created.`);
    }

    const data = buildSectorData(sector, categoryId, mediaIds, index);
    const json = data as Prisma.InputJsonValue;
    const thumbnailImageId = data.thumbnail_image_id;
    const heroImageId = data.hero_image_id;

    await prisma.contentItem.upsert({
      where: {
        variantId_collectionKey_slug: {
          variantId: variant.id,
          collectionKey: "sector",
          slug: sector.slug,
        },
      },
      update: {
        title: sector.title,
        status: PublishStatus.PUBLISHED,
        excerpt: sector.summary,
        thumbnailImageId,
        heroImageId,
        isFeatured: index < 3,
        sortOrder: index,
        dataJson: json,
        publishedDataJson: json,
        publishedAt: now,
      },
      create: {
        tenantId: variant.tenantId,
        variantId: variant.id,
        collectionKey: "sector",
        title: sector.title,
        slug: sector.slug,
        status: PublishStatus.PUBLISHED,
        excerpt: sector.summary,
        thumbnailImageId,
        heroImageId,
        isFeatured: index < 3,
        sortOrder: index,
        dataJson: json,
        publishedDataJson: json,
        publishedAt: now,
      },
    });
  }

  const pageData = {
    hero: {
      media_type: "image",
      media_id: mediaAt(mediaIds, 0),
      eyebrow_label: "CAPABILITY DIRECTORY",
      headline: "Bidang Pelatihan dan Kesiapan Kandidat",
      subheadline: "Jelajahi 13 bidang pelatihan, standar kompetensi, kapasitas kandidat, dan proses quality assurance yang dapat disesuaikan dengan kebutuhan perusahaan Jepang.",
      primary_cta_label: "Konsultasikan Kebutuhan",
      primary_line_message_template: "Halo, kami ingin berkonsultasi mengenai kebutuhan tenaga kerja untuk bidang ..., posisi ..., dan jumlah ... orang.",
      secondary_cta_label: "Lihat Profil Kandidat",
      secondary_href: "/candidate-profile",
    },
    display_text: {
      card_cta_label: "Lihat Capability Dossier",
      featured_badge_label: "Prioritas",
      breadcrumb_home_label: "Beranda",
      breadcrumb_sector_label: "Bidang Pelatihan",
      requirements_title: "Kriteria Awal Kandidat",
      process_title: "Proses Kerja Sama",
      faq_title: "Pertanyaan Mitra",
      sidebar_title: "Minta Shortlist Kandidat",
      sidebar_description: "Sampaikan posisi, jumlah, lokasi, shift, alat kerja, dan target mulai. Tim kami akan menyiapkan pemetaan kandidat dan gap pelatihan.",
      detail_primary_cta_label: "Diskusikan via LINE",
      detail_secondary_cta_label: "Unduh Capability Brief",
    },
    filter_config: { enable_sector_category_filter: true },
    final_cta: {
      headline: "Butuh kandidat untuk bidang yang lebih spesifik?",
      description: "Kirimkan job description dan target kebutuhan. Kami akan memetakan kandidat, kompetensi, waktu persiapan, dan asesmen yang diperlukan.",
      primary_cta_label: "Minta Pemetaan Kandidat",
      primary_line_message_template: "Halo, kami ingin meminta pemetaan kandidat untuk posisi ..., jumlah ..., lokasi ..., dan target mulai ....",
      secondary_cta_label: "Lihat Profil Kandidat",
      secondary_document_url: "",
      secondary_document_file_id: "",
    },
  };
  const pageJson = pageData as Prisma.InputJsonValue;

  await prisma.contentPage.upsert({
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "sector_page" } },
    update: {
      title: "Bidang Pelatihan",
      slug: "sector",
      status: PublishStatus.PUBLISHED,
      dataJson: pageJson,
      publishedDataJson: pageJson,
    },
    create: {
      tenantId: variant.tenantId,
      variantId: variant.id,
      pageKey: "sector_page",
      title: "Bidang Pelatihan",
      slug: "sector",
      status: PublishStatus.PUBLISHED,
      dataJson: pageJson,
      publishedDataJson: pageJson,
    },
  });

  console.log(`Seeded ${sectors.length} Japan sector capability dossiers using ${mediaIds.length} existing images.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Sector demo seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
