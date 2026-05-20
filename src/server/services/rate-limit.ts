import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { RATE_LIMITS } from "@/lib/constants";
import { env } from "@/lib/env";

type HeaderReader = {
  get(name: string): string | null;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type TOTPAttemptInput = {
  ipAddress: string;
  username: string;
};

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const totpVerifyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.totpVerify.maxAttempts,
    `${RATE_LIMITS.totpVerify.windowSeconds} s`,
  ),
  prefix: "ratelimit:totp-verify",
});

const memoryAttempts = new Map<string, number[]>();

export async function limitTOTPVerifyAttempt({
  ipAddress,
  username,
}: TOTPAttemptInput): Promise<RateLimitResult> {
  const key = `${normalizeRateLimitPart(ipAddress)}:${normalizeRateLimitPart(username)}`;

  try {
    const result = await totpVerifyLimiter.limit(key);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    if (env.NODE_ENV === "production") {
      return createBlockedResult();
    }

    return limitInMemory(`totp-verify:${key}`);
  }
}

export function getClientIp(headers: HeaderReader) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

function limitInMemory(key: string): RateLimitResult {
  const now = Date.now();
  const windowMs = RATE_LIMITS.totpVerify.windowSeconds * 1000;
  const attempts = (memoryAttempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs,
  );

  if (attempts.length >= RATE_LIMITS.totpVerify.maxAttempts) {
    memoryAttempts.set(key, attempts);

    return {
      success: false,
      limit: RATE_LIMITS.totpVerify.maxAttempts,
      remaining: 0,
      reset: attempts[0] + windowMs,
    };
  }

  attempts.push(now);
  memoryAttempts.set(key, attempts);

  return {
    success: true,
    limit: RATE_LIMITS.totpVerify.maxAttempts,
    remaining: RATE_LIMITS.totpVerify.maxAttempts - attempts.length,
    reset: attempts[0] + windowMs,
  };
}

function createBlockedResult(): RateLimitResult {
  return {
    success: false,
    limit: RATE_LIMITS.totpVerify.maxAttempts,
    remaining: 0,
    reset: Date.now() + RATE_LIMITS.totpVerify.windowSeconds * 1000,
  };
}

function normalizeRateLimitPart(value: string) {
  return value.trim().toLowerCase() || "unknown";
}
