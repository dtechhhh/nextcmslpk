import { readFile, writeFile } from "node:fs/promises";

import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import {
  Prisma,
  PrismaClient,
  PublishStatus,
} from "../src/generated/prisma/client";

config({ path: ".env.local" });

const mediaIdsPath = "/tmp/media-ids.json";
const reportPath = "/tmp/task7-report.md";

const requiredMediaKeys = [
  "sector-manufacturing-thumb",
  "sector-nursing-thumb",
  "sector-agriculture-thumb",
] as const;

const optionRequests = [
  {
    name: "newsPartnerVisit",
    optionSetKey: "japan_news_category",
    value: "パートナー訪問",
  },
  {
    name: "newsAnnouncement",
    optionSetKey: "japan_news_category",
    value: "お知らせ",
  },
  {
    name: "newsTrainingActivity",
    optionSetKey: "japan_news_category",
    value: "研修活動",
  },
  {
    name: "tagTechnicalIntern",
    optionSetKey: "japan_news_tag",
    value: "技能実習",
  },
  {
    name: "tagIndonesia",
    optionSetKey: "japan_news_tag",
    value: "インドネシア",
  },
  {
    name: "tagTokuteiGinou",
    optionSetKey: "japan_news_tag",
    value: "特定技能",
  },
  {
    name: "tagRecruitment",
    optionSetKey: "japan_news_tag",
    value: "採用",
  },
  {
    name: "sectorManufacturing",
    optionSetKey: "japan_sector_category",
    value: "製造業",
  },
  {
    name: "sectorCare",
    optionSetKey: "japan_sector_category",
    value: "介護",
  },
  {
    name: "sectorAgriculture",
    optionSetKey: "japan_sector_category",
    value: "農業",
  },
] as const;

type CollectionKey = "news" | "sector";
type MediaKey = (typeof requiredMediaKeys)[number];
type MediaIds = Record<MediaKey, string>;
type OptionName = (typeof optionRequests)[number]["name"];
type OptionIds = Record<OptionName, string>;
type JsonRecord = Record<string, unknown>;

type SeedItem = {
  collectionKey: CollectionKey;
  title: string;
  slug: string;
  status: PublishStatus;
  isFeatured?: boolean;
  sortOrder?: number;
  thumbnailImageId?: string | null;
  heroImageId?: string | null;
  publishedAt?: Date | null;
  dataJson: JsonRecord;
};

type CreatedItem = {
  id: string;
  collectionKey: string;
  title: string;
  slug: string;
};

type VerificationRow = {
  collection_key: string;
  count: number;
  published: number;
};

type TitleDescriptionItem = {
  title: string;
  description: string;
  is_enabled: boolean;
  sort_order: number;
};

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Japan collection seedにはDIRECT_URLまたはDATABASE_URLが必要です。");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function toPrismaJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label}はJSONオブジェクトである必要があります。`);
  }
}

async function loadMediaIds() {
  const parsed = JSON.parse(await readFile(mediaIdsPath, "utf8")) as unknown;

  assertRecord(parsed, mediaIdsPath);

  const missingKeys = requiredMediaKeys.filter((key) => typeof parsed[key] !== "string");

  if (missingKeys.length > 0) {
    throw new Error(`${mediaIdsPath}に必要なmedia IDがありません: ${missingKeys.join(", ")}`);
  }

  return Object.fromEntries(
    requiredMediaKeys.map((key) => [key, parsed[key]]),
  ) as MediaIds;
}

async function loadOptionIds(
  tx: Prisma.TransactionClient,
  tenantId: string,
  variantId: string,
) {
  const entries = await Promise.all(
    optionRequests.map(async (request) => {
      const option = await tx.optionValue.findFirst({
        where: {
          value: request.value,
          optionSet: {
            tenantId,
            variantId,
            key: request.optionSetKey,
          },
        },
        select: { id: true },
      });

      if (!option) {
        throw new Error(
          `${request.optionSetKey}.${request.value}のOptionValueが見つかりません。`,
        );
      }

      return [request.name, option.id] as const;
    }),
  );

  return Object.fromEntries(entries) as OptionIds;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function toTitleItems(items: string[]): TitleDescriptionItem[] {
  return items.map((title, index) => ({
    title,
    description: "",
    is_enabled: true,
    sort_order: index + 1,
  }));
}

function getExcerpt(dataJson: JsonRecord) {
  const value =
    typeof dataJson.excerpt === "string"
      ? dataJson.excerpt
      : typeof dataJson.short_description === "string"
        ? dataJson.short_description
        : typeof dataJson.subtitle === "string"
          ? dataJson.subtitle
          : "";

  return value.trim() || null;
}

function buildItems(media: MediaIds, options: OptionIds, now: Date): SeedItem[] {
  return [
    {
      collectionKey: "news",
      title: "2026年1月 パートナー企業訪問レポート — 愛知県 自動車部品工場",
      slug: "partner-visit-aichi-automotive-jan-2026",
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: addDays(now, -14),
      thumbnailImageId: media["sector-manufacturing-thumb"],
      dataJson: {
        subtitle:
          "愛知県の自動車部品工場を訪問し、活躍中のHIT出身者3名と面談を行いました",
        excerpt:
          "2026年1月、HITのスタッフが愛知県のパートナー企業を訪問。製造ラインで活躍する卒業生たちの生の声をお届けします。",
        cover_image_id: media["sector-manufacturing-thumb"],
        category_option_id: options.newsPartnerVisit,
        tag_option_ids: [options.tagTechnicalIntern, options.tagIndonesia],
        author_name: "田中 直子",
        author_title: "日本事業部マネージャー",
        reading_time_label: "5分",
        content_blocks: [
          {
            type: "heading",
            sort_order: 1,
            data: { level: "h2", text: "訪問の目的" },
          },
          {
            type: "paragraph",
            sort_order: 2,
            data: {
              text: "今回の訪問は、派遣後の定着状況と職場環境の確認を目的として実施しました。インドネシア人技能実習生3名（いずれもHIT卒業生）が製造ラインで活躍しており、職場内でも信頼を勝ち取っていることが確認できました。",
            },
          },
          {
            type: "heading",
            sort_order: 3,
            data: { level: "h2", text: "現場マネージャーの声" },
          },
          {
            type: "quote",
            sort_order: 4,
            data: {
              text: "HIT出身の実習生は日本語能力が高く、指示の理解が早い。安全意識も高く、現場に溶け込むのが早かった。来年もお願いしたい。",
              author: "愛知県 自動車部品工場 製造部長",
            },
          },
          {
            type: "heading",
            sort_order: 5,
            data: { level: "h2", text: "実習生からのメッセージ" },
          },
          {
            type: "paragraph",
            sort_order: 6,
            data: {
              text: "「日本に来て1年が経ちました。最初は大変でしたが、今は仕事にも生活にも慣れ、毎月の貯金が増えていくのが楽しみです。HITで学んだ日本語と礼儀が、ここで本当に役立っています」（アリ・ワハユ、製造部門）",
            },
          },
          {
            type: "line_cta",
            sort_order: 7,
            data: {
              label: "採用についてLINEでご相談",
              line_message_template:
                "パートナー企業訪問レポートを拝見しました。採用についてご相談させてください。",
            },
          },
        ],
        related_articles: { source: "same_category", max_items: 3 },
      },
    },
    {
      collectionKey: "news",
      title: "特定技能制度 2026年最新情報 — 受け入れ業種と手続きの変更点",
      slug: "tokutei-ginou-update-2026",
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: addMonths(now, -1),
      thumbnailImageId: media["sector-manufacturing-thumb"],
      dataJson: {
        subtitle: "2026年施行の特定技能制度改正ポイントをわかりやすく解説します",
        excerpt:
          "特定技能制度の最新動向と、インドネシア人材採用への影響をまとめました。HITの専門スタッフが解説します。",
        cover_image_id: null,
        category_option_id: options.newsAnnouncement,
        tag_option_ids: [options.tagTokuteiGinou, options.tagRecruitment],
        author_name: "田中 直子",
        author_title: "日本事業部マネージャー",
        reading_time_label: "6分",
        content_blocks: [
          {
            type: "heading",
            sort_order: 1,
            data: { level: "h2", text: "特定技能制度の概要" },
          },
          {
            type: "paragraph",
            sort_order: 2,
            data: {
              text: "特定技能制度は、深刻な人材不足が生じている特定の産業分野において、一定の専門性・技能を有する外国人を受け入れるための在留資格です。現在14業種が対象となっています。",
            },
          },
          {
            type: "heading",
            sort_order: 3,
            data: { level: "h2", text: "2026年の主な変更点" },
          },
          {
            type: "paragraph",
            sort_order: 4,
            data: {
              text: "2026年より、自動車整備業および電気・電子情報関連産業が特定技能の対象業種として追加される見込みです。また、特定技能2号の対象業種も拡大され、より多くの分野で長期就労・家族帯同が可能になります。",
            },
          },
          {
            type: "heading",
            sort_order: 5,
            data: { level: "h2", text: "HITのサポート体制" },
          },
          {
            type: "paragraph",
            sort_order: 6,
            data: {
              text: "HITは特定技能に対応したインドネシア人材の育成・紹介実績を豊富に持っています。制度変更への対応も含め、最新情報に基づいたアドバイスを無料で提供しています。",
            },
          },
          {
            type: "line_cta",
            sort_order: 7,
            data: {
              label: "特定技能採用についてLINEで相談",
              line_message_template:
                "特定技能のニュースを拝見しました。詳しく教えていただけますか。",
            },
          },
        ],
      },
    },
    {
      collectionKey: "news",
      title: "2026年3月 研修活動レポート — 第15期生 卒業式",
      slug: "training-report-batch-15-graduation-mar-2026",
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      publishedAt: addDays(now, -21),
      thumbnailImageId: null,
      dataJson: {
        subtitle: "52名の第15期生が研修を修了し、日本へ旅立ちます",
        excerpt:
          "2026年3月20日、HITの研修センターにて第15期生の卒業式が開催されました。52名の候補者が6〜10ヶ月の研修を修了し、4月から各地の提携企業で就労を開始します。",
        cover_image_id: null,
        category_option_id: options.newsTrainingActivity,
        tag_option_ids: [options.tagIndonesia, options.tagTechnicalIntern],
        author_name: "Sari Anggraini",
        author_title: "研修部長",
        reading_time_label: "4分",
        content_blocks: [
          {
            type: "heading",
            sort_order: 1,
            data: { level: "h2", text: "第15期生のプロフィール" },
          },
          {
            type: "paragraph",
            sort_order: 2,
            data: {
              text: "52名の卒業生の内訳は：製造業23名、介護11名、農業8名、食品加工6名、その他4名。平均年齢23歳、全員がJLPT N4以上を取得して渡航します。",
            },
          },
          {
            type: "quote",
            sort_order: 3,
            data: {
              text: "第15期生は特に日本語力と礼儀正しさが際立っています。受け入れ企業の皆様に必ずご満足いただけると確信しています。",
              author: "清水 浩志（代表取締役）",
            },
          },
          {
            type: "paragraph",
            sort_order: 4,
            data: {
              text: "卒業式には保護者や提携校の関係者も参加し、候補者たちの晴れ姿を見守りました。4月の渡航に向けて、全員が強い決意と期待を胸に日本での生活をスタートさせます。",
            },
          },
        ],
      },
    },
    {
      collectionKey: "sector",
      title: "製造業（Manufacturing）",
      slug: "manufacturing",
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      sortOrder: 1,
      thumbnailImageId: media["sector-manufacturing-thumb"],
      dataJson: {
        subtitle: "自動車部品・電子機器・金属加工など、製造業全般に対応",
        short_description:
          "HITは製造業向けのインドネシア人材育成に最も豊富な実績を持っています。技能実習から特定技能まで対応可能です。",
        sector_category_option_id: options.sectorManufacturing,
        overview:
          "製造業はHITが最も多くの実績を持つ分野です。自動車部品、電子機器、金属加工、プラスチック成形など、様々なサブセクターに対応した人材をご提供しています。技能実習制度・特定技能制度ともに対応可能で、累計1,500名以上を製造業に派遣してきた実績があります。",
        suitability_items: toTitleItems([
          "プレス・溶接・旋盤などの機械操作",
          "組み立てラインでの作業",
          "品質管理（QC）",
          "梱包・出荷作業",
          "フォークリフト操作（資格取得サポートあり）",
        ]),
        example_positions: toTitleItems([
          "プレス機オペレーター",
          "組み立てラインワーカー",
          "品質検査員",
          "溶接工（指導のもと）",
          "梱包・物流スタッフ",
        ]),
        training_alignment_items: toTitleItems([
          "機械操作基礎訓練 — 配属前に機械の安全な操作方法を習得",
          "品質管理概念 — QCの基礎と不良品の見分け方",
          "工場安全訓練 — 5S活動、危険予知訓練、PPE装着",
          "製造業日本語 — 指示語、帳票記入、報告会話",
        ]),
        candidate_requirements: [
          "年齢：18〜30歳（技能実習）、18〜35歳（特定技能）",
          "学歴：高校卒業以上",
          "日本語：JLPT N4以上（HITで研修済み）",
          "体力：立ち作業・重作業に対応できること",
          "健康：労働基準を満たす健康状態",
        ],
        process_items: toTitleItems([
          "採用ニーズのヒアリング（お問い合わせ後1週間以内）",
          "候補者リストのご提案",
          "書類確認・オンライン面接",
          "内定・在留資格申請",
          "渡航・配属（最短6ヶ月後）",
        ]),
        primary_cta_label: "製造業の採用についてLINEで相談",
        line_message_template:
          "製造業の人材についてお問い合わせです。採用条件を相談させてください。",
        secondary_cta_label: "資料請求",
        secondary_document_file_id: null,
      },
    },
    {
      collectionKey: "sector",
      title: "介護・福祉（Care & Welfare）",
      slug: "care-welfare",
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      sortOrder: 2,
      thumbnailImageId: media["sector-nursing-thumb"],
      dataJson: {
        subtitle: "特定技能「介護」に特化した人材育成・紹介",
        short_description:
          "高齢化が進む日本において、HITはインドネシア人介護士の育成に力を入れています。心優しく献身的な介護士をご提供します。",
        sector_category_option_id: options.sectorCare,
        overview:
          "介護・福祉分野は日本で最も深刻な人材不足が続く分野の一つです。HITでは、特定技能「介護」に対応した専門カリキュラムを開発し、日本の高齢者施設で長期的に活躍できる介護士を育成しています。インドネシア人は温かみと献身性に優れており、利用者様から高い評価をいただいています。",
        suitability_items: toTitleItems([
          "入浴・排泄・食事介助などの身体介護",
          "レクリエーション活動の企画・実施",
          "利用者様とのコミュニケーション",
          "記録業務（介護日誌・申し送り）",
          "生活支援（掃除・洗濯・料理補助）",
        ]),
        example_positions: toTitleItems([
          "介護職員（特別養護老人ホーム）",
          "介護職員（グループホーム）",
          "生活支援スタッフ（デイサービス）",
          "訪問介護スタッフ（条件あり）",
        ]),
        candidate_requirements: [
          "年齢：18〜35歳",
          "日本語：JLPT N4以上（介護専門語彙の習得含む）",
          "特定技能介護技能評価試験 合格（HITが受験サポート）",
          "明るく温かな性格、思いやりのある対応ができること",
          "体力的に介護業務に対応できること",
        ],
        process_items: toTitleItems([
          "ニーズヒアリング・条件確認",
          "候補者マッチング（2週間以内）",
          "資料送付・オンライン面接",
          "在留資格申請サポート",
          "渡航・初期オリエンテーション",
        ]),
        primary_cta_label: "介護人材についてLINEで相談",
        line_message_template: "介護・福祉分野の人材についてお問い合わせです。",
        secondary_cta_label: "資料請求",
        secondary_document_file_id: null,
      },
    },
    {
      collectionKey: "sector",
      title: "農業・農畜産業（Agriculture）",
      slug: "agriculture",
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      sortOrder: 3,
      thumbnailImageId: media["sector-agriculture-thumb"],
      dataJson: {
        subtitle: "農作業全般から施設園芸まで、農業分野の人材をご提供",
        short_description:
          "農業大国インドネシア出身の候補者は、土に親しんだ経験と体力を持ちます。北海道から九州まで、全国の農業法人様をサポートします。",
        sector_category_option_id: options.sectorAgriculture,
        overview:
          "農業分野は日本で慢性的な人手不足が続いており、インドネシア人材への期待が高まっています。HITは農業経験者を優先採用し、農作業に特化した事前研修を実施しています。",
        suitability_items: toTitleItems([
          "播種・定植・収穫作業",
          "農薬・肥料の散布（指導のもと）",
          "施設園芸（ハウス管理）",
          "選果・梱包作業",
          "農業機械の補助操作",
        ]),
        primary_cta_label: "農業人材についてLINEで相談",
        line_message_template: "農業・農畜産業の人材についてお問い合わせです。",
        secondary_cta_label: "資料請求",
        secondary_document_file_id: null,
      },
    },
  ];
}

async function writeReport(input: {
  tenantId: string;
  variantId: string;
  createdItems: CreatedItem[];
  verificationRows: VerificationRow[];
}) {
  const itemRows = input.createdItems.map(
    (item) => `| ${item.collectionKey} | ${item.title} | ${item.slug} | ${item.id} |`,
  );
  const verificationRows = input.verificationRows.map(
    (row) => `| ${row.collection_key} | ${row.count} | ${row.published} |`,
  );

  const report = [
    "# Task 7 レポート - Japan Collection Items",
    "",
    `HITテナントID: ${input.tenantId}`,
    `JapanバリアントID: ${input.variantId}`,
    `メディアIDソース: ${mediaIdsPath}`,
    "",
    "## 作成したアイテム",
    "",
    "| コレクション | タイトル | スラッグ | ID |",
    "| --- | --- | --- | --- |",
    ...itemRows,
    "",
    "## 検証SQL",
    "",
    "```sql",
    "SELECT collection_key, count(*), sum(case when status='PUBLISHED' then 1 else 0 end) as published",
    `FROM content_items WHERE variant_id = '${input.variantId}' GROUP BY collection_key;`,
    "```",
    "",
    "| collection_key | count | published |",
    "| --- | ---: | ---: |",
    ...verificationRows,
    "",
  ].join("\n");

  await writeFile(reportPath, report, "utf8");
}

async function main() {
  const media = await loadMediaIds();
  const now = new Date();

  const result = await prisma.$transaction(
    async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { slug: "hit" },
        select: { id: true },
      });

      if (!tenant) {
        throw new Error('slug "hit" のテナントが見つかりません。');
      }

      const japanVariant = await tx.variant.findUnique({
        where: {
          tenantId_key: {
            tenantId: tenant.id,
            key: "japan",
          },
        },
        select: { id: true },
      });

      if (!japanVariant) {
        throw new Error('テナント"hit"のvariant key "japan"が見つかりません。');
      }

      const mediaAssets = await tx.mediaAsset.findMany({
        where: {
          tenantId: tenant.id,
          id: { in: Object.values(media) },
        },
        select: { id: true },
      });
      const foundMediaIds = new Set(mediaAssets.map((asset) => asset.id));
      const missingMediaIds = Object.entries(media)
        .filter(([, id]) => !foundMediaIds.has(id))
        .map(([key, id]) => `${key}=${id}`);

      if (missingMediaIds.length > 0) {
        throw new Error(
          `テナント"hit"に存在しないメディアがあります: ${missingMediaIds.join(", ")}`,
        );
      }

      const optionIds = await loadOptionIds(tx, tenant.id, japanVariant.id);
      const seedItems = buildItems(media, optionIds, now);
      const createdItems: CreatedItem[] = [];

      for (const item of seedItems) {
        const json = toPrismaJson(item.dataJson);
        const created = await tx.contentItem.create({
          data: {
            tenantId: tenant.id,
            variantId: japanVariant.id,
            collectionKey: item.collectionKey,
            title: item.title,
            slug: item.slug,
            status: item.status,
            excerpt: getExcerpt(item.dataJson),
            thumbnailImageId: item.thumbnailImageId ?? null,
            heroImageId: item.heroImageId ?? null,
            isFeatured: item.isFeatured ?? false,
            publishedAt: item.publishedAt ?? null,
            startAt: null,
            expiredAt: null,
            sortOrder: item.sortOrder ?? 0,
            dataJson: json,
            publishedDataJson: json,
          },
          select: {
            id: true,
            collectionKey: true,
            title: true,
            slug: true,
          },
        });

        createdItems.push(created);
      }

      const verificationRows = await tx.$queryRaw<VerificationRow[]>`
        SELECT
          collection_key,
          count(*)::int AS count,
          sum(case when status='PUBLISHED' then 1 else 0 end)::int AS published
        FROM content_items
        WHERE variant_id = ${japanVariant.id}
        GROUP BY collection_key
        ORDER BY collection_key ASC
      `;

      return {
        tenantId: tenant.id,
        variantId: japanVariant.id,
        createdItems,
        verificationRows,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 20_000,
      timeout: 120_000,
    },
  );

  await writeReport(result);

  console.log(
    JSON.stringify(
      {
        tenantId: result.tenantId,
        variantId: result.variantId,
        createdItems: result.createdItems,
        verification: result.verificationRows,
        reportPath,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Japan Variantのcollection items投入に失敗しました。");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
