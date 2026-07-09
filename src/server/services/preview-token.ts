import { createHmac, timingSafeEqual } from "node:crypto";

import { AppError } from "@/lib/errors";

export type PreviewTokenPayload = {
  iss: "nextcmslpk";
  sub: string;
  type: "content_page" | "content_item";
  tenantId: string;
  variantId: string;
  pageKey?: string;
  collectionKey?: string;
  iat: number;
  exp: number;
};

type VerifyPreviewTokenResult =
  | {
      ok: true;
      payload: PreviewTokenPayload;
    }
  | {
      ok: false;
      reason: "invalid" | "expired" | "config";
    };

export function signPreviewToken(payload: PreviewTokenPayload) {
  const secret = getPreviewSecret();
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyPreviewToken(token: string): VerifyPreviewTokenResult {
  const secret = getPreviewSecretValue();

  if (!secret) {
    return {
      ok: false,
      reason: "config",
    };
  }

  const [encodedHeader, encodedPayload, signature, ...extraParts] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature || extraParts.length > 0) {
    return {
      ok: false,
      reason: "invalid",
    };
  }

  const expectedSignature = createSignature(
    `${encodedHeader}.${encodedPayload}`,
    secret,
  );

  if (!safeEqual(signature, expectedSignature)) {
    return {
      ok: false,
      reason: "invalid",
    };
  }

  const payload = parsePayload(encodedPayload);

  if (!payload) {
    return {
      ok: false,
      reason: "invalid",
    };
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return {
      ok: false,
      reason: "expired",
    };
  }

  return {
    ok: true,
    payload,
  };
}

function getPreviewSecret() {
  const secret = getPreviewSecretValue();

  if (!secret) {
    throw new AppError("CONFIG_ERROR", "AUTH_SECRET belum dikonfigurasi.", 500);
  }

  return secret;
}

function getPreviewSecretValue() {
  return process.env.PREVIEW_SECRET || process.env.AUTH_SECRET;
}

function createSignature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.byteLength === rightBuffer.byteLength &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function parsePayload(value: string) {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      parsed.iss !== "nextcmslpk" ||
      (parsed.type !== "content_page" && parsed.type !== "content_item") ||
      typeof parsed.sub !== "string" ||
      typeof parsed.tenantId !== "string" ||
      typeof parsed.variantId !== "string" ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    return {
      iss: parsed.iss,
      sub: parsed.sub,
      type: parsed.type,
      tenantId: parsed.tenantId,
      variantId: parsed.variantId,
      pageKey: typeof parsed.pageKey === "string" ? parsed.pageKey : undefined,
      collectionKey:
        typeof parsed.collectionKey === "string"
          ? parsed.collectionKey
          : undefined,
      iat: parsed.iat,
      exp: parsed.exp,
    } satisfies PreviewTokenPayload;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
