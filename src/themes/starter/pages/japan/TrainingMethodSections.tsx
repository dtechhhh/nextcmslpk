import Image from "next/image";

import { Check } from "lucide-react";

import { FALLBACK_ICON, ICON_REGISTRY, type IconKey } from "@/lib/icon-registry";
import { cn } from "@/lib/utils";
import { resolveMediaUrl, type PublicJson } from "@/server/resolvers/public";
import { Badge } from "@/themes/starter/components/ui/Badge";
import { Container } from "@/themes/starter/components/ui/Container";
import { DocumentDownload } from "@/themes/starter/components/sections/DocumentDownload";

type SectionProps = { config: PublicJson };

export function TrainingRiskSection({ config }: SectionProps) {
  const items = sortedRecords(config.items).filter(
    (item) => enabled(item) && (text(item.title) || text(item.description)),
  );

  if (!hasHeader(config) && items.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <SectionHeader config={config} />
        {items.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const Icon = iconFor(item.icon_key, "shield_alert");
              return (
                <article
                  key={`${text(item.title)}-${index}`}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 p-6"
                >
                  <Icon aria-hidden="true" className="size-6 text-primary-500" />
                  <h3 className="mt-5 text-lg font-bold text-neutral-950">{text(item.title)}</h3>
                  {text(item.description) ? (
                    <p className="mt-3 text-sm leading-7 text-neutral-600">
                      {text(item.description)}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

export function TrainingProgramOverview({ config }: SectionProps) {
  const stats = sortedRecords(config.stats).filter(
    (item) => enabled(item) && (text(item.value) || text(item.label)),
  );
  const stages = sortedRecords(config.stages).filter(
    (item) => enabled(item) && (text(item.title) || text(item.description)),
  );

  if (!hasHeader(config) && stats.length === 0 && stages.length === 0) return null;

  return (
    <section id="training-program" className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        <SectionHeader config={config} />
        {stats.length > 0 ? (
          <div className="mt-10 grid border-y border-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item, index) => {
              const Icon = iconFor(item.icon_key, "clock");
              return (
                <div
                  key={`${text(item.label)}-${index}`}
                  className="flex min-h-36 flex-col justify-center border-b border-neutral-200 px-5 py-6 sm:border-r lg:border-b-0"
                >
                  <Icon aria-hidden="true" className="size-5 text-primary-500" />
                  <p className="mt-4 text-2xl font-bold text-neutral-950">{text(item.value)}</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{text(item.label)}</p>
                </div>
              );
            })}
          </div>
        ) : null}

        {stages.length > 0 ? (
          <ol className="mt-12 grid gap-8 lg:grid-cols-4 lg:gap-5">
            {stages.map((item, index) => {
              const Icon = iconFor(item.icon_key, "clipboard_check");
              return (
                <li key={`${text(item.title)}-${index}`} className="relative flex gap-4 lg:block">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 lg:mt-5">
                    <Icon aria-hidden="true" className="size-6 text-primary-500" />
                    {text(item.step_label) ? (
                      <p className="mt-4 text-xs font-semibold uppercase tracking-normal text-primary-600">
                        {text(item.step_label)}
                      </p>
                    ) : null}
                    <h3 className="mt-2 text-lg font-bold text-neutral-950">{text(item.title)}</h3>
                    {text(item.description) ? (
                      <p className="mt-3 text-sm leading-7 text-neutral-600">
                        {text(item.description)}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}
      </Container>
    </section>
  );
}

export function TrainingSectorModules({ config }: SectionProps) {
  const items = sortedRecords(config.items).filter(
    (item) => enabled(item) && (text(item.title) || text(item.description)),
  );

  if (!hasHeader(config) && items.length === 0) return null;

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        <SectionHeader config={config} />
        {items.length > 0 ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {items.map((item, index) => {
              const Icon = iconFor(item.icon_key, "briefcase");
              const focusItems = stringList(item.focus_items);
              return (
                <article
                  key={`${text(item.title)}-${index}`}
                  className="rounded-lg border border-neutral-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-5">
                    <Icon aria-hidden="true" className="size-7 shrink-0 text-primary-500" />
                    {text(item.sector_label) ? (
                      <Badge variant="outline">{text(item.sector_label)}</Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-neutral-950">{text(item.title)}</h3>
                  {text(item.description) ? (
                    <p className="mt-3 text-sm leading-7 text-neutral-600">
                      {text(item.description)}
                    </p>
                  ) : null}
                  {focusItems.length > 0 ? (
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {focusItems.map((focus) => (
                        <li key={focus} className="flex gap-2 text-sm leading-6 text-neutral-700">
                          <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary-500" />
                          <span>{focus}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

export function TrainingReadinessStandards({ config }: SectionProps) {
  const criteria = sortedRecords(config.criteria).filter(
    (item) => enabled(item) && text(item.competency_label),
  );

  if (!hasHeader(config) && criteria.length === 0) return null;

  return (
    <section id="readiness-standards" className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <SectionHeader config={config} />
        {criteria.length > 0 ? (
          <div className="mt-10 overflow-hidden rounded-lg border border-neutral-200">
            <div className="hidden grid-cols-[0.8fr_1fr_1fr_1fr] gap-5 bg-neutral-100 px-5 py-4 text-xs font-semibold text-neutral-600 lg:grid">
              <span>評価項目</span>
              <span>評価方法</span>
              <span>合格基準・記録</span>
              <span>未達時の対応</span>
            </div>
            <div className="divide-y divide-neutral-200">
              {criteria.map((item, index) => (
                <article
                  key={`${text(item.competency_label)}-${index}`}
                  className="grid gap-5 bg-white px-5 py-6 lg:grid-cols-[0.8fr_1fr_1fr_1fr]"
                >
                  <h3 className="font-bold text-neutral-950">{text(item.competency_label)}</h3>
                  <MatrixCell label="評価方法" value={text(item.assessment_method)} />
                  <div>
                    <MatrixCell label="合格基準" value={text(item.pass_standard)} />
                    {text(item.evidence_label) ? (
                      <p className="mt-3 text-xs leading-5 text-neutral-500">
                        記録: {text(item.evidence_label)}
                      </p>
                    ) : null}
                  </div>
                  <MatrixCell label="未達時の対応" value={text(item.failure_action)} />
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

export function TrainingQualityGates({ config }: SectionProps) {
  const items = sortedRecords(config.items).filter(
    (item) => enabled(item) && (text(item.title) || text(item.stage_label)),
  );

  if (!hasHeader(config) && items.length === 0 && !text(config.governance_note)) return null;

  return (
    <section className="bg-primary-700 py-16 text-white md:py-20 lg:py-24">
      <Container>
        <SectionHeader config={config} inverse />
        {items.length > 0 ? (
          <ol className="mt-10 grid gap-4 lg:grid-cols-2">
            {items.map((item, index) => (
              <li
                key={`${text(item.title)}-${index}`}
                className="rounded-lg border border-white/15 bg-white/10 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <Badge variant="neutral">{text(item.stage_label) || `Gate ${index + 1}`}</Badge>
                  <span className="text-3xl font-bold text-white/20">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold">{text(item.title)}</h3>
                <QualityRow label="確認方法" value={text(item.assessment_method)} />
                <QualityRow label="次工程への条件" value={text(item.pass_standard)} />
                <QualityRow label="保存記録" value={text(item.evidence_label)} />
                <QualityRow label="未達時" value={text(item.failure_action)} accent />
              </li>
            ))}
          </ol>
        ) : null}
        {text(config.governance_note) ? (
          <p className="mt-8 border-l-2 border-red-300 pl-5 text-sm leading-7 text-white/75">
            {text(config.governance_note)}
          </p>
        ) : null}
      </Container>
    </section>
  );
}

export async function TrainingPartnerReport({ config }: SectionProps) {
  const deliverables = stringList(config.deliverables);
  const imageSrc = await resolveMediaUrl(text(config.image_id));
  const documentUrl =
    text(config.sample_document_url) ||
    (await resolveMediaUrl(text(config.sample_document_file_id))) ||
    "";

  if (!hasHeader(config) && deliverables.length === 0 && !imageSrc && !documentUrl) return null;

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-center">
          <div>
            <SectionHeader config={config} align="left" />
            {deliverables.length > 0 ? (
              <ul className="mt-7 space-y-3">
                {deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-neutral-700">
                    <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {documentUrl ? (
              <div className="mt-8">
                <DocumentDownload
                  label={text(config.sample_document_label) || "評価レポート例を見る"}
                  fileUrl={documentUrl}
                  fallbackLabel="評価レポート例を見る"
                />
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            {imageSrc ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={imageSrc}
                  alt={text(config.headline)}
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
                  <div>
                    <p className="text-xs font-semibold text-primary-600">CANDIDATE READINESS REPORT</p>
                    <p className="mt-2 text-lg font-bold text-neutral-950">企業面接前 評価サマリー</p>
                  </div>
                  <Badge variant="success">確認済み</Badge>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {(deliverables.length > 0
                    ? deliverables.slice(0, 4)
                    : ["日本語学習状況", "出席・規律", "実技・安全確認", "面談所見"]
                  ).map((item, index) => (
                    <div key={item} className="border-l-2 border-primary-300 pl-4">
                      <p className="text-xs text-neutral-500">0{index + 1}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-neutral-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function TrainingEvidence({ config }: SectionProps) {
  const stats = sortedRecords(config.stats).filter(
    (item) => enabled(item) && (text(item.value) || text(item.label)),
  );

  if (!hasHeader(config) && stats.length === 0 && !text(config.methodology_note)) return null;

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        <SectionHeader config={config} />
        {stats.length > 0 ? (
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item, index) => {
              const Icon = iconFor(item.icon_key, "file_check");
              return (
                <div key={`${text(item.label)}-${index}`} className="bg-white p-6">
                  <Icon aria-hidden="true" className="size-6 text-primary-500" />
                  <p className="mt-5 text-3xl font-bold text-neutral-950">{text(item.value)}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{text(item.label)}</p>
                </div>
              );
            })}
          </div>
        ) : null}
        {text(config.source_label) || text(config.period_label) || text(config.methodology_note) ? (
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5 text-sm leading-6 text-neutral-600">
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-medium text-neutral-800">
              {text(config.source_label) ? <span>出典: {text(config.source_label)}</span> : null}
              {text(config.period_label) ? <span>対象期間: {text(config.period_label)}</span> : null}
            </div>
            {text(config.methodology_note) ? (
              <p className="mt-3">{text(config.methodology_note)}</p>
            ) : null}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function SectionHeader({
  config,
  inverse = false,
  align = "center",
}: {
  config: PublicJson;
  inverse?: boolean;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {text(config.eyebrow_label) ? (
        <p
          className={cn(
            "text-sm font-semibold uppercase tracking-normal",
            inverse ? "text-white/65" : "text-primary-500",
          )}
        >
          {text(config.eyebrow_label)}
        </p>
      ) : null}
      {text(config.headline) ? (
        <h2
          className={cn(
            "mt-3 text-3xl font-bold leading-tight md:text-4xl",
            inverse ? "text-white" : "text-neutral-950",
          )}
        >
          {text(config.headline)}
        </h2>
      ) : null}
      {text(config.description) ? (
        <p
          className={cn(
            "mt-5 text-base leading-8 md:text-lg",
            inverse ? "text-white/75" : "text-neutral-600",
          )}
        >
          {text(config.description)}
        </p>
      ) : null}
    </div>
  );
}

function MatrixCell({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-neutral-500 lg:hidden">{label}</p>
      <p className="text-sm leading-6 text-neutral-700">{value}</p>
    </div>
  );
}

function QualityRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  if (!value) return null;
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="text-xs font-semibold text-white/50">{label}</p>
      <p className={cn("mt-1 text-sm leading-6", accent ? "text-red-200" : "text-white/80")}>
        {value}
      </p>
    </div>
  );
}

function hasHeader(config: PublicJson) {
  return Boolean(text(config.eyebrow_label) || text(config.headline) || text(config.description));
}

function iconFor(value: unknown, fallback: IconKey) {
  const key = text(value) as IconKey;
  return ICON_REGISTRY[key] ?? ICON_REGISTRY[fallback] ?? FALLBACK_ICON;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function enabled(value: PublicJson) {
  return typeof value.is_enabled === "boolean" ? value.is_enabled : true;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function sortedRecords(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is PublicJson => typeof item === "object" && item !== null && !Array.isArray(item))
        .sort((a, b) => numberValue(a.sort_order) - numberValue(b.sort_order))
    : [];
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}
