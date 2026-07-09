import { cn } from "@/lib/utils";
import type { VariantKey } from "@/types";

type ContentPageRendererProps = {
  isPreview: boolean;
  page: {
    title: string;
    pageKey: string;
    variantKey: VariantKey;
    dataJson: Record<string, unknown>;
    updatedAt: string;
  };
};

export function ContentPageRenderer({ isPreview, page }: ContentPageRendererProps) {
  const hero = toRecord(page.dataJson.hero) ?? {};
  const headline = readString(hero.headline) || page.title;
  const subheadline = readString(hero.subheadline);
  const eyebrowLabel = readString(hero.eyebrow_label);
  const sections = Object.entries(page.dataJson).filter(([key]) => key !== "hero");

  return (
    <main
      className={cn(
        "min-h-screen bg-background text-foreground",
        page.variantKey === "japan" && "font-japanese",
      )}
    >
      {isPreview ? (
        <div className="sticky top-0 z-20 border-b bg-amber-100 px-6 py-3 text-sm font-medium text-amber-950">
          PREVIEW MODE - Konten ini belum dipublish
        </div>
      ) : null}

      <section className="border-b px-6 py-14">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <p className="text-sm font-medium uppercase tracking-normal text-muted-foreground">
            {page.variantKey} / {formatLabel(page.pageKey)}
          </p>
          {eyebrowLabel ? (
            <p className="text-sm font-medium text-primary">{eyebrowLabel}</p>
          ) : null}
          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal">
            {headline}
          </h1>
          {subheadline ? (
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {subheadline}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Updated {formatDateTime(page.updatedAt)}
          </p>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto grid w-full max-w-5xl gap-4">
          {sections.length > 0 ? (
            sections.map(([key, value]) => (
              <section key={key} className="rounded-lg border p-4">
                <h2 className="text-base font-semibold tracking-normal">
                  {formatLabel(key)}
                </h2>
                <div className="mt-3 text-sm leading-6 text-muted-foreground">
                  <ValuePreview value={value} />
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Belum ada section content.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ValuePreview({ value }: { value: unknown }) {
  if (typeof value === "string" || typeof value === "number") {
    return <span>{String(value) || "-"}</span>;
  }

  if (typeof value === "boolean") {
    return <span>{value ? "Enabled" : "Disabled"}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span>-</span>;
    }

    return (
      <ul className="grid gap-2">
        {value.map((item, index) => (
          <li key={index} className="rounded-md bg-muted/50 px-3 py-2">
            <ValuePreview value={item} />
          </li>
        ))}
      </ul>
    );
  }

  const record = toRecord(value);

  if (record) {
    const entries = Object.entries(record);

    if (entries.length === 0) {
      return <span>-</span>;
    }

    return (
      <dl className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, childValue]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-normal text-foreground">
              {formatLabel(key)}
            </dt>
            <dd className="mt-1 break-words">
              <ValuePreview value={childValue} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return <span>-</span>;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
