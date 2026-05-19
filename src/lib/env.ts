import { z } from "zod";

const requiredString = z.string().trim().min(1);

const postgresUrl = requiredString
  .url()
  .refine(
    (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "Must be a PostgreSQL URL",
  );

const hostWithOptionalPort = requiredString
  .refine((value) => !value.includes("://"), "Must not include protocol")
  .refine((value) => {
    const [host, port, ...rest] = value.split(":");

    if (!host || rest.length > 0) {
      return false;
    }

    return !port || /^\d{1,5}$/.test(port);
  }, "Must be a hostname with optional port")
  .transform((value) => value.toLowerCase());

export const envSchema = z.object({
  DATABASE_URL: postgresUrl,
  DIRECT_URL: postgresUrl,
  AUTH_SECRET: requiredString.min(32),
  TOTP_ENCRYPTION_KEY: requiredString.regex(
    /^[a-f0-9]{64}$/i,
    "Must be a 64-character hex string",
  ),
  SETUP_SECRET: requiredString.min(16),
  SUPER_ADMIN_DOMAIN: hostWithOptionalPort,
  DASHBOARD_DOMAIN: hostWithOptionalPort,
  R2_ACCOUNT_ID: requiredString.regex(
    /^[a-f0-9]{32}$/i,
    "Must be a 32-character Cloudflare account ID",
  ),
  R2_ACCESS_KEY_ID: requiredString,
  R2_SECRET_ACCESS_KEY: requiredString,
  R2_BUCKET_NAME: requiredString,
  R2_PUBLIC_URL: requiredString.url(),
  UPSTASH_REDIS_REST_URL: requiredString.url(),
  UPSTASH_REDIS_REST_TOKEN: requiredString,
  SENTRY_DSN: requiredString.url(),
  NEXT_PUBLIC_APP_URL: requiredString.url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

export type Env = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const messages = parsedEnv.error.issues.map((issue) => {
    const key = issue.path.join(".");
    const value = process.env[key];
    const message = value === undefined || value === "" ? "is required" : issue.message;

    return `- ${key}: ${message}`;
  });

  throw new Error(`Invalid environment variables:\n${messages.join("\n")}`);
}

export const env: Env = parsedEnv.data;
