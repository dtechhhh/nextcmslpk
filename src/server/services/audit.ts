import { headers } from "next/headers";

import { Prisma } from "@/generated/prisma/client";
import type { AuditLogEntry } from "@/types";
import { prisma } from "@/server/db/client";
import { getClientIp, type HeaderReader } from "@/server/services/rate-limit";

type CreateAuditLogInput = Omit<AuditLogEntry, "ipAddress"> & {
  ipAddress?: string | null;
  headers?: HeaderReader;
};

export async function createAuditLog(entry: AuditLogEntry | CreateAuditLogInput) {
  const ipAddress =
    "ipAddress" in entry &&
    typeof entry.ipAddress === "string" &&
    entry.ipAddress.trim() !== ""
      ? entry.ipAddress
      : getClientIp(await getRequestHeaders(entry));

  return prisma.auditLog.create({
    data: {
      tenantId: entry.tenantId,
      userId: entry.userId,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: toPrismaJson(entry.metadata),
      ipAddress,
    },
  });
}

async function getRequestHeaders(entry: CreateAuditLogInput) {
  if (entry.headers) {
    return entry.headers;
  }

  try {
    return await headers();
  } catch {
    return new Headers();
  }
}

function toPrismaJson(value: AuditLogEntry["metadata"]) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
