import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { PageEditor } from "@/components/dashboard/page-editor";
import {
  getPageEditorDefinition,
  type PageEditorDefinitionKey,
} from "@/lib/page-editor-definitions";
import { getPage } from "@/server/actions/tenant/page";
import { tenantDb } from "@/server/db/tenant-scoped";

type PageEditorPageProps = {
  definitionKey: PageEditorDefinitionKey;
};

export async function PageEditorPage({ definitionKey }: PageEditorPageProps) {
  const definition = getPageEditorDefinition(definitionKey);
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

  const response = await getPage(variant.id, definition.pageKey);

  if (!isPageLoadSuccess(response)) {
    const redirectTo = getActionRedirect(response);

    if (redirectTo) {
      redirect(redirectTo);
    }

    throw new Error(getActionErrorMessage(response, "Page gagal dimuat."));
  }

  return (
    <PageEditor
      tenantId={session.user.tenantId}
      variantId={variant.id}
      definitionKey={definitionKey}
      pageId={response.page.id}
      initialData={response.page.dataJson}
      initialStatus={response.page.status}
      updatedAt={response.page.updatedAt}
    />
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPageLoadSuccess(value: unknown): value is {
  ok: true;
  page: {
    id: string;
    status: "DRAFT" | "PUBLISHED" | "CLOSED" | "FILLED";
    dataJson: Record<string, unknown>;
    updatedAt: string;
  };
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    isRecord(value.page) &&
    typeof value.page.id === "string" &&
    typeof value.page.status === "string" &&
    isRecord(value.page.dataJson) &&
    typeof value.page.updatedAt === "string"
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
