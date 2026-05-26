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
const reportPath = "/tmp/task6-report.md";

const requiredMediaKeys = [
  "hit-logo-dark",
  "hit-logo-light",
  "hero-japan-main",
  "hero-japan-about",
  "hero-japan-training",
  "hero-japan-candidate",
  "hero-japan-network",
  "hero-japan-contact",
  "avatar-director",
  "avatar-japan-manager",
] as const;

const requiredPageKeys = [
  "homepage",
  "tentang_kami",
  "metode_pelatihan",
  "profil_kandidat",
  "jaringan_rekrutmen",
  "sector_page",
  "news_page",
  "contact",
] as const;

const requiredGlobalConfigKeys = [
  "brand_header",
  "line_business_contact",
  "footer",
] as const;

const pageMeta = {
  homepage: { title: "ホームページ", slug: "homepage" },
  tentang_kami: { title: "会社概要", slug: "about" },
  metode_pelatihan: { title: "研修方法", slug: "training-method" },
  profil_kandidat: { title: "人材プロフィール", slug: "candidate-profile" },
  jaringan_rekrutmen: { title: "採用ネットワーク", slug: "recruitment-network" },
  sector_page: { title: "対応業種一覧", slug: "sectors" },
  news_page: { title: "ニュース & お知らせ", slug: "news" },
  contact: { title: "お問い合わせ", slug: "contact" },
} satisfies Record<(typeof requiredPageKeys)[number], { title: string; slug: string }>;

type MediaKey = (typeof requiredMediaKeys)[number];
type MediaIds = Record<MediaKey, string>;
type JsonRecord = Record<string, unknown>;
type VerificationRow = {
  page_key: string;
  status: string;
};

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL または DATABASE_URL が必要です。");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function toPrismaJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} はJSONオブジェクトである必要があります。`);
  }
}

async function loadMediaIds() {
  const parsed = JSON.parse(await readFile(mediaIdsPath, "utf8")) as unknown;

  assertRecord(parsed, mediaIdsPath);

  const missingKeys = requiredMediaKeys.filter((key) => typeof parsed[key] !== "string");

  if (missingKeys.length > 0) {
    throw new Error(`${mediaIdsPath} に不足しているメディアID: ${missingKeys.join(", ")}`);
  }

  return Object.fromEntries(
    requiredMediaKeys.map((key) => [key, parsed[key]]),
  ) as MediaIds;
}

function buildGlobalConfigs(media: MediaIds) {
  return {
    brand_header: {
      brand: {
        lpk_name: "ハシモト・インド・トラスト",
        tagline: "インドネシア人材で、貴社の成長を支援します",
        logo_image_id: media["hit-logo-dark"],
        logo_light_image_id: media["hit-logo-light"],
      },
      topbar: {
        location_label: "〒150-0001 大阪府大阪市（日本窓口）",
        email_label: "japan@hashimotoindotrust.co.id",
        business_hours_label: "月〜金 09:00-17:00 JST",
        is_enabled: true,
      },
      navbar: [
        {
          key: "about",
          label: "会社概要",
          href: "/about",
          is_enabled: true,
          sort_order: 1,
        },
        {
          key: "training_method",
          label: "研修方法",
          href: "/training-method",
          is_enabled: true,
          sort_order: 2,
        },
        {
          key: "candidate_profile",
          label: "人材プロフィール",
          href: "/candidate-profile",
          is_enabled: true,
          sort_order: 3,
        },
        {
          key: "recruitment_network",
          label: "採用ネットワーク",
          href: "/recruitment-network",
          is_enabled: true,
          sort_order: 4,
        },
        {
          key: "sectors",
          label: "業種",
          href: "/sectors",
          is_enabled: true,
          sort_order: 5,
        },
        {
          key: "news",
          label: "ニュース",
          href: "/news",
          is_enabled: true,
          sort_order: 6,
        },
        {
          key: "contact",
          label: "お問い合わせ",
          href: "/contact",
          is_enabled: true,
          sort_order: 7,
        },
      ],
      header_primary_cta: {
        label: "LINEで相談する",
        type: "line",
        line_message_template:
          "ハシモト・インド・トラストのウェブサイトからお問い合わせです。インドネシア人材の採用についてご相談したいのですが、よろしいでしょうか。",
      },
      header_secondary_cta: {
        label: "会社案内 ダウンロード",
        type: "document",
        document_file_id: null,
        href: "",
        is_enabled: false,
      },
      header_behavior: {
        sticky_header: true,
        header_style: "solid",
      },
    },
    line_business_contact: {
      line_contact: {
        line_official_account_id: "@hit-japan",
        line_display_label: "LINE公式アカウント",
        default_message_template:
          "ハシモト・インド・トラストのウェブサイトからお問い合わせです。",
        is_enabled: true,
      },
      business_email: {
        email: "japan@hashimotoindotrust.co.id",
        default_subject_template: "インドネシア人材採用に関するお問い合わせ",
        is_enabled: true,
      },
      business_contact_note: {
        short_note:
          "お問い合わせには通常1〜2営業日以内にご返答いたします。お急ぎの場合はLINEをご利用ください。",
      },
      business_info: {
        phone_label: "+62 812-3456-7890（インドネシア本社）",
        address:
          "インドネシア 西ジャワ州 Bandung Soreang ラヤ・ソレアン通り45番地 40911",
        map_url:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63384.09!2d107.52!3d-7.02",
        operational_hours: "月〜金 08:00-17:00 WIB（UTC+7）",
        language_support: ["日本語", "英語", "インドネシア語"],
      },
      documents: {
        company_profile_file_id: null,
        curriculum_file_id: null,
      },
      social_links: {
        line: "https://line.me/R/ti/p/@hit-japan",
        linkedin: "https://linkedin.com/company/hashimoto-indo-trust",
        youtube: "https://youtube.com/@hashimotoindotrust",
        instagram: "https://instagram.com/hashimotoindotrust",
      },
    },
    footer: {
      brand: {
        logo_image_id: media["hit-logo-light"],
        lpk_name: "ハシモト・インド・トラスト",
        short_description:
          "2015年の設立以来、インドネシアの優秀な人材を日本企業へ送り出してきた信頼のパートナーです。",
      },
      company_links: [
        {
          key: "about",
          label: "会社概要",
          href: "/about",
          is_enabled: true,
          sort_order: 1,
        },
        {
          key: "recruitment_network",
          label: "採用ネットワーク",
          href: "/recruitment-network",
          is_enabled: true,
          sort_order: 2,
        },
        {
          key: "training_method",
          label: "研修方法",
          href: "/training-method",
          is_enabled: true,
          sort_order: 3,
        },
      ],
      resource_links: [
        {
          key: "candidate_profile",
          label: "人材プロフィール",
          href: "/candidate-profile",
          document_file_id: null,
          is_enabled: true,
          sort_order: 1,
        },
        {
          key: "sectors",
          label: "対応業種",
          href: "/sectors",
          document_file_id: null,
          is_enabled: true,
          sort_order: 2,
        },
        {
          key: "news",
          label: "ニュース",
          href: "/news",
          document_file_id: null,
          is_enabled: true,
          sort_order: 3,
        },
      ],
      contact: {
        use_global_contact: true,
      },
      legal: {
        copyright_text: "© 2026 Hashimoto Indo Trust. 無断転載を禁じます。",
        show_powered_by: true,
      },
    },
  } satisfies Record<(typeof requiredGlobalConfigKeys)[number], JsonRecord>;
}

function buildPageData(media: MediaIds) {
  return {
    homepage: {
      hero: {
        media_type: "image",
        media_id: media["hero-japan-main"],
        headline: "インドネシア人材で、貴社の未来を共に切り拓きます",
        subheadline:
          "ハシモト・インド・トラストは、10年以上にわたりインドネシアの優秀な人材を厳選・育成し、日本の企業様へお届けしてきた専門機関です。",
        eyebrow_label: "信頼と実績のインドネシア人材パートナー",
      },
      stats: [
        {
          icon_key: "users",
          value: "2,500名以上",
          label: "累計派遣実績",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "building",
          value: "150社以上",
          label: "提携日本企業",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "graduation_cap",
          value: "10年以上",
          label: "実績と信頼",
          sort_order: 3,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          value: "95%",
          label: "定着率",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      achievements: [
        {
          icon_key: "graduation_cap",
          title: "技能実習・特定技能対応",
          description:
            "技能実習（外国人技能実習機構登録）から特定技能まで、各在留資格に対応した人材を提供いたします。",
          document_label: null,
          document_url: null,
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "users",
          title: "厳格な選考プロセス",
          description:
            "学力テスト、健康診断、面接を経た厳選された候補者のみをご紹介します。",
          document_label: null,
          document_url: null,
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          title: "充実した日本語研修",
          description:
            "JLPT N4〜N3を目標とした6〜12ヶ月の集中日本語研修を実施しています。",
          document_label: null,
          document_url: null,
          sort_order: 3,
          is_enabled: true,
        },
      ],
      latest_news: {
        source: "latest_published",
        max_items: 4,
      },
      why_indonesia_section: {
        image_id: media["hero-japan-candidate"],
        eyebrow_label: "なぜインドネシア人材なのか",
        headline: "インドネシアは、日本の未来の労働力パートナーです",
        description:
          "インドネシアは2億7千万人を超える人口を持つ東南アジア最大の国。若く勤勉な労働力が豊富であり、日本の職場文化との親和性も高いと評価されています。",
        bullet_items: [
          "平均年齢29歳の若い労働力",
          "勤勉で礼儀正しい国民性",
          "日本語学習への高いモチベーション",
          "既に多くの分野で活躍する実績",
        ],
        cta_label: "人材プロフィールを見る",
        target_page: "candidate_profile",
      },
      why_us_cards: [
        {
          key: "about",
          icon_key: "building",
          title: "10年以上の実績と信頼",
          description:
            "2015年の創業以来、透明性と誠実さを大切に、日本とインドネシアの架け橋として歩んできました。",
          href: "/about",
          sort_order: 1,
          is_enabled: true,
        },
        {
          key: "recruitment_network",
          icon_key: "users",
          title: "広域採用ネットワーク",
          description:
            "インドネシア全土の学校・職業訓練校と連携し、優秀な候補者を幅広く集めています。",
          href: "/recruitment-network",
          sort_order: 2,
          is_enabled: true,
        },
        {
          key: "sectors",
          icon_key: "briefcase",
          title: "多様な業種への対応",
          description:
            "製造業から介護、農業、食品加工まで、幅広い業種に対応した人材をご用意できます。",
          href: "/sectors",
          sort_order: 3,
          is_enabled: true,
        },
        {
          key: "training_method",
          icon_key: "graduation_cap",
          title: "体系的な研修プログラム",
          description:
            "日本語教育から職業訓練、ビジネスマナーまで、実践的なカリキュラムで人材を育成しています。",
          href: "/training-method",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      final_cta: {
        headline: "インドネシア人材の採用について、まずはご相談ください",
        description:
          "お客様のニーズに合わせた最適な人材採用プランをご提案いたします。LINEまたはメールでお気軽にご連絡ください。",
        primary_cta_label: "LINEで相談する",
        primary_line_message_template:
          "ハシモト・インド・トラストのウェブサイトからお問い合わせです。インドネシア人材の採用についてご相談したいと思います。",
        secondary_cta_label: "メールで問い合わせる",
        secondary_href: "/contact",
      },
    },
    tentang_kami: {
      hero: {
        media_type: "image",
        media_id: media["hero-japan-about"],
        headline: "会社概要",
        subheadline:
          "10年以上の経験と実績を持つ、インドネシア人材紹介の専門機関",
        eyebrow_label: "ハシモト・インド・トラストについて",
      },
      proof_stats: [
        { value: "2,500名以上", label: "累計派遣実績", sort_order: 1, is_enabled: true },
        { value: "150社以上", label: "提携企業", sort_order: 2, is_enabled: true },
        { value: "2015年", label: "設立年", sort_order: 3, is_enabled: true },
        { value: "95%", label: "定着率", sort_order: 4, is_enabled: true },
      ],
      story: {
        image_id: media["hero-japan-about"],
        eyebrow_label: "設立の経緯",
        headline: "インドネシアと日本を繋ぐ、信頼の架け橋として",
        body: "ハシモト・インド・トラスト（HIT）は、2015年にインドネシア・Bandungで設立されました。創業者の清水浩志は、インドネシアの優秀な若者が適切な支援と機会さえあれば、国際的な舞台で大きく活躍できると確信し、この事業を立ち上げました。10年以上にわたり、私たちは単なる人材紹介会社ではなく、候補者の人生を変えるパートナーとして歩んできました。",
      },
      timeline: [
        {
          year_label: "2015",
          title: "ハシモト・インド・トラスト設立",
          description: "インドネシア・Bandungにて創業。最初の10名を日本へ派遣。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          year_label: "2017",
          title: "提携企業50社達成",
          description: "製造業を中心に日本全国50社との提携を達成。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          year_label: "2020",
          title: "特定技能制度対応開始",
          description: "2019年に施行された特定技能制度への対応を開始。",
          sort_order: 3,
          is_enabled: true,
        },
        {
          year_label: "2023",
          title: "累計1,000名派遣達成",
          description: "設立8年で累計1,000名以上を日本企業へ派遣。",
          sort_order: 4,
          is_enabled: true,
        },
        {
          year_label: "2026",
          title: "2,500名突破・更なる展開へ",
          description:
            "提携150社、累計2,500名派遣を達成。介護・農業分野をさらに拡充。",
          sort_order: 5,
          is_enabled: true,
        },
      ],
      vision_mission: {
        vision_headline: "ビジョン",
        vision_description:
          "インドネシアと日本の架け橋となり、両国の経済発展と相互理解に貢献する、アジアで最も信頼される人材育成・紹介機関になること。",
        mission_headline: "ミッション",
        mission_description:
          "1. 高品質な日本語教育と職業訓練を通じて、世界で通用するインドネシア人材を育成する。\n2. 日本企業の人材不足の課題を解決し、持続的な経営発展を支援する。\n3. すべての関係者（候補者・企業・地域社会）にとって誠実で透明性のある事業運営を行う。",
      },
      values: [
        {
          icon_key: "briefcase",
          title: "誠実さ（誠実）",
          description:
            "候補者・企業・社会に対して、常に正直で透明性のある対応を貫きます。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "users",
          title: "人を大切に（人材育成）",
          description:
            "候補者一人ひとりの可能性を信じ、その成長を全力でサポートします。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "graduation_cap",
          title: "品質へのこだわり（品質）",
          description:
            "研修品質と人材の質において、業界最高水準を目指し続けます。",
          sort_order: 3,
          is_enabled: true,
        },
      ],
      team_members: [
        {
          name: "清水 浩志",
          role: "代表取締役",
          bio: "インドネシア人材業界20年の経験を持つ創業者。日本とインドネシアの相互理解促進に情熱を注ぐ。",
          image_id: media["avatar-director"],
          sort_order: 1,
          is_enabled: true,
        },
        {
          name: "田中 直子",
          role: "日本事業部マネージャー",
          bio: "日本国内のパートナー企業との関係構築・維持を担当。元人事担当者としての視点で企業の課題を解決。",
          image_id: media["avatar-japan-manager"],
          sort_order: 2,
          is_enabled: true,
        },
      ],
      final_cta: {
        headline: "当社についてさらに詳しく知りたい方へ",
        description:
          "会社案内や詳細な実績データをお送りすることも可能です。お気軽にご連絡ください。",
        primary_cta_label: "LINEでお問い合わせ",
        primary_line_message_template:
          "会社概要ページを拝見しました。詳しい資料をお送りいただけますか。",
        secondary_cta_label: "お問い合わせフォームへ",
        secondary_href: "/contact",
      },
    },
    metode_pelatihan: {
      hero: {
        media_type: "image",
        media_id: media["hero-japan-training"],
        headline: "研修プログラムの詳細",
        subheadline:
          "単なる語学研修にとどまらない、実践的かつ体系的な育成プログラムをご紹介します。",
        eyebrow_label: "HIT研修メソッド",
      },
      training_pillars: [
        {
          icon_key: "graduation_cap",
          title: "日本語教育",
          description:
            "JLPT N5からN3を目標とした段階的な日本語カリキュラム。ネイティブ講師と経験豊富なインドネシア人講師が担当。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          title: "職業技術訓練",
          description:
            "配属先の業種に合わせた実践的な技術訓練。製造業、介護、農業など各分野の専門トレーニング。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "users",
          title: "日本のビジネスマナー",
          description:
            "報・連・相、時間厳守、チームワークなど日本の職場で求められるマナーと姿勢を徹底教育。",
          sort_order: 3,
          is_enabled: true,
        },
        {
          icon_key: "building",
          title: "生活サポート研修",
          description:
            "銀行口座開設、医療機関の利用、ゴミ分別など日本での生活に必要な実践的知識を学びます。",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      training_flow: [
        {
          step_label: "第1段階（1〜3ヶ月）",
          title: "日本語基礎・生活文化",
          description:
            "ひらがな・カタカナ・基礎会話から始め、日常生活に必要な日本語力を養成します。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          step_label: "第2段階（4〜6ヶ月）",
          title: "職業日本語・業種別研修",
          description:
            "職場で使う専門用語と実践的な業種別スキルを集中的に習得します。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          step_label: "第3段階（7〜9ヶ月）",
          title: "総合評価・模擬訓練",
          description:
            "JLPT模擬試験、模擬職場実習、最終評価を実施。渡航前の最終調整を行います。",
          sort_order: 3,
          is_enabled: true,
        },
        {
          step_label: "第4段階（渡航後）",
          title: "フォローアップサポート",
          description: "渡航後3〜6ヶ月間、定期的なヒアリングとサポートを実施します。",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      curriculum_areas: [
        {
          icon_key: "graduation_cap",
          title: "JLPT N5〜N3対策",
          description: "読解・文法・聴解・語彙の4技能を体系的に学習。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          title: "ビジネスコミュニケーション",
          description:
            "報告・連絡・相談、電話応対、挨拶など実践的コミュニケーション。",
          sort_order: 2,
          is_enabled: true,
        },
      ],
      final_cta: {
        headline: "研修プログラムの詳細資料をご希望の方へ",
        description:
          "カリキュラムの詳細や研修施設の写真をまとめた資料をお送りすることができます。",
        primary_cta_label: "LINEで資料請求",
        primary_line_message_template:
          "研修プログラムの詳細資料を送っていただけますか。",
        secondary_cta_label: "お問い合わせ",
        secondary_href: "/contact",
      },
    },
    profil_kandidat: {
      hero: {
        media_type: "image",
        media_id: media["hero-japan-candidate"],
        headline: "HITが送り出す人材のプロフィール",
        subheadline:
          "私たちが育成する候補者は、技術と人間性を兼ね備えた即戦力です。",
        eyebrow_label: "人材プロフィール",
      },
      proof_stats: [
        { value: "N4以上", label: "日本語レベル", sort_order: 1, is_enabled: true },
        { value: "6〜12ヶ月", label: "研修期間", sort_order: 2, is_enabled: true },
        { value: "18〜35歳", label: "平均年齢層", sort_order: 3, is_enabled: true },
      ],
      why_indonesia: {
        image_id: media["hero-japan-candidate"],
        headline: "なぜインドネシア人材が選ばれるのか",
        description:
          "インドネシアは東南アジア最大の人口を持ち、若く活力ある労働力が豊富です。宗教的・文化的多様性の中で育った適応力の高さと、日本の「ものづくり精神」に通じる勤勉さが評価されています。",
        bullet_items: [
          "平均年齢29歳の若いエネルギーと学習意欲",
          "日本語能力検定（JLPT）への積極的な取り組み",
          "チームワークを重視する協調性",
          "既に多くの業種で活躍中の実績",
        ],
      },
      candidate_strengths: [
        {
          icon_key: "graduation_cap",
          title: "高い日本語学習意欲",
          description:
            "自発的に日本語を学ぶ候補者が多く、研修中の習得スピードが早い傾向があります。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "users",
          title: "チームワーク重視",
          description:
            "集団での作業や協調性が求められる環境で高いパフォーマンスを発揮します。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          title: "勤勉な労働観",
          description:
            "時間を守り、指示に忠実で、向上心を持って業務に取り組む姿勢が評価されています。",
          sort_order: 3,
          is_enabled: true,
        },
      ],
      supported_pathways: [
        {
          pathway_label: "技能実習（外国人技能実習）",
          title: "技能実習制度",
          description: "3〜5年の技能実習。製造、建設、農業など幅広い業種に対応。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          pathway_label: "特定技能",
          title: "特定技能制度（1号・2号）",
          description: "より高い自由度と長期就労を可能にする在留資格。14業種対応。",
          sort_order: 2,
          is_enabled: true,
        },
      ],
      final_cta: {
        headline: "候補者のご紹介を希望される方へ",
        description:
          "現在の採用ニーズをお聞かせください。最適な候補者をご紹介いたします。",
        primary_cta_label: "LINEで採用相談",
        primary_line_message_template:
          "人材プロフィールのページを見ました。候補者のご紹介をお願いしたいのですが。",
        secondary_cta_label: "お問い合わせ",
        secondary_href: "/contact",
      },
    },
    jaringan_rekrutmen: {
      hero: {
        media_type: "image",
        media_id: media["hero-japan-network"],
        headline: "インドネシア全土をカバーする採用ネットワーク",
        subheadline:
          "ジャカルタからスラウェシまで、HITの採用ネットワークは全国に広がっています。",
        eyebrow_label: "採用ネットワーク",
      },
      proof_stats: [
        { value: "34州", label: "カバーエリア", sort_order: 1, is_enabled: true },
        {
          value: "200校以上",
          label: "提携学校・訓練校",
          sort_order: 2,
          is_enabled: true,
        },
        {
          value: "年間500名以上",
          label: "候補者エントリー数",
          sort_order: 3,
          is_enabled: true,
        },
      ],
      network_overview: {
        map_image_id: null,
        headline: "インドネシア全土からの厳選採用",
        description:
          "HITはジャワ島の都市部だけでなく、スマトラ、スラウェシ、カリマンタンなど全国から優秀な候補者を採用しています。地方出身の候補者は特に忍耐力と適応力が高く、日本の職場環境で長期定着する傾向があります。",
      },
      coverage_regions: [
        {
          region_name: "ジャワ島（西ジャワ・中ジャワ・東ジャワ）",
          description:
            "インドネシア最大の人口集積地。多様なスキルを持つ候補者が豊富。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          region_name: "スマトラ島",
          description:
            "農業・プランテーション経験者が多く、体力と忍耐力に優れた候補者が多い地域。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          region_name: "スラウェシ・カリマンタン",
          description: "地方の職業訓練学校と連携した採用チャンネルを持つ。",
          sort_order: 3,
          is_enabled: true,
        },
      ],
      screening_flow: [
        {
          step_label: "ステップ1",
          title: "書類審査",
          description: "履歴書、学歴証明、健康診断書の確認。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          step_label: "ステップ2",
          title: "基礎学力テスト",
          description: "読み書き、計算、日本語基礎テストを実施。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          step_label: "ステップ3",
          title: "面接・適性評価",
          description: "日本語面接（またはインドネシア語）と性格適性検査。",
          sort_order: 3,
          is_enabled: true,
        },
        {
          step_label: "ステップ4",
          title: "健康診断",
          description: "指定医療機関での精密健康診断。",
          sort_order: 4,
          is_enabled: true,
        },
        {
          step_label: "ステップ5",
          title: "企業マッチング",
          description:
            "候補者のスキルと御社のニーズを照合し最適なマッチングを実施。",
          sort_order: 5,
          is_enabled: true,
        },
      ],
      final_cta: {
        headline: "採用ネットワークについて詳しく聞きたい方へ",
        description:
          "御社の採用条件に合った候補者の探し方について、具体的にご説明いたします。",
        primary_cta_label: "LINEで相談する",
        primary_line_message_template:
          "採用ネットワークについて詳しく教えていただけますか。",
        secondary_cta_label: "お問い合わせ",
        secondary_href: "/contact",
      },
    },
    sector_page: {
      hero: {
        media_type: "image",
        media_id: media["hero-japan-main"],
        headline: "対応業種一覧",
        subheadline:
          "HITは製造業から介護まで、多様な業種に対応したインドネシア人材をご用意しています。",
        eyebrow_label: "業種別対応",
      },
      filter_config: {
        enable_sector_category_filter: true,
      },
      final_cta: {
        headline: "ご希望の業種が見つかりましたか？",
        description: "具体的な採用条件や人数規模についてお気軽にご相談ください。",
        primary_cta_label: "LINEでお問い合わせ",
        primary_line_message_template:
          "業種ページを拝見しました。採用についてご相談させてください。",
        secondary_cta_label: "メールで問い合わせ",
        secondary_document_file_id: null,
      },
    },
    news_page: {
      hero: {
        media_type: "image",
        media_id: null,
        headline: "ニュース & お知らせ",
        subheadline:
          "HITからの最新情報、イベント、パートナー企業訪問レポートをお届けします。",
        eyebrow_label: "最新情報",
      },
      filter_config: {
        enable_category_filter: true,
        enable_tag_filter: true,
      },
      final_cta: {
        headline: "最新情報をメールで受け取りたい方へ",
        description:
          "新しいニュースや採用情報をいち早くお届けします。LINEで友達追加ください。",
        primary_cta_label: "LINEで友達追加",
        primary_line_message_template:
          "ニュースページを拝見しました。LINEで最新情報を受け取りたいです。",
        secondary_cta_label: "お問い合わせ",
        secondary_href: "/contact",
      },
    },
    contact: {
      hero: {
        media_type: "image",
        media_id: media["hero-japan-contact"],
        headline: "お問い合わせ",
        subheadline:
          "採用に関するご質問・ご相談は、LINEまたはメールでお気軽にどうぞ。通常1〜2営業日以内にご返答いたします。",
        eyebrow_label: "お問い合わせ",
      },
      contact_channels: {
        line_official_account_id: "@hit-japan",
        line_cta_label: "LINEでお問い合わせ",
        line_message_template:
          "ハシモト・インド・トラストのウェブサイトからお問い合わせです。",
        business_email: "japan@hashimotoindotrust.co.id",
        email_subject_template: "インドネシア人材採用に関するお問い合わせ",
      },
      business_info: {
        business_hours: "月〜金 08:00-17:00 WIB（UTC+7）/ 10:00-19:00 JST",
        language_support: ["日本語", "英語", "インドネシア語"],
        address:
          "インドネシア 西ジャワ州 Bandung Soreang ラヤ・ソレアン通り45番地 40911",
        map_url:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63384.09!2d107.52!3d-7.02",
        map_embed_url:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63384.09!2d107.52!3d-7.02",
      },
      inquiry_flow: [
        {
          icon_key: "users",
          title: "LINEまたはメールでご連絡",
          description: "LINEに友達追加いただくか、メールにてお問い合わせください。",
          sort_order: 1,
          is_enabled: true,
        },
        {
          icon_key: "briefcase",
          title: "担当者よりご返答",
          description: "1〜2営業日以内に担当者よりご連絡差し上げます。",
          sort_order: 2,
          is_enabled: true,
        },
        {
          icon_key: "graduation_cap",
          title: "採用プランのご提案",
          description:
            "御社のニーズをお聞きし、最適な採用プランをご提案いたします。",
          sort_order: 3,
          is_enabled: true,
        },
        {
          icon_key: "plane",
          title: "候補者のご紹介・面接",
          description: "条件に合う候補者をご紹介し、オンライン面接を実施します。",
          sort_order: 4,
          is_enabled: true,
        },
      ],
      final_cta: {
        headline: "まずはLINEで気軽にご相談を",
        description:
          "難しいことは何もありません。「採用を考えている」その一言からで大丈夫です。",
        primary_cta_label: "LINEで友達追加",
        primary_line_message_template:
          "お問い合わせページから連絡しました。インドネシア人材の採用について相談したいです。",
        secondary_cta_label: "メールで問い合わせる",
        secondary_document_file_id: null,
      },
    },
  } satisfies Record<(typeof requiredPageKeys)[number], JsonRecord>;
}

async function writeReport(input: {
  tenantId: string;
  variantId: string;
  verificationRows: VerificationRow[];
  equalityRows: VerificationRow[];
}) {
  const tableRows = input.verificationRows.map(
    (row) => `| ${row.page_key} | ${row.status} |`,
  );

  const report = [
    "# タスク6レポート - 日本バリアントコンテンツ",
    "",
    `テナント: ハシモト・インド・トラスト (${input.tenantId})`,
    `日本バリアント: ${input.variantId}`,
    `メディアID参照元: ${mediaIdsPath}`,
    "",
    "## 更新したグローバル設定",
    "",
    "- brand_header",
    "- line_business_contact",
    "- footer",
    "",
    "## 更新したページ",
    "",
    ...requiredPageKeys.map((pageKey) => `- ${pageKey}`),
    "",
    "## 公開確認",
    "",
    "```sql",
    `SELECT page_key, status FROM content_pages WHERE variant_id = '${input.variantId}';`,
    "```",
    "",
    "| page_key | status |",
    "| --- | --- |",
    ...tableRows,
    "",
    input.equalityRows.length === 0
      ? "結果: PASS - 8ページすべてがPUBLISHEDで、publishedDataJsonはdataJsonと一致しています。"
      : `結果: FAIL - publishedDataJsonがdataJsonと異なるページ: ${input.equalityRows
          .map((row) => row.page_key)
          .join(", ")}`,
    "",
  ].join("\n");

  await writeFile(reportPath, report, "utf8");
}

async function main() {
  const media = await loadMediaIds();
  const globalConfigs = buildGlobalConfigs(media);
  const pageData = buildPageData(media);

  const result = await prisma.$transaction(
    async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { slug: "hit" },
        select: { id: true, name: true },
      });

      if (!tenant) {
        throw new Error('テナント slug "hit" が見つかりません。');
      }

      const japanVariant = await tx.variant.findUnique({
        where: {
          tenantId_key: {
            tenantId: tenant.id,
            key: "japan",
          },
        },
        select: { id: true, key: true },
      });

      if (!japanVariant) {
        throw new Error('テナント "hit" の variant key "japan" が見つかりません。');
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
          `テナント "hit" で見つからないメディアアセット: ${missingMediaIds.join(", ")}`,
        );
      }

      for (const [configKey, data] of Object.entries(globalConfigs)) {
        await tx.variantGlobalConfig.upsert({
          where: {
            variantId_configKey: {
              variantId: japanVariant.id,
              configKey,
            },
          },
          update: {
            dataJson: toPrismaJson(data),
          },
          create: {
            tenantId: tenant.id,
            variantId: japanVariant.id,
            configKey,
            dataJson: toPrismaJson(data),
          },
        });
      }

      for (const [pageKey, data] of Object.entries(pageData)) {
        const meta = pageMeta[pageKey as keyof typeof pageMeta];
        const json = toPrismaJson(data);

        await tx.contentPage.upsert({
          where: {
            variantId_pageKey: {
              variantId: japanVariant.id,
              pageKey,
            },
          },
          update: {
            title: meta.title,
            slug: meta.slug,
            dataJson: json,
            publishedDataJson: json,
            status: PublishStatus.PUBLISHED,
          },
          create: {
            tenantId: tenant.id,
            variantId: japanVariant.id,
            pageKey,
            title: meta.title,
            slug: meta.slug,
            dataJson: json,
            publishedDataJson: json,
            status: PublishStatus.PUBLISHED,
          },
        });
      }

      const verificationRows = await tx.$queryRaw<VerificationRow[]>`
        SELECT page_key, status
        FROM content_pages
        WHERE variant_id = ${japanVariant.id}
        ORDER BY page_key ASC
      `;

      const equalityRows = await tx.$queryRaw<VerificationRow[]>`
        SELECT page_key, status
        FROM content_pages
        WHERE variant_id = ${japanVariant.id}
          AND data_json IS DISTINCT FROM published_data_json
        ORDER BY page_key ASC
      `;

      if (
        verificationRows.length !== requiredPageKeys.length ||
        verificationRows.some((row) => row.status !== PublishStatus.PUBLISHED) ||
        equalityRows.length > 0
      ) {
        throw new Error("日本バリアントページの公開確認に失敗しました。");
      }

      return {
        tenantId: tenant.id,
        variantId: japanVariant.id,
        verificationRows,
        equalityRows,
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
        updatedGlobalConfigs: requiredGlobalConfigKeys,
        publishedPages: result.verificationRows,
        reportPath,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("日本バリアントコンテンツの投入に失敗しました。");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
