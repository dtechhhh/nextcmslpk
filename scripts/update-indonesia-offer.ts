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
  throw new Error("DATABASE_URL is required to update the Indonesia offer.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const targetTenantSlug = readArgument("--tenant") || "hit";
const offerSlug = "kelas-gratis-persiapan-kerja-di-jepang";
const generatedHeroFileName = "kelas-gratis-persiapan-kerja-jepang.webp";

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

function item(title: string, description: string, sortOrder: number) {
  return {
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

function json(value: Record<string, unknown>): Prisma.InputJsonObject {
  return value as Prisma.InputJsonObject;
}

function updateOfferData(
  value: unknown,
  instructorImageId: string,
  heroMediaId: string,
) {
  const current = record(value);
  const currentWithoutStaticImage = { ...current };
  delete currentWithoutStaticImage.public_image_path;

  return {
    ...currentWithoutStaticImage,
    title: "Kelas Gratis 2 Jam: Persiapan Awal Kerja ke Jepang",
    slug: offerSlug,
    subtitle:
      "Kenali jalur yang relevan, siapkan checklist pribadi, dan mulai dengan langkah yang lebih terarah bersama tim HIT.",
    short_description:
      "Kelas online gratis untuk memahami jalur kerja Jepang, target bahasa, dokumen awal, dan langkah persiapan yang sesuai untuk pemula.",
    overview:
      "Masih bingung harus mulai dari belajar bahasa, menyiapkan dokumen, atau memilih program? Dalam kelas online ini, tim HIT membantu kamu memahami perbedaan jalur Magang, Tokutei Ginou, dan Gijinkoku serta hal-hal yang perlu dipersiapkan sejak awal.\n\nKelas dirancang untuk pemula. Kamu tidak harus sudah bisa bahasa Jepang dan dapat membawa pertanyaan sesuai usia, pendidikan, pengalaman, serta tujuanmu.",
    status: "PUBLISHED",
    start_at: "2026-06-20T02:00:00.000Z",
    expired_at: "2026-07-25T16:59:59.000Z",
    thumbnail_image_id: heroMediaId || stringValue(current.thumbnail_image_id),
    hero_image_id: heroMediaId || stringValue(current.hero_image_id),
    hero_eyebrow_label: "Kelas Online Gratis untuk Pemula",
    intro_heading: "Mulai dengan Peta Persiapan yang Lebih Jelas",
    schedule_label: "Setiap Sabtu, 09.00-11.00 WIB",
    duration_label: "2 jam, termasuk sesi tanya jawab",
    format_label: "Live online via Zoom",
    quota_label: "Maksimal 30 peserta per batch",
    price_label: "Gratis, tanpa biaya pendaftaran",
    original_price_label: "",
    urgency_label: "Pendaftaran ditutup saat kuota batch terpenuhi",
    batch_label: "20 & 27 Juni; 4, 11, 18 & 25 Juli 2026",
    benefit_items: [
      item(
        "Peta jalur awal yang lebih mudah dibandingkan",
        "Kenali perbedaan dasar Magang, Tokutei Ginou, dan Gijinkoku agar kamu tahu jalur mana yang perlu diperiksa lebih lanjut.",
        0,
      ),
      item(
        "Checklist persiapan sesuai kondisi saat ini",
        "Catat dokumen awal, target bahasa, dan kebiasaan belajar yang dapat mulai kamu siapkan setelah kelas.",
        1,
      ),
      item(
        "Roadmap belajar 30 hari untuk pemula",
        "Gunakan panduan sederhana untuk membangun ritme belajar bahasa Jepang sebelum masuk ke tahap yang lebih intensif.",
        2,
      ),
      item(
        "Pertanyaan konsultasi yang lebih terarah",
        "Pahami hal penting tentang tahapan, biaya, timeline, dan seleksi agar konsultasi lanjutanmu lebih efektif.",
        3,
      ),
    ],
    agenda_items: [
      item(
        "09.00-09.15 WIB",
        "Orientasi kelas dan cara membaca peluang kerja Jepang berdasarkan profil awal peserta.",
        0,
      ),
      item(
        "09.15-09.40 WIB",
        "Perbandingan Magang, Tokutei Ginou, dan Gijinkoku: tujuan, gambaran syarat, dan karakter persiapannya.",
        1,
      ),
      item(
        "09.40-10.05 WIB",
        "Target bahasa Jepang, dokumen awal, serta kebiasaan belajar yang dapat mulai dibangun dari sekarang.",
        2,
      ),
      item(
        "10.05-10.30 WIB",
        "Gambaran proses seleksi, interview, komponen biaya, dan faktor yang memengaruhi timeline persiapan.",
        3,
      ),
      item(
        "10.30-11.00 WIB",
        "Tanya jawab bersama tim HIT dan arahan untuk menentukan langkah berikutnya.",
        4,
      ),
    ],
    instructor_name: "Sarif Hidayatulloh",
    instructor_role: "Penanggung Jawab Pendidikan dan Pengajar Bahasa Jepang HIT",
    instructor_qualification: "JLPT N1",
    instructor_experience: "7+ tahun mengajar dan berpengalaman tinggal di Jepang",
    instructor_description:
      "Materi kelas disusun di bawah arahan Sarif Hidayatulloh, pengajar JLPT N1 yang telah mengajar bahasa Jepang lebih dari tujuh tahun. Pengalaman tinggal di Jepang membantu menghadirkan pembahasan bahasa, komunikasi, dan kebiasaan kerja dalam konteks yang lebih dekat dengan situasi nyata.",
    instructor_image_id:
      instructorImageId || stringValue(current.instructor_image_id),
    detail_description: "",
    detail_checklist_title: "Sebelum Kelas, Siapkan Ini",
    detail_checklist: [
      "Smartphone atau laptop dengan aplikasi Zoom dan koneksi internet yang memadai",
      "Informasi singkat tentang usia, pendidikan, pengalaman kerja, dan kemampuan bahasa Jepangmu",
      "Catatan pertanyaan tentang program, biaya, dokumen, atau bidang kerja yang ingin kamu pahami",
    ],
    bonus_items: [
      item(
        "Template checklist dokumen awal",
        "Panduan ringkas untuk menata dokumen pribadi dan mencatat bagian yang masih perlu dilengkapi.",
        0,
      ),
      item(
        "Mini roadmap belajar bahasa Jepang 30 hari",
        "Rangkaian target awal yang membantu pemula mulai belajar dengan ritme yang lebih teratur.",
        1,
      ),
    ],
    suitable_for_items: [
      item(
        "Lulusan SMA/SMK yang ingin mulai dari dasar",
        "Cocok untuk kamu yang baru mengenal peluang kerja Jepang dan ingin memahami pilihan jalurnya terlebih dahulu.",
        0,
      ),
      item(
        "Lulusan D3/S1 atau fresh graduate",
        "Bantu membandingkan jalur yang relevan dengan pendidikan dan rencana kariermu sebelum memilih program.",
        1,
      ),
      item(
        "Pemula yang belum bisa bahasa Jepang",
        "Materi dimulai dari gambaran dasar dan tidak mensyaratkan kemampuan bahasa Jepang sebelumnya.",
        2,
      ),
      item(
        "Orang tua atau pendamping calon peserta",
        "Dapatkan gambaran awal mengenai proses, persiapan, dan pertanyaan penting sebelum keluarga mengambil keputusan.",
        3,
      ),
    ],
    faqs: [
      faq(
        "Apakah kelas ini benar-benar gratis?",
        "Ya. Tidak ada biaya pendaftaran untuk mengikuti kelas pengenalan ini. Peserta cukup memilih batch melalui WhatsApp dan menunggu konfirmasi selama kuota masih tersedia.",
        0,
      ),
      faq(
        "Apakah saya harus sudah bisa bahasa Jepang?",
        "Tidak. Kelas ini dirancang untuk pemula yang ingin memahami arah persiapan sebelum menentukan target belajar dan program yang akan dipilih.",
        1,
      ),
      faq(
        "Siapa yang mengarahkan materi kelas?",
        "Materi berada di bawah arahan Sarif Hidayatulloh, Penanggung Jawab Pendidikan HIT dengan kualifikasi JLPT N1 dan pengalaman mengajar bahasa Jepang lebih dari tujuh tahun.",
        2,
      ),
      faq(
        "Apakah setelah kelas saya langsung bisa bekerja di Jepang?",
        "Kelas ini membantu kamu memahami langkah awal. Proses kerja tetap mencakup persiapan bahasa, pemeriksaan persyaratan, dokumen, kesehatan, dan seleksi sesuai jalur yang dipilih.",
        3,
      ),
      faq(
        "Apakah setelah kelas saya wajib mengambil program HIT?",
        "Tidak ada kewajiban mendaftar program berbayar setelah kelas. Kamu dapat menggunakan materi pengenalan untuk mempertimbangkan pilihan dan berkonsultasi kembali ketika sudah siap.",
        4,
      ),
      faq(
        "Bagaimana cara memilih batch?",
        "Klik tombol daftar, kirim data singkat melalui WhatsApp, lalu tim HIT akan menyampaikan pilihan batch yang masih tersedia beserta petunjuk mengikuti Zoom.",
        5,
      ),
    ],
    terms_conditions:
      "Pendaftaran dilakukan melalui WhatsApp HIT. Konfirmasi peserta mengikuti urutan pendaftaran dan ketersediaan maksimal 30 kursi pada setiap batch. Tautan Zoom dikirim kepada peserta yang sudah terkonfirmasi. Kelas ini merupakan sesi pengenalan; kecocokan program dan tahapan lanjutan tetap mengikuti profil serta persyaratan yang berlaku.",
    primary_cta_label: "Pilih Batch & Daftar Gratis",
    whatsapp_message_template:
      "Halo {lpk_name}, saya ingin mendaftar {offer_title}. Mohon info pilihan batch yang masih tersedia dan langkah konfirmasinya.",
  };
}

async function resolveExistingHeroMedia(tenantId: string, currentMediaId: string) {
  if (currentMediaId) {
    const currentMedia = await prisma.mediaAsset.findFirst({
      where: {
        id: currentMediaId,
        tenantId,
        status: "ACTIVE",
        mediaType: "IMAGE",
      },
      select: { id: true, fileName: true },
    });

    if (currentMedia && currentMedia.fileName !== generatedHeroFileName) {
      return currentMedia.id;
    }
  }

  const candidates = await prisma.mediaAsset.findMany({
    where: {
      tenantId,
      status: "ACTIVE",
      mediaType: "IMAGE",
      fileName: { not: generatedHeroFileName },
    },
    select: { id: true, width: true, height: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const landscape = candidates.find(
    (media) =>
      (media.width ?? 0) >= 1200 &&
      (media.height ?? 0) >= 700 &&
      (media.width ?? 0) > (media.height ?? 0),
  );
  const selected = landscape ?? candidates[0];

  if (!selected) {
    throw new Error("No active CMS image is available for the offer hero.");
  }

  return selected.id;
}

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: targetTenantSlug },
    select: { id: true, slug: true },
  });

  if (!tenant) {
    throw new Error(`Tenant ${targetTenantSlug} was not found.`);
  }

  const variant = await prisma.variant.findFirst({
    where: { tenantId: tenant.id, key: "indonesia" },
    select: { id: true },
  });

  if (!variant) {
    throw new Error("Indonesia variant was not found.");
  }

  const [offer, aboutPage] = await Promise.all([
    prisma.contentItem.findUnique({
      where: {
        variantId_collectionKey_slug: {
          variantId: variant.id,
          collectionKey: "offer",
          slug: offerSlug,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        dataJson: true,
        publishedDataJson: true,
        heroImageId: true,
        thumbnailImageId: true,
        publishedAt: true,
      },
    }),
    prisma.contentPage.findUnique({
      where: {
        variantId_pageKey: {
          variantId: variant.id,
          pageKey: "tentang_kami",
        },
      },
      select: { dataJson: true, publishedDataJson: true },
    }),
  ]);

  if (!offer) {
    throw new Error(`Offer ${offerSlug} was not found.`);
  }

  const aboutData = aboutPage
    ? record(aboutPage.publishedDataJson ?? aboutPage.dataJson)
    : {};
  const instructorImageId = stringValue(record(aboutData.education_quality).image_id);
  const heroMediaId = await resolveExistingHeroMedia(
    tenant.id,
    offer.heroImageId || offer.thumbnailImageId || "",
  );
  const nextDraft = updateOfferData(offer.dataJson, instructorImageId, heroMediaId);
  const nextPublished = updateOfferData(
    offer.publishedDataJson ?? offer.dataJson,
    instructorImageId,
    heroMediaId,
  );

  const preview = {
    mode: shouldApply ? "apply" : "dry-run",
    tenant: tenant.slug,
    offerId: offer.id,
    previousTitle: offer.title,
    nextTitle: nextPublished.title,
    heroMediaId: heroMediaId || "will upload on --apply",
    instructorImageId: instructorImageId || "not available",
    agendaCount: Array.isArray(nextPublished.agenda_items)
      ? nextPublished.agenda_items.length
      : 0,
    faqCount: Array.isArray(nextPublished.faqs) ? nextPublished.faqs.length : 0,
    batchLabel: nextPublished.batch_label,
  };
  const previewPath = join(tmpdir(), `nextcms-indonesia-offer-${Date.now()}.json`);
  await writeFile(previewPath, JSON.stringify(preview, null, 2));
  console.log(JSON.stringify(preview, null, 2));
  console.log(`Preview written to ${previewPath}`);

  if (!shouldApply) {
    console.log("Dry run only. Re-run with --apply to update the database.");
    return;
  }

  await prisma.contentItem.update({
    where: { id: offer.id },
    data: {
      title: stringValue(nextPublished.title),
      excerpt: stringValue(nextPublished.short_description),
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      startAt: new Date("2026-06-20T02:00:00.000Z"),
      expiredAt: new Date("2026-07-25T16:59:59.000Z"),
      publishedAt: offer.publishedAt ?? new Date(),
      thumbnailImageId: heroMediaId,
      heroImageId: heroMediaId,
      dataJson: json(nextDraft),
      publishedDataJson: json(nextPublished),
    },
  });

  console.log("Indonesia offer content and media updated successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to update Indonesia offer content.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
