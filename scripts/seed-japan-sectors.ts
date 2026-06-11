import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import {
  MediaStatus,
  MediaType,
  Prisma,
  PrismaClient,
  PublishStatus,
} from "../src/generated/prisma/client";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed Japan sector data.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type Position = {
  title: string;
  duties: string;
  focus: string;
  safety: string;
};

type SectorSeed = {
  groupValue: string;
  groupLabel: string;
  title: string;
  slug: string;
  subtitle: string;
  officialScope: string;
  pathway: string;
  language: string;
  skillTest: string;
  referenceUrl: string;
  positions: Position[];
  preparationFocus: string[];
  serviceStatus?: string;
  officialNotice?: string;
};

const STANDARD_LANGUAGE = "JFT-Basic または JLPT N4以上";
const VERIFIED_DATE = "2026年6月11日";

const sectors: SectorSeed[] = [
  {
    groupValue: "welfare-cleaning",
    groupLabel: "福祉・衛生",
    title: "介護",
    slug: "kaigo",
    subtitle: "利用者の尊厳と安全を重視した介護人材の採用支援",
    officialScope: "利用者の心身の状況に応じた入浴、食事、排せつ等の身体介護と、レクリエーションや機能訓練補助などの関連業務が対象です。",
    pathway: "特定技能1号対象分野",
    language: `${STANDARD_LANGUAGE}に加え、介護日本語評価試験`,
    skillTest: "介護技能評価試験",
    referenceUrl: "https://www.ssw.go.jp/about/visa/nursing_care_1/",
    positions: [
      { title: "介護職", duties: "身体介護および日常生活上の支援", focus: "利用者対応、基本的な介助動作、記録・報告、日本語コミュニケーション", safety: "転倒防止、感染対策、プライバシー、身体負担の軽減" },
    ],
    preparationFocus: ["介護場面の日本語", "基本介助と安全確認", "報告・連絡・相談", "介護技能評価試験対策"],
  },
  {
    groupValue: "welfare-cleaning",
    groupLabel: "福祉・衛生",
    title: "ビルクリーニング",
    slug: "building-cleaning",
    subtitle: "建築物内部の清掃品質と安全行動を重視した人材提案",
    officialScope: "事務所、商業施設、宿泊施設など、建築物内部の清掃業務が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "ビルクリーニング分野特定技能1号評価試験",
    referenceUrl: "https://www.ssw.go.jp/about/visa/building_cleaning_management_1/",
    positions: [
      { title: "建築物清掃スタッフ", duties: "床面、共用部、衛生設備など建築物内部の清掃", focus: "作業手順、清掃用具、汚れの判別、品質確認、接遇", safety: "薬剤管理、転倒防止、区画表示、感染対策" },
    ],
    preparationFocus: ["清掃手順と品質確認", "用具・薬剤の基礎", "安全表示と作業導線", "現場日本語"],
  },
  {
    groupValue: "construction-manufacturing",
    groupLabel: "建設・製造",
    title: "建設",
    slug: "construction",
    subtitle: "土木・建築・ライフライン分野の求人条件に合わせた採用支援",
    officialScope: "土木、建築、ライフライン・設備に関する新設、改修、維持、修繕等の作業が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "建設分野特定技能1号評価試験 または 技能検定3級",
    referenceUrl: "https://www.ssw.go.jp/about/visa/construction_1/",
    positions: [
      { title: "土木", duties: "土木施設の新設、改築、維持、修繕に関する作業", focus: "指示理解、測定、資材取扱い、作業手順", safety: "保護具、重機周辺、高所・掘削、危険予知" },
      { title: "建築", duties: "建築物の新築、増改築、移転、修繕、模様替えに関する作業", focus: "図面・指示確認、工具、施工補助、品質確認", safety: "高所、開口部、工具、整理整頓" },
      { title: "ライフライン・設備", duties: "電気、通信、ガス、水道等の設備整備・設置・変更・修理", focus: "設備名称、作業指示、工具、確認記録", safety: "電気、火気、閉所、誤操作防止" },
    ],
    preparationFocus: ["安全衛生と危険予知", "工具・資材の基礎", "図面・作業指示の理解", "建設分野試験対策"],
  },
  {
    groupValue: "construction-manufacturing",
    groupLabel: "建設・製造",
    title: "工業製品製造業",
    slug: "industrial-product-manufacturing",
    subtitle: "機械・金属加工、組立、表面処理など製造現場の採用ニーズに対応",
    officialScope: "機械・金属加工、電気電子機器組立、金属表面処理のほか、紙器・段ボール箱、コンクリート製品、RPF、陶磁器、印刷・製本、紡織、縫製等の製造工程が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "製造分野特定技能1号評価試験",
    referenceUrl: "https://www.ssw.go.jp/about/visa/industrial_product_manufacturing_1/",
    positions: [
      { title: "機械・金属加工", duties: "素材製品や産業機械等の製造工程", focus: "測定、加工補助、CNC、溶接、品質確認、標準作業", safety: "機械可動部、切削物、火気、保護具" },
      { title: "電気電子機器組立", duties: "電気電子機器等の製造・組立工程", focus: "組立手順、部品識別、工具、外観・機能確認", safety: "静電気、通電、工具、異物混入" },
      { title: "金属表面処理・その他製造", duties: "表面処理および制度対象となる各種製品の製造工程", focus: "工程管理、材料識別、品質基準、記録", safety: "薬品、温度、設備、作業区域管理" },
    ],
    preparationFocus: ["5Sと標準作業", "CNC・溶接を含む加工基礎", "組立・測定・品質確認", "製造現場の日本語"],
  },
  {
    groupValue: "construction-manufacturing",
    groupLabel: "建設・製造",
    title: "造船・舶用工業",
    slug: "shipbuilding-marine-industry",
    subtitle: "造船、舶用機械、舶用電気電子機器の採用相談に対応",
    officialScope: "造船、舶用機械、舶用電気電子機器の製造工程が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "造船・舶用工業分野特定技能1号試験 または 技能検定3級",
    referenceUrl: "https://www.ssw.go.jp/about/visa/shipbuilding_and_ship_machinery_1/",
    positions: [
      { title: "造船", duties: "船体等の製造工程", focus: "溶接、組立、仕上げ、測定、作業指示", safety: "火気、高所、重量物、閉所" },
      { title: "舶用機械・電気電子機器", duties: "舶用機械および電気電子機器の製造工程", focus: "部品組立、配線、工具、品質確認", safety: "回転体、通電、吊り荷、工具管理" },
    ],
    preparationFocus: ["溶接・組立の基礎確認", "図面・作業指示", "造船現場の安全", "分野別試験対策"],
  },
  {
    groupValue: "construction-manufacturing",
    groupLabel: "建設・製造",
    title: "自動車整備",
    slug: "automobile-repair-maintenance",
    subtitle: "点検・整備業務に必要な基礎技能と日本語を確認した人材提案",
    officialScope: "自動車の日常点検整備、定期点検整備、特定整備および関連する基礎業務が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "自動車整備分野特定技能1号評価試験 または 自動車整備士技能検定3級",
    referenceUrl: "https://www.ssw.go.jp/about/visa/automobile_repair_and_maintenance_1/",
    positions: [
      { title: "自動車整備スタッフ", duties: "日常点検、定期点検、特定整備および関連業務", focus: "点検手順、工具、部品名称、測定、整備記録", safety: "車両支持、回転部、高温部、油脂・電気" },
    ],
    preparationFocus: ["日常・定期点検", "工具と締付管理", "故障診断の基礎", "整備現場の日本語"],
  },
  {
    groupValue: "transport-infrastructure",
    groupLabel: "交通・インフラ",
    title: "航空",
    slug: "aviation",
    subtitle: "空港グランドハンドリング・航空機整備分野の採用相談",
    officialScope: "空港グランドハンドリングと航空機、装備品等の整備業務が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "航空分野特定技能1号評価試験",
    referenceUrl: "https://www.ssw.go.jp/about/visa/aviation_1/",
    positions: [
      { title: "空港グランドハンドリング", duties: "地上走行支援、手荷物・貨物取扱い等", focus: "指示確認、荷役、チーム連携、時間管理", safety: "車両動線、航空機周辺、重量物、異物管理" },
      { title: "航空機整備", duties: "機体、装備品等の整備", focus: "工具、部品、整備指示、記録、品質確認", safety: "高所、通電、可動部、工具・部品管理" },
    ],
    preparationFocus: ["空港・整備現場の用語", "安全と時間管理", "指示確認とチーム作業", "分野別試験対策"],
  },
  {
    groupValue: "hospitality-food-service",
    groupLabel: "宿泊・外食",
    title: "宿泊",
    slug: "accommodation",
    subtitle: "フロント、接客、レストランサービス等の採用ニーズに対応",
    officialScope: "宿泊施設におけるフロント、企画・広報、接客、レストランサービス等の業務が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "宿泊分野特定技能1号評価試験",
    referenceUrl: "https://www.ssw.go.jp/about/visa/accommodation_1/",
    positions: [
      { title: "宿泊サービススタッフ", duties: "フロント、接客、企画・広報、レストランサービス等", focus: "敬語、接客応対、予約・案内、状況報告", safety: "個人情報、衛生、緊急時対応、クレーム初期対応" },
    ],
    preparationFocus: ["接客日本語と敬語", "フロント・案内ロールプレイ", "衛生と身だしなみ", "宿泊分野試験対策"],
  },
  {
    groupValue: "transport-infrastructure",
    groupLabel: "交通・インフラ",
    title: "自動車運送業",
    slug: "automobile-transportation",
    subtitle: "トラック・タクシー・バス運転者の要件に沿った採用支援",
    officialScope: "事業用自動車による貨物・旅客運送と、運転に付随する業務が対象です。",
    pathway: "特定技能1号対象分野",
    language: "トラックはJFT-BasicまたはJLPT N4以上、タクシー・バスはJLPT N3以上",
    skillTest: "車種別評価試験および日本の運転免許。タクシー・バスは新任運転者研修も必要",
    referenceUrl: "https://www.ssw.go.jp/about/visa/automobile_transportation_business_1/",
    positions: [
      { title: "トラック運転者", duties: "事業用トラックの運転および付随業務", focus: "安全運転、荷扱い、点呼、運行指示、日本語N4以上", safety: "交通法規、疲労、積載、車両点検" },
      { title: "タクシー・バス運転者", duties: "事業用タクシーまたはバスの運転および旅客対応", focus: "安全運転、接客、案内、緊急対応、日本語N3以上", safety: "旅客安全、交通法規、健康管理、事故対応" },
    ],
    preparationFocus: ["運転業務の日本語", "安全・接客・点呼", "免許取得要件の確認", "車種別評価試験対策"],
  },
  {
    groupValue: "transport-infrastructure",
    groupLabel: "交通・インフラ",
    title: "鉄道",
    slug: "railway",
    subtitle: "軌道・電気設備・車両・運輸係員の分野別採用相談",
    officialScope: "軌道整備、電気設備整備、車両整備、車両製造、駅係員・車掌・運転士等の運輸係員業務が対象です。",
    pathway: "特定技能1号対象分野",
    language: "整備・製造はJFT-BasicまたはJLPT N4以上、運輸係員はJLPT N3以上",
    skillTest: "業務区分別の鉄道分野特定技能1号評価試験等",
    referenceUrl: "https://www.ssw.go.jp/about/visa/railway_1/",
    positions: [
      { title: "軌道・電気設備・車両整備", duties: "軌道、電気設備、鉄道車両の整備・検査", focus: "作業指示、点検、工具、記録、日本語N4以上", safety: "列車接近、通電、高所、重量物" },
      { title: "車両製造", duties: "鉄道車両および部品の製造", focus: "加工、組立、塗装、品質確認、日本語N4以上", safety: "機械、火気、塗料、吊り荷" },
      { title: "運輸係員", duties: "駅係員、車掌、運転士等", focus: "案内、確認喚呼、異常時対応、日本語N3以上", safety: "旅客安全、運行規程、緊急対応" },
    ],
    preparationFocus: ["業務区分別の適性確認", "安全規程と確認行動", "鉄道用語・指示理解", "N3/N4要件と試験対策"],
  },
  {
    groupValue: "agriculture-food",
    groupLabel: "農林水産・食品",
    title: "農業",
    slug: "agriculture",
    subtitle: "耕種・畜産の作業内容と就業環境に合わせた人材提案",
    officialScope: "耕種農業の栽培管理、集出荷・選別と、畜産農業の飼養管理、集出荷・選別等が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "農業技能測定試験1号",
    referenceUrl: "https://www.ssw.go.jp/about/visa/agriculture_1/",
    positions: [
      { title: "耕種農業", duties: "栽培管理、農産物の集出荷・選別等", focus: "栽培手順、選別、道具、作業記録", safety: "農機具、薬剤、暑熱、重量物" },
      { title: "畜産農業", duties: "飼養管理、畜産物の集出荷・選別等", focus: "給餌、衛生、動物観察、記録", safety: "動物接触、衛生、機械、薬剤" },
    ],
    preparationFocus: ["栽培・飼養の基礎", "選別・出荷・衛生", "屋外作業の安全", "農業技能測定試験対策"],
  },
  {
    groupValue: "agriculture-food",
    groupLabel: "農林水産・食品",
    title: "漁業",
    slug: "fishery-aquaculture",
    subtitle: "漁業・養殖業の作業環境と安全要件に合わせた採用支援",
    officialScope: "漁具の製作・補修、漁獲、漁獲物の処理・保蔵、安全衛生の確保、および養殖資材の管理、育成、収獲・処理等が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "漁業技能測定試験1号",
    referenceUrl: "https://www.ssw.go.jp/about/visa/fishery_and_aquaculture_1/",
    positions: [
      { title: "漁業", duties: "漁具、漁労、漁獲物処理・保蔵、安全衛生等", focus: "漁具、機械、選別、保蔵、チーム作業", safety: "海上、機械、寒冷、転倒・巻き込まれ" },
      { title: "養殖業", duties: "養殖資材管理、育成管理、収獲・処理等", focus: "給餌、観察、網・資材、記録、衛生", safety: "水辺、滑り、機械、衛生管理" },
    ],
    preparationFocus: ["漁業・養殖の作業用語", "水辺・海上の安全", "衛生・保蔵・選別", "漁業技能測定試験対策"],
  },
  {
    groupValue: "agriculture-food",
    groupLabel: "農林水産・食品",
    title: "飲食料品製造業",
    slug: "food-beverage-manufacturing",
    subtitle: "食品製造・加工・安全衛生を重視した採用ニーズに対応",
    officialScope: "酒類を除く飲食料品の製造・加工と、安全衛生を確保する業務が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "飲食料品製造業特定技能1号技能測定試験",
    referenceUrl: "https://www.ssw.go.jp/about/visa/food_and_beverage_manufacturing_1/",
    positions: [
      { title: "食品製造スタッフ", duties: "飲食料品の製造、加工、包装、品質・衛生確認", focus: "衛生、工程、計量、検品、記録、ライン作業", safety: "異物・アレルゲン、刃物、温度、機械" },
    ],
    preparationFocus: ["食品衛生と交差汚染防止", "製造・包装・検品", "ライン作業と報告", "技能測定試験対策"],
  },
  {
    groupValue: "hospitality-food-service",
    groupLabel: "宿泊・外食",
    title: "外食業",
    slug: "food-service",
    subtitle: "調理・接客・店舗管理に関する人材育成相談",
    officialScope: "飲食物調理、接客、店舗管理を含む外食業全般の業務が対象です。",
    pathway: "特定技能1号・2号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "外食業特定技能1号技能測定試験",
    referenceUrl: "https://www.ssw.go.jp/about/visa/food_service_1/",
    positions: [
      { title: "外食業スタッフ", duties: "飲食物調理、接客、店舗管理", focus: "衛生、調理補助、接客日本語、注文・会計、店舗運営", safety: "食品衛生、刃物、火気、アレルゲン" },
    ],
    preparationFocus: ["調理・食品衛生", "接客日本語", "注文・配膳・会計", "技能測定試験対策"],
    serviceStatus: "制度上の受入れ手続停止情報あり",
    officialNotice: "2026年4月13日から、特定技能1号「外食業」分野の在留資格認定証明書の交付が停止されています。最新情報を確認したうえでご相談を承ります。",
  },
  {
    groupValue: "agriculture-food",
    groupLabel: "農林水産・食品",
    title: "林業",
    slug: "forestry",
    subtitle: "造林・素材生産等の作業条件に合わせた採用相談",
    officialScope: "樹木の植栽・育成管理、伐採、丸太への加工など、造林および素材生産等の業務が対象です。",
    pathway: "特定技能1号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "林業技能測定試験",
    referenceUrl: "https://www.ssw.go.jp/about/visa/forestry_1/",
    positions: [
      { title: "林業作業員", duties: "造林、保育、伐採、素材生産等", focus: "道具、作業手順、地形・天候判断、チーム連携", safety: "伐倒、斜面、機械、暑寒・害虫" },
    ],
    preparationFocus: ["造林・素材生産の基礎", "刃物・機械の安全", "屋外作業の適性", "林業技能測定試験対策"],
  },
  {
    groupValue: "agriculture-food",
    groupLabel: "農林水産・食品",
    title: "木材産業",
    slug: "wood-industry",
    subtitle: "製材・合板製造等の工程に合わせた人材提案",
    officialScope: "製材業、合板製造業等における木材加工業務が対象です。",
    pathway: "特定技能1号対象分野",
    language: STANDARD_LANGUAGE,
    skillTest: "木材産業特定技能1号測定試験",
    referenceUrl: "https://www.ssw.go.jp/about/visa/wood_industry_1/",
    positions: [
      { title: "木材加工スタッフ", duties: "製材、合板製造等の木材加工工程", focus: "材料識別、機械操作補助、寸法・品質確認、搬送", safety: "回転刃、粉じん、騒音、重量物" },
    ],
    preparationFocus: ["木材・製品の基礎", "加工設備の安全", "測定・品質確認", "分野別試験対策"],
  },
  {
    groupValue: "circular-living-services",
    groupLabel: "循環・生活サービス",
    title: "資源循環",
    slug: "resource-recycling",
    subtitle: "資源循環施設の業務内容を確認しながら採用計画を個別提案",
    officialScope: "廃棄物を再資源化し、適正に処理する施設での業務が対象とされています。公式の分野別詳細ページは現在準備中です。",
    pathway: "特定技能1号対象分野",
    language: "分野別の公表要件を確認してご案内",
    skillTest: "試験・運用要件は公式発表を確認してご案内",
    referenceUrl: "https://www.ssw.go.jp/about/visa/",
    positions: [
      { title: "資源循環施設スタッフ", duties: "廃棄物の再資源化および適正処理に関する施設業務", focus: "求人票、設備、取扱物、作業区分に基づき個別確認", safety: "機械、車両、粉じん、選別物・薬品等を個別確認" },
    ],
    preparationFocus: ["作業区分と設備の確認", "安全衛生・分別の基礎", "現場日本語", "公表要件への適合確認"],
    serviceStatus: "制度詳細を確認しながら個別相談受付中",
  },
  {
    groupValue: "circular-living-services",
    groupLabel: "循環・生活サービス",
    title: "リネンサプライ",
    slug: "linen-supply",
    subtitle: "ホテル・病院等向けリネンサプライ業務の採用相談",
    officialScope: "ホテル、病院等へ貸し出すシーツ、タオル等のリネン類の回収、洗濯等が対象とされています。公式の分野別詳細ページは現在準備中です。",
    pathway: "特定技能1号対象分野",
    language: "分野別の公表要件を確認してご案内",
    skillTest: "試験・運用要件は公式発表を確認してご案内",
    referenceUrl: "https://www.ssw.go.jp/about/visa/",
    positions: [
      { title: "リネンサプライスタッフ", duties: "リネン類の回収、洗濯、仕上げ、仕分け、出荷等", focus: "求人票、工程、設備、衛生区分に基づき個別確認", safety: "機械、高温、薬剤、衛生区域、重量物" },
    ],
    preparationFocus: ["回収・洗濯・仕分け工程", "衛生区域と品質確認", "設備安全", "公表要件への適合確認"],
    serviceStatus: "制度詳細を確認しながら個別相談受付中",
  },
  {
    groupValue: "transport-infrastructure",
    groupLabel: "交通・インフラ",
    title: "物流倉庫",
    slug: "logistics-warehouse",
    subtitle: "物流倉庫の入出荷・保管業務に合わせた採用相談",
    officialScope: "物流倉庫における貨物の入出荷および保管業務が対象とされています。公式の分野別詳細ページは現在準備中です。",
    pathway: "特定技能1号対象分野",
    language: "分野別の公表要件を確認してご案内",
    skillTest: "試験・運用要件は公式発表を確認してご案内",
    referenceUrl: "https://www.ssw.go.jp/about/visa/",
    positions: [
      { title: "物流倉庫スタッフ", duties: "貨物の入荷、検品、保管、ピッキング、出荷等", focus: "求人票、荷姿、設備、作業区分に基づき個別確認", safety: "フォークリフト動線、荷崩れ、重量物、誤出荷防止" },
    ],
    preparationFocus: ["入出荷・保管の基礎", "検品・数量確認", "倉庫内安全", "公表要件への適合確認"],
    serviceStatus: "制度詳細を確認しながら個別相談受付中",
  },
];

function withSortOrder<T extends Record<string, unknown>>(items: T[]) {
  return items.map((item, index) => ({
    ...item,
    is_enabled: true,
    sort_order: index,
  }));
}

function mediaAt(mediaIds: string[], index: number) {
  return mediaIds[index % mediaIds.length];
}

function buildSectorData(
  sector: SectorSeed,
  categoryId: string,
  mediaIds: string[],
  sectorIndex: number,
) {
  const mediaOffset = sectorIndex * 2;
  const statusLabel = sector.serviceStatus ?? "採用・人材育成のご相談受付中";
  const overview = [
    sector.officialScope,
    sector.officialNotice,
    "HITでは、受入企業様の求人条件を起点に、候補者の選定、日本語力・職務適性の事前確認、面接調整、入社前教育をご提案します。必要人数や募集時期が未確定の段階でもご相談いただけます。",
  ].filter(Boolean).join("\n\n");

  const curriculumModules = [
    {
      title: "日本語基礎教育（N5-N4）",
      description: "文字、語彙、文法、聴解、会話、漢字、日本文化・礼儀を段階的に学習します。教材は『みんなの日本語 初級I・II』および『Kanji Look and Learn』を使用します。",
      theory_hours_label: "N5：3か月",
      practical_hours_label: "N4：4.5か月",
      evaluation_method: "原則週1回、2課ごとに文法・聴解・会話を確認",
    },
    {
      title: "職場コミュニケーション",
      description: "挨拶、指示確認、復唱、報告・連絡・相談、面接応答を求人内容に合わせて練習します。",
      theory_hours_label: "基礎日本語と連動",
      practical_hours_label: "ロールプレイ",
      evaluation_method: "面接練習・指示理解・口頭報告",
    },
    {
      title: "分野別の事前教育・選考設計",
      description: sector.preparationFocus.join("、") + "を中心に、職務内容と受入企業様の基準に合わせて確認項目を設定します。",
      theory_hours_label: "求人票確認後に設定",
      practical_hours_label: "業務内容に応じて設定",
      evaluation_method: "面接、適性確認、必要に応じた技能確認",
    },
  ];

  const qualityAssurance = [
    { title: "求人条件の整理", description: "職務内容、勤務条件、必要な日本語力、経験、資格、配属時期を確認し、選考条件を明確にします。" },
    { title: "候補者の事前確認", description: "プロフィールだけでなく、就業意欲、日本語力、職務適性、条件理解を確認したうえで面接候補をご提案します。" },
    { title: "面接後の調整", description: "面接結果や企業様の評価をもとに、追加確認や入社前教育の内容を調整します。" },
  ];

  const placementSupport = [
    { title: "募集から面接まで", description: "求人条件の確認、候補者選定、プロフィール整理、面接日程の調整を一連で支援します。" },
    { title: "入社前準備", description: "必要に応じて日本語、職場ルール、安全、生活オリエンテーションの準備を行います。" },
    { title: "手続・連携", description: "関係機関や受入れに関わる各担当者と連携し、必要な情報整理と進捗確認を支援します。" },
  ];

  const processItems = [
    { icon_key: "clipboard_list", title: "求人条件の確認", description: "職種、人数、勤務地、勤務時間、必要経験、日本語力、入社希望時期を確認します。" },
    { icon_key: "user_search", title: "候補者の選定", description: "条件に合う人材を確認し、面接候補として整理します。" },
    { icon_key: "users", title: "面接・技能確認", description: "オンラインまたは対面での面接、必要に応じた技能確認を調整します。" },
    { icon_key: "graduation_cap", title: "入社前教育", description: "企業様の評価と職務内容に合わせ、日本語・安全・業務理解を補強します。" },
    { icon_key: "handshake", title: "手続・配属準備", description: "関係者と連携し、必要書類、渡航、入社前の確認を進めます。" },
  ];

  const faqs = [
    { question: "候補者数や採用時期が未確定でも相談できますか。", answer: "はい。想定職種と採用条件を伺い、選考の進め方と準備項目をご案内します。" },
    { question: "会社独自の業務内容や選考基準に合わせられますか。", answer: "はい。求人票、職務記述書、使用設備、勤務環境、面接基準を確認し、候補者確認と入社前教育に反映します。" },
    { question: "日本語教育はどのように行いますか。", answer: "N5からN4までの基礎教育に加え、職種別の用語、指示確認、報告・連絡・相談、面接練習を組み合わせます。N3以上が必要な職種は、応募者ごとの到達状況を確認します。" },
    { question: "候補者提案までの期間はどのくらいですか。", answer: "職種、人数、日本語・技能要件、面接時期によって異なります。求人条件を確認後、現実的な選考計画をご案内します。" },
  ];

  return {
    title: sector.title,
    slug: sector.slug,
    subtitle: sector.subtitle,
    short_description: `受入企業様の条件に合わせ、${sector.title}分野の候補者選定、事前確認、面接調整、入社前教育をご提案します。`,
    overview,
    thumbnail_image_id: mediaAt(mediaIds, mediaOffset),
    hero_image_id: mediaAt(mediaIds, mediaOffset + 1),
    status: "PUBLISHED",
    is_featured: [0, 3, 10, 12].includes(sectorIndex),
    sort_order: sectorIndex,
    sector_category_option_id: categoryId,
    data_status_label: statusLabel,
    pathway_label: sector.pathway,
    language_target_label: sector.language,
    skill_test_label: sector.skillTest,
    readiness_lead_time_label: "求人条件確認後に選考計画をご案内",
    last_verified_label: `制度情報確認日：${VERIFIED_DATE}`,
    reference_url: sector.referenceUrl,
    capability_stats: withSortOrder([
      { icon_key: "badge_check", value: "19分野", label: "特定技能1号の対象分野" },
      { icon_key: "languages", value: sector.language.includes("N3") ? "N3/N4" : sector.language.includes("N4") ? "N4以上" : "要件確認", label: "日本語要件" },
      { icon_key: "users", value: "個別提案", label: "求人条件に合わせた候補者選定" },
      { icon_key: "calendar_clock", value: "2026.06", label: "制度情報の確認時点" },
    ]),
    position_competencies: withSortOrder(sector.positions.map((position) => ({
      title: position.title,
      duties: position.duties,
      practical_skills: position.focus,
      tools_equipment: "求人票・職務記述書・使用設備を確認し、選考時の確認項目を設定します。",
      safety_focus: position.safety,
      pass_standard: "受入企業様の採用基準に基づき、面接・適性・必要な技能確認の内容を設定します。",
    }))),
    curriculum_modules: withSortOrder(curriculumModules),
    facility_items: withSortOrder([
      { title: `${sector.title}分野イメージ`, description: "掲載画像は分野イメージです。実際の教育内容や確認方法は求人条件に合わせてご案内します。", media_id: mediaAt(mediaIds, mediaOffset) },
      { title: "選考・教育イメージ", description: "候補者情報、教育状況、面接準備に関する詳細は個別の採用案件でご案内します。", media_id: mediaAt(mediaIds, mediaOffset + 1) },
    ]),
    candidate_snapshots: [],
    quality_assurance_items: withSortOrder(qualityAssurance),
    placement_support_items: withSortOrder(placementSupport),
    evidence_gallery: [],
    suitability_items: [],
    example_positions: [],
    training_alignment_items: [],
    candidate_requirements: [
      "募集職種・具体的な業務内容",
      "採用予定人数・希望入社時期",
      "勤務地・勤務時間・休日・給与条件",
      "必要な日本語力・経験・資格",
      "面接方法および重視する選考項目",
    ],
    process_items: withSortOrder(processItems),
    faqs: withSortOrder(faqs),
    primary_cta_label: "採用について相談する",
    line_message_template: `${sector.title}分野の採用について相談したいです。募集職種：／人数：／勤務地：／希望時期：`,
    secondary_cta_label: "資料を確認する",
    secondary_document_url: "",
    secondary_document_file_id: "",
  };
}

async function main() {
  const targetHost = process.env.SECTOR_HOST || "hit-japan.lpk.local";
  const targetTenantSlug = process.env.SECTOR_TENANT_SLUG || "hit";
  const variantByDomain = await prisma.variant.findFirst({
    where: { key: "japan", domains: { some: { host: targetHost } } },
    select: { id: true, tenantId: true },
  });
  const variant = variantByDomain ?? await prisma.variant.findFirst({
    where: { key: "japan", tenant: { slug: targetTenantSlug } },
    select: { id: true, tenantId: true },
  });

  if (!variant) {
    throw new Error(`Japan variant for ${targetHost} or tenant ${targetTenantSlug} was not found.`);
  }

  const media = await prisma.mediaAsset.findMany({
    where: { tenantId: variant.tenantId, status: MediaStatus.ACTIVE, mediaType: MediaType.IMAGE },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (media.length === 0) {
    throw new Error("No active image media is available for Japan sector data.");
  }

  const mediaIds = media.map((item) => item.id);
  const pageData = {
    hero: {
      media_type: "image",
      media_id: mediaAt(mediaIds, 0),
      eyebrow_label: "SPECIFIED SKILLED WORKER",
      headline: "特定技能19分野の人材採用サポート",
      subheadline: "求人条件に合わせた候補者選定、日本語・適性の事前確認、面接調整、入社前教育をご提案します。",
      primary_cta_label: "採用について相談する",
      primary_line_message_template: "特定技能人材の採用について相談したいです。職種：／人数：／勤務地：／希望時期：",
      secondary_cta_label: "採用の流れを見る",
      secondary_href: "/training-method",
    },
    display_text: {
      card_cta_label: "分野の詳細を見る",
      featured_badge_label: "重点分野",
      breadcrumb_home_label: "ホーム",
      breadcrumb_sector_label: "対応分野",
      requirements_title: "ご相談時にお知らせいただきたい事項",
      process_title: "採用支援の流れ",
      faq_title: "よくあるご質問",
      sidebar_title: "採用に関するご相談",
      sidebar_description: "職種、人数、勤務地、必要な日本語力、希望時期をお知らせください。求人条件に合わせて選考の進め方をご案内します。",
      detail_primary_cta_label: "LINEで相談する",
      detail_secondary_cta_label: "資料を確認する",
    },
    filter_config: { enable_sector_category_filter: true },
    final_cta: {
      headline: "採用条件に合う人材を一緒に整理しませんか",
      description: "職種や人数が未確定でもご相談いただけます。業務内容を確認し、候補者選定と入社前準備の進め方をご提案します。",
      primary_cta_label: "採用について相談する",
      primary_line_message_template: "特定技能人材の採用について相談したいです。職種：／人数：／勤務地：／希望時期：",
      secondary_cta_label: "お問い合わせ",
      secondary_document_url: "",
      secondary_document_file_id: "",
    },
  };

  await prisma.$transaction(async (tx) => {
    const optionSet = await tx.optionSet.upsert({
      where: { variantId_key: { variantId: variant.id, key: "japan_sector_category" } },
      update: { label: "特定技能分野カテゴリー" },
      create: { tenantId: variant.tenantId, variantId: variant.id, key: "japan_sector_category", label: "特定技能分野カテゴリー" },
      select: { id: true },
    });

    await tx.optionValue.updateMany({ where: { optionSetId: optionSet.id }, data: { isActive: false } });

    const groups = Array.from(new Map(sectors.map((sector) => [sector.groupValue, sector.groupLabel])).entries());
    const categoryIds = new Map<string, string>();
    for (const [index, [value, label]] of groups.entries()) {
      const category = await tx.optionValue.upsert({
        where: { optionSetId_value: { optionSetId: optionSet.id, value } },
        update: { label, sortOrder: index, isActive: true },
        create: { optionSetId: optionSet.id, value, label, sortOrder: index, isActive: true },
        select: { id: true },
      });
      categoryIds.set(value, category.id);
    }

    await tx.contentItem.deleteMany({ where: { variantId: variant.id, collectionKey: "sector" } });

    const now = new Date();
    for (const [index, sector] of sectors.entries()) {
      const categoryId = categoryIds.get(sector.groupValue);
      if (!categoryId) throw new Error(`Category ${sector.groupValue} was not created.`);

      const data = buildSectorData(sector, categoryId, mediaIds, index);
      const json = data as Prisma.InputJsonValue;
      await tx.contentItem.create({
        data: {
          tenantId: variant.tenantId,
          variantId: variant.id,
          collectionKey: "sector",
          title: sector.title,
          slug: sector.slug,
          status: PublishStatus.PUBLISHED,
          excerpt: data.short_description,
          thumbnailImageId: data.thumbnail_image_id,
          heroImageId: data.hero_image_id,
          isFeatured: data.is_featured,
          sortOrder: index,
          dataJson: json,
          publishedDataJson: json,
          publishedAt: now,
        },
      });
    }

    const pageJson = pageData as Prisma.InputJsonValue;
    await tx.contentPage.upsert({
      where: { variantId_pageKey: { variantId: variant.id, pageKey: "sector_page" } },
      update: { title: "対応分野", slug: "sector", status: PublishStatus.PUBLISHED, dataJson: pageJson, publishedDataJson: pageJson },
      create: { tenantId: variant.tenantId, variantId: variant.id, pageKey: "sector_page", title: "対応分野", slug: "sector", status: PublishStatus.PUBLISHED, dataJson: pageJson, publishedDataJson: pageJson },
    });
  }, { timeout: 30_000 });

  console.log(`Seeded ${sectors.length} production-ready Japan SSW sectors using ${mediaIds.length} existing images.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Japan sector seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
