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
  throw new Error("DATABASE_URL is required to update the Japan homepage.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const targetHost = readArgument("--host") || "hit-japan.lpk.local:3000";
const targetTenantSlug = readArgument("--tenant") || "hit";

const navigationLabels: Record<string, string> = {
  about: "企業情報",
  training_method: "教育・研修",
  candidate_profile: "候補者情報",
  news: "お役立ち情報",
  recruitment_network: "採用ネットワーク",
  sectors: "対応分野",
  contact: "お問い合わせ",
};

const footerCompanyLabels: Record<string, string> = {
  about: "企業情報",
  recruitment_network: "採用ネットワーク",
  training_method: "教育・研修",
};

const footerResourceLabels: Record<string, string> = {
  candidate_profile: "候補者情報",
  sectors: "対応分野",
  news: "お役立ち情報",
  curriculum: "教育内容",
};

const lineMessage =
  "お世話になっております。【貴社名／ご担当者名】：インドネシア人材の採用について相談を希望しております。採用予定の職種や時期について、詳しくお話を伺えますと幸いです。よろしくお願いいたします。";

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

function arrayOfRecords(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function localizeLinks(
  value: unknown,
  labels: Record<string, string>,
) {
  return arrayOfRecords(value).map((item) => ({
    ...item,
    label: labels[String(item.key)] || String(item.label || ""),
  }));
}

function updateHomepageData(value: unknown) {
  const current = record(value);
  const hero = record(current.hero);
  const whyIndonesia = record(current.why_indonesia_section);
  const finalCta = record(current.final_cta);
  const displayText = record(current.display_text);

  return {
    ...current,
    hero: {
      ...hero,
      eyebrow_label: "インドネシア人材の採用・育成パートナー",
      headline: "日本企業の現場に応える、インドネシア人材を育成",
      subheadline:
        "貴社の採用要件を丁寧に伺い、日本語、職場規律、業務理解を重視した教育を通じて、面接に向けた候補者の準備を支援します。",
      primary_cta_label: "LINEで採用相談",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "候補者情報を見る",
      secondary_href: "/candidate-profile",
    },
    stats: [
      {
        value: "25+",
        label: "地域採用ネットワーク",
        icon_key: "network",
        sort_order: 0,
        is_enabled: true,
      },
      {
        value: "N1",
        label: "JLPT N1の教育責任者",
        icon_key: "award",
        sort_order: 1,
        is_enabled: true,
      },
      {
        value: "8",
        label: "対応分野",
        icon_key: "briefcase",
        sort_order: 2,
        is_enabled: true,
      },
      {
        value: "2言語",
        label: "日本語・インドネシア語対応",
        icon_key: "languages",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    display_text: {
      ...displayText,
      achievements_title: "実績・取り組み",
      why_us_title: "採用に向けた人材づくり",
      legalities_title: "法人情報・許認可",
      latest_news_title: "採用担当者向け情報",
      latest_news_cta_label: "記事一覧を見る",
      new_badge_label: "新着",
    },
    why_indonesia_section: {
      ...whyIndonesia,
      eyebrow_label: "インドネシア人材という選択肢",
      headline: "若い人材基盤と学ぶ意欲を、日本企業の力へ",
      description:
        "インドネシアには、海外での就業を目指し、日本語や専門技能の習得に意欲を持つ若い人材が数多くいます。当社は中部ジャワを中心とした採用ネットワークを活用し、企業ごとの採用要件を踏まえながら、面接と就業に向けた候補者の準備を進めます。",
      bullet_items: [
        "若年層を中心とした豊富な人材基盤",
        "日本語・職場規律・安全意識を重視した教育",
        "企業ごとの採用要件に合わせた候補者準備",
        "中部ジャワを中心とする25以上の採用ネットワーク",
      ],
      cta_label: "候補者情報を詳しく見る",
      target_page: "candidate_profile",
    },
    why_us_cards: [
      {
        key: "about",
        href: "/about",
        title: "JLPT N1の教育責任者による指導",
        description:
          "高い日本語力を持つ教育責任者が、日本語学習の方針と指導品質を管理し、候補者の継続的な学習を支えます。",
        icon_key: "award",
        sort_order: 0,
        is_enabled: true,
      },
      {
        key: "recruitment_network",
        href: "/recruitment-network",
        title: "25以上の地域採用ネットワーク",
        description:
          "中部ジャワを中心に地域との連携を広げ、意欲や適性を確認しながら、多様な候補者との接点を構築しています。",
        icon_key: "network",
        sort_order: 1,
        is_enabled: true,
      },
      {
        key: "sectors",
        href: "/sectors",
        title: "8分野を想定した事前教育",
        description:
          "配属予定の業務を踏まえ、現場で使用する言葉、安全意識、基本動作など、就業前に必要な学習内容を整理します。",
        icon_key: "briefcase",
        sort_order: 2,
        is_enabled: true,
      },
      {
        key: "training_method",
        href: "/training-method",
        title: "日本の職場を意識した実践指導",
        description:
          "報告・連絡・相談、時間管理、チームで働く姿勢を重視し、日本企業の職場環境を意識した指導を行います。",
        icon_key: "clipboard_check",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    partnership_flow: {
      headline: "ご相談から候補者面接まで",
      description:
        "採用要件を共有いただいた後、候補者の選定と準備を進め、面接までの流れを丁寧にご案内します。",
      items: [
        {
          step_label: "STEP 1",
          icon_key: "clipboard_list",
          title: "採用要件の確認",
          description:
            "職種、人数、希望時期、必要な日本語力、現場で重視する姿勢などを伺います。",
          sort_order: 0,
          is_enabled: true,
        },
        {
          step_label: "STEP 2",
          icon_key: "user_search",
          title: "候補者の募集・選定",
          description:
            "地域ネットワークを活用し、経験、学習状況、適性を確認しながら候補者を選定します。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          step_label: "STEP 3",
          icon_key: "id_card",
          title: "面接候補者のご提案",
          description:
            "候補者の経歴、日本語学習状況、希望職種などを整理し、面接候補としてご案内します。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          step_label: "STEP 4",
          icon_key: "calendar_days",
          title: "面接・教育内容の調整",
          description:
            "面接日程を調整し、選考結果と配属予定の業務に応じて、その後の教育内容を確認します。",
          sort_order: 3,
          is_enabled: true,
        },
      ],
    },
    legalities: arrayOfRecords(current.legalities).map((item) => {
      const typeLabel = String(item.type_label || "");
      const isNib = typeLabel.startsWith("NIB");

      return {
        ...item,
        title: isNib ? "事業基本番号（NIB）" : "法人設立認可（AHU）",
        description: isNib
          ? "インドネシア政府のオンライン・シングル・サブミッション（OSS）制度に基づき発行された事業者登録番号です。"
          : "インドネシア法務人権省により承認された法人設立認可であり、当社の法人格と登録情報を示す公的書類です。",
        document_label: "証明書を確認する",
      };
    }),
    final_cta: {
      ...finalCta,
      headline: "インドネシア人材の採用についてご相談ください",
      description:
        "採用人数や時期がまだ確定していない段階でもご相談いただけます。貴社の状況と採用要件を伺い、候補者の準備と面接までの進め方をご案内します。",
      primary_cta_label: "LINEで採用相談",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "お問い合わせフォーム",
      secondary_href: "/contact",
    },
  };
}

function updateBrandHeader(value: unknown) {
  const current = record(value);
  const primaryCta = record(current.header_primary_cta);
  const secondaryCta = record(current.header_secondary_cta);

  return {
    ...current,
    navbar: localizeLinks(current.navbar, navigationLabels),
    header_primary_cta: {
      ...primaryCta,
      label: "LINEで採用相談",
      line_message_template: lineMessage,
    },
    header_secondary_cta: {
      ...secondaryCta,
      label: "会社案内",
    },
  };
}

function updateFooter(value: unknown) {
  const current = record(value);
  const brand = record(current.brand);
  const legal = record(current.legal);

  return {
    ...current,
    brand: {
      ...brand,
      short_description:
        "日本企業の採用要件に合わせ、インドネシア人材の募集、日本語教育、就業準備を支援しています。",
    },
    company_links: localizeLinks(current.company_links, footerCompanyLabels),
    resource_links: localizeLinks(current.resource_links, footerResourceLabels),
    legal: {
      ...legal,
      copyright_text:
        "© 2026 PT Hashimoto Indo Trust. 無断転載を禁じます。",
    },
  };
}

function updateLineContact(value: unknown) {
  const current = record(value);
  const lineContact = record(current.line_contact);
  const businessInfo = record(current.business_info);
  const contactNote = record(current.business_contact_note);

  return {
    ...current,
    line_contact: {
      ...lineContact,
      line_display_label: "LINEで採用相談",
      default_message_template: lineMessage,
    },
    business_info: {
      ...businessInfo,
      language_support: ["日本語", "インドネシア語"],
    },
    business_contact_note: {
      ...contactNote,
      short_note:
        "インドネシア人材の採用に関するご相談を、日本語で承ります。",
    },
  };
}

async function main() {
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
    throw new Error(
      `Japan variant for ${targetHost} or tenant ${targetTenantSlug} was not found.`,
    );
  }

  const page = await prisma.contentPage.findUnique({
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "homepage" } },
    select: {
      id: true,
      title: true,
      status: true,
      dataJson: true,
      publishedDataJson: true,
    },
  });
  const globals = await prisma.variantGlobalConfig.findMany({
    where: {
      variantId: variant.id,
      configKey: { in: ["brand_header", "footer", "line_business_contact"] },
    },
    select: { id: true, configKey: true, dataJson: true },
  });

  if (!page) {
    throw new Error("Published Japan homepage was not found.");
  }

  const updatedDraft = updateHomepageData(page.dataJson);
  const updatedPublished = updateHomepageData(
    isRecord(page.publishedDataJson) ? page.publishedDataJson : page.dataJson,
  );
  const globalUpdates = globals.map((globalConfig) => {
    const transformer =
      globalConfig.configKey === "brand_header"
        ? updateBrandHeader
        : globalConfig.configKey === "footer"
          ? updateFooter
          : updateLineContact;

    return {
      ...globalConfig,
      updatedData: transformer(globalConfig.dataJson),
    };
  });

  console.log(
    JSON.stringify(
      {
        mode: shouldApply ? "apply" : "dry-run",
        targetHost,
        pageId: page.id,
        pageTitle: page.title,
        globalConfigs: globalUpdates.map((item) => item.configKey),
        sections: [
          "hero",
          "stats",
          "why_indonesia_section",
          "why_us_cards",
          "partnership_flow",
          "legalities",
          "final_cta",
        ],
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
  const backupPath = join(
    tmpdir(),
    `nextcmslpk-japan-homepage-${timestamp}.json`,
  );
  await writeFile(
    backupPath,
    JSON.stringify({ targetHost, page, globals }, null, 2),
    "utf8",
  );

  await prisma.$transaction([
    prisma.contentPage.update({
      where: { id: page.id },
      data: {
        title: "ホーム",
        dataJson: updatedDraft as Prisma.InputJsonValue,
        publishedDataJson: updatedPublished as Prisma.InputJsonValue,
      },
    }),
    ...globalUpdates.map((globalConfig) =>
      prisma.variantGlobalConfig.update({
        where: { id: globalConfig.id },
        data: {
          dataJson: globalConfig.updatedData as Prisma.InputJsonValue,
        },
      }),
    ),
  ]);

  console.log(`Japan homepage content updated. Backup: ${backupPath}`);
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Japan homepage update failed.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
