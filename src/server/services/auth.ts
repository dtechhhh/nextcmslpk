import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto";

import bcrypt from "bcryptjs";
import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";

import { env } from "@/lib/env";

const PASSWORD_HASH_ROUNDS = 12;
const TOTP_ISSUER = "nextcmslpk";
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_WINDOW = 1;
const ENCRYPTION_VERSION = "v1";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";

export type GeneratedTOTPSecret = {
  secret: string;
  qrCodeDataUri: string;
  otpauthUrl: string;
};

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, PASSWORD_HASH_ROUNDS);
}

export async function generateTOTPSecret(label = TOTP_ISSUER): Promise<GeneratedTOTPSecret> {
  const secret = new Secret({ size: 20 }).base32;
  const otpauthUrl = createTOTPUrl(secret, label);
  const qrCodeDataUri = await QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });

  return {
    secret,
    qrCodeDataUri,
    otpauthUrl,
  };
}

export function verifyTOTPCode(secret: string, code: string) {
  const normalizedCode = code.trim();

  if (!/^\d{6}$/.test(normalizedCode)) {
    return false;
  }

  const totp = createTOTP(secret);

  return totp.validate({
    token: normalizedCode,
    window: TOTP_WINDOW,
  }) !== null;
}

export function encryptTOTPSecret(secret: string) {
  const key = getTOTPEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptTOTPSecret(encrypted: string) {
  const [version, ivHex, authTagHex, encryptedHex] = encrypted.split(":");

  if (version !== ENCRYPTION_VERSION || !ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted TOTP secret.");
  }

  const key = getTOTPEncryptionKey();
  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

export async function getTOTPQRCodeDataUri(secret: string, label = TOTP_ISSUER) {
  return QRCode.toDataURL(createTOTPUrl(secret, label), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });
}

export function safeEqual(a: string, b: string) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  if (first.length !== second.length) {
    return false;
  }

  return timingSafeEqual(first, second);
}

function createTOTP(secret: string) {
  return new TOTP({
    issuer: TOTP_ISSUER,
    label: TOTP_ISSUER,
    algorithm: "SHA1",
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SECONDS,
    secret: Secret.fromBase32(secret),
  });
}

function createTOTPUrl(secret: string, label: string) {
  return new TOTP({
    issuer: TOTP_ISSUER,
    label,
    algorithm: "SHA1",
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SECONDS,
    secret: Secret.fromBase32(secret),
  }).toString();
}

function getTOTPEncryptionKey() {
  return Buffer.from(env.TOTP_ENCRYPTION_KEY, "hex");
}
