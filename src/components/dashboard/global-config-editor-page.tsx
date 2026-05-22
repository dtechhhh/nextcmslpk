import { redirect, notFound } from "next/navigation";

import { auth } from "@/auth";
import { GlobalConfigEditor } from "@/components/dashboard/global-config-editor";
import {
  getGlobalConfigEditorDefinition,
  type GlobalConfigEditorKey,
} from "@/lib/global-config-editor-definitions";
import { tenantDb } from "@/server/db/tenant-scoped";
import { getGlobalConfig } from "@/server/actions/tenant/global-config";

type GlobalConfigEditorPageProps = {
  definitionKey: GlobalConfigEditorKey;
};

export async function GlobalConfigEditorPage({
  definitionKey,
}: GlobalConfigEditorPageProps) {
  const definition = getGlobalConfigEditorDefinition(definitionKey);
  const session = await auth();

  if (!session?.user?.userId || !session.user.tenantId) {
    redirect("/dashboard/login");
  }

  const db = tenantDb(session);
  const variant = await db.variant.findFirst({
    where: {
      key: definition.variantKey,
    },
    select: {
      id: true,
    },
  });

  if (!variant) {
    notFound();
  }

  const response = await getGlobalConfig(variant.id, definition.configKey);

  if (!isGlobalConfigLoadSuccess(response)) {
    const redirectTo = getActionRedirect(response);

    if (redirectTo) {
      redirect(redirectTo);
    }

    throw new Error(getActionErrorMessage(response, "Global config gagal dimuat."));
  }

  return (
    <GlobalConfigEditor
      tenantId={session.user.tenantId}
      variantId={variant.id}
      definitionKey={definitionKey}
      initialData={response.config.dataJson}
      updatedAt={response.config.updatedAt}
    />
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isGlobalConfigLoadSuccess(value: unknown): value is {
  ok: true;
  config: {
    dataJson: Record<string, unknown>;
    updatedAt: string;
  };
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    isRecord(value.config) &&
    isRecord(value.config.dataJson) &&
    typeof value.config.updatedAt === "string"
  );
}

function getActionRedirect(value: unknown) {
  return isRecord(value) && typeof value.redirectTo === "string"
    ? value.redirectTo
    : null;
}

function getActionErrorMessage(value: unknown, fallback: string) {
  if (isRecord(value) && typeof value.error === "string") {
    return value.error;
  }

  return fallback;
}
