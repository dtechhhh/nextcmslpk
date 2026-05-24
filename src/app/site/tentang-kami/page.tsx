import {
  generatePublicMetadata,
  loadPublicPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";
import {
  ContentBlocks,
  type ContentBlockType,
} from "@/themes/starter/components/sections/ContentBlocks";
import { Container } from "@/themes/starter/components/ui/Container";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "tentang_kami",
    path: "/tentang-kami",
    titleFallback: "Tentang Kami",
    searchParams,
  });
}

export default async function TentangKamiPage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const { page, isPreview } = await loadPublicPage({
    pageKey: "tentang_kami",
    path: "/tentang-kami",
    cacheTags: (variantId) => [`page:${variantId}:tentang_kami`],
    revalidate: 3600,
    searchParams,
  });

  if (!page) {
    notFound();
  }

  const blocks = Array.isArray(page.dataJson.blocks) ? page.dataJson.blocks : [];

  return (
    <>
      {isPreview ? (
        <div className="sticky top-0 z-50 bg-amber-100 px-4 py-3 text-center text-sm font-semibold text-amber-950">
          Preview mode - konten draft, tidak di-cache
        </div>
      ) : null}
      <section className="bg-neutral-950 py-20 text-white">
        <Container>
          <h1 className="text-4xl font-bold md:text-5xl">{page.title}</h1>
        </Container>
      </section>
      <section className="py-16">
        <Container>
          <ContentBlocks
            variant="indonesia"
            blocks={blocks.map((block, index) => ({
              type: readBlockType(block),
              sortOrder: readSortOrder(block, index),
              data: readBlockData(block),
            }))}
          />
        </Container>
      </section>
    </>
  );
}

function readBlockType(value: unknown): ContentBlockType {
  return isRecord(value) && isContentBlockType(value.type) ? value.type : "paragraph";
}

function readSortOrder(value: unknown, fallback: number) {
  return isRecord(value) && typeof value.sortOrder === "number" ? value.sortOrder : fallback;
}

function readBlockData(value: unknown) {
  return isRecord(value) && isRecord(value.data) ? value.data : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContentBlockType(value: unknown): value is ContentBlockType {
  return (
    value === "heading" ||
    value === "paragraph" ||
    value === "quote" ||
    value === "image" ||
    value === "youtube_embed" ||
    value === "offer_callout" ||
    value === "whatsapp_cta" ||
    value === "line_cta" ||
    value === "sector_callout"
  );
}
