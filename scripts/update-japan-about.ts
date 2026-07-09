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
  throw new Error("DATABASE_URL is required to update the Japan about page.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const targetHost = readArgument("--host") || "hit-japan.lpk.local:3000";
const targetTenantSlug = readArgument("--tenant") || "hit";

const lineMessage =
  "お世話になっております。【貴社名／ご担当者名】：インドネシア人材の採用・育成について相談を希望しております。採用予定の職種、人数、時期について詳しくお話を伺えますと幸いです。よろしくお願いいたします。";

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

function findTeamMember(items: Record<string, unknown>[], namePart: string) {
  return items.find((item) => String(item.name || "").includes(namePart)) ?? {};
}

function mediaIdFrom(item: Record<string, unknown>) {
  return String(item.image_id || "");
}

function updateAboutData(value: unknown) {
  const current = record(value);
  const hero = record(current.hero);
  const story = record(current.story);
  const finalCta = record(current.final_cta);
  const team = arrayOfRecords(current.team_members);
  const facilities = arrayOfRecords(current.facilities);
  const legalOverview = arrayOfRecords(current.legal_overview);
  const sarif = findTeamMember(team, "Sarif");

  return {
    ...current,
    hero: {
      ...hero,
      eyebrow_label: "PT HASHIMOTO INDO TRUSTについて",
      headline: "日本企業とともに、長く活躍できる人材を育てる。",
      subheadline:
        "インドネシア・中部ジャワ州スラゲンを拠点に、募集、日本語教育、職場理解、就業準備を一体的に支援しています。新しい組織だからこそ、企業様の採用要件に丁寧に向き合い、一社ごとに育成内容を組み立てます。",
      primary_cta_label: "採用・育成について相談する",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "会社情報を見る",
      secondary_href: "#company-profile",
    },
    display_text: {
      timeline_title: "設立までの歩みと現在",
      values_title: "私たちが大切にすること",
      facilities_title: "教育・研修環境",
      team_title: "運営・教育を支えるチーム",
      legal_overview_title: "法人情報・登録書類",
    },
    proof_stats: [
      {
        icon_key: "building_2",
        value: "2025",
        label: "法人設立",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "award",
        value: "N1",
        label: "JLPT N1の教育責任者",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "network",
        value: "25+",
        label: "地域採用ネットワーク",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "briefcase",
        value: "17年",
        label: "代表者の日本就労経験",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    company_status: {
      eyebrow_label: "会社情報",
      headline: "新しい組織に、現場経験と教育力を集約",
      description:
        "PT Hashimoto Indo Trustは、2025年に設立された人材育成・就業支援会社です。組織としての歩みは始まったばかりですが、日本で長年働いた代表者の現場理解、JLPT N1を持つ教育責任者、地域に根差した採用ネットワークを一つの体制にまとめています。\n\n現在は、日本企業様との対話を重ねながら、採用要件に応じた候補者募集と教育設計を進めています。",
      status_label: "パートナー企業募集中",
      last_updated_label: "2026年6月更新",
      facts: [
        {
          icon_key: "calendar_days",
          value: "2025年7月",
          label: "法人設立",
          description: "インドネシアで法人登録を行い、スラゲンを拠点に活動を開始しました。",
          sort_order: 0,
          is_enabled: true,
        },
        {
          icon_key: "map_pin",
          value: "Sragen",
          label: "中部ジャワの育成拠点",
          description: "地域人材との接点を生かし、募集から教育まで現地で支援します。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "award",
          value: "JLPT N1",
          label: "教育品質の責任体制",
          description: "最上位資格N1を持つ教育責任者が、日本語教育の方針と評価を統括します。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "users_round",
          value: "25以上",
          label: "地域採用ネットワーク",
          description: "中部ジャワを中心に、意欲ある若者との継続的な接点を構築しています。",
          sort_order: 3,
          is_enabled: true,
        },
      ],
    },
    story: {
      ...story,
      eyebrow_label: "設立の背景",
      headline: "日本で培った現場理解を、インドネシアの人材育成へ",
      body:
        "代表取締役のAris Supriyadiは、日本で17年にわたり働き、仕事の進め方、時間と約束を守る姿勢、周囲と協力することの大切さを現場で学んできました。\n\nその日本での就労期間に、ArisはHAP JAPAN創設者のHashimoto Shigetoのもとで勤務しました。長年の仕事を通じて築かれた信頼関係が、インドネシアで人材を育て、日本企業へつなぐ現在の取り組みの土台となっています。\n\n私たちが目指すのは、人数を送り出すことだけではありません。企業様が求める人物像を理解し、候補者が日本の職場で学び続け、周囲から信頼されるための準備を現地から支えることです。",
    },
    japan_relationship: {
      eyebrow_label: "日本との信頼関係",
      headline: "長年の仕事で築いた信頼を、育成と採用支援へ",
      description:
        "PT Hashimoto Indo Trustの日本との接点は、形式的な紹介から始まったものではありません。日本の職場でともに働き、仕事ぶりと人柄を理解してきた関係を背景に、日本企業が安心して相談できる現地体制づくりを進めています。",
      people: [
        {
          side_label: "日本側",
          name: "Hashimoto Shigeto",
          role: "HAP JAPAN創設者",
          organization: "日本側連携・事業アドバイス",
          summary:
            "Arisが日本で勤務していた時期の雇用主として、その仕事ぶりと人柄を長年にわたり見てきました。日本企業の視点から、採用と育成に関する助言・連携を行います。",
          sort_order: 0,
          is_enabled: true,
        },
        {
          side_label: "インドネシア側",
          name: "Aris Supriyadi",
          role: "PT Hashimoto Indo Trust 代表取締役",
          organization: "現地運営・企業対応",
          summary:
            "橋本茂人氏のもとで働いた経験と、日本の現場で培った理解を生かし、候補者募集、教育体制、企業様とのコミュニケーションを統括します。",
          sort_order: 1,
          is_enabled: true,
        },
      ],
      cooperation_scope: [
        "日本企業が求める人物像・採用要件の共有",
        "日本の職場文化を踏まえた教育内容への助言",
        "候補者情報と育成状況の丁寧な共有",
        "採用後の適応を見据えた連絡・相談体制",
      ],
      clarification_note:
        "日本側・インドネシア側の具体的な役割および契約範囲は、案件内容に応じて事前に整理し、企業様へ明確にご案内します。",
    },
    education_quality: {
      image_id: mediaIdFrom(sarif),
      eyebrow_label: "教育品質",
      qualification_label: "JLPT N1",
      headline: "最上位資格N1を持つ教育責任者が、学習品質を統括",
      description:
        "教育責任者のSarif Hidayatullohは、JLPTの最上位資格であるN1を保持し、職業訓練機関で7年以上の日本語指導経験を有しています。語彙や文法だけでなく、報告・連絡・相談、指示の理解、職場での受け答えまで、日本で働く場面を想定した教育方針と評価基準を整えます。",
      leader_name: "Sarif Hidayatulloh",
      leader_role: "教育責任者・日本語講師",
      experience_label: "日本語指導経験7年以上",
      focus_items: [
        "候補者ごとの日本語力を把握する継続評価",
        "配属分野で使う語彙・指示表現の事前学習",
        "報告・連絡・相談を含む職場コミュニケーション",
        "時間管理、規律、安全意識を含む就業準備",
      ],
    },
    operational_readiness: {
      headline: "現在の体制と取り組み",
      description:
        "設立年数だけではなく、何が整い、何を進めているかを明確にお伝えします。企業様との相談内容に合わせ、募集と教育の精度を段階的に高めています。",
      items: [
        {
          status: "completed",
          status_label: "整備済み",
          icon_key: "building_2",
          title: "法人設立・事業基本登録",
          description:
            "NIBおよび法人設立認可（AHU）を取得し、インドネシア法人として活動するための基礎登録を完了しています。",
          target_label: "2025年完了",
          sort_order: 0,
          is_enabled: true,
        },
        {
          status: "completed",
          status_label: "体制構築済み",
          icon_key: "graduation_cap",
          title: "教育責任者を中心とした指導体制",
          description:
            "JLPT N1を持つ教育責任者を中心に、日本語、職場理解、就業姿勢を指導する体制を整えています。",
          target_label: "継続改善",
          sort_order: 1,
          is_enabled: true,
        },
        {
          status: "in_progress",
          status_label: "展開中",
          icon_key: "network",
          title: "地域採用ネットワークの拡充",
          description:
            "中部ジャワを中心とする25以上の接点を活用し、就労意欲、学習姿勢、適性を確認できる募集基盤を広げています。",
          target_label: "候補者募集を継続",
          sort_order: 2,
          is_enabled: true,
        },
        {
          status: "in_progress",
          status_label: "受付中",
          icon_key: "handshake",
          title: "日本企業との採用要件ヒアリング",
          description:
            "職種、必要人数、日本語力、配属時期、現場で重視する姿勢を伺い、候補者選定と教育内容へ反映します。",
          target_label: "パートナー企業募集中",
          sort_order: 3,
          is_enabled: true,
        },
      ],
    },
    leadership_quote: {
      is_enabled: true,
      quote:
        "新しい組織だからこそ、一社一社の声を丁寧に聞き、候補者一人ひとりの成長に責任を持つ。その積み重ねで、長く信頼されるパートナーを目指します。",
      attribution_name: "Aris Supriyadi",
      attribution_role: "代表取締役",
      photo_image_id: String(record(current.leadership_quote).photo_image_id || ""),
    },
    timeline: [
      {
        year_label: "2008年",
        title: "日本での就労を開始",
        description:
          "Aris Supriyadiが来日し、日本の職場で規律、品質意識、チームワークを学び始めました。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        year_label: "2008年–2024年",
        title: "17年の現場経験と信頼関係",
        description:
          "日本で働き続ける中で、Hashimoto Shigetoとの信頼関係を築き、外国人材に求められる姿勢を現場から学びました。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        year_label: "2025年7月",
        title: "PT Hashimoto Indo Trust設立",
        description:
          "中部ジャワ州スラゲンを拠点に法人を設立し、人材募集、日本語教育、就業準備を支える体制づくりを開始しました。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        year_label: "2026年",
        title: "企業連携と育成体制を強化",
        description:
          "日本企業との対話、地域採用ネットワークの拡充、候補者教育の改善を進め、具体的な採用相談を受け付けています。",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    vision_mission: {
      vision_headline: "目指す姿",
      vision_description:
        "日本企業とインドネシア人材の双方から、誠実な情報共有と教育品質で選ばれるパートナーを目指します。",
      mission_headline: "私たちの役割",
      mission_description:
        "企業様の採用要件を理解し、候補者の募集、日本語教育、職場理解、面接準備を一貫して支援します。採用後も関係者との連携を大切にし、長期的な活躍につながる土台をつくります。",
    },
    values: [
      {
        icon_key: "shield_check",
        title: "情報を正確に共有する",
        description:
          "候補者の学習状況や準備状況を整理し、企業様の判断に必要な情報を分かりやすくお伝えします。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "user_check",
        title: "人数よりも適合を重視する",
        description:
          "採用条件と候補者の適性を丁寧に確認し、長く働くことを見据えた候補者提案を行います。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "book_open_check",
        title: "教育を継続的に改善する",
        description:
          "企業様からのフィードバックと候補者の学習結果をもとに、カリキュラムと指導方法を更新します。",
        sort_order: 2,
        is_enabled: true,
      },
    ],
    facilities: facilities.map((item, index) => {
      const copy = [
        {
          title: "集中して学べる教室環境",
          description: "少人数での指導と反復練習を行い、一人ひとりの理解度を確認します。",
        },
        {
          title: "対話と実践を重視した学習",
          description: "面接、報告・連絡・相談、職場での受け答えを想定した練習を行います。",
        },
        {
          title: "授業外の学習も支える仕組み",
          description: "教材と課題を活用し、候補者が継続して学習できる環境を整えています。",
        },
      ][index];

      return copy ? { ...item, ...copy } : item;
    }),
    team_members: [
      {
        ...findTeamMember(team, "Hashimoto Shigeto"),
        name: "Hashimoto Shigeto 橋本 茂人",
        role: "日本側連携・事業アドバイザー",
        organization_name: "HAP JAPAN創設者",
        credentials: "Aris Supriyadiの日本就労時代の雇用主",
        responsibility: "日本企業の視点から、採用要件と育成方針に関する助言・連携を担当します。",
        bio: "",
        sort_order: 0,
        is_enabled: true,
      },
      {
        ...findTeamMember(team, "Aris Supriyadi"),
        name: "Aris Supriyadi アリス・スプリヤディ",
        role: "代表取締役",
        organization_name: "PT Hashimoto Indo Trust",
        credentials: "日本での就労経験17年",
        responsibility: "現地運営、企業対応、候補者募集・育成体制を統括します。",
        bio: "",
        sort_order: 1,
        is_enabled: true,
      },
      {
        ...sarif,
        name: "Sarif Hidayatulloh サリフ・ヒダヤトゥロ",
        role: "教育責任者・日本語講師",
        organization_name: "PT Hashimoto Indo Trust",
        credentials: "JLPT N1 / 日本語指導経験7年以上",
        responsibility: "日本語教育の方針、進捗評価、職場コミュニケーション指導を統括します。",
        bio: "",
        sort_order: 2,
        is_enabled: true,
      },
      {
        ...findTeamMember(team, "Anton Tri"),
        name: "Anton Tri Anggono, S.Psi., S.H.",
        role: "法務・コンプライアンス顧問",
        organization_name: "PT Hashimoto Indo Trust",
        credentials: "心理学・法学の専門知識",
        responsibility: "現地法務、契約、候補者対応に関するコンプライアンスを支援します。",
        bio: "",
        sort_order: 3,
        is_enabled: true,
      },
      {
        ...findTeamMember(team, "Ernawan"),
        name: "Ernawan, S.T., M.M.",
        role: "行政連携顧問",
        organization_name: "スラゲン地域",
        credentials: "労働行政に関する実務知見",
        responsibility: "地域行政との連携および適切な手続きに関する助言を行います。",
        bio: "",
        sort_order: 4,
        is_enabled: true,
      },
      {
        ...findTeamMember(team, "Ading Riyanto"),
        name: "Ading Riyanto アディン・リヤント",
        role: "採用ネットワーク・講師",
        organization_name: "PT Hashimoto Indo Trust",
        credentials: "地域人材ネットワーク",
        responsibility: "候補者との接点づくり、初期確認、学習支援を担当します。",
        bio: "",
        sort_order: 5,
        is_enabled: true,
      },
    ],
    legal_overview: legalOverview.map((item, index) => {
      const combined = `${String(item.type_label || "")} ${String(item.title || "")}`;
      const isNib = combined.includes("NIB");

      return {
        ...item,
        type_label: isNib ? "NIB 2307250018253" : "AHU-0037284.AH.01.01.TAHUN 2025",
        title: isNib ? "事業基本番号（NIB）" : "法人設立認可（AHU）",
        description: isNib
          ? "インドネシア政府のOSS制度に基づく事業者登録番号です。"
          : "インドネシア法務人権省による法人設立の承認情報です。",
        issuing_authority: isNib
          ? "インドネシア政府 OSS / BKPM"
          : "インドネシア法務人権省",
        issued_date_label: isNib ? "2025年登録" : "2025年承認",
        status_label: "登録済み",
        document_label: "登録書類を確認する",
        sort_order: index,
        is_enabled: true,
      };
    }),
    final_cta: {
      ...finalCta,
      headline: "採用要件を伺い、候補者づくりからご一緒します",
      description:
        "採用人数や時期がまだ決まっていない段階でもご相談いただけます。職種、日本語力、現場で重視する姿勢を伺い、募集・教育・面接準備の進め方をご案内します。",
      primary_cta_label: "LINEで採用相談",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "お問い合わせフォーム",
      secondary_href: "/contact",
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
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "tentang_kami" } },
    select: {
      id: true,
      title: true,
      status: true,
      dataJson: true,
      publishedDataJson: true,
    },
  });

  if (!page) {
    throw new Error("Japan about page was not found.");
  }

  const updatedDraft = updateAboutData(page.dataJson);
  const updatedPublished = updateAboutData(
    isRecord(page.publishedDataJson) ? page.publishedDataJson : page.dataJson,
  );

  console.log(
    JSON.stringify(
      {
        mode: shouldApply ? "apply" : "dry-run",
        targetHost,
        variantId: variant.id,
        pageId: page.id,
        pageTitle: page.title,
        pageStatus: page.status,
        currentDraftHeadline: String(record(record(page.dataJson).hero).headline || ""),
        currentPublishedHeadline: String(
          record(record(page.publishedDataJson).hero).headline || "",
        ),
        nextHeadline: String(record(updatedPublished.hero).headline || ""),
        sections: [
          "hero",
          "proof_stats",
          "company_status",
          "story",
          "japan_relationship",
          "education_quality",
          "operational_readiness",
          "leadership_quote",
          "timeline",
          "vision_mission",
          "values",
          "facilities",
          "team_members",
          "legal_overview",
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
  const backupPath = join(tmpdir(), `nextcmslpk-japan-about-${timestamp}.json`);
  await writeFile(backupPath, JSON.stringify({ targetHost, page }, null, 2), "utf8");

  await prisma.contentPage.update({
    where: { id: page.id },
    data: {
      title: "企業情報",
      dataJson: updatedDraft as Prisma.InputJsonValue,
      publishedDataJson: updatedPublished as Prisma.InputJsonValue,
    },
  });

  const verified = await prisma.contentPage.findUnique({
    where: { id: page.id },
    select: { status: true, dataJson: true, publishedDataJson: true },
  });

  console.log(`Japan about content updated. Backup: ${backupPath}`);
  console.log(
    JSON.stringify(
      {
        verifiedStatus: verified?.status,
        verifiedDraftHeadline: String(
          record(record(verified?.dataJson).hero).headline || "",
        ),
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
    console.error(error instanceof Error ? error.message : "Japan about update failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
