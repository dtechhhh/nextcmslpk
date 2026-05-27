import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { performance } from "node:perf_hooks";

import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import { Prisma, PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });

const REPORT_PATH = "/tmp/task8-test-results.md";
const INDONESIA_BASE = "http://hit-indonesia.lpk.local:3000";
const JAPAN_BASE = "http://hit-japan.lpk.local:3000";
const DASHBOARD_BASE = "http://dashboard.lpk.local:3000";
const ADMIN_BASE = "http://admin.lpk.local:3000";
const TEST_DRAFT_SLUG = "draft-test-item";
const TEST_NULL_SLUG = "null-test";
const TEST_DRAFT_PAGE_KEY = "task8_draft_page";
const TEST_DRAFT_PAGE_SLUG = "task8-draft-page";
const TEST_DRAFT_PAGE_TITLE = "TASK 8 DRAFT PAGE";
const OTHER_TENANT_SLUG = "task8-tenant-isolation-other";
const FETCH_TIMEOUT_MS = 60_000;

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required to run tests.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type TestStatus = "pass" | "fail" | "warning";
type TestResult = {
  id: string;
  group: string;
  label: string;
  status: TestStatus;
  details: string;
  responseTimeMs?: number;
  critical?: boolean;
};

type FetchResult = {
  status: number;
  body: string;
  headers: Headers;
  responseTimeMs: number;
  error?: string;
};

type HitContext = {
  tenantId: string;
  indonesiaVariantId: string;
  japanVariantId: string;
};

type UrlCheck = {
  label: string;
  test: (body: string, response: FetchResult) => boolean;
};

type UrlTest = {
  id: string;
  group: string;
  label: string;
  url: string;
  expectedStatus: number;
  checks?: UrlCheck[];
};

const results: TestResult[] = [];

async function main() {
  const hit = await loadHitContext();

  await runPublicRenderingIndonesiaTests();
  await runPublicRenderingJapanTests();
  await runErrorStateTests(hit);
  await runDraftProtectionTests(hit);
  await runTenantIsolationTests(hit);
  await runAuthFlowTests();
  await runPerformanceTests();
  await runContentCountVerification(hit);
}

async function runPublicRenderingIndonesiaTests() {
  await runUrlTests([
    {
      id: "T1.1",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "Homepage renders",
      url: `${INDONESIA_BASE}/`,
      expectedStatus: 200,
      checks: [
        contains("Hashimoto Indo Trust"),
        containsEither(["Wujudkan Impianmu", "Jepang"], "Wujudkan Impianmu/Jepang"),
        matches(/wa\.me/i, "WhatsApp link (wa.me)"),
      ],
    },
    {
      id: "T1.2",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "Program listing renders",
      url: `${INDONESIA_BASE}/program`,
      expectedStatus: 200,
      checks: [contains("Program Pelatihan"), contains("Magang")],
    },
    {
      id: "T1.3",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "Program detail renders",
      url: `${INDONESIA_BASE}/program/magang-manufaktur-otomotif`,
      expectedStatus: 200,
      checks: [
        contains("Program Magang Manufaktur"),
        matches(/WhatsApp|wa\.me/i, "WhatsApp CTA"),
      ],
    },
    {
      id: "T1.4",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "Job listing renders",
      url: `${INDONESIA_BASE}/job`,
      expectedStatus: 200,
      checks: [contains("Lowongan")],
    },
    {
      id: "T1.5",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "Job detail renders and CTA is enabled",
      url: `${INDONESIA_BASE}/job/operator-produksi-pabrik-otomotif-aichi`,
      expectedStatus: 200,
      checks: [
        contains("Operator Produksi"),
        contains("Aichi"),
        {
          label: "CTA not disabled",
          test: (body) =>
            !body.includes("Pendaftaran ditutup") &&
            /Daftar via WhatsApp|Lamar.*WhatsApp|wa\.me/i.test(body),
        },
      ],
    },
    {
      id: "T1.6",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "Blog listing renders",
      url: `${INDONESIA_BASE}/blog`,
      expectedStatus: 200,
      checks: [contains("Blog")],
    },
    {
      id: "T1.7",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "Blog detail renders",
      url: `${INDONESIA_BASE}/blog/5-tips-persiapan-mental-sebelum-berangkat-ke-jepang`,
      expectedStatus: 200,
      checks: [contains("Tips Persiapan Mental"), contains("Sari Anggraini")],
    },
    {
      id: "T1.8",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "About page renders",
      url: `${INDONESIA_BASE}/tentang-kami`,
      expectedStatus: 200,
      checks: [contains("Hashimoto Indo Trust"), contains("2015")],
    },
    {
      id: "T1.9",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "Career page renders",
      url: `${INDONESIA_BASE}/karir`,
      expectedStatus: 200,
      checks: [containsEither(["Bergabung", "Karir"], "Bergabung/Karir")],
    },
    {
      id: "T1.10",
      group: "Test Group 1: Public Rendering Indonesia",
      label: "Offer detail renders",
      url: `${INDONESIA_BASE}/offer/kelas-bahasa-jepang-gratis-juli-2026`,
      expectedStatus: 200,
      checks: [contains("Kelas Bahasa Jepang Gratis"), contains("GRATIS")],
    },
  ]);
}

async function runPublicRenderingJapanTests() {
  await runUrlTests([
    {
      id: "T2.1",
      group: "Test Group 2: Public Rendering Japan",
      label: "Homepage renders",
      url: `${JAPAN_BASE}/`,
      expectedStatus: 200,
      checks: [
        containsEither(["ハシモト", "インドネシア"], "ハシモト/インドネシア"),
        matches(/line\.me|LINE/i, "LINE link/text"),
      ],
    },
    {
      id: "T2.2",
      group: "Test Group 2: Public Rendering Japan",
      label: "About page renders",
      url: `${JAPAN_BASE}/about`,
      expectedStatus: 200,
      checks: [contains("会社概要")],
    },
    {
      id: "T2.3",
      group: "Test Group 2: Public Rendering Japan",
      label: "Training method page renders",
      url: `${JAPAN_BASE}/training-method`,
      expectedStatus: 200,
      checks: [contains("研修")],
    },
    {
      id: "T2.4",
      group: "Test Group 2: Public Rendering Japan",
      label: "Candidate profile page renders",
      url: `${JAPAN_BASE}/candidate-profile`,
      expectedStatus: 200,
      checks: [contains("人材")],
    },
    {
      id: "T2.5",
      group: "Test Group 2: Public Rendering Japan",
      label: "Recruitment network page renders",
      url: `${JAPAN_BASE}/recruitment-network`,
      expectedStatus: 200,
      checks: [contains("採用")],
    },
    {
      id: "T2.6",
      group: "Test Group 2: Public Rendering Japan",
      label: "Sectors listing renders",
      url: `${JAPAN_BASE}/sectors`,
      expectedStatus: 200,
      checks: [contains("業種")],
    },
    {
      id: "T2.7",
      group: "Test Group 2: Public Rendering Japan",
      label: "Sector detail renders",
      url: `${JAPAN_BASE}/sectors/manufacturing`,
      expectedStatus: 200,
      checks: [contains("製造業")],
    },
    {
      id: "T2.8",
      group: "Test Group 2: Public Rendering Japan",
      label: "News listing renders",
      url: `${JAPAN_BASE}/news`,
      expectedStatus: 200,
      checks: [contains("ニュース")],
    },
    {
      id: "T2.9",
      group: "Test Group 2: Public Rendering Japan",
      label: "News detail renders",
      url: `${JAPAN_BASE}/news/partner-visit-aichi-automotive-jan-2026`,
      expectedStatus: 200,
      checks: [contains("パートナー企業訪問")],
    },
    {
      id: "T2.10",
      group: "Test Group 2: Public Rendering Japan",
      label: "Contact page renders",
      url: `${JAPAN_BASE}/contact`,
      expectedStatus: 200,
      checks: [contains("お問い合わせ"), matches(/line\.me|LINE/i, "LINE link/text")],
    },
  ]);
}

async function runErrorStateTests(hit: HitContext) {
  await runUrlTests([
    {
      id: "T3.1",
      group: "Test Group 3: Error States",
      label: "Indonesia unknown page returns 404",
      url: `${INDONESIA_BASE}/halaman-yang-tidak-ada`,
      expectedStatus: 404,
      checks: [matches(/tidak ditemukan|404/i, "tidak ditemukan/404")],
    },
    {
      id: "T3.2",
      group: "Test Group 3: Error States",
      label: "Japan unknown page returns 404",
      url: `${JAPAN_BASE}/halaman-yang-tidak-ada`,
      expectedStatus: 404,
      checks: [matches(/見つかりません|404/i, "見つかりません/404")],
    },
    {
      id: "T3.3",
      group: "Test Group 3: Error States",
      label: "Unknown program slug returns 404",
      url: `${INDONESIA_BASE}/program/slug-yang-tidak-ada`,
      expectedStatus: 404,
    },
  ]);

  await testExistingDraftPage(hit);
}

async function runDraftProtectionTests(hit: HitContext) {
  await cleanupTestContentItems(hit.indonesiaVariantId);

  try {
    await prisma.contentItem.create({
      data: {
        tenantId: hit.tenantId,
        variantId: hit.indonesiaVariantId,
        collectionKey: "program",
        title: "DRAFT TEST ITEM",
        slug: TEST_DRAFT_SLUG,
        status: "DRAFT",
        excerpt: "Draft item created by Task 8 test runner.",
        dataJson: toJson({ short_description: "Draft item created by Task 8." }),
        publishedDataJson: Prisma.JsonNull,
      },
    });

    const list = await timedFetch(`${INDONESIA_BASE}/program`);
    const detail = await timedFetch(`${INDONESIA_BASE}/program/${TEST_DRAFT_SLUG}`);
    const hiddenFromList = !list.body.includes("DRAFT TEST ITEM");
    const detailNotFound = detail.status === 404 && !detail.body.includes("DRAFT TEST ITEM");

    addResult({
      id: "T4.1",
      group: "Test Group 4: Draft Protection",
      label: "Draft ContentItem is hidden from listing and detail",
      status: list.status === 200 && hiddenFromList && detailNotFound ? "pass" : "fail",
      responseTimeMs: list.responseTimeMs + detail.responseTimeMs,
      details: [
        `listing HTTP ${list.status}`,
        `listing hidden=${hiddenFromList}`,
        `detail HTTP ${detail.status}`,
        `detail hidden=${!detail.body.includes("DRAFT TEST ITEM")}`,
      ].join(" | "),
    });
  } catch (error) {
    addResult({
      id: "T4.1",
      group: "Test Group 4: Draft Protection",
      label: "Draft ContentItem is hidden from listing and detail",
      status: "fail",
      details: errorMessage(error),
    });
  } finally {
    await cleanupTestContentItems(hit.indonesiaVariantId);
  }

  try {
    await prisma.contentItem.create({
      data: {
        tenantId: hit.tenantId,
        variantId: hit.indonesiaVariantId,
        collectionKey: "program",
        title: "NULL TEST ITEM",
        slug: TEST_NULL_SLUG,
        status: "DRAFT",
        excerpt: "Null published data test item.",
        dataJson: toJson({ short_description: "Null published data test item." }),
        publishedDataJson: Prisma.JsonNull,
      },
    });

    const response = await timedFetch(`${INDONESIA_BASE}/program/${TEST_NULL_SLUG}`);

    addResult({
      id: "T4.2",
      group: "Test Group 4: Draft Protection",
      label: "publishedDataJson null returns 404",
      status: response.status === 404 && !response.body.includes("NULL TEST ITEM") ? "pass" : "fail",
      responseTimeMs: response.responseTimeMs,
      details: `HTTP ${response.status} | draft title hidden=${!response.body.includes("NULL TEST ITEM")}`,
    });
  } catch (error) {
    addResult({
      id: "T4.2",
      group: "Test Group 4: Draft Protection",
      label: "publishedDataJson null returns 404",
      status: "fail",
      details: errorMessage(error),
    });
  } finally {
    await cleanupTestContentItems(hit.indonesiaVariantId);
  }
}

async function runTenantIsolationTests(hit: HitContext) {
  await prisma.tenant.deleteMany({ where: { slug: OTHER_TENANT_SLUG } });

  try {
    const hitAdmin = await prisma.user.findFirst({
      where: {
        username: "hit-admin",
        tenantId: hit.tenantId,
        role: "TENANT_ADMIN",
      },
      select: { id: true, username: true },
    });

    if (!hitAdmin) {
      throw new Error('Tenant admin "hit-admin" was not found for tenant "hit".');
    }

    const otherTenant = await prisma.tenant.create({
      data: {
        name: "Task 8 Tenant Isolation Other",
        slug: OTHER_TENANT_SLUG,
        status: "ACTIVE",
        variants: {
          create: {
            key: "indonesia",
            label: "Task 8 Other Indonesia",
            themeKey: "starter",
            status: "ACTIVE",
          },
        },
      },
      include: { variants: true },
    });
    const otherVariant = otherTenant.variants[0];

    if (!otherVariant) {
      throw new Error("Other tenant variant was not created.");
    }

    await prisma.contentPage.create({
      data: {
        tenantId: otherTenant.id,
        variantId: otherVariant.id,
        pageKey: "homepage",
        title: "OTHER TENANT SECRET PAGE",
        slug: "homepage",
        status: "PUBLISHED",
        dataJson: toJson({ hero: { headline: "OTHER TENANT SECRET PAGE" } }),
        publishedDataJson: toJson({ hero: { headline: "OTHER TENANT SECRET PAGE" } }),
      },
    });

    const { tenantDb } = await import("../src/server/db/tenant-scoped");
    const scopedDb = tenantDb({
      user: {
        userId: hitAdmin.id,
        username: hitAdmin.username,
        role: "TENANT_ADMIN",
        tenantId: hit.tenantId,
      },
    } as never);
    const rows = (await scopedDb.contentPage.findMany({
      where: { tenantId: otherTenant.id },
      select: { id: true, tenantId: true, title: true },
    })) as unknown[];

    addResult({
      id: "T5.1",
      group: "Test Group 5: Tenant Isolation",
      label: "tenantDb filters cross-tenant dashboard reads",
      status: rows.length === 0 ? "pass" : "fail",
      critical: rows.length > 0,
      details:
        rows.length === 0
          ? "Result EMPTY when hit-admin scoped query requested another tenantId."
          : `SECURITY VIOLATION: ${rows.length} cross-tenant row(s) returned.`,
    });
  } catch (error) {
    addResult({
      id: "T5.1",
      group: "Test Group 5: Tenant Isolation",
      label: "tenantDb filters cross-tenant dashboard reads",
      status: "fail",
      critical: true,
      details: errorMessage(error),
    });
  } finally {
    await prisma.tenant.deleteMany({ where: { slug: OTHER_TENANT_SLUG } });
  }

  await scanDashboardForDirectPrismaCalls();
}

async function runAuthFlowTests() {
  await runRedirectTest({
    id: "T6.1",
    group: "Test Group 6: Auth Flow",
    label: "Dashboard requires login",
    url: `${DASHBOARD_BASE}/dashboard`,
    expectedLocationPart: "/dashboard/login",
  });

  await runRedirectTest({
    id: "T6.2",
    group: "Test Group 6: Auth Flow",
    label: "Super admin requires login",
    url: `${ADMIN_BASE}/super-admin`,
    expectedLocationPart: "/super-admin/login",
  });

  await testLoginRateLimit();

  const setup = await timedFetch(`${ADMIN_BASE}/super-admin/setup`);
  addResult({
    id: "T6.4",
    group: "Test Group 6: Auth Flow",
    label: "Super admin setup is locked",
    status: setup.status === 404 ? "pass" : "fail",
    responseTimeMs: setup.responseTimeMs,
    details: `HTTP ${setup.status}`,
  });
}

async function runPerformanceTests() {
  const tests = [
    { id: "T7.1", label: "Indonesia homepage", url: `${INDONESIA_BASE}/` },
    { id: "T7.2", label: "Indonesia program listing", url: `${INDONESIA_BASE}/program` },
    { id: "T7.3", label: "Japan homepage", url: `${JAPAN_BASE}/` },
  ];

  for (const test of tests) {
    const response = await timedFetch(test.url);
    const exceeded = response.responseTimeMs >= 3000;
    addResult({
      id: test.id,
      group: "Test Group 7: Performance",
      label: `${test.label} < 3000ms`,
      status: response.status !== 200 ? "fail" : exceeded ? "warning" : "pass",
      responseTimeMs: response.responseTimeMs,
      details: `HTTP ${response.status} | ${Math.round(response.responseTimeMs)}ms${
        exceeded ? " | WARNING: exceeds 3000ms" : ""
      }`,
    });
  }
}

async function runContentCountVerification(hit: HitContext) {
  type PageCountRow = {
    variant: string;
    type: string;
    total: number;
    published: number;
  };
  type ItemCountRow = {
    variant: string;
    collection_key: string;
    total: number;
    published: number;
  };

  const pageRows = await prisma.$queryRaw<PageCountRow[]>`
    SELECT
      v.key as variant,
      'pages' as type,
      count(*)::int as total,
      coalesce(sum(case when cp.status='PUBLISHED' then 1 else 0 end), 0)::int as published
    FROM content_pages cp
    JOIN variants v ON cp.variant_id = v.id
    WHERE v.tenant_id = ${hit.tenantId}
    GROUP BY v.key
    ORDER BY v.key
  `;

  const itemRows = await prisma.$queryRaw<ItemCountRow[]>`
    SELECT
      v.key as variant,
      ci.collection_key,
      count(*)::int as total,
      coalesce(sum(case when ci.status='PUBLISHED' then 1 else 0 end), 0)::int as published
    FROM content_items ci
    JOIN variants v ON ci.variant_id = v.id
    WHERE v.tenant_id = ${hit.tenantId}
    GROUP BY v.key, ci.collection_key
    ORDER BY v.key, ci.collection_key
  `;

  const mediaCount = await prisma.mediaAsset.count({
    where: { tenantId: hit.tenantId },
  });

  const expectedPages = new Map([
    ["indonesia", { total: 6, published: 6 }],
    ["japan", { total: 8, published: 8 }],
  ]);
  const expectedItems = new Map([
    ["indonesia|program", { total: 3, published: 3 }],
    ["indonesia|job", { total: 3, published: 3 }],
    ["indonesia|offer", { total: 2, published: 2 }],
    ["indonesia|blog", { total: 3, published: 3 }],
    ["indonesia|karir", { total: 2, published: 2 }],
    ["japan|news", { total: 3, published: 3 }],
    ["japan|sector", { total: 3, published: 3 }],
  ]);

  const pageIssues = compareRows(
    pageRows.map((row) => ({
      key: row.variant,
      total: row.total,
      published: row.published,
    })),
    expectedPages,
  );
  const itemIssues = compareRows(
    itemRows.map((row) => ({
      key: `${row.variant}|${row.collection_key}`,
      total: row.total,
      published: row.published,
    })),
    expectedItems,
  );

  addResult({
    id: "T8.1",
    group: "Test Group 8: Content Count Verification",
    label: "Content page counts match expected",
    status: pageIssues.length === 0 ? "pass" : "fail",
    details: pageIssues.length === 0 ? formatPageRows(pageRows) : pageIssues.join("; "),
  });

  addResult({
    id: "T8.2",
    group: "Test Group 8: Content Count Verification",
    label: "Content item counts match expected",
    status: itemIssues.length === 0 ? "pass" : "fail",
    details: itemIssues.length === 0 ? formatItemRows(itemRows) : itemIssues.join("; "),
  });

  addResult({
    id: "T8.3",
    group: "Test Group 8: Content Count Verification",
    label: "Media assets count is >= 25",
    status: mediaCount >= 25 ? "pass" : "fail",
    details: `media_assets count=${mediaCount}`,
  });
}

async function runUrlTests(tests: UrlTest[]) {
  for (const test of tests) {
    const response = await timedFetch(test.url);
    const missingChecks = (test.checks ?? [])
      .filter((check) => !check.test(response.body, response))
      .map((check) => check.label);
    const statusMatches = response.status === test.expectedStatus;
    const passed = statusMatches && missingChecks.length === 0 && !response.error;

    addResult({
      id: test.id,
      group: test.group,
      label: test.label,
      status: passed ? "pass" : "fail",
      responseTimeMs: response.responseTimeMs,
      details: [
        `HTTP ${response.status}`,
        `${Math.round(response.responseTimeMs)}ms`,
        statusMatches ? null : `expected HTTP ${test.expectedStatus}`,
        missingChecks.length ? `missing: ${missingChecks.join(", ")}` : null,
        response.error ? `error: ${response.error}` : null,
      ]
        .filter(Boolean)
        .join(" | "),
    });
  }
}

async function testExistingDraftPage(hit: HitContext) {
  let temporaryDraft = false;
  let draftPage = await prisma.contentPage.findFirst({
    where: {
      tenantId: hit.tenantId,
      status: "DRAFT",
    },
    select: {
      title: true,
      pageKey: true,
      slug: true,
      variant: { select: { key: true } },
    },
  });

  if (!draftPage) {
    await cleanupTestContentPages(hit.indonesiaVariantId);
    draftPage = await prisma.contentPage.create({
      data: {
        tenantId: hit.tenantId,
        variantId: hit.indonesiaVariantId,
        pageKey: TEST_DRAFT_PAGE_KEY,
        title: TEST_DRAFT_PAGE_TITLE,
        slug: TEST_DRAFT_PAGE_SLUG,
        status: "DRAFT",
        dataJson: toJson({ hero: { headline: TEST_DRAFT_PAGE_TITLE } }),
        publishedDataJson: Prisma.JsonNull,
      },
      select: {
        title: true,
        pageKey: true,
        slug: true,
        variant: { select: { key: true } },
      },
    });
    temporaryDraft = true;
  }

  const pathForPage = temporaryDraft
    ? `/${draftPage.slug}`
    : getPublicPagePath(draftPage.variant.key, draftPage.pageKey);

  if (!pathForPage) {
    addResult({
      id: "T3.4",
      group: "Test Group 3: Error States",
      label: "Existing draft page is not public",
      status: "warning",
      details: `Draft page ${draftPage.pageKey} has no known public route mapping.`,
    });
    return;
  }

  const base = draftPage.variant.key === "japan" ? JAPAN_BASE : INDONESIA_BASE;
  const response = await timedFetch(`${base}${pathForPage}`);

  try {
    addResult({
      id: "T3.4",
      group: "Test Group 3: Error States",
      label: "Draft page is not public",
      status: response.status === 404 && !response.body.includes(draftPage.title) ? "pass" : "fail",
      responseTimeMs: response.responseTimeMs,
      details: `HTTP ${response.status} | pageKey=${draftPage.pageKey} | path=${pathForPage} | draft title hidden=${!response.body.includes(
        draftPage.title,
      )}`,
    });
  } finally {
    if (temporaryDraft) {
      await cleanupTestContentPages(hit.indonesiaVariantId);
    }
  }
}

async function scanDashboardForDirectPrismaCalls() {
  const dashboardDir = path.join(process.cwd(), "src", "app", "dashboard");
  const files = await listSourceFiles(dashboardDir);
  const findings: string[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (/\bprisma\./.test(line) && !line.includes("tenantDb(")) {
        findings.push(`${path.relative(process.cwd(), file)}:${index + 1}`);
      }
    });
  }

  addResult({
    id: "T5.2",
    group: "Test Group 5: Tenant Isolation",
    label: "Dashboard files avoid direct prisma calls",
    status: findings.length === 0 ? "pass" : "warning",
    details:
      findings.length === 0
        ? "No prisma.* usage found in src/app/dashboard/**/*.ts(x)."
        : `WARNING: direct prisma.* usage found at ${findings.slice(0, 20).join(", ")}${
            findings.length > 20 ? ` and ${findings.length - 20} more` : ""
          }`,
  });
}

async function runRedirectTest(input: {
  id: string;
  group: string;
  label: string;
  url: string;
  expectedLocationPart: string;
}) {
  const response = await timedFetch(input.url, { redirect: "manual" });
  const location = response.headers.get("location") ?? "";
  const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
  const passed = isRedirect && location.includes(input.expectedLocationPart);

  addResult({
    id: input.id,
    group: input.group,
    label: input.label,
    status: passed ? "pass" : "fail",
    responseTimeMs: response.responseTimeMs,
    details: `HTTP ${response.status} | location=${location || "(none)"}`,
  });
}

async function testLoginRateLimit() {
  const statuses: string[] = [];
  const bodies: string[] = [];
  const forwardedFor = `task8-${randomUUID()}`;
  const cookieJar = new Map<string, string>();
  let csrfToken = "";

  try {
    const csrf = await timedFetch(`${DASHBOARD_BASE}/api/auth/csrf`, {
      headers: { "x-forwarded-for": forwardedFor },
    });
    storeCookies(cookieJar, csrf.headers);
    const parsed = JSON.parse(csrf.body) as { csrfToken?: string };
    csrfToken = parsed.csrfToken ?? "";

    if (!csrfToken) {
      throw new Error("Could not obtain Auth.js CSRF token.");
    }

    for (let attempt = 1; attempt <= 7; attempt += 1) {
      const body = new URLSearchParams({
        csrfToken,
        username: "hit-admin",
        password: `wrong-password-${Date.now()}-${attempt}`,
        scope: "dashboard",
        callbackUrl: `${DASHBOARD_BASE}/dashboard`,
        redirect: "false",
      });
      const response = await timedFetch(`${DASHBOARD_BASE}/api/auth/callback/credentials`, {
        method: "POST",
        redirect: "manual",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "x-auth-return-redirect": "1",
          "x-forwarded-for": forwardedFor,
          cookie: cookieHeader(cookieJar),
        },
        body,
      });

      storeCookies(cookieJar, response.headers);
      statuses.push(`${attempt}:${response.status}`);
      bodies.push(response.body.slice(0, 180).replace(/\s+/g, " "));
    }

    const sixthOrSeventhLimited = statuses
      .slice(5, 7)
      .some((entry, index) => entry === `${index + 6}:429`);
    const rateBody = bodies
      .slice(5, 7)
      .some((body) => /rate|terlalu banyak|too many/i.test(body));

    addResult({
      id: "T6.3",
      group: "Test Group 6: Auth Flow",
      label: "Wrong password attempts are rate limited",
      status: sixthOrSeventhLimited && rateBody ? "pass" : "fail",
      details: `statuses=${statuses.join(", ")} | sixth/seventh body has rate text=${rateBody}`,
    });
  } catch (error) {
    addResult({
      id: "T6.3",
      group: "Test Group 6: Auth Flow",
      label: "Wrong password attempts are rate limited",
      status: "fail",
      details: errorMessage(error),
    });
  }
}

async function timedFetch(url: string, init: RequestInit = {}): Promise<FetchResult> {
  const start = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "manual",
      ...init,
      signal: controller.signal,
      headers: {
        "user-agent": "task8-test-runner/1.0",
        "cache-control": "no-cache",
        ...(init.headers ?? {}),
      },
    });
    const body = await response.text();

    return {
      status: response.status,
      body,
      headers: response.headers,
      responseTimeMs: performance.now() - start,
    };
  } catch (error) {
    return {
      status: 0,
      body: "",
      headers: new Headers(),
      responseTimeMs: performance.now() - start,
      error: errorMessage(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function loadHitContext(): Promise<HitContext> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "hit" },
    select: {
      id: true,
      variants: {
        where: { key: { in: ["indonesia", "japan"] } },
        select: { id: true, key: true },
      },
    },
  });

  if (!tenant) {
    throw new Error('Tenant slug "hit" was not found. Run Task 2 before Task 8.');
  }

  const indonesiaVariantId = tenant.variants.find((variant) => variant.key === "indonesia")?.id;
  const japanVariantId = tenant.variants.find((variant) => variant.key === "japan")?.id;

  if (!indonesiaVariantId || !japanVariantId) {
    throw new Error('Expected "indonesia" and "japan" variants for tenant "hit".');
  }

  return {
    tenantId: tenant.id,
    indonesiaVariantId,
    japanVariantId,
  };
}

async function cleanupTestContentItems(indonesiaVariantId: string) {
  await prisma.contentItem.deleteMany({
    where: {
      variantId: indonesiaVariantId,
      collectionKey: "program",
      slug: { in: [TEST_DRAFT_SLUG, TEST_NULL_SLUG] },
    },
  });
}

async function cleanupTestContentPages(indonesiaVariantId: string) {
  await prisma.contentPage.deleteMany({
    where: {
      variantId: indonesiaVariantId,
      pageKey: TEST_DRAFT_PAGE_KEY,
      slug: TEST_DRAFT_PAGE_SLUG,
    },
  });
}

function contains(text: string): UrlCheck {
  return {
    label: `"${text}"`,
    test: (body) => body.includes(text),
  };
}

function containsEither(texts: string[], label: string): UrlCheck {
  return {
    label,
    test: (body) => texts.some((text) => body.includes(text)),
  };
}

function matches(pattern: RegExp, label: string): UrlCheck {
  return {
    label,
    test: (body) => pattern.test(body),
  };
}

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function compareRows(
  actualRows: { key: string; total: number; published: number }[],
  expectedRows: Map<string, { total: number; published: number }>,
) {
  const actual = new Map(actualRows.map((row) => [row.key, row]));
  const issues: string[] = [];

  for (const [key, expected] of expectedRows.entries()) {
    const row = actual.get(key);

    if (!row) {
      issues.push(`${key} missing`);
      continue;
    }

    if (row.total !== expected.total || row.published !== expected.published) {
      issues.push(
        `${key} expected ${expected.total}/${expected.published}, got ${row.total}/${row.published}`,
      );
    }
  }

  return issues;
}

function formatPageRows(rows: { variant: string; total: number; published: number }[]) {
  return rows.map((row) => `${row.variant} pages ${row.total}/${row.published}`).join("; ");
}

function formatItemRows(
  rows: { variant: string; collection_key: string; total: number; published: number }[],
) {
  return rows
    .map((row) => `${row.variant} ${row.collection_key} ${row.total}/${row.published}`)
    .join("; ");
}

function getPublicPagePath(variantKey: string, pageKey: string) {
  const indonesia = new Map([
    ["homepage", "/"],
    ["program_page", "/program"],
    ["job_page", "/job"],
    ["blog_page", "/blog"],
    ["tentang_kami", "/tentang-kami"],
    ["karir_page", "/karir"],
  ]);
  const japan = new Map([
    ["homepage", "/"],
    ["tentang_kami", "/about"],
    ["metode_pelatihan", "/training-method"],
    ["profil_kandidat", "/candidate-profile"],
    ["jaringan_rekrutmen", "/recruitment-network"],
    ["sector_page", "/sectors"],
    ["news_page", "/news"],
    ["contact", "/contact"],
  ]);

  return variantKey === "japan" ? japan.get(pageKey) : indonesia.get(pageKey);
}

async function listSourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return listSourceFiles(fullPath);
      }

      return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
    }),
  );

  return files.flat();
}

function storeCookies(cookieJar: Map<string, string>, headers: Headers) {
  for (const cookie of getSetCookie(headers)) {
    const [pair] = cookie.split(";");
    const separatorIndex = pair.indexOf("=");

    if (separatorIndex > 0) {
      cookieJar.set(pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1));
    }
  }
}

function getSetCookie(headers: Headers) {
  const withGetter = headers as Headers & { getSetCookie?: () => string[] };

  if (withGetter.getSetCookie) {
    return withGetter.getSetCookie();
  }

  const cookie = headers.get("set-cookie");
  return cookie ? [cookie] : [];
}

function cookieHeader(cookieJar: Map<string, string>) {
  return [...cookieJar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
}

function addResult(result: TestResult) {
  results.push(result);
  console.log(`${result.id}: ${statusIcon(result.status)} ${result.label} | ${result.details}`);
}

function statusIcon(status: TestStatus) {
  if (status === "pass") {
    return "✅";
  }

  if (status === "warning") {
    return "⚠️";
  }

  return "❌";
}

function buildReport() {
  const passed = results.filter((result) => result.status === "pass").length;
  const failed = results.filter((result) => result.status === "fail").length;
  const warnings = results.filter((result) => result.status === "warning").length;
  const groups = [...new Set(results.map((result) => result.group))];
  const lines = [
    "# Test Results — HIT LPK CMS",
    `Date: ${new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Asia/Jakarta",
    }).format(new Date())}`,
    "",
    "## Summary",
    `Total Tests: ${results.length}`,
    `Passed: ${passed} ✅`,
    `Failed: ${failed} ❌`,
    `Warnings: ${warnings} ⚠️`,
    "",
  ];

  for (const group of groups) {
    lines.push(`## ${group}`, "");

    for (const result of results.filter((item) => item.group === group)) {
      const hasTimeInDetails = /\b\d+ms\b/.test(result.details);
      const time =
        result.responseTimeMs === undefined || hasTimeInDetails
          ? ""
          : ` | ${Math.round(result.responseTimeMs)}ms`;
      const critical = result.critical ? " | CRITICAL" : "";
      lines.push(
        `${result.id}: ${statusIcon(result.status)} ${result.label}${critical} | ${result.details}${time}`,
      );
    }

    lines.push("");
  }

  const issues = results.filter((result) => result.status !== "pass");
  lines.push("## Issues Found");

  if (issues.length === 0) {
    lines.push("None.");
  } else {
    for (const issue of issues) {
      const critical = issue.critical ? " CRITICAL" : "";
      lines.push(
        `- ${issue.id}: ${statusIcon(issue.status)}${critical} ${issue.label} — ${issue.details}`,
      );
    }
  }

  lines.push("", "## Conclusion");

  if (failed > 0) {
    lines.push(
      `Overall: FAIL. ${failed} test(s) failed and ${warnings} warning(s) were recorded. Review the failed security/rendering checks before considering the seed verification complete.`,
    );
  } else if (warnings > 0) {
    lines.push(
      `Overall: PASS WITH WARNINGS. Core checks passed, but ${warnings} warning(s) should be reviewed.`,
    );
  } else {
    lines.push("Overall: PASS. Public seeded content renders and the tested security checks passed.");
  }

  lines.push("");
  return lines.join("\n");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

main()
  .catch((error) => {
    addResult({
      id: "RUNNER",
      group: "Runner",
      label: "Test runner completed",
      status: "fail",
      details: errorMessage(error),
      critical: true,
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await mkdir(path.dirname(REPORT_PATH), { recursive: true });
    await writeFile(REPORT_PATH, buildReport(), "utf8");
    await prisma.$disconnect();
    console.log(`Wrote ${REPORT_PATH}`);
  });
