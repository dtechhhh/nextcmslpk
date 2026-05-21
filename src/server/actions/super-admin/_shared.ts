import { headers } from "next/headers";

import { auth } from "@/auth";
import { AppError, AuthError, ForbiddenError, ValidationError } from "@/lib/errors";
import { getClientIp } from "@/server/services/rate-limit";
import { verifySecurityStamp } from "@/server/services/security-stamp";

export type ActionSuccess<T extends object = object> = {
  ok: true;
} & T;

export type ActionFailure = {
  ok: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  redirectTo?: string;
};

export type SuperAdminActionResult<T extends object = object> =
  | ActionSuccess<T>
  | ActionFailure;

export async function requireSuperAdminActionSession() {
  const session = await auth();

  if (!session?.user?.userId) {
    throw new AuthError("Sesi tidak valid.");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Akses super admin diperlukan.");
  }

  await verifySecurityStamp(session);

  return {
    userId: session.user.userId,
  };
}

export async function getRequestIpAddress() {
  try {
    return getClientIp(await headers());
  } catch {
    return "unknown";
  }
}

export function toFieldErrors(error: {
  flatten: () => {
    fieldErrors: Record<string, string[] | undefined>;
  };
}): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([key, value]) => [
      key,
      value ?? [],
    ]),
  );
}

export function toActionError(error: unknown, fallback: string): ActionFailure {
  if (error instanceof AuthError) {
    return {
      ok: false,
      error: error.message,
      code: error.code,
      redirectTo: "/super-admin/login",
    };
  }

  if (error instanceof AppError) {
    return {
      ok: false,
      error:
        error instanceof ValidationError
          ? getFirstValidationMessage(error) ?? error.message
          : error.message,
      code: error.code,
      details: error.details,
    };
  }

  return {
    ok: false,
    error: fallback,
  };
}

export function validationError(field: string, message: string) {
  return new ValidationError({
    [field]: [message],
  });
}

function getFirstValidationMessage(error: ValidationError) {
  const errors = error.details?.errors;

  if (!isValidationErrors(errors)) {
    return null;
  }

  return Object.values(errors).flat()[0] ?? null;
}

function isValidationErrors(
  value: unknown,
): value is Record<string, string[]> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every(
      (messages) =>
        Array.isArray(messages) &&
        messages.every((message) => typeof message === "string"),
    )
  );
}
