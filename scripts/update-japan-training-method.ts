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
  throw new Error("DATABASE_URL is required to update the Japan training method page.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const targetHost = readArgument("--host") || "hit-japan.lpk.local:3000";
const targetTenantSlug = readArgument("--tenant") || "hit";

const lineMessage =
  "お世話になっております。【貴社名／ご担当者名】：候補者の教育・評価基準について相談を希望しております。採用予定の職種、人数、時期、重視する能力について詳しくお話を伺えますと幸いです。よろしくお願いいたします。";

function readArgument(name: string) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length).trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown) {
  return isRecord(value) ? value : {};
}

function updateTrainingData(value: unknown) {
  const current = record(value);
  const hero = record(current.hero);
  const curriculumDownload = record(current.curriculum_download);
  const partnerReport = record(current.partner_report);
  const finalCta = record(current.final_cta);

  return {
    ...current,
    hero: {
      ...hero,
      eyebrow_label: "採用リスクを減らす教育・評価設計",
      headline: "「受講した」ではなく、「基準を満たした」候補者を。",
      subheadline:
        "企業ごとの採用要件を起点に、日本語、職場行動、安全意識、業務理解を確認します。面接前には評価結果と未達項目を整理し、候補者を紹介する根拠を企業様と共有します。",
      primary_cta_label: "教育・評価基準を相談する",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "合格基準を見る",
      secondary_href: "#readiness-standards",
    },
    display_text: {
      training_pillars_title: "教育設計の3原則",
      training_flow_title: "教育・評価の流れ",
      curriculum_areas_title: "共通教育カリキュラム",
      evaluation_items_title: "評価項目",
      training_gallery_title: "教育・評価の実施風景",
    },
    curriculum_download: {
      ...curriculumDownload,
      headline: "教育・評価項目資料",
      description:
        "教育領域、評価方法、企業要件に応じた調整範囲をまとめた資料です。公開用資料が登録されている場合のみダウンロードできます。",
      button_label: "教育・評価資料を確認する",
      version_label: "案件要件に応じて更新",
      updated_label: "面接前に最新版を共有",
      language_label: "日本語",
      scope_label: "共通教育・職種別教育・評価",
    },
    partner_risks: {
      eyebrow_label: "企業様の懸念から逆算",
      headline: "教育内容ではなく、採用後に起こり得るリスクから設計します",
      description:
        "語学学習だけでは、配属後の安定した就業を保証できません。採用要件を確認し、現場で問題になりやすい場面を教育と評価に落とし込みます。",
      items: [
        {
          icon_key: "message_circle",
          title: "指示理解・報連相のずれ",
          description:
            "聞き返し、復唱、報告のタイミングを場面別に確認し、分からないまま作業を進めるリスクを減らします。",
          sort_order: 0,
          is_enabled: true,
        },
        {
          icon_key: "clock",
          title: "時間・規律・チーム行動",
          description:
            "出席、時間管理、役割分担、指摘を受けた後の改善行動を継続的に記録します。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "shield_alert",
          title: "安全意識と職種理解の不足",
          description:
            "危険予知、保護具、衛生、基本動作など、配属予定の業務に応じた確認項目を追加します。",
          sort_order: 2,
          is_enabled: true,
        },
      ],
    },
    training_pillars: [
      {
        icon_key: "target",
        title: "企業要件を先に定義",
        description:
          "職種、担当業務、日本語水準、現場で重視する行動を確認し、教育項目と評価基準を調整します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "clipboard_check",
        title: "行動と記録で評価",
        description:
          "受講時間だけで判断せず、出席、課題、会話、実技、面談所見を記録し、面接前の判断材料にします。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "timer_reset",
        title: "未達項目は再教育",
        description:
          "基準未達の場合は、補講、再評価、紹介時期の見直しを行い、未確認のまま次工程へ進めません。",
        sort_order: 2,
        is_enabled: true,
      },
    ],
    program_overview: {
      eyebrow_label: "PROGRAM STRUCTURE",
      headline: "期間・内容・確認方法を案件ごとに明確化",
      description:
        "固定カリキュラムを一律に当てはめるのではなく、採用要件と候補者の初期評価をもとに教育計画を作成します。期間、総学習時間、クラス編成は提案時に明示します。",
      stats: [
        {
          icon_key: "calendar_range",
          value: "要件確認後",
          label: "期間・総時間を個別提示",
          sort_order: 0,
          is_enabled: true,
        },
        {
          icon_key: "calendar_check",
          value: "週次",
          label: "出席・課題・改善状況をレビュー",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "users_round",
          value: "少人数",
          label: "会話・実技を確認しやすい編成",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "file_check",
          value: "面接前",
          label: "企業向け評価サマリーを整理",
          sort_order: 3,
          is_enabled: true,
        },
      ],
      stages: [
        {
          icon_key: "clipboard_list",
          step_label: "BASELINE",
          title: "初期評価",
          description: "日本語、学習履歴、職務理解、出席可能性、希望職種との適合を確認します。",
          sort_order: 0,
          is_enabled: true,
        },
        {
          icon_key: "book_open_check",
          step_label: "TRAINING",
          title: "共通・職種別教育",
          description: "日本語と職場行動の共通教育に、配属職種に必要な用語・安全・基本動作を追加します。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "clipboard_pen_line",
          step_label: "ASSESSMENT",
          title: "定期評価・補講",
          description: "週次確認と段階評価を行い、未達項目は補講後に再評価します。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "id_card",
          step_label: "REPORT",
          title: "面接前レポート",
          description: "確認済み項目、注意点、今後の教育課題を企業様へ共有します。",
          sort_order: 3,
          is_enabled: true,
        },
      ],
    },
    curriculum_stats: [
      { icon_key: "languages", value: "4領域", label: "共通教育の基本領域", sort_order: 0, is_enabled: true },
      { icon_key: "clipboard_check", value: "5段階", label: "紹介前の品質確認", sort_order: 1, is_enabled: true },
      { icon_key: "briefcase", value: "要件別", label: "企業・職種ごとに調整", sort_order: 2, is_enabled: true },
      { icon_key: "file_text", value: "記録", label: "評価結果を企業向けに整理", sort_order: 3, is_enabled: true },
    ],
    curriculum_areas: [
      {
        icon_key: "languages",
        title: "職場日本語",
        description: "指示理解、復唱、質問、報告、連絡、相談を、実際の職場場面を想定して練習します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        icon_key: "clock",
        title: "規律・生活管理",
        description: "出席、時間管理、健康管理、共同生活、職場規則を継続的な行動として確認します。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        icon_key: "shield_check",
        title: "安全・衛生",
        description: "危険予知、保護具、整理整頓、衛生管理、異常時の報告を職種に合わせて扱います。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        icon_key: "handshake",
        title: "職場適応",
        description: "チーム行動、指摘への対応、文化差の理解、相談方法をロールプレイと面談で確認します。",
        sort_order: 3,
        is_enabled: true,
      },
    ],
    sector_modules: {
      eyebrow_label: "SECTOR MODULES",
      headline: "共通教育に、配属職種の用語・安全・基本動作を追加",
      description:
        "以下は構成例です。実際の内容は求人票、作業工程、企業様のルールを確認したうえで調整します。",
      items: [
        {
          icon_key: "factory",
          sector_label: "製造・建設",
          title: "安全確認と作業指示の理解",
          description: "現場用語、保護具、5S、危険箇所、指示の復唱を中心に確認します。",
          focus_items: ["工具・設備の基本用語", "危険予知と異常報告", "作業手順の復唱"],
          sort_order: 0,
          is_enabled: true,
        },
        {
          icon_key: "sprout",
          sector_label: "農業・食品",
          title: "衛生と品質を守る基本行動",
          description: "衛生管理、選別、記録、温度や時間の管理に関する基本表現を扱います。",
          focus_items: ["手洗い・衛生ルール", "品質異常の報告", "数量・時間の確認"],
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "heart_handshake",
          sector_label: "介護",
          title: "利用者への声掛けと安全配慮",
          description: "尊厳、安全、記録、報告を重視し、介助場面の基本会話を練習します。",
          focus_items: ["丁寧な声掛け", "体調変化の報告", "事故防止の確認"],
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "hotel",
          sector_label: "外食・宿泊",
          title: "接客表現と衛生・連携",
          description: "挨拶、注文確認、清掃、衛生、スタッフ間の引き継ぎを扱います。",
          focus_items: ["接客の基本表現", "注文・予約の確認", "清掃・衛生ルール"],
          sort_order: 3,
          is_enabled: true,
        },
      ],
    },
    readiness_standards: {
      eyebrow_label: "READINESS STANDARD",
      headline: "「紹介可能」の判断基準を、項目ごとに明確にします",
      description:
        "合否は一つの試験だけで決めません。企業要件に照らし、複数の記録と評価を組み合わせて判断します。",
      criteria: [
        {
          competency_label: "日本語・指示理解",
          assessment_method: "会話、聞き取り、復唱、場面別ロールプレイ",
          pass_standard: "想定業務の指示を理解し、不明点を質問・確認できること",
          evidence_label: "会話評価、課題結果、講師所見",
          failure_action: "弱点別補講を行い、同等条件で再評価",
          sort_order: 0,
          is_enabled: true,
        },
        {
          competency_label: "出席・規律",
          assessment_method: "出欠、遅刻、課題提出、連絡行動の継続記録",
          pass_standard: "企業様と合意した基準を満たし、欠席・遅刻時に適切な連絡ができること",
          evidence_label: "出席記録、指導記録、改善履歴",
          failure_action: "原因面談と改善期間を設定し、継続状況を再確認",
          sort_order: 1,
          is_enabled: true,
        },
        {
          competency_label: "安全・衛生",
          assessment_method: "確認テスト、危険予知、実技・模擬場面",
          pass_standard: "禁止事項と基本手順を理解し、異常時に作業を止めて報告できること",
          evidence_label: "確認表、実技所見、再評価記録",
          failure_action: "該当項目を再教育し、理解と行動の両方を再評価",
          sort_order: 2,
          is_enabled: true,
        },
        {
          competency_label: "職種理解・基本動作",
          assessment_method: "用語確認、手順説明、職種別の基礎課題",
          pass_standard: "求人内容と担当業務を理解し、基本手順を説明または実施できること",
          evidence_label: "職種別チェックシート、講師所見",
          failure_action: "職種適合を再確認し、補講または候補職種を見直す",
          sort_order: 3,
          is_enabled: true,
        },
        {
          competency_label: "面接・就業意欲",
          assessment_method: "個別面談、模擬面接、希望条件の再確認",
          pass_standard: "応募理由、業務理解、希望条件に矛盾がなく、自分の言葉で説明できること",
          evidence_label: "面談記録、模擬面接所見",
          failure_action: "追加面談を行い、意思確認が取れない場合は紹介を保留",
          sort_order: 4,
          is_enabled: true,
        },
      ],
    },
    quality_gates: {
      eyebrow_label: "QUALITY GATE",
      headline: "未確認のまま、次の工程へ進めません",
      description:
        "各段階で確認項目と保存記録を定めます。未達の場合は補講、再評価、紹介保留のいずれかを判断します。",
      governance_note:
        "評価基準は教育責任者が管理し、企業要件の変更時には項目を見直します。評価者の所見だけに依存せず、出席、課題、会話、実技、面談記録を組み合わせます。",
      items: [
        {
          stage_label: "GATE 1",
          title: "応募条件・意思確認",
          assessment_method: "経歴、健康・生活条件、希望職種、渡航意思を面談で確認",
          pass_standard: "求人条件との重大な不一致がなく、本人の意思が確認できる",
          evidence_label: "初期面談記録・応募情報",
          failure_action: "条件調整または応募保留",
          sort_order: 0,
          is_enabled: true,
        },
        {
          stage_label: "GATE 2",
          title: "基礎学習の継続性",
          assessment_method: "出席、時間管理、課題、連絡行動を一定期間確認",
          pass_standard: "合意した運用基準を継続して満たす",
          evidence_label: "出席・指導・改善履歴",
          failure_action: "改善期間を設定し、再確認",
          sort_order: 1,
          is_enabled: true,
        },
        {
          stage_label: "GATE 3",
          title: "日本語・職場行動",
          assessment_method: "会話、指示理解、報連相、模擬場面を評価",
          pass_standard: "想定業務に必要な確認・報告行動ができる",
          evidence_label: "会話評価・講師所見",
          failure_action: "弱点別補講後に再評価",
          sort_order: 2,
          is_enabled: true,
        },
        {
          stage_label: "GATE 4",
          title: "職種別の安全・適性",
          assessment_method: "職種別用語、安全確認、基本課題を実施",
          pass_standard: "禁止事項を理解し、基本手順と異常報告を実行できる",
          evidence_label: "職種別チェックシート",
          failure_action: "再教育、職種変更検討、または紹介保留",
          sort_order: 3,
          is_enabled: true,
        },
        {
          stage_label: "GATE 5",
          title: "企業面接前レビュー",
          assessment_method: "全記録を確認し、未達項目と注意点を整理",
          pass_standard: "企業要件に対する確認状況を説明できる状態",
          evidence_label: "候補者評価サマリー",
          failure_action: "不足情報を追加確認し、紹介時期を見直す",
          sort_order: 4,
          is_enabled: true,
        },
      ],
    },
    partner_report: {
      ...partnerReport,
      eyebrow_label: "REPORTING",
      headline: "面接前に、確認済み事項と注意点を共有",
      description:
        "候補者を良く見せるためだけの資料ではありません。企業様が面接で確認すべき点を判断できるよう、学習状況、評価結果、未達項目を整理します。",
      deliverables: [
        "日本語学習状況と指示理解の確認結果",
        "出席、時間管理、課題提出、改善履歴",
        "安全・職種別課題の確認結果",
        "面談所見、就業意思、企業面接での確認推奨事項",
      ],
      sample_document_label: "候補者評価レポート例を見る",
    },
    outcome_evidence: {
      eyebrow_label: "EVIDENCE POLICY",
      headline: "数字は、定義・対象期間・出典とともに公開します",
      description:
        "現段階では、根拠のない合格率や定着率を掲載しません。まず評価工程と記録方法を明確にし、十分な母数と追跡期間が整った指標から順次公開します。",
      stats: [
        { icon_key: "clipboard_check", value: "5", label: "紹介前の品質確認段階", sort_order: 0, is_enabled: true },
        { icon_key: "file_text", value: "4", label: "企業向けレポートの基本領域", sort_order: 1, is_enabled: true },
        { icon_key: "calendar_check", value: "週次", label: "学習・行動記録のレビュー", sort_order: 2, is_enabled: true },
        { icon_key: "target", value: "要件別", label: "企業・職種ごとの評価調整", sort_order: 3, is_enabled: true },
      ],
      source_label: "教育運用基準・候補者評価記録",
      period_label: "採用案件ごとに管理",
      methodology_note:
        "上記は成果率ではなく、現在運用する確認工程の指標です。合格率、面接通過率、入社後定着率を公開する場合は、分母、対象期間、除外条件、更新日を併記します。",
    },
    faq_intro: {
      headline: "企業ご担当者様からよくあるご質問",
      description: "教育内容、評価、未達時の対応、企業様との連携方法についてお答えします。",
    },
    faqs: [
      {
        question: "当社の業務に合わせて教育内容を変更できますか？",
        answer:
          "はい。求人票だけでなく、担当業務、使用する用語、安全ルール、現場で重視する行動を確認し、共通教育に職種別項目を追加します。実施可能範囲と必要期間は事前にご説明します。",
        sort_order: 0,
        is_enabled: true,
      },
      {
        question: "基準に達しない候補者はどうなりますか？",
        answer:
          "未達項目を特定し、補講と再評価を行います。改善が確認できない場合や求人条件との不一致が大きい場合は、企業面接への紹介を保留し、職種変更を含めて再検討します。",
        sort_order: 1,
        is_enabled: true,
      },
      {
        question: "日本語能力試験の級だけで判断しますか？",
        answer:
          "いいえ。資格や試験結果は参考情報の一つです。実際の指示理解、聞き返し、復唱、報告、職種別用語を場面評価で確認します。",
        sort_order: 2,
        is_enabled: true,
      },
      {
        question: "面接前にどのような情報を確認できますか？",
        answer:
          "日本語学習状況、出席・規律、職種別課題、安全確認、面談所見、未達項目を評価サマリーとして整理します。企業様が面接で追加確認すべき点も明記します。",
        sort_order: 3,
        is_enabled: true,
      },
      {
        question: "教育期間と総時間はどのくらいですか？",
        answer:
          "候補者の初期水準、職種、企業様が求める日本語・実技水準により異なります。要件確認と初期評価後に、期間、総時間、評価日程を含む計画をご提示します。",
        sort_order: 4,
        is_enabled: true,
      },
      {
        question: "企業側も評価基準の作成に参加できますか？",
        answer:
          "はい。現場で重視する行動、避けたいリスク、面接で確認したい項目を共有いただき、教育項目と合格判断に反映します。必要に応じて面接後の追加教育も調整します。",
        sort_order: 5,
        is_enabled: true,
      },
    ],
    final_cta: {
      ...finalCta,
      headline: "貴社の採用要件から、教育・評価基準を設計します",
      description:
        "職種、人数、採用時期、必要な日本語水準、現場で重視する行動をお聞かせください。候補者教育と面接前評価の進め方をご提案します。",
      primary_cta_label: "LINEで教育・評価を相談",
      primary_line_message_template: lineMessage,
      secondary_cta_label: "候補者評価レポート例",
    },
  };
}

async function main() {
  const variantByDomain = await prisma.variant.findFirst({
    where: { key: "japan", domains: { some: { host: targetHost } } },
    select: { id: true },
  });
  const variant =
    variantByDomain ??
    (await prisma.variant.findFirst({
      where: { key: "japan", tenant: { slug: targetTenantSlug } },
      select: { id: true },
    }));

  if (!variant) throw new Error(`Japan variant for ${targetHost} or tenant ${targetTenantSlug} was not found.`);

  const page = await prisma.contentPage.findUnique({
    where: { variantId_pageKey: { variantId: variant.id, pageKey: "metode_pelatihan" } },
    select: { id: true, title: true, status: true, dataJson: true, publishedDataJson: true },
  });

  if (!page) throw new Error("Japan training method page was not found.");

  const updatedDraft = updateTrainingData(page.dataJson);
  const updatedPublished = updateTrainingData(
    isRecord(page.publishedDataJson) ? page.publishedDataJson : page.dataJson,
  );

  console.log(
    JSON.stringify(
      {
        mode: shouldApply ? "apply" : "dry-run",
        targetHost,
        pageId: page.id,
        pageStatus: page.status,
        currentHeadline: String(record(record(page.dataJson).hero).headline || ""),
        nextHeadline: String(record(updatedPublished.hero).headline || ""),
        sections: [
          "partner_risks",
          "training_pillars",
          "program_overview",
          "curriculum_areas",
          "sector_modules",
          "readiness_standards",
          "quality_gates",
          "partner_report",
          "outcome_evidence",
          "faqs",
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
  const backupPath = join(tmpdir(), `nextcmslpk-japan-training-${timestamp}.json`);
  await writeFile(backupPath, JSON.stringify({ targetHost, page }, null, 2), "utf8");

  await prisma.contentPage.update({
    where: { id: page.id },
    data: {
      title: "教育・研修",
      dataJson: updatedDraft as Prisma.InputJsonValue,
      publishedDataJson: updatedPublished as Prisma.InputJsonValue,
    },
  });

  const verified = await prisma.contentPage.findUnique({
    where: { id: page.id },
    select: { status: true, dataJson: true, publishedDataJson: true },
  });

  console.log(`Japan training method content updated. Backup: ${backupPath}`);
  console.log(
    JSON.stringify(
      {
        verifiedStatus: verified?.status,
        verifiedDraftHeadline: String(record(record(verified?.dataJson).hero).headline || ""),
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
    console.error(error instanceof Error ? error.message : "Japan training method update failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
