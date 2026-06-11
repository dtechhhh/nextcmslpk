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
  throw new Error("DATABASE_URL is required to seed Japan news data.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const REVIEWED_AT = "2026-06-11";
const AUTHOR_NAME = "Hashimoto Indo Trust 採用支援チーム";
const AUTHOR_TITLE = "インドネシア人材採用・育成担当";
const REVIEWER_NAME = "Hashimoto Indo Trust 編集責任者";
const REVIEWER_TITLE = "日本向けパートナーコンテンツ確認";

const officialSources = {
  sswPortal: "https://www.ssw.go.jp/",
  supportPlan: "https://www.moj.go.jp/isa/applications/ssw/nyuukokukanri07_00201.html",
  employmentManagement: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000184413.html",
  safety: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000186714.html",
  japaneseEducation: "https://www.nihongo-ews.mext.go.jp/",
};

const contentTypes = [
  { value: "practical-guide", label: "実務ガイド" },
  { value: "insight", label: "解説" },
  { value: "case-study", label: "事例" },
  { value: "report", label: "レポート" },
  { value: "announcement", label: "お知らせ" },
];

const categories = [
  { value: "partnership-guide", label: "採用・受入れガイド" },
  { value: "candidate-readiness", label: "候補者準備" },
  { value: "quality-assurance", label: "選考・品質管理" },
  { value: "compliance-support", label: "在留資格・受入れ支援" },
  { value: "case-activity", label: "事例・活動報告" },
  { value: "industry-insight", label: "人材・業界インサイト" },
];

const tags = [
  { value: "requirement-definition", label: "求人要件" },
  { value: "interview", label: "面接" },
  { value: "japanese-education", label: "日本語教育" },
  { value: "retention", label: "定着支援" },
  { value: "specified-skilled-worker", label: "特定技能" },
  { value: "safety", label: "安全衛生" },
  { value: "recruitment-schedule", label: "採用スケジュール" },
  { value: "job-description", label: "求人票" },
  { value: "onboarding", label: "入社準備" },
  { value: "quality-assurance", label: "品質管理" },
];

type ArticleSection = {
  heading: string;
  paragraphs: string[];
};

type ArticleSeed = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  contentType: string;
  category: string;
  tagValues: string[];
  coverKeywords: string[];
  isFeatured?: boolean;
  partnerRelevance: string;
  takeaways: string[];
  facts: Array<{ label: string; value: string }>;
  evidence: Array<{
    title: string;
    description: string;
    sourceLabel: string;
    sourceUrl: string;
  }>;
  sections: ArticleSection[];
  ctaLabel: string;
  ctaMessage: string;
};

const articles: ArticleSeed[] = [
  {
    slug: "indonesia-talent-requirement-definition",
    title: "インドネシア人材採用を成功させる求人要件の整理方法",
    subtitle: "候補者探しを始める前に、仕事内容と選考基準を言語化する",
    excerpt: "海外人材採用では、人数や日本語レベルだけでなく、実際の業務、教育体制、生活環境まで整理することで候補者とのミスマッチを減らせます。",
    contentType: "practical-guide",
    category: "partnership-guide",
    tagValues: ["requirement-definition", "job-description"],
    coverKeywords: ["idjobhero", "ssw", "tokutei"],
    isFeatured: true,
    partnerRelevance: "初回相談時に必要な情報を整理できるため、候補者提案、面接、入社前教育の精度を上げやすくなります。",
    takeaways: [
      "職種名ではなく、候補者が毎日行う作業単位で業務を整理する",
      "必須条件と入社後に教育できる項目を分ける",
      "住居、勤務時間、職場環境も候補者説明に必要な採用条件として扱う",
    ],
    facts: [
      { label: "推奨する準備", value: "仕事内容・人数・勤務地・希望時期の整理" },
      { label: "主な成果物", value: "候補者選定基準と面接確認項目" },
      { label: "確認タイミング", value: "募集開始前" },
    ],
    evidence: [
      {
        title: "外国人雇用管理に関する公的情報",
        description: "募集・採用から雇用管理までの基本事項は、厚生労働省の案内もあわせてご確認ください。",
        sourceLabel: "厚生労働省の公式情報",
        sourceUrl: officialSources.employmentManagement,
      },
    ],
    sections: [
      {
        heading: "最初に決めるのは国籍ではなく仕事内容です",
        paragraphs: [
          "海外人材採用の相談では、最初に『インドネシア人を何名採用したい』という話から始まることがあります。しかし候補者選定に必要なのは、国籍よりも、担当する作業、勤務場所、シフト、使用する道具、報告方法、安全上の注意点です。具体的な一日の流れが見えるほど、候補者は仕事を正しく理解できます。",
          "同じ職種名でも企業によって担当範囲は異なります。たとえば製造業であれば、機械操作が中心なのか、検品や梱包まで含むのかによって確認すべき経験が変わります。求人票には職種名だけでなく、実際の作業を三つから五つ程度に分けて記載することをおすすめします。",
        ],
      },
      {
        heading: "必須条件と教育可能な条件を分けます",
        paragraphs: [
          "すべてを必須条件にすると候補者の幅が狭くなります。入社時点で必要な日本語、資格、経験と、入社後の教育で習得できる作業を分けることが重要です。この区分があると、選考で何を確認し、入社前教育で何を補うべきかが明確になります。",
          "選考基準は『明るい人』『真面目な人』といった抽象表現だけでは判定できません。指示を復唱できる、分からないときに質問できる、決められた手順を守れるなど、面接や実技確認で観察できる行動に置き換えます。",
        ],
      },
      {
        heading: "候補者へ伝える生活条件も採用要件です",
        paragraphs: [
          "勤務地の気候、住居から職場までの移動、夜勤の有無、食事や買い物の環境は、入社後の生活に直接影響します。良い情報だけでなく、仕事や生活の難しさも事前に説明することで、候補者が自分で判断できる状態をつくります。",
          "当社へのご相談では、求人条件を確認したうえで、候補者に伝える説明項目と面接時の確認項目を整理します。条件がまだ確定していない段階でも、採用目的と想定業務から一緒に整理できます。",
        ],
      },
    ],
    ctaLabel: "求人要件を相談する",
    ctaMessage: "インドネシア人材の求人要件を整理したいです。職種：／人数：／勤務地：／希望時期：",
  },
  {
    slug: "candidate-interview-five-viewpoints",
    title: "候補者面接で確認したい5つの観点",
    subtitle: "日本語の正確さだけでなく、職場での行動を具体的に確認する",
    excerpt: "海外人材の面接では、会話力だけで合否を決めず、仕事内容の理解、報告行動、安全意識、学習姿勢、生活適応を具体的な質問で確認します。",
    contentType: "practical-guide",
    category: "quality-assurance",
    tagValues: ["interview", "quality-assurance"],
    coverKeywords: ["gijinkoku", "about", "hero-tentang"],
    isFeatured: true,
    partnerRelevance: "面接担当者ごとの評価差を減らし、採用後に必要となる教育やフォローも選考段階で把握できます。",
    takeaways: [
      "質問は過去の具体的な行動を聞く形式にする",
      "日本語力と仕事理解を別々に評価する",
      "合否だけでなく入社前教育へ引き継ぐ記録を残す",
    ],
    facts: [
      { label: "確認する観点", value: "仕事理解・報告・安全・学習・生活適応" },
      { label: "推奨形式", value: "構造化面接と共通評価表" },
      { label: "面接後", value: "教育担当へ評価結果を共有" },
    ],
    evidence: [
      {
        title: "外国人雇用管理の基本事項",
        description: "適切な募集・採用と雇用管理に関する公的な考え方を確認できます。",
        sourceLabel: "厚生労働省の公式情報",
        sourceUrl: officialSources.employmentManagement,
      },
    ],
    sections: [
      {
        heading: "1. 仕事内容を自分の言葉で説明できるか",
        paragraphs: [
          "求人説明を受けた候補者に、担当する仕事を自分の言葉で説明してもらいます。説明が完全である必要はありませんが、勤務地、主な作業、勤務時間、注意すべき点を理解しているかを確認します。理解が曖昧な場合は、採用後の問題ではなく説明方法を見直すサインです。",
          "仕事内容の理解と日本語の流暢さは分けて評価します。短い表現でも内容を正しく理解している候補者と、会話は滑らかでも仕事理解が曖昧な候補者では、教育上の課題が異なります。",
        ],
      },
      {
        heading: "2. 報告と質問の行動を確認する",
        paragraphs: [
          "『分からない指示を受けたとき、どうしますか』という質問だけでなく、過去に分からないことを確認した経験を聞きます。誰に、どのタイミングで、どのように質問したかを確認すると、職場での行動をイメージしやすくなります。",
          "安全や品質が重視される職場では、無理に理解したふりをしないことが重要です。候補者には、質問することが否定的に評価されるのではなく、正確な仕事のために必要な行動であると説明します。",
        ],
      },
      {
        heading: "3. 安全、学習、生活適応を分けて記録する",
        paragraphs: [
          "安全意識は、保護具、手順、異常時の報告について具体例を使って確認します。学習姿勢は、これまで新しい作業や言語をどのように覚えたかを聞きます。生活適応では、寮生活、通勤、食事、宗教上の習慣など、本人が事前に相談したい事項を確認します。",
          "面接結果は合否だけで終わらせず、入社前教育で補う項目として残します。当社では企業様の評価項目に合わせ、候補者への追加確認と教育側への引き継ぎを行えるよう面接情報を整理します。",
        ],
      },
    ],
    ctaLabel: "面接設計を相談する",
    ctaMessage: "インドネシア人材の面接項目について相談したいです。職種：／重視する点：／面接予定時期：",
  },
  {
    slug: "pre-employment-japanese-training-design",
    title: "入社前日本語教育を仕事内容から設計する",
    subtitle: "資格レベルだけでは測れない、現場で必要な理解と報告を準備する",
    excerpt: "入社前教育は一般日本語だけでなく、配属先の指示、報告、安全、品質確認に必要な場面を想定して設計することで実務につながります。",
    contentType: "insight",
    category: "candidate-readiness",
    tagValues: ["japanese-education", "onboarding"],
    coverKeywords: ["ryugakusei", "programhero", "Magang"],
    isFeatured: true,
    partnerRelevance: "配属後に『日本語資格はあるが指示が伝わらない』という状況を減らすため、求人ごとの教育優先順位を事前に共有できます。",
    takeaways: [
      "日本語レベルと職場コミュニケーションを別々に確認する",
      "実際の指示、復唱、報告、質問を教材に反映する",
      "企業固有の用語やルールは採用決定後に追加する",
    ],
    facts: [
      { label: "教育の基礎", value: "一般日本語と生活日本語" },
      { label: "求人別教育", value: "作業指示・安全・報告・品質用語" },
      { label: "確認方法", value: "会話、ロールプレイ、理解確認" },
    ],
    evidence: [
      {
        title: "日本語教育に関する公的情報",
        description: "日本語教育機関や学習支援に関する情報は、文部科学省の日本語教育情報サイトも参照できます。",
        sourceLabel: "文部科学省 日本語教育情報サイト",
        sourceUrl: officialSources.japaneseEducation,
      },
    ],
    sections: [
      {
        heading: "資格は共通の目安、仕事の準備は求人ごとに変わります",
        paragraphs: [
          "JLPTやJFT-Basicなどの結果は日本語学習の到達度を確認する共通の目安です。一方、実際の職場では、短い指示を正確に理解する、聞き取れない部分を確認する、作業結果を報告するなど、場面ごとの行動が必要です。",
          "同じ日本語レベルの候補者でも、経験した仕事や学習方法によって得意な場面は異なります。そのため、資格結果だけで教育内容を決めず、会話、聞き取り、作業説明など複数の方法で現在地を確認します。",
        ],
      },
      {
        heading: "配属先で頻繁に使う場面から優先順位を決めます",
        paragraphs: [
          "教育項目は、朝礼、作業指示、復唱、進捗報告、異常報告、引き継ぎ、休暇連絡など、実際に起こる場面から整理します。製造、介護、外食、宿泊では必要な語彙と丁寧さが異なるため、共通教育の後に分野別・求人別の内容を追加します。",
          "企業様から作業手順書、写真、用語一覧、よくある指示をご提供いただける場合は、候補者が入社前に触れられる範囲を相談します。機密情報を扱う場合は、公開範囲と利用方法を明確にします。",
        ],
      },
      {
        heading: "教育結果を採用側へ返す仕組みをつくります",
        paragraphs: [
          "教育は受講時間だけでは評価できません。指示理解、質問、報告、語彙、生活準備などの観点で確認し、できることと継続課題を分けて共有します。企業様はその情報をもとに、入社後の指導担当者や初期業務を準備できます。",
          "当社では求人条件と面接結果を教育側へ引き継ぎ、候補者ごとの準備項目を整理します。入社前にすべてを完成させるのではなく、入社後の教育につながる情報を残すことを重視します。",
        ],
      },
    ],
    ctaLabel: "入社前教育を相談する",
    ctaMessage: "求人に合わせた入社前日本語教育について相談したいです。職種：／主な業務：／必要な日本語場面：",
  },
  {
    slug: "retention-starts-before-recruitment",
    title: "外国人材の定着支援は採用前から始まる",
    subtitle: "期待値の調整と受入れ準備が、入社後のコミュニケーションを支える",
    excerpt: "定着支援は問題が起きた後の対応だけではありません。求人説明、面接、生活案内、職場の受入れ準備を一つの流れとして設計します。",
    contentType: "insight",
    category: "partnership-guide",
    tagValues: ["retention", "onboarding"],
    coverKeywords: ["hero-tentang-kami", "aboutheroid", "about"],
    partnerRelevance: "採用前に候補者と職場双方の期待をそろえることで、入社後の相談や指導を個人任せにしない体制を準備できます。",
    takeaways: [
      "良い条件だけでなく仕事と生活の難しさも説明する",
      "相談窓口と職場指導者の役割を入社前に決める",
      "入社直後、1か月、3か月など確認時期を設定する",
    ],
    facts: [
      { label: "採用前", value: "期待値と生活条件の確認" },
      { label: "入社時", value: "ルール、相談先、初期業務の共有" },
      { label: "入社後", value: "定期確認と課題の早期共有" },
    ],
    evidence: [
      {
        title: "外国人雇用管理に関する指針",
        description: "外国人労働者の適切な雇用管理と再就職援助について、事業主向けの公的情報を確認できます。",
        sourceLabel: "厚生労働省の公式情報",
        sourceUrl: officialSources.employmentManagement,
      },
    ],
    sections: [
      {
        heading: "ミスマッチは入社後だけの問題ではありません",
        paragraphs: [
          "仕事内容や生活条件への理解が不足したまま採用が進むと、入社後に本人と企業の期待がずれる可能性があります。面接時点で、業務の難しさ、繁忙期、シフト、職場のルール、住居や通勤について具体的に説明することが定着支援の第一歩です。",
          "候補者側にも、働く目的、将来計画、家族との相談状況、日本で不安に感じることを確認します。企業から一方的に条件を伝えるのではなく、双方が確認できる時間を設けます。",
        ],
      },
      {
        heading: "職場内の役割を決めておきます",
        paragraphs: [
          "外国人材本人が困ったとき、誰に仕事を聞き、誰に生活の相談をするのかが曖昧だと、小さな問題が長く残ります。現場指導者、管理担当者、外部支援者の役割を整理し、本人にも分かる形で伝えます。",
          "指導担当者だけに負担が集中しないよう、よくある質問、休暇連絡、体調不良、住居トラブルなどの対応方法を組織内で共有しておくことが重要です。",
        ],
      },
      {
        heading: "定期確認は評価面談と相談を分けます",
        paragraphs: [
          "仕事の評価と生活上の相談を同じ場だけで行うと、本人が話しにくい場合があります。業務習得の確認と、生活・人間関係・健康面の相談を必要に応じて分け、通訳や支援担当を含めた確認方法を決めます。",
          "当社は候補者への事前説明、入社前教育、受入れ側への情報共有をつなげます。実際の支援範囲は在留資格、契約、登録支援機関との役割分担に応じて個別に確認します。",
        ],
      },
    ],
    ctaLabel: "受入れ準備を相談する",
    ctaMessage: "外国人材の受入れと定着支援について相談したいです。職種：／入社予定時期：／現在の受入れ体制：",
  },
  {
    slug: "specified-skilled-worker-acceptance-checklist",
    title: "特定技能人材の受入れ前に確認したい基本項目",
    subtitle: "在留資格手続だけでなく、雇用条件、支援、職場準備を並行して進める",
    excerpt: "特定技能人材の受入れでは、対象分野と業務、雇用条件、支援体制、必要書類、入社後の担当者を関係機関と確認しながら準備します。",
    contentType: "practical-guide",
    category: "compliance-support",
    tagValues: ["specified-skilled-worker", "onboarding"],
    coverKeywords: ["tokuteiginou", "ssw"],
    isFeatured: true,
    partnerRelevance: "採用判断後に手続や支援の確認が遅れないよう、受入企業、紹介・送出関係者、登録支援機関などの役割を早期に整理できます。",
    takeaways: [
      "対象分野と従事予定業務の適合を最初に確認する",
      "雇用条件と支援内容を候補者が理解できる方法で説明する",
      "申請、入国・転居、入社後支援の担当と期限を一覧化する",
    ],
    facts: [
      { label: "確認主体", value: "受入企業と関係する専門機関" },
      { label: "主な準備", value: "雇用条件・支援計画・必要書類・社内体制" },
      { label: "注意", value: "制度・分野ごとの最新要件を公式情報で確認" },
    ],
    evidence: [
      {
        title: "特定技能制度の公式情報",
        description: "対象分野、試験、働くための条件など、制度の概要を確認できます。",
        sourceLabel: "特定技能総合支援サイト",
        sourceUrl: officialSources.sswPortal,
      },
      {
        title: "1号特定技能外国人支援に関する情報",
        description: "支援計画や届出に関する最新情報は出入国在留管理庁の案内をご確認ください。",
        sourceLabel: "出入国在留管理庁の公式情報",
        sourceUrl: officialSources.supportPlan,
      },
    ],
    sections: [
      {
        heading: "制度確認と採用実務を同時に進めます",
        paragraphs: [
          "特定技能の採用では、候補者の試験や日本語要件だけでなく、受入企業の事業内容、従事予定業務、雇用条件、分野別の手続を確認します。制度上の対象業務と実際の仕事内容に差がないか、専門家や関係機関と早い段階で確認することが重要です。",
          "制度や提出書類は変更される可能性があります。本記事は準備項目の整理を目的としており、個別案件では出入国在留管理庁、分野所管省庁、行政書士、登録支援機関などの最新案内に基づいて判断してください。",
        ],
      },
      {
        heading: "候補者説明と社内準備を分けないことが重要です",
        paragraphs: [
          "雇用条件、控除、住居、勤務時間、業務内容、相談方法は、候補者が理解できる方法で説明します。同時に社内では、配属部署、指導担当者、連絡方法、初日の案内、必要な備品を準備します。候補者への説明と受入れ側の準備内容が一致していることが大切です。",
          "支援を登録支援機関へ委託する場合も、日常の指導や労務管理まで外部だけで完結するわけではありません。誰がどの連絡を担当し、問題が起きたときにどこへ共有するかを決めます。",
        ],
      },
      {
        heading: "案件ごとの進行表を作成します",
        paragraphs: [
          "候補者決定、書類収集、申請、住居準備、移動、入社手続、オリエンテーションまでを一つの進行表にします。候補者側、企業側、支援側の担当を明記すると、確認待ちによる遅れを把握しやすくなります。",
          "当社への採用相談では、求人条件と候補者準備を整理します。在留資格申請や法的判断が必要な事項については、案件に関係する専門家・機関と連携し、役割を明確にして進めます。",
        ],
      },
    ],
    ctaLabel: "特定技能採用を相談する",
    ctaMessage: "特定技能人材の採用について相談したいです。分野・職種：／人数：／勤務地：／希望時期：",
  },
  {
    slug: "foreign-worker-safety-orientation",
    title: "外国人材向け安全衛生教育を伝わる形にする",
    subtitle: "翻訳だけに頼らず、実演、復唱、理解確認を組み合わせる",
    excerpt: "安全衛生教育では、資料を渡すだけでなく、危険箇所、禁止行動、異常時の報告を写真や実演で示し、本人の理解を確認します。",
    contentType: "practical-guide",
    category: "quality-assurance",
    tagValues: ["safety", "japanese-education"],
    coverKeywords: ["ChatGPT Image", "Magang", "programhero"],
    partnerRelevance: "日本語力に差がある職場でも、安全ルールの理解を共通の方法で確認し、教育記録を残すための準備に使えます。",
    takeaways: [
      "危険を文章だけでなく写真、現物、実演で示す",
      "『分かりましたか』ではなく本人に手順を説明・実演してもらう",
      "教育後も作業観察と再確認を継続する",
    ],
    facts: [
      { label: "教育方法", value: "やさしい日本語・視覚資料・実演" },
      { label: "理解確認", value: "復唱、指差し、本人による実演" },
      { label: "記録", value: "実施日、内容、確認結果、再教育" },
    ],
    evidence: [
      {
        title: "外国人労働者の安全衛生対策",
        description: "外国人労働者向け教材や安全衛生に関する公的情報を確認できます。",
        sourceLabel: "厚生労働省の公式情報",
        sourceUrl: officialSources.safety,
      },
    ],
    sections: [
      {
        heading: "翻訳された資料だけでは理解を確認できません",
        paragraphs: [
          "母語の資料は重要ですが、読んだことと実際に安全な行動ができることは同じではありません。作業場所を案内し、危険箇所、保護具、停止手順、立入禁止区域を現物と一緒に説明します。",
          "専門用語をそのまま使う場合は、短い説明、写真、記号を組み合わせます。職場で実際に使う警告表示や合図も教材に含め、見たときに何をすべきかを確認します。",
        ],
      },
      {
        heading: "本人から説明してもらうことで理解を確認します",
        paragraphs: [
          "説明後に『分かりましたか』と聞くと、候補者や新入社員が遠慮して『はい』と答えることがあります。安全手順を本人の言葉で説明してもらう、保護具を着用してもらう、異常時の連絡をロールプレイするなど、行動で確認します。",
          "間違いがあった場合は叱責ではなく、どの説明が伝わらなかったかを確認します。日本語、経験、職場固有ルールのどこに課題があるかを分けると、再教育の内容を決めやすくなります。",
        ],
      },
      {
        heading: "配属後の観察と再教育を計画します",
        paragraphs: [
          "初回教育だけで安全行動が定着するとは限りません。配属直後は指導者が作業を観察し、決められた時期に理解を再確認します。作業変更、新しい設備、事故やヒヤリハットがあった場合も教育内容を見直します。",
          "当社の入社前教育では、安全に関する基本語彙、質問、報告の練習を行えます。企業固有の安全教育は、設備と作業を理解する受入企業様が主体となり、必要に応じて伝達方法を一緒に整理します。",
        ],
      },
    ],
    ctaLabel: "安全教育の準備を相談する",
    ctaMessage: "外国人材向け安全衛生教育の準備について相談したいです。職種：／主な危険作業：／入社予定時期：",
  },
  {
    slug: "international-recruitment-schedule",
    title: "海外人材採用のスケジュールを逆算する方法",
    subtitle: "希望入社日から、要件定義、選考、手続、教育、受入れ準備を整理する",
    excerpt: "海外人材採用では候補者選考以外にも確認事項があります。希望入社日から逆算し、企業側と候補者側の準備を同じ進行表で管理します。",
    contentType: "practical-guide",
    category: "partnership-guide",
    tagValues: ["recruitment-schedule", "onboarding"],
    coverKeywords: ["programhero", "herohomepage", "ssw"],
    partnerRelevance: "各工程の担当と確認待ちを可視化し、候補者決定後に社内準備や書類準備が止まるリスクを減らせます。",
    takeaways: [
      "入社希望日だけでなく、変更可能な期限と必須期限を分ける",
      "企業、候補者、支援・専門機関の担当を一つの表にする",
      "遅延時に優先する業務と再設定する日程を事前に決める",
    ],
    facts: [
      { label: "開始点", value: "求人要件と希望入社時期" },
      { label: "管理対象", value: "選考・書類・手続・教育・住居・入社" },
      { label: "更新頻度", value: "進捗変更時に関係者へ共有" },
    ],
    evidence: [
      {
        title: "特定技能に関する公式案内",
        description: "在留資格や対象分野に関する最新の制度情報は公式サイトで確認してください。",
        sourceLabel: "特定技能総合支援サイト",
        sourceUrl: officialSources.sswPortal,
      },
    ],
    sections: [
      {
        heading: "最初に希望日と前提条件を分けます",
        paragraphs: [
          "『できるだけ早く』という希望だけでは、候補者や関係者が同じ優先順位で動けません。希望入社日、その日を希望する理由、変更できる範囲、社内の繁忙期を確認します。",
          "候補者の現在地も重要です。日本語・技能試験の状況、必要書類、現在の仕事、渡航準備によって工程が異なります。候補者決定前に、想定できるパターンを複数用意します。",
        ],
      },
      {
        heading: "選考と受入れ準備を並行させます",
        paragraphs: [
          "面接が終わってから住居や指導担当者を検討すると、入社準備が集中します。選考中から、配属部署、住居方針、必要備品、初日の案内、社内手続の担当を仮決めしておきます。",
          "一方で、採用決定前に確定できない支出や契約もあります。仮準備、採用決定後、手続完了後の三段階に分けると、早すぎる手配と遅すぎる手配の両方を避けやすくなります。",
        ],
      },
      {
        heading: "進捗表は責任追及ではなく早期共有のために使います",
        paragraphs: [
          "海外採用では一つの確認待ちが後工程に影響します。各項目に担当、期限、現在の状態、次の行動を記載し、遅れが発生した時点で関係者へ共有します。",
          "当社は候補者募集、選考調整、入社前教育に関する進捗を整理します。制度手続や支援については関係する専門家・機関と確認し、企業様が判断すべき事項を分けてご案内します。",
        ],
      },
    ],
    ctaLabel: "採用日程を相談する",
    ctaMessage: "海外人材採用のスケジュールを相談したいです。職種：／人数：／希望入社時期：",
  },
  {
    slug: "job-description-for-indonesian-candidates",
    title: "インドネシア人候補者に伝わる求人票の作り方",
    subtitle: "応募を集める文章ではなく、仕事を正しく判断できる情報を届ける",
    excerpt: "伝わる求人票には、業務、勤務条件、必要能力、教育、生活環境、選考方法を具体的に記載し、候補者が応募前に適性を判断できる情報をそろえます。",
    contentType: "practical-guide",
    category: "candidate-readiness",
    tagValues: ["job-description", "requirement-definition"],
    coverKeywords: ["idjobhero", "Magang", "gijinkoku"],
    partnerRelevance: "応募数よりも仕事内容への理解を重視し、面接前の認識差や辞退理由を把握しやすくなります。",
    takeaways: [
      "職種名ではなく一日の主な作業を記載する",
      "給与は控除や住居費を含む説明方法を整理する",
      "向いている人だけでなく難しさも明記する",
    ],
    facts: [
      { label: "必須情報", value: "業務・勤務・賃金・勤務地・住居・選考" },
      { label: "推奨情報", value: "職場写真・一日の流れ・教育方法" },
      { label: "確認", value: "候補者説明時に理解を再確認" },
    ],
    evidence: [
      {
        title: "外国人労働者の募集・雇用管理",
        description: "募集・採用時の適切な対応について公的情報を確認できます。",
        sourceLabel: "厚生労働省の公式情報",
        sourceUrl: officialSources.employmentManagement,
      },
    ],
    sections: [
      {
        heading: "候補者が働く姿を想像できる情報を載せます",
        paragraphs: [
          "『工場スタッフ』『介護職』だけでは、具体的な仕事を判断できません。原材料の投入、機械操作、検品、記録、清掃など、一日の中で行う作業を記載します。作業場所の温度、立ち仕事、重量物、夜勤なども重要です。",
          "写真を使用する場合は、実際の職場や作業に近いものを選びます。イメージ写真だけを使う場合は、その旨を明記し、面接前に実際の条件を説明します。",
        ],
      },
      {
        heading: "条件は候補者が比較できる形で説明します",
        paragraphs: [
          "賃金は総額だけでなく、想定される控除、住居費、手当、残業の扱いを関係法令と契約内容に沿って説明します。確定していない金額を断定せず、何が固定で何が変動するかを分けます。",
          "勤務地については都道府県名だけでなく、気候、通勤方法、周辺環境、住居の想定を伝えます。候補者が家族と相談できる情報を早めに提供することで、選考後の辞退理由も把握しやすくなります。",
        ],
      },
      {
        heading: "難しさを隠さないことが信頼につながります",
        paragraphs: [
          "求人票は魅力を伝えるだけの広告ではありません。繁忙期、覚える内容、体力面、衛生・安全ルール、職場で求められる日本語など、入社後に直面する難しさも説明します。",
          "当社は企業様からいただいた求人情報を候補者向けに整理し、説明時の質問も記録します。候補者から多く出る質問は、求人条件や説明資料を改善する材料として企業様へ共有します。",
        ],
      },
    ],
    ctaLabel: "求人票作成を相談する",
    ctaMessage: "インドネシア人候補者向け求人票について相談したいです。職種：／勤務地：／採用予定人数：",
  },
  {
    slug: "first-thirty-days-onboarding",
    title: "入社後30日間のオンボーディング設計",
    subtitle: "最初の一か月で仕事、生活、相談のルールを段階的に共有する",
    excerpt: "入社初日にすべてを説明するのではなく、初日、初週、2週間、1か月に分けて業務習得と生活状況を確認します。",
    contentType: "practical-guide",
    category: "partnership-guide",
    tagValues: ["onboarding", "retention"],
    coverKeywords: ["Magang", "hero-karir", "aboutheroid"],
    partnerRelevance: "現場指導者が何をいつ伝えるかを共有し、新入社員本人も相談・確認のタイミングを理解できます。",
    takeaways: [
      "初日は安全、連絡、相談先に重点を置く",
      "業務習得は小さな単位で確認し記録する",
      "生活面と仕事面の確認を必要に応じて分ける",
    ],
    facts: [
      { label: "初日", value: "安全、緊急連絡、職場案内" },
      { label: "初週", value: "基本作業、報告、生活確認" },
      { label: "30日", value: "習得状況、課題、次月目標" },
    ],
    evidence: [
      {
        title: "外国人雇用管理に関する公的情報",
        description: "適切な雇用管理、教育、生活上の配慮を検討する際の参考情報です。",
        sourceLabel: "厚生労働省の公式情報",
        sourceUrl: officialSources.employmentManagement,
      },
    ],
    sections: [
      {
        heading: "初日は覚える量を限定します",
        paragraphs: [
          "入社初日は契約、社内ルール、安全、設備、同僚紹介など情報が集中します。すべてを一度で覚えることを期待せず、緊急時の連絡、危険区域、出退勤、相談先など、最初に必要な項目を優先します。",
          "本人が後から確認できるよう、連絡先、勤務予定、住居ルール、よく使う言葉を一枚にまとめます。翻訳資料を使う場合も、説明者が内容を理解し、質問を受けられる状態にします。",
        ],
      },
      {
        heading: "初週は基本行動を繰り返し確認します",
        paragraphs: [
          "作業手順だけでなく、始業前確認、道具の管理、報告、清掃、終了時の引き継ぎを一連の流れとして教えます。指導者は一度説明して終えるのではなく、本人に実施してもらい、できた項目と再確認が必要な項目を記録します。",
          "生活面では、通勤、買い物、行政手続、体調、睡眠などを確認します。仕事の評価者には話しにくい内容がある場合は、別の相談担当を設定します。",
        ],
      },
      {
        heading: "30日目に次の目標を合意します",
        paragraphs: [
          "一か月後は、本人ができるようになったこと、困っていること、次に覚える業務を確認します。抽象的に『もっと頑張る』とせず、報告のタイミング、作業時間、安全確認など観察できる目標にします。",
          "当社は入社前の面接・教育情報を受入れ側へ共有できるよう整理します。入社後の支援範囲は企業様、支援機関、関係者との契約と役割分担に基づいて確認します。",
        ],
      },
    ],
    ctaLabel: "受入れ計画を相談する",
    ctaMessage: "外国人材の入社後30日間の受入れ計画について相談したいです。職種：／入社予定人数：／予定時期：",
  },
  {
    slug: "candidate-quality-assurance-process",
    title: "候補者提案の品質をそろえるための確認プロセス",
    subtitle: "募集人数ではなく、求人条件との一致を記録して企業へ共有する",
    excerpt: "候補者提案では、経歴、日本語、技能、仕事理解、入社意思、必要な教育を同じ観点で確認し、未確認事項も含めて共有します。",
    contentType: "insight",
    category: "quality-assurance",
    tagValues: ["quality-assurance", "interview"],
    coverKeywords: ["kaigo", "ssw", "ChatGPT Image"],
    isFeatured: true,
    partnerRelevance: "候補者ごとの情報量や評価者の印象に左右されず、企業側が比較・判断できる提案資料を準備できます。",
    takeaways: [
      "求人要件と候補者情報を同じ評価項目で照合する",
      "確認済み、本人申告、未確認を区別する",
      "採用可否だけでなく教育・配属上の注意点を共有する",
    ],
    facts: [
      { label: "確認領域", value: "経歴・日本語・技能・理解・意思・準備" },
      { label: "情報区分", value: "確認済み・本人申告・未確認" },
      { label: "企業共有", value: "評価結果と追加確認事項" },
    ],
    evidence: [
      {
        title: "外国人雇用管理に関する基本情報",
        description: "公正な募集・採用と適切な雇用管理を検討する際の参考情報です。",
        sourceLabel: "厚生労働省の公式情報",
        sourceUrl: officialSources.employmentManagement,
      },
    ],
    sections: [
      {
        heading: "候補者情報を求人要件に結び付けます",
        paragraphs: [
          "履歴書の情報が多くても、求人との関係が分からなければ選考しにくくなります。候補者の経験を、担当予定業務、必要な日本語、安全・品質行動、勤務条件への適合という観点で整理します。",
          "経験年数だけでなく、実際に担当した作業、使用した道具、チーム内の役割を確認します。本人の説明だけで判断せず、可能な範囲で証明書、試験結果、教育記録などと区別して記載します。",
        ],
      },
      {
        heading: "分からない情報を空欄のままにしません",
        paragraphs: [
          "候補者提案時に未確認事項があること自体は問題ではありません。重要なのは、確認済み情報と本人申告、未確認を区別し、次の面接や書類確認で何を確認するかを明確にすることです。",
          "評価者によって基準が変わらないよう、共通の質問と記録形式を使用します。ただし、点数だけで候補者を単純に順位付けせず、求人の必須条件と教育可能な条件を踏まえて判断します。",
        ],
      },
      {
        heading: "提案後のフィードバックを募集と教育へ戻します",
        paragraphs: [
          "企業様から『この経験をより詳しく確認したい』『この日本語場面が重要』というフィードバックをいただいた場合、追加面接だけで終わらせず、その後の候補者募集と教育項目にも反映します。",
          "当社は候補者提案を一回の書類提出ではなく、求人理解を深めるプロセスとして扱います。企業様の判断理由を共有いただくことで、次の候補者提案の精度改善につなげます。",
        ],
      },
    ],
    ctaLabel: "候補者提案方法を相談する",
    ctaMessage: "候補者の選定・提案プロセスについて相談したいです。職種：／重視する経験：／採用予定人数：",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function contentBlocks(sections: ArticleSection[]) {
  return sections.flatMap((section, sectionIndex) => [
    {
      type: "heading",
      sort_order: sectionIndex * 10,
      data: { level: "h2", text: section.heading },
    },
    ...section.paragraphs.map((text, paragraphIndex) => ({
      type: "paragraph",
      sort_order: sectionIndex * 10 + paragraphIndex + 1,
      data: { text },
    })),
  ]);
}

function withSortOrder<T extends Record<string, unknown>>(items: T[]) {
  return items.map((item, index) => ({
    ...item,
    is_enabled: true,
    sort_order: index,
  }));
}

function pickCover(
  media: Array<{ id: string; fileName: string; width: number | null; height: number | null }>,
  keywords: string[],
  index: number,
) {
  const largeMedia = media.filter(
    (item) => (item.width ?? 0) >= 1000 && (item.height ?? 0) >= 500,
  );
  const matched = keywords
    .map((keyword) =>
      largeMedia.find((item) => item.fileName.toLowerCase().includes(keyword.toLowerCase())),
    )
    .find(Boolean);

  return matched?.id || largeMedia[index % largeMedia.length]?.id || media[index % media.length]?.id;
}

async function upsertOptionSet(
  tx: Prisma.TransactionClient,
  input: {
    tenantId: string;
    variantId: string;
    key: string;
    label: string;
    values: Array<{ value: string; label: string }>;
  },
) {
  const optionSet = await tx.optionSet.upsert({
    where: { variantId_key: { variantId: input.variantId, key: input.key } },
    update: { label: input.label },
    create: {
      tenantId: input.tenantId,
      variantId: input.variantId,
      key: input.key,
      label: input.label,
    },
    select: { id: true },
  });

  await tx.optionValue.updateMany({
    where: { optionSetId: optionSet.id },
    data: { isActive: false },
  });

  const ids = new Map<string, string>();
  for (const [index, value] of input.values.entries()) {
    const option = await tx.optionValue.upsert({
      where: { optionSetId_value: { optionSetId: optionSet.id, value: value.value } },
      update: { label: value.label, sortOrder: index, isActive: true },
      create: {
        optionSetId: optionSet.id,
        value: value.value,
        label: value.label,
        sortOrder: index,
        isActive: true,
      },
      select: { id: true },
    });
    ids.set(value.value, option.id);
  }

  return ids;
}

async function main() {
  const targetHost = process.env.NEWS_HOST || "hit-japan.lpk.local:3000";
  const targetTenantSlug = process.env.NEWS_TENANT_SLUG || "hit";
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

  const media = await prisma.mediaAsset.findMany({
    where: { tenantId: variant.tenantId, status: "ACTIVE", mediaType: "IMAGE" },
    orderBy: { createdAt: "asc" },
    select: { id: true, fileName: true, width: true, height: true },
  });

  if (media.length === 0) {
    throw new Error("No active image media is available for Japan news articles.");
  }

  await prisma.$transaction(
    async (tx) => {
      const contentTypeIds = await upsertOptionSet(tx, {
        tenantId: variant.tenantId,
        variantId: variant.id,
        key: "japan_news_content_type",
        label: "記事タイプ",
        values: contentTypes,
      });
      const categoryIds = await upsertOptionSet(tx, {
        tenantId: variant.tenantId,
        variantId: variant.id,
        key: "japan_news_category",
        label: "記事カテゴリー",
        values: categories,
      });
      const tagIds = await upsertOptionSet(tx, {
        tenantId: variant.tenantId,
        variantId: variant.id,
        key: "japan_news_tag",
        label: "記事タグ",
        values: tags,
      });

      await tx.contentItem.updateMany({
        where: {
          variantId: variant.id,
          collectionKey: "news",
          slug: { in: ["berita-contoh-1", "berita-contoh-2", "berita-contoh-3"] },
        },
        data: { status: PublishStatus.DRAFT, publishedDataJson: Prisma.DbNull },
      });

      for (const [index, article] of articles.entries()) {
        const contentTypeId = contentTypeIds.get(article.contentType);
        const categoryId = categoryIds.get(article.category);
        const coverImageId = pickCover(media, article.coverKeywords, index);
        const articleTagIds = article.tagValues
          .map((value) => tagIds.get(value))
          .filter((value): value is string => Boolean(value));

        if (!contentTypeId || !categoryId || !coverImageId) {
          throw new Error(`Editorial options or cover are missing for ${article.slug}.`);
        }

        const publishedAt = new Date(Date.UTC(2026, 5, 11 - index, 1, 0, 0));
        const data = {
          title: article.title,
          slug: article.slug,
          subtitle: article.subtitle,
          excerpt: article.excerpt,
          cover_image_id: coverImageId,
          status: "PUBLISHED",
          is_featured: Boolean(article.isFeatured),
          published_at: publishedAt.toISOString().slice(0, 10),
          reading_time_label: "",
          sort_order: index,
          content_type_option_id: contentTypeId,
          category_option_id: categoryId,
          tag_option_ids: articleTagIds,
          author_name: AUTHOR_NAME,
          author_title: AUTHOR_TITLE,
          author_image_id: "",
          partner_relevance: article.partnerRelevance,
          key_takeaways: article.takeaways,
          key_facts: withSortOrder(article.facts),
          evidence_items: withSortOrder(
            article.evidence.map((evidence) => ({
              title: evidence.title,
              description: evidence.description,
              source_label: evidence.sourceLabel,
              source_url: evidence.sourceUrl,
            })),
          ),
          reviewer_name: REVIEWER_NAME,
          reviewer_title: REVIEWER_TITLE,
          reviewed_at: REVIEWED_AT,
          article_cta_label: article.ctaLabel,
          article_line_message_template: article.ctaMessage,
          content_blocks: contentBlocks(article.sections),
          related_source: "same_category",
          manual_news_ids: [],
          related_articles: [],
          related_max_items: 3,
        };
        const json = data as Prisma.InputJsonValue;

        await tx.contentItem.upsert({
          where: {
            variantId_collectionKey_slug: {
              variantId: variant.id,
              collectionKey: "news",
              slug: article.slug,
            },
          },
          update: {
            title: article.title,
            excerpt: article.excerpt,
            thumbnailImageId: coverImageId,
            isFeatured: Boolean(article.isFeatured),
            sortOrder: index,
            status: PublishStatus.PUBLISHED,
            dataJson: json,
            publishedDataJson: json,
            publishedAt,
          },
          create: {
            tenantId: variant.tenantId,
            variantId: variant.id,
            collectionKey: "news",
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            thumbnailImageId: coverImageId,
            isFeatured: Boolean(article.isFeatured),
            sortOrder: index,
            status: PublishStatus.PUBLISHED,
            dataJson: json,
            publishedDataJson: json,
            publishedAt,
          },
        });
      }

      const existingPage = await tx.contentPage.findUnique({
        where: { variantId_pageKey: { variantId: variant.id, pageKey: "news_page" } },
        select: { dataJson: true },
      });
      const existingData = isRecord(existingPage?.dataJson) ? existingPage.dataJson : {};
      const existingHero = isRecord(existingData.hero) ? existingData.hero : {};
      const existingDisplay = isRecord(existingData.display_text) ? existingData.display_text : {};
      const existingFinalCta = isRecord(existingData.final_cta) ? existingData.final_cta : {};
      const pageData = {
        ...existingData,
        hero: {
          ...existingHero,
          media_type: "image",
          media_id: pickCover(media, ["ssw", "tokutei", "hero-tentang"], 0) || "",
          eyebrow_label: "PARTNER INSIGHTS",
          headline: "インドネシア人材採用の実務情報",
          subheadline: "求人設計、候補者選考、入社前教育、受入れ準備を、企業様の判断に役立つ形でお届けします。",
          primary_cta_label: "採用について相談する",
          primary_line_message_template: "インドネシア人材の採用について相談したいです。職種：／人数：／勤務地：／希望時期：",
          secondary_cta_label: "対応分野を見る",
          secondary_href: "/sectors",
        },
        display_text: {
          ...existingDisplay,
          card_cta_label: "記事を読む",
          featured_badge_label: "おすすめ",
          new_badge_label: "新着",
          breadcrumb_home_label: "ホーム",
          breadcrumb_news_label: "お知らせ・コラム",
          related_news_title: "関連記事",
        },
        filter_config: {
          enable_content_type_filter: true,
          enable_category_filter: true,
          enable_tag_filter: true,
        },
        final_cta: {
          ...existingFinalCta,
          headline: "採用条件の整理からご相談いただけます",
          description: "職種、人数、勤務地、希望時期をお知らせください。候補者選定と入社前準備の進め方をご案内します。",
          primary_cta_label: "LINEで相談する",
          primary_line_message_template: "インドネシア人材の採用について相談したいです。職種：／人数：／勤務地：／希望時期：",
          secondary_cta_label: "お問い合わせ",
          secondary_href: "/contact",
        },
      };
      const pageJson = pageData as Prisma.InputJsonValue;

      await tx.contentPage.upsert({
        where: { variantId_pageKey: { variantId: variant.id, pageKey: "news_page" } },
        update: {
          title: "お知らせ・コラム",
          slug: "news",
          status: PublishStatus.PUBLISHED,
          dataJson: pageJson,
          publishedDataJson: pageJson,
        },
        create: {
          tenantId: variant.tenantId,
          variantId: variant.id,
          pageKey: "news_page",
          title: "お知らせ・コラム",
          slug: "news",
          status: PublishStatus.PUBLISHED,
          dataJson: pageJson,
          publishedDataJson: pageJson,
        },
      });
    },
    { timeout: 45_000 },
  );

  console.log(`Upserted ${articles.length} Japanese partner articles and updated the news page.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Japan news seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
