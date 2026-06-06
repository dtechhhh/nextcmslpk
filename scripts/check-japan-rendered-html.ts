import http from "node:http";

const JAPAN_HOST = "hit-japan.lpk.local:3000";
const PATHS = [
  "/",
  "/about",
  "/training-method",
  "/candidate-profile",
  "/recruitment-network",
  "/sectors",
  "/news",
  "/contact",
];
const JAPANESE_TEXT_PATTERN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/u;
const PRINT_DETAILS = process.argv.includes("--details");

let failed = false;

async function main() {
  for (const path of PATHS) {
    const { status, html } = await requestPage(path);
    const hasJapaneseText = JAPANESE_TEXT_PATTERN.test(html);

    if (status !== 200 || hasJapaneseText) {
      failed = true;
    }

    console.log(`${path} ${status} ${hasJapaneseText ? "HAS_JAPANESE" : "OK"}`);
    if (hasJapaneseText && PRINT_DETAILS) {
      console.log(`  ${firstJapaneseSnippet(html)}`);
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

void main();

function requestPage(path: string) {
  return new Promise<{ status: number; html: string }>((resolve, reject) => {
    const request = http.request(
      {
        hostname: "127.0.0.1",
        port: 3000,
        path,
        method: "GET",
        headers: {
          Host: JAPAN_HOST,
        },
        timeout: 30_000,
      },
      (response) => {
        let html = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          html += chunk;
        });
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            html,
          });
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error(`Timeout ketika memuat ${path}`));
    });
    request.on("error", reject);
    request.end();
  });
}

function firstJapaneseSnippet(html: string) {
  const match = JAPANESE_TEXT_PATTERN.exec(html);
  if (!match) {
    return "";
  }

  const start = Math.max(0, match.index - 80);
  const end = Math.min(html.length, match.index + 120);
  return html
    .slice(start, end)
    .replace(/\s+/g, " ")
    .slice(0, 240);
}
