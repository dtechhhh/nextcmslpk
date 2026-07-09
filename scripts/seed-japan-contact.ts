import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import {
  Prisma,
  PrismaClient,
  PublishStatus,
} from "../src/generated/prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the Japan contact page.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function enabledItem<T extends Record<string, unknown>>(item: T, sortOrder: number) {
  return { ...item, sort_order: sortOrder, is_enabled: true };
}

async function main() {
  const targetHost = process.env.CONTACT_HOST || "hit-japan.lpk.local:3000";
  const targetTenantSlug = process.env.CONTACT_TENANT_SLUG || "hit";
  const variantByDomain = await prisma.variant.findFirst({
    where: { key: "japan", domains: { some: { host: targetHost } } },
    select: { id: true, tenantId: true },
  });
  const variant =
    variantByDomain ??
    (await prisma.variant.findFirst({
      where: { key: "japan", tenant: { slug: targetTenantSlug } },
      select: { id: true, tenantId: true },
    }));

  if (!variant) {
    throw new Error(`Japan variant for ${targetHost} or tenant ${targetTenantSlug} was not found.`);
  }

  const existingPage = await prisma.contentPage.findUnique({
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "contact" } },
    select: { dataJson: true },
  });
  const existingData = isRecord(existingPage?.dataJson) ? existingPage.dataJson : {};
  const existingHero = isRecord(existingData.hero) ? existingData.hero : {};

  const lineMessage =
    "インドネシア人材の採用について相談したいです。会社名：／ご担当者名：／職種：／採用予定人数：／希望時期：";

  const pageData = {
    ...existingData,
    hero: {
      ...existingHero,
      media_type: "image",
      eyebrow_label: "インドネシア人材の採用をご検討の企業様へ",
      headline: "採用計画に合ったインドネシア人材をご提案します",
      subheadline:
        "特定技能を中心に、候補者のご紹介、日本語・職業教育、面接調整、入国前準備まで一貫してサポートします。まずは貴社の採用課題をお聞かせください。",
      primary_cta_label: "LINEで相談する",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "お問い合わせフォーム",
      secondary_href: "#contact-inquiry",
    },
    display_text: {
      line_cta_label: "LINEで相談する",
      contact_channels_title: "ご希望の方法でお問い合わせください",
      contact_channels_description:
        "ご相談内容やお急ぎの度合いに合わせて、LINE、メール、またはお問い合わせフォームをご利用ください。",
      consultation_topics_title: "このようなご相談を承ります",
      consultation_topics_description:
        "採用条件がまだ確定していない段階でも、必要な情報を整理しながらご相談いただけます。",
      inquiry_form_title: "採用について相談する",
      inquiry_form_description:
        "分かる範囲でご入力ください。入力内容をもとにメールが作成されます。",
      preparation_title: "ご相談時にお知らせいただきたい事項",
      preparation_description:
        "すべて決まっている必要はありません。現時点で分かる内容だけでご相談いただけます。",
      business_info_title: "会社・窓口情報",
      business_info_cta_label: "LINEで問い合わせる",
      inquiry_flow_title: "お問い合わせからご提案まで",
      faq_title: "よくあるご質問",
    },
    trust_points: [
      enabledItem(
        {
          icon_key: "languages",
          title: "日本語でのご相談に対応",
          description: "採用条件や選考方法について日本語でご相談いただけます。",
        },
        0,
      ),
      enabledItem(
        {
          icon_key: "screen_share",
          title: "オンライン面談が可能",
          description: "日本からオンラインで採用条件や進め方をご相談いただけます。",
        },
        1,
      ),
      enabledItem(
        {
          icon_key: "clock",
          title: "担当者より順次ご連絡",
          description: "営業時間内に内容を確認し、担当者からご連絡します。",
        },
        2,
      ),
    ],
    contact_channels: {
      line_official_account_id: "",
      line_cta_label: "LINEで相談する",
      line_message_template: lineMessage,
      line_description: "お急ぎの方や、まずは簡単に相談したい方におすすめです。",
      business_email: "",
      email_subject_template: "インドネシア人材採用に関するお問い合わせ",
      email_description: "資料の添付や、社内関係者を含むご連絡にご利用ください。",
      form_cta_label: "フォームに入力する",
    },
    consultation_topics: [
      enabledItem(
        {
          icon_key: "id_card",
          title: "在留資格・対象分野",
          description: "採用予定の業務と利用可能な在留資格・制度について確認します。",
        },
        0,
      ),
      enabledItem(
        {
          icon_key: "user_search",
          title: "候補者の条件",
          description: "日本語力、職務経験、人物像など、選考条件を整理します。",
        },
        1,
      ),
      enabledItem(
        {
          icon_key: "users",
          title: "採用人数・採用時期",
          description: "必要人数と希望時期に合わせて候補者紹介の進め方をご案内します。",
        },
        2,
      ),
      enabledItem(
        {
          icon_key: "calendar_check",
          title: "面接・選考の調整",
          description: "面接日程、確認項目、通訳を含む選考支援についてご相談いただけます。",
        },
        3,
      ),
      enabledItem(
        {
          icon_key: "book_open_check",
          title: "入社前教育",
          description: "日本語教育、職業教育、企業別の事前準備について確認します。",
        },
        4,
      ),
      enabledItem(
        {
          icon_key: "handshake",
          title: "受入れ・定着に向けた連携",
          description: "入国前後の役割分担や関係機関との連携方法を整理します。",
        },
        5,
      ),
    ],
    inquiry_form: {
      submit_label: "入力内容をメールで送信する",
      consent_label: "入力内容および個人情報の取り扱いに同意します。",
      response_note: "営業時間内に内容を確認し、担当者より順次ご連絡します。",
    },
    preparation_items: [
      "採用を検討している職種・主な仕事内容",
      "採用予定人数と希望時期",
      "勤務地、勤務時間、シフト、住居などの雇用条件",
      "希望する日本語レベル、経験、資格",
      "面接方法と選考で確認したい事項",
      "現在感じている採用・受入れ上の課題",
    ],
    partnership_pic: {
      name: "Hashimoto Indo Trust 採用支援チーム",
      role: "日本企業様お問い合わせ窓口",
      photo_image_id: "",
      description:
        "インドネシア人材の採用条件整理から候補者紹介、面接調整、入社前教育まで、担当チームが日本語で対応します。条件が未確定の段階でも、採用目的と仕事内容から一緒に整理いたします。",
    },
    business_info: {
      description:
        "インドネシア現地の採用・教育拠点です。所在地、営業時間、対応言語をご確認いただけます。ご訪問をご希望の場合は、事前に担当者へご連絡ください。",
      business_hours: "",
      language_support: ["日本語", "インドネシア語"],
      address: "",
      map_url: "",
      map_embed_url: "",
    },
    inquiry_flow: [
      enabledItem(
        {
          icon_key: "mail",
          title: "お問い合わせ",
          description: "LINE、メール、またはフォームからご相談内容をお送りください。",
        },
        0,
      ),
      enabledItem(
        {
          icon_key: "screen_share",
          title: "オンラインヒアリング",
          description: "採用背景、仕事内容、人数、時期、ご希望条件を確認します。",
        },
        1,
      ),
      enabledItem(
        {
          icon_key: "clipboard_check",
          title: "採用プラン・候補者のご提案",
          description: "条件に合った進め方と候補者情報をご案内します。",
        },
        2,
      ),
      enabledItem(
        {
          icon_key: "calendar_check",
          title: "面接・選考の調整",
          description: "面接日程の調整や、必要に応じた通訳・選考支援を行います。",
        },
        3,
      ),
    ],
    faqs: [
      enabledItem(
        {
          question: "採用人数や時期がまだ決まっていなくても相談できますか。",
          answer:
            "はい。採用目的や想定している仕事内容を伺いながら、必要人数、時期、候補者条件を一緒に整理します。",
        },
        0,
      ),
      enabledItem(
        {
          question: "どのような業種・職種に対応していますか。",
          answer:
            "特定技能の対象分野を中心にご相談を承ります。実際の仕事内容を確認したうえで、対応可否と必要な要件をご案内します。",
        },
        1,
      ),
      enabledItem(
        {
          question: "候補者の日本語力や経験はどのように確認しますか。",
          answer:
            "日本語学習状況、資格、職務経験、面接での受け答えなどを確認し、企業様の選考条件に合わせて情報を整理します。",
        },
        2,
      ),
      enabledItem(
        {
          question: "オンラインで打ち合わせできますか。",
          answer:
            "はい。日本からオンラインでご参加いただけます。日程はお問い合わせ後に担当者が調整します。",
        },
        3,
      ),
      enabledItem(
        {
          question: "問い合わせ後はどのように進みますか。",
          answer:
            "採用条件をヒアリングした後、候補者紹介と選考の進め方をご提案します。必要に応じて面接調整や入社前教育についてもご案内します。",
        },
        4,
      ),
    ],
    final_cta: {
      headline: "インドネシア人材の採用について、まずはご相談ください",
      description:
        "採用人数や時期がまだ決まっていない段階でもご相談いただけます。貴社の状況を伺い、適切な進め方をご案内します。",
      primary_cta_label: "LINEで問い合わせる",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "",
      secondary_document_url: "",
      secondary_document_file_id: "",
    },
  };

  const json = pageData as Prisma.InputJsonValue;

  await prisma.contentPage.upsert({
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "contact" } },
    update: {
      title: "お問い合わせ",
      slug: "contact",
      status: PublishStatus.PUBLISHED,
      dataJson: json,
      publishedDataJson: json,
    },
    create: {
      tenantId: variant.tenantId,
      variantId: variant.id,
      pageKey: "contact",
      title: "お問い合わせ",
      slug: "contact",
      status: PublishStatus.PUBLISHED,
      dataJson: json,
      publishedDataJson: json,
    },
  });

  console.log(`Updated the Japanese contact page for ${targetHost}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Japan contact seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
