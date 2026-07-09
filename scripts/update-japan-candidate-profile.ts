import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import { Prisma, PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env" });

const args = new Set(process.argv.slice(2));

if (!args.has("--skip-env-local")) {
  config({ path: ".env.local", override: true });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to update the Japan candidate profile page.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const shouldApply = args.has("--apply");
const targetHost = readArgument("--host") || "hit-japan.lpk.local:3000";
const targetTenantSlug = readArgument("--tenant") || "hit";

const lineMessage =
  "お世話になっております。インドネシア人材の採用について相談を希望しています。採用予定の職種、人数、時期について確認しながら、候補者情報をご提案いただけますでしょうか。よろしくお願いいたします。";

function readArgument(name: string) {
  const prefix = `${name}=`;
  const value = process.argv.slice(2).find((argument) => argument.startsWith(prefix));

  return value?.slice(prefix.length).trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeHost(value: string) {
  return value.trim().toLowerCase();
}

function stripPort(host: string) {
  if (host.startsWith("[")) {
    const bracketEnd = host.indexOf("]");

    return bracketEnd >= 0 ? host.slice(0, bracketEnd + 1) : host;
  }

  const [hostname, port, ...rest] = host.split(":");

  if (hostname && port && rest.length === 0 && /^\d{1,5}$/.test(port)) {
    return hostname;
  }

  return host;
}

function record(value: unknown) {
  return isRecord(value) ? value : {};
}

function updateCandidateProfileData(value: unknown) {
  const current = record(value);
  const hero = record(current.hero);
  const candidatePoolHero = record(current.candidate_pool_hero);
  const whyIndonesia = record(current.why_indonesia);
  const finalCta = record(current.final_cta);

  return {
    ...current,
    hero: {
      ...hero,
      model: "candidate_pool",
      eyebrow_label: "候補者情報",
      headline: "日本企業の採用基準に合わせたインドネシア人材をご紹介します",
      subheadline:
        "介護・外食・製造などの分野に向けて、日本語学習、職種理解、面接準備を進めた候補者をご提案します。",
      primary_cta_label: "候補者について相談する",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "人材プロフィールを見る",
      secondary_href: "/candidate-profile#candidate-profiles",
    },
    candidate_pool_hero: {
      ...candidatePoolHero,
      eyebrow_label: "候補者情報",
      headline: "採用条件に合わせて候補者を確認できます",
      subheadline:
        "希望職種、在留資格、日本語学習状況、面接準備の状況を整理し、企業様の採用条件に沿ってご提案します。",
      primary_cta_label: "候補者について相談する",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "人材プロフィールを見る",
      secondary_href: "/candidate-profile#candidate-profiles",
      trust_note:
        "候補者情報は採用条件に合わせて確認し、面接前に必要な情報を整理してご案内します。",
      stats: [
        {
          icon_key: "briefcase",
          value: "複数分野",
          label: "介護・外食・製造などに対応",
          sort_order: 0,
          is_enabled: true,
        },
        {
          icon_key: "languages",
          value: "N4相当〜",
          label: "日本語学習状況を確認",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "shield_check",
          value: "面接前",
          label: "希望条件・職種理解を確認",
          sort_order: 2,
          is_enabled: true,
        },
      ],
      candidate_cards: [
        {
          initials: "AR",
          name: "A.R.",
          nationality_label: "インドネシア",
          target_sector_label: "介護 / 特定技能",
          age_label: "24歳",
          japanese_level_label: "N4相当",
          readiness_label: "面接準備中",
          availability_label: "条件確認後に提案",
          image_id: "",
          sort_order: 0,
          is_enabled: true,
        },
        {
          initials: "DS",
          name: "D.S.",
          nationality_label: "インドネシア",
          target_sector_label: "外食 / 特定技能",
          age_label: "22歳",
          japanese_level_label: "N4学習中",
          readiness_label: "職種理解確認済み",
          availability_label: "候補者リスト候補",
          image_id: "",
          sort_order: 1,
          is_enabled: true,
        },
        {
          initials: "MF",
          name: "M.F.",
          nationality_label: "インドネシア",
          target_sector_label: "製造 / 技能実習",
          age_label: "25歳",
          japanese_level_label: "基礎会話確認",
          readiness_label: "面接前確認済み",
          availability_label: "条件により調整",
          image_id: "",
          sort_order: 2,
          is_enabled: true,
        },
        {
          initials: "SN",
          name: "S.N.",
          nationality_label: "インドネシア",
          target_sector_label: "宿泊・清掃",
          age_label: "23歳",
          japanese_level_label: "N5〜N4学習中",
          readiness_label: "学習継続中",
          availability_label: "相談可能",
          image_id: "",
          sort_order: 3,
          is_enabled: true,
        },
      ],
    },
    display_text: {
      ...record(current.display_text),
      candidate_strengths_title: "候補者の特徴",
      supported_pathways_title: "対応可能な在留資格・採用ルート",
      candidate_examples_title: "候補者プロフィール例",
      selection_assurance_title: "選考前の確認体制",
      selection_assurance_description:
        "候補者の希望条件、職種理解、日本語学習状況を事前に確認し、企業様の採用基準に沿ってご提案します。",
      handoff_process_title: "ご相談から候補者提案まで",
      handoff_process_description:
        "採用条件の確認から候補者紹介、面接調整まで、実務に合わせて段階的に進めます。",
      faq_title: "候補者紹介に関するよくあるご質問",
      faq_description:
        "採用条件に合わせた候補者確認を進める前に、よくいただくご質問をまとめました。",
      readiness_framework_title: "受け入れ前の準備項目",
    },
    proof_stats: [
      {
        icon_key: "users",
        value: "職種別",
        label: "採用条件に合わせて候補者を整理",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "circle_check",
        value: "事前確認",
        label: "希望条件・日本語・面接姿勢を確認",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "message_circle",
        value: "継続支援",
        label: "面接調整から受け入れ前準備まで対応",
        sort_order: 2,
        is_enabled: true,
      },
    ],
    why_indonesia: {
      ...whyIndonesia,
      media_type: String(whyIndonesia.media_type || "image"),
      headline: "インドネシア人材が採用候補として選ばれる理由",
      description:
        "インドネシアには若く意欲的な人材が多く、日本での就労に向けて日本語学習や生活習慣の理解を進める候補者が増えています。当社では、候補者の希望条件と企業様の採用条件を丁寧に確認し、長期的に働く意欲のある人材をご提案します。",
      bullet_items: [
        "日本で働く目的や希望条件を事前に確認",
        "職種ごとの基礎理解と面接準備をサポート",
        "採用条件に合わせて候補者情報を整理",
      ],
    },
    candidate_strengths: [
      {
        icon_key: "target",
        title: "日本で働く意欲",
        description:
          "候補者の就労目的、希望職種、勤務条件への理解を確認し、企業様の採用条件に合う候補者をご提案します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "languages",
        title: "日本語学習の継続",
        description:
          "基礎会話、職場で使う表現、面接時の受け答えなど、採用前に確認しやすい形で学習状況を整理します。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "handshake",
        title: "職場理解と姿勢",
        description:
          "時間管理、報告・連絡・相談、チームで働く姿勢など、日本の職場で求められる基本姿勢を重視します。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "clipboard_check",
        title: "面接前の情報整理",
        description:
          "年齢、学習状況、希望職種、在留資格の方向性など、企業様が比較しやすいプロフィールとしてご案内します。",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    candidate_examples: [
      {
        initials: "AR",
        name: "A.R.",
        age_origin_label: "24歳 / 中部ジャワ",
        highlight_tags: ["介護", "N4相当", "特定技能"],
        background_label: "経歴・学習状況",
        background_text:
          "介護分野での就労を希望し、日本語の基礎会話と介護現場で使う表現を継続して学習しています。",
        target_path_label: "希望職種・在留資格",
        target_path_text: "介護分野 / 特定技能を想定。採用条件に合わせて詳細確認が可能です。",
        language_label: "日本語レベル",
        language_text: "N4相当を目標に学習中。面接での自己紹介、勤務希望、基本確認に対応できるよう準備しています。",
        character_label: "面接・勤務姿勢",
        character_text: "穏やかな受け答えで、長期就労への意欲を確認しています。",
        screening_label: "確認状況",
        screening_text: "希望条件、家族同意、職種理解を確認済み。面接前に追加条件を確認します。",
        availability_label: "紹介可能時期",
        availability_text: "採用条件確認後、候補者リストとして提案可能です。",
        readiness_label: "面接前確認済み",
        readiness_is_enabled: true,
        image_id: "",
        sort_order: 0,
        is_enabled: true,
      },
      {
        initials: "DS",
        name: "D.S.",
        age_origin_label: "22歳 / 西ジャワ",
        highlight_tags: ["外食", "接客", "N4学習中"],
        background_label: "経歴・学習状況",
        background_text:
          "接客業務に関心があり、外食分野で必要な基本表現と職場マナーを学習しています。",
        target_path_label: "希望職種・在留資格",
        target_path_text: "外食分野 / 特定技能を想定。勤務時間や勤務地条件を確認しながら提案します。",
        language_label: "日本語レベル",
        language_text: "N4学習中。注文対応、あいさつ、簡単な報連相を中心に準備しています。",
        character_label: "面接・勤務姿勢",
        character_text: "明るい受け答えで、接客業務への適性を確認しています。",
        screening_label: "確認状況",
        screening_text: "希望職種、勤務条件、面接姿勢を確認済み。",
        availability_label: "紹介可能時期",
        availability_text: "企業様の募集条件に合わせて候補者として確認可能です。",
        readiness_label: "職種理解確認済み",
        readiness_is_enabled: true,
        image_id: "",
        sort_order: 1,
        is_enabled: true,
      },
      {
        initials: "MF",
        name: "M.F.",
        age_origin_label: "25歳 / 東ジャワ",
        highlight_tags: ["製造", "技能実習", "基礎会話"],
        background_label: "経歴・学習状況",
        background_text:
          "製造現場での勤務を希望し、安全意識、時間管理、チーム作業の基本理解を確認しています。",
        target_path_label: "希望職種・在留資格",
        target_path_text: "製造分野 / 技能実習または関連ルートを想定。受け入れ条件に応じて確認します。",
        language_label: "日本語レベル",
        language_text: "基礎会話を学習中。現場指示、確認、あいさつを中心に準備しています。",
        character_label: "面接・勤務姿勢",
        character_text: "落ち着いた受け答えで、ルールを守って働く姿勢を確認しています。",
        screening_label: "確認状況",
        screening_text: "希望条件、職種理解、基本的な面接応答を確認済み。",
        availability_label: "紹介可能時期",
        availability_text: "募集条件確認後、候補者リストとして整理可能です。",
        readiness_label: "面接前確認済み",
        readiness_is_enabled: true,
        image_id: "",
        sort_order: 2,
        is_enabled: true,
      },
    ],
    supported_pathways: [
      {
        pathway_label: "特定技能",
        title: "即戦力を見据えた採用ルート",
        description:
          "介護、外食、製造など、企業様の分野と採用条件に合わせて候補者の方向性を確認します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        pathway_label: "技能実習",
        title: "育成を前提とした受け入れ",
        description:
          "職種理解、生活適応、基礎日本語を重視し、受け入れ前の準備を段階的に進めます。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        pathway_label: "技人国",
        title: "専門性を活かす採用相談",
        description:
          "学歴、職務経験、日本語力などを確認し、企業様の業務内容に合う可能性を整理します。",
        sort_order: 2,
        is_enabled: true,
      },
    ],
    selection_assurance: [
      {
        icon_key: "user_search",
        title: "採用条件の確認",
        description:
          "職種、人数、勤務地、勤務条件、必要な日本語レベルを確認し、候補者提案の基準を整理します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "message_circle",
        title: "候補者ヒアリング",
        description:
          "希望職種、就労意欲、家族同意、勤務条件への理解を確認し、面接前の不安を減らします。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "languages",
        title: "日本語・面接準備",
        description:
          "自己紹介、志望理由、職場での基本表現を確認し、企業様が比較しやすい状態に整えます。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "file_check",
        title: "書類状況の整理",
        description:
          "採用ルートに応じて、学習状況や必要情報を確認し、次の手続きに進みやすい形で共有します。",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    handoff_process: [
      {
        icon_key: "clipboard_list",
        step_label: "Step 01",
        title: "採用条件のヒアリング",
        description:
          "職種、人数、勤務開始時期、希望する日本語レベルなどを確認します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "users_round",
        step_label: "Step 02",
        title: "候補者の抽出",
        description:
          "条件に近い候補者を確認し、プロフィールとして比較しやすい形に整理します。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "file_text",
        step_label: "Step 03",
        title: "プロフィール共有",
        description:
          "学習状況、希望職種、確認済み事項をまとめ、面接候補としてご案内します。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "calendar_check",
        step_label: "Step 04",
        title: "面接調整",
        description:
          "候補者への事前説明と面接日程の調整を行い、スムーズな選考をサポートします。",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    faqs: [
      {
        question: "どの分野の候補者を紹介できますか？",
        answer:
          "介護、外食、製造、宿泊・清掃など、企業様の採用条件に合わせて候補者情報を確認します。対応分野は時期や候補者状況により変わるため、まずは職種・人数・希望時期をお知らせください。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        question: "候補者の日本語レベルはどのように確認していますか？",
        answer:
          "日本語学習状況、面接での受け答え、職場で使う基本表現を確認し、候補者プロフィールとして整理します。必要に応じて、企業様の面接前に確認ポイントを共有します。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        question: "候補者プロフィールにはどのような情報が含まれますか？",
        answer:
          "年齢、出身地、希望職種、在留資格の方向性、日本語学習状況、面接準備状況、確認済み事項などを、比較しやすい形でご案内します。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        question: "採用条件に合わせて候補者を絞り込めますか？",
        answer:
          "はい。職種、勤務地、勤務開始時期、日本語レベル、経験・適性などを確認し、条件に近い候補者をご提案します。",
        sort_order: 3,
        is_enabled: true,
      },
      {
        question: "問い合わせ後、どのくらいで候補者情報を確認できますか？",
        answer:
          "採用条件を確認したうえで、候補者状況に応じてご案内します。すぐにご紹介可能な候補者がいる場合は、プロフィール確認から面接調整までスムーズに進めます。",
        sort_order: 4,
        is_enabled: true,
      },
      {
        question: "面接前のサポートはありますか？",
        answer:
          "候補者への事前説明、面接内容の確認、日程調整などをサポートします。企業様が候補者を確認しやすい状態で面接に進めるよう準備します。",
        sort_order: 5,
        is_enabled: true,
      },
    ],
    readiness_framework: [
      {
        icon_key: "message_circle",
        title: "日本語コミュニケーション",
        description:
          "あいさつ、自己紹介、確認表現など、面接と職場で使う基礎表現を確認します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "briefcase",
        title: "職場マナー",
        description:
          "時間管理、報告・連絡・相談、チームで働く姿勢など、受け入れ前に意識づけを行います。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "home",
        title: "生活適応",
        description:
          "日本での生活ルール、勤務後の相談体制、長期就労への意識を確認します。",
        sort_order: 2,
        is_enabled: true,
      },
    ],
    final_cta: {
      ...finalCta,
      headline: "採用条件に合う候補者をご提案します",
      description:
        "職種、人数、時期、日本語レベルなどをお知らせください。条件に合わせて候補者情報を整理し、面接前に確認しやすい形でご案内します。",
      primary_cta_label: "候補者について相談する",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "お問い合わせ",
      secondary_href: "/contact",
    },
  };
}

async function main() {
  const normalizedTargetHost = normalizeHost(targetHost);
  const hostWithoutPort = stripPort(normalizedTargetHost);
  const hostFilters =
    normalizedTargetHost === hostWithoutPort
      ? [{ host: normalizedTargetHost }, { host: { startsWith: `${normalizedTargetHost}:` } }]
      : [{ host: normalizedTargetHost }, { host: hostWithoutPort }];
  const domains = await prisma.domain.findMany({
    where: {
      status: "ACTIVE",
      OR: hostFilters,
      variant: { key: "japan" },
    },
    include: {
      variant: {
        select: { id: true, tenantId: true },
      },
    },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });
  const domain =
    domains.find((item) => normalizeHost(item.host) === normalizedTargetHost) ??
    domains.find((item) => stripPort(normalizeHost(item.host)) === hostWithoutPort) ??
    null;
  const variant =
    domain?.variant ??
    (await prisma.variant.findFirst({
      where: { key: "japan", tenant: { slug: targetTenantSlug } },
      select: { id: true, tenantId: true },
    }));

  if (!variant) {
    throw new Error(`Japan variant not found for host=${targetHost} or tenant=${targetTenantSlug}`);
  }

  const page = await prisma.contentPage.findUnique({
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "profil_kandidat" } },
    select: { id: true, title: true, status: true, dataJson: true, publishedDataJson: true },
  });

  if (!page) {
    throw new Error("Candidate profile page not found.");
  }

  const updatedDraft = updateCandidateProfileData(page.dataJson);
  const updatedPublished = updateCandidateProfileData(
    isRecord(page.publishedDataJson) ? page.publishedDataJson : page.dataJson,
  );
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = join(tmpdir(), `nextcmslpk-japan-candidate-profile-${timestamp}.json`);

  await writeFile(
    backupPath,
    JSON.stringify(
      {
        pageId: page.id,
        title: page.title,
        status: page.status,
        before: {
          dataJson: page.dataJson,
          publishedDataJson: page.publishedDataJson,
        },
        after: {
          dataJson: updatedDraft,
          publishedDataJson: updatedPublished,
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        mode: shouldApply ? "apply" : "dry-run",
        targetHost,
        matchedDomainHost: domain?.host ?? null,
        variantId: variant.id,
        pageId: page.id,
        backupPath,
        heroHeadline: String(record(record(page.dataJson).hero).headline || ""),
        nextHeroHeadline: String(record(updatedDraft.hero).headline || ""),
        nextPoolHeadline: String(record(updatedDraft.candidate_pool_hero).headline || ""),
      },
      null,
      2,
    ),
  );

  if (!shouldApply) {
    return;
  }

  await prisma.contentPage.update({
    where: { id: page.id },
    data: {
      title: "候補者情報",
      dataJson: updatedDraft as Prisma.InputJsonValue,
      publishedDataJson: updatedPublished as Prisma.InputJsonValue,
    },
  });

  const verified = await prisma.contentPage.findUnique({
    where: { id: page.id },
    select: { title: true, dataJson: true, publishedDataJson: true },
  });

  console.log(
    JSON.stringify(
      {
        applied: true,
        variantId: variant.id,
        title: verified?.title,
        verifiedHeadline: String(record(record(verified?.dataJson).hero).headline || ""),
        verifiedPoolHeadline: String(
          record(record(verified?.dataJson).candidate_pool_hero).headline || "",
        ),
        verifiedPublishedHeadline: String(
          record(record(verified?.publishedDataJson).hero).headline || "",
        ),
        verifiedPublishedPoolHeadline: String(
          record(record(verified?.publishedDataJson).candidate_pool_hero).headline || "",
        ),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
