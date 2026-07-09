import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { RATE_LIMITS } from "@/lib/constants";
import { env } from "@/lib/env";

export type HeaderReader = {
  get(name: string): string | null;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type UsernameKeyInput = {
  ipAddress: string;
  username: string;
};

type RateLimitKey =
  | "login"
  | "totpVerify"
  | "initialSetup"
  | "changePassword"
  | "mediaUpload"
  | "dashboardMutation";

type LimitOptions = {
  limiter: Ratelimit;
  key: string;
  configKey: RateLimitKey;
  memoryPrefix: string;
};

const redis = Redis.fromEnv();

export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.login.maxAttempts,
    `${RATE_LIMITS.login.windowSeconds} s`,
  ),
  prefix: "ratelimit:login",
});

export const totpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.totpVerify.maxAttempts,
    `${RATE_LIMITS.totpVerify.windowSeconds} s`,
  ),
  prefix: "ratelimit:totp",
});

export const setupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.initialSetup.maxAttempts,
    `${RATE_LIMITS.initialSetup.windowSeconds} s`,
  ),
  prefix: "ratelimit:setup",
});

export const passwordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.changePassword.maxAttempts,
    `${RATE_LIMITS.changePassword.windowSeconds} s`,
  ),
  prefix: "ratelimit:password",
});

export const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.mediaUpload.maxAttempts,
    `${RATE_LIMITS.mediaUpload.windowSeconds} s`,
  ),
  prefix: "ratelimit:upload",
});

export const mutationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    RATE_LIMITS.dashboardMutation.maxAttempts,
    `${RATE_LIMITS.dashboardMutation.windowSeconds} s`,
  ),
  prefix: "ratelimit:mutation",
});

const memoryAttempts = new Map<string, number[]>();

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

export function limitLoginAttempt(input: UsernameKeyInput) {
  return limit({
    limiter: loginLimiter,
    key: usernameScopedKey(input.ipAddress, input.username),
    configKey: "login",
    memoryPrefix: "login",
  });
}

export function limitTOTPAttempt(input: UsernameKeyInput) {
  return limit({
    limiter: totpLimiter,
    key: usernameScopedKey(input.ipAddress, input.username),
    configKey: "totpVerify",
    memoryPrefix: "totp",
  });
}

export const limitTOTPVerifyAttempt = limitTOTPAttempt;

export function limitSetupAttempt(ipAddress: string) {
  return limit({
    limiter: setupLimiter,
    key: normalizeRateLimitPart(ipAddress),
    configKey: "initialSetup",
    memoryPrefix: "setup",
  });
}

export function limitPasswordAttempt(userId: string) {
  return limit({
    limiter: passwordLimiter,
    key: normalizeRateLimitPart(userId),
    configKey: "changePassword",
    memoryPrefix: "password",
  });
}

export function limitUploadAttempt(tenantId: string) {
  return limit({
    limiter: uploadLimiter,
    key: normalizeRateLimitPart(tenantId),
    configKey: "mediaUpload",
    memoryPrefix: "upload",
  });
}

export function limitMutationAttempt(tenantId: string) {
  return limit({
    limiter: mutationLimiter,
    key: normalizeRateLimitPart(tenantId),
    configKey: "dashboardMutation",
    memoryPrefix: "mutation",
  });
}

async function limit({
  limiter,
  key,
  configKey,
  memoryPrefix,
}: LimitOptions): Promise<RateLimitResult> {
  try {
    const result = await limiter.limit(key);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    if (env.NODE_ENV === "production") {
      return createBlockedResult(configKey);
    }

    return limitInMemory(`${memoryPrefix}:${key}`, configKey);
  }
}

function limitInMemory(key: string, configKey: RateLimitKey): RateLimitResult {
  const config = RATE_LIMITS[configKey];
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const attempts = (memoryAttempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < windowMs,
  );

  if (attempts.length >= config.maxAttempts) {
    memoryAttempts.set(key, attempts);

    return {
      success: false,
      limit: config.maxAttempts,
      remaining: 0,
      reset: attempts[0] + windowMs,
    };
  }

  attempts.push(now);
  memoryAttempts.set(key, attempts);

  return {
    success: true,
    limit: config.maxAttempts,
    remaining: config.maxAttempts - attempts.length,
    reset: attempts[0] + windowMs,
  };
}

function createBlockedResult(configKey: RateLimitKey): RateLimitResult {
  const config = RATE_LIMITS[configKey];

  return {
    success: false,
    limit: config.maxAttempts,
    remaining: 0,
    reset: Date.now() + config.windowSeconds * 1000,
  };
}

function usernameScopedKey(ipAddress: string, username: string) {
  return `${normalizeRateLimitPart(ipAddress)}:${normalizeRateLimitPart(username)}`;
}

function normalizeRateLimitPart(value: string) {
  return value.trim().toLowerCase() || "unknown";
}
