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
  throw new Error("DATABASE_URL is required to update the Japan recruitment network page.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const shouldApply = args.has("--apply");
const targetHost = readArgument("--host") || "hit-japan.lpk.local:3000";
const targetTenantSlug = readArgument("--tenant") || "hit";

const lineMessage =
  "お世話になっております。インドネシア人材の採用ネットワークについて相談を希望しています。募集予定の職種、人数、時期に合わせて、候補者の確認方法と紹介までの流れを教えていただけますでしょうか。よろしくお願いいたします。";

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

function updateRecruitmentNetworkData(value: unknown) {
  const current = record(value);
  const hero = record(current.hero);
  const networkMapHero = record(current.network_map_hero);
  const networkOverview = record(current.network_overview);
  const finalCta = record(current.final_cta);

  return {
    ...current,
    hero: {
      ...hero,
      model: "network_map",
      eyebrow_label: "インドネシア採用ネットワーク",
      headline: "採用条件に合う候補者を、地域ネットワークから安定して確認します",
      subheadline:
        "地域の紹介基盤、教育機関、既存候補者との接点を活用し、職種・日本語力・就労意欲・書類状況を確認したうえで、比較しやすい候補者情報としてご提案します。",
      primary_cta_label: "採用ネットワークについて相談する",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "候補者情報を見る",
      secondary_href: "/candidate-profile",
    },
    network_map_hero: {
      ...networkMapHero,
      panel_badge_label: "候補者供給の全体像",
      panel_title: "地域接点から面接候補までを一つの流れで管理",
      trust_note:
        "対応エリアや候補者数は募集条件と時期により変動します。ご相談時には、職種・人数・時期に合わせて確認可能な候補者状況をご案内します。",
    },
    display_text: {
      ...record(current.display_text),
      coverage_regions_title: "地域ごとの候補者基盤",
      recruitment_sources_title: "候補者との接点と確認方法",
      screening_flow_title: "候補者を紹介する前の確認フロー",
      network_nodes_title: "パートナー企業への情報共有",
      quality_control_title: "候補者確認の基準",
      faq_title: "採用ネットワークに関するよくあるご質問",
      faq_description:
        "候補者紹介を進める前に、企業様からよくいただく確認事項をまとめています。",
    },
    proof_stats: [
      {
        icon_key: "network",
        value: "25+",
        label: "地域・教育機関・紹介ネットワークとの接点",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "briefcase",
        value: "職種別",
        label: "介護・外食・製造など条件別に候補者を整理",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "clipboard_check",
        value: "面接前",
        label: "動機・日本語・書類状況を確認して共有",
        sort_order: 2,
        is_enabled: true,
      },
    ],
    network_overview: {
      ...networkOverview,
      headline: "採用条件から逆算して、候補者の入口を設計します",
      description:
        "候補者を多く集めることだけを目的にせず、企業様の職種、勤務条件、必要な日本語力、受け入れ時期に合わせて、確認すべき候補者像を整理します。地域ネットワークから候補者を抽出し、本人の希望、就労意欲、職種理解、学習状況を確認したうえで、面接候補として比較しやすい情報にまとめます。\n\n初回相談では、募集条件を伺いながら、どの地域・どの候補者層から確認を進めるべきかを整理します。候補者状況は時期により変動するため、実際に紹介可能な人数や条件は、案件ごとに確認してご案内します。",
    },
    coverage_regions: [
      {
        region_name: "中部ジャワ",
        description:
          "当社拠点を中心に、介護、製造、外食などの候補者確認を進めやすい地域です。面談や学習状況の確認を行いやすく、候補者との継続的な接点を作りやすいことが特徴です。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        region_name: "東ジャワ",
        description:
          "製造、宿泊、外食などに関心を持つ候補者層を確認します。地域の紹介接点を活用し、勤務条件や日本で働く目的を事前に確認します。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        region_name: "西ジャワ・首都圏",
        description:
          "教育機関やオンライン登録を通じて、接客、外食、技術系職種に関心のある候補者を確認します。面接前に日本語力と希望条件を整理します。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        region_name: "教育機関・訓練機関",
        description:
          "日本語学習中の候補者、職業訓練経験のある候補者と接点を作り、学習状況や職種適性を確認します。企業様の条件に合わせて候補者層を絞り込みます。",
        sort_order: 3,
        is_enabled: true,
      },
      {
        region_name: "紹介・卒業生ネットワーク",
        description:
          "既存候補者や地域の紹介者からの情報を活用し、本人確認と就労意欲の確認を行います。紹介経路に依存しすぎず、当社側で確認した情報をもとに判断します。",
        sort_order: 4,
        is_enabled: true,
      },
    ],
    recruitment_sources: [
      {
        icon_key: "users_round",
        title: "地域紹介ネットワーク",
        description:
          "地域の信頼できる接点から候補者情報を集め、本人の希望条件、家族理解、日本で働く目的を確認します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "graduation_cap",
        title: "教育機関・訓練機関",
        description:
          "日本語学習や職業訓練に取り組む候補者を確認し、学習状況と職種理解を整理します。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "message_circle",
        title: "既存候補者・卒業生からの紹介",
        description:
          "候補者同士のつながりを活用しながら、紹介者の情報だけで判断せず、当社側で本人確認と面談を行います。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "file_text",
        title: "オンライン事前登録",
        description:
          "遠方の候補者も確認できるよう、基本情報、希望職種、日本語学習状況を整理してから面談に進めます。",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    screening_flow: [
      {
        icon_key: "clipboard_list",
        step_label: "ステップ 01",
        title: "採用条件の確認",
        description:
          "職種、人数、勤務開始時期、必要な日本語力、重視する人物像を伺い、候補者確認の基準を整理します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "user_search",
        step_label: "ステップ 02",
        title: "候補者母集団の抽出",
        description:
          "地域ネットワーク、教育機関、登録候補者から、条件に近い候補者層を確認します。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "message_circle",
        step_label: "ステップ 03",
        title: "動機・条件の確認",
        description:
          "日本で働く目的、希望職種、勤務条件への理解、家族の理解、長期就労への姿勢を確認します。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "languages",
        step_label: "ステップ 04",
        title: "日本語・職種理解の確認",
        description:
          "基礎会話、面接での受け答え、職場で使う表現、職種ごとの基本理解を確認します。",
        sort_order: 3,
        is_enabled: true,
      },
      {
        icon_key: "file_check",
        step_label: "ステップ 05",
        title: "プロフィール整理",
        description:
          "年齢、出身地、希望職種、学習状況、確認済み事項をまとめ、企業様が比較しやすい形で共有します。",
        sort_order: 4,
        is_enabled: true,
      },
      {
        icon_key: "calendar_check",
        step_label: "ステップ 06",
        title: "面接調整と事前説明",
        description:
          "候補者へ面接内容を事前に説明し、日程調整と面接前の確認を行います。",
        sort_order: 5,
        is_enabled: true,
      },
    ],
    network_nodes: [
      {
        region_label: "初回相談",
        title: "採用条件シート",
        description:
          "職種、人数、勤務条件、必要な日本語力、希望時期を整理し、候補者確認の前提を明確にします。",
        image_id: "",
        sort_order: 0,
        is_enabled: true,
      },
      {
        region_label: "候補者共有",
        title: "プロフィールと確認メモ",
        description:
          "候補者の基本情報だけでなく、動機、日本語学習状況、職種理解、確認済み事項を合わせて共有します。",
        image_id: "",
        sort_order: 1,
        is_enabled: true,
      },
      {
        region_label: "選考進行",
        title: "面接ステータスの更新",
        description:
          "候補者の意思確認、面接日程、追加確認事項を整理し、企業様が進捗を把握しやすい状態にします。",
        image_id: "",
        sort_order: 2,
        is_enabled: true,
      },
      {
        region_label: "改善",
        title: "フィードバックの反映",
        description:
          "面接後の評価や条件のずれを確認し、次回候補者の抽出基準と事前説明に反映します。",
        image_id: "",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    quality_control_items: [
      {
        icon_key: "badge_check",
        title: "本人情報の確認",
        description:
          "氏名、年齢、出身地、連絡先、学習状況などの基本情報を確認し、候補者プロフィールとして整理します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "heart_handshake",
        title: "就労意欲と家族理解",
        description:
          "日本で働く目的、希望条件、家族の理解を確認し、選考途中の認識違いを減らします。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "languages",
        title: "日本語学習状況",
        description:
          "現在の学習レベル、面接での受け答え、職場で使う基本表現を確認し、必要に応じて学習課題を整理します。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "briefcase",
        title: "職種理解",
        description:
          "介護、外食、製造など、希望職種ごとに仕事内容、勤務姿勢、基本ルールへの理解を確認します。",
        sort_order: 3,
        is_enabled: true,
      },
      {
        icon_key: "file_check",
        title: "書類・手続き状況",
        description:
          "採用ルートに応じて必要となる情報や準備状況を確認し、次の手続きに進みやすい形で共有します。",
        sort_order: 4,
        is_enabled: true,
      },
      {
        icon_key: "shield_check",
        title: "紹介前レビュー",
        description:
          "候補者情報、確認メモ、企業様の条件との適合を確認してから、面接候補としてご案内します。",
        sort_order: 5,
        is_enabled: true,
      },
    ],
    faqs: [
      {
        question: "どの分野の候補者を確認できますか？",
        answer:
          "介護、外食、製造、宿泊・清掃などを中心に、企業様の募集条件に合わせて候補者状況を確認します。対応可能な分野や人数は時期により変動するため、まずは職種、人数、希望時期をお知らせください。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        question: "候補者の質はどのように確認していますか？",
        answer:
          "本人情報、就労意欲、希望条件、日本語学習状況、職種理解を面談で確認します。紹介前には、企業様の条件と候補者の状況を照らし合わせ、比較しやすいプロフィールとして整理します。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        question: "候補者が途中で辞退するリスクにはどう対応しますか？",
        answer:
          "選考前に本人の希望条件、家族理解、勤務開始時期への認識を確認し、認識違いを減らすよう努めます。状況が変わった場合は早めに共有し、条件に近い別候補の確認も進めます。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        question: "候補者プロフィールには何が含まれますか？",
        answer:
          "年齢、出身地、希望職種、日本語学習状況、職種理解、確認済み事項、面接前に補足すべき点などを整理します。企業様が候補者を比較しやすい形で共有します。",
        sort_order: 3,
        is_enabled: true,
      },
      {
        question: "紹介までにどのくらい時間がかかりますか？",
        answer:
          "募集条件と候補者状況により異なります。条件確認後、すぐに候補者を確認できる場合もありますが、職種や日本語レベルの条件が明確なほど、候補者抽出と面接調整を進めやすくなります。",
        sort_order: 4,
        is_enabled: true,
      },
      {
        question: "紹介経路や候補者への説明は管理されていますか？",
        answer:
          "地域紹介や教育機関など複数の接点を活用しますが、候補者を紹介する前に当社側で本人確認と説明内容の確認を行います。必要な情報は企業様にも分かりやすく共有します。",
        sort_order: 5,
        is_enabled: true,
      },
    ],
    final_cta: {
      ...finalCta,
      headline: "採用条件に合わせて、候補者確認を始めませんか",
      description:
        "職種、人数、勤務開始時期、求める日本語力をお知らせください。地域ネットワークから候補者状況を確認し、面接前に必要な情報を整理してご案内します。",
      primary_cta_label: "採用ネットワークについて相談する",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "候補者情報を見る",
      secondary_href: "/candidate-profile",
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
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "jaringan_rekrutmen" } },
    select: { id: true, title: true, status: true, dataJson: true, publishedDataJson: true },
  });

  if (!page) {
    throw new Error("Japan recruitment network page not found.");
  }

  const updatedDraft = updateRecruitmentNetworkData(page.dataJson);
  const updatedPublished = updateRecruitmentNetworkData(
    isRecord(page.publishedDataJson) ? page.publishedDataJson : page.dataJson,
  );
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = join(tmpdir(), `nextcmslpk-japan-recruitment-network-${timestamp}.json`);

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

  const updatedDraftRecord = record(updatedDraft);
  const faqCount = Array.isArray(updatedDraftRecord.faqs) ? updatedDraftRecord.faqs.length : 0;

  console.log(
    JSON.stringify(
      {
        mode: shouldApply ? "apply" : "dry-run",
        targetHost,
        matchedDomainHost: domain?.host ?? null,
        variantId: variant.id,
        pageId: page.id,
        backupPath,
        currentTitle: page.title,
        nextTitle: "採用ネットワーク",
        nextHeadline: String(record(updatedDraft.hero).headline || ""),
        faqCount,
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
      title: "採用ネットワーク",
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
        verifiedPublishedHeadline: String(
          record(record(verified?.publishedDataJson).hero).headline || "",
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
