import { ContentPageRenderer } from "@/components/site/content-page-renderer";
import type { VariantKey } from "@/types";

type StarterContentPage = {
  title?: string;
  pageKey?: string;
  variantKey?: VariantKey;
  dataJson?: Record<string, unknown>;
  updatedAt?: string;
};

type StarterCollectionItem = {
  title?: string;
  dataJson?: Record<string, unknown>;
  updatedAt?: string;
};

type IndonesiaPageProps = {
  isPreview?: boolean;
  item?: StarterCollectionItem;
  page?: StarterContentPage;
};

function createIndonesiaPage(pageKey: string, fallbackTitle: string) {
  function IndonesiaPage({ isPreview = false, item, page }: IndonesiaPageProps) {
    return (
      <ContentPageRenderer
        isPreview={isPreview}
        page={{
          title: page?.title ?? item?.title ?? fallbackTitle,
          pageKey: page?.pageKey ?? pageKey,
          variantKey: "indonesia",
          dataJson: page?.dataJson ?? item?.dataJson ?? {},
          updatedAt:
            page?.updatedAt ?? item?.updatedAt ?? "1970-01-01T00:00:00.000Z",
        }}
      />
    );
  }

  IndonesiaPage.displayName = `Indonesia${fallbackTitle.replace(/\s/g, "")}`;

  return IndonesiaPage;
}

export const HomePageIndonesia = createIndonesiaPage("homepage", "Home");
export const ProgramPageIndonesia = createIndonesiaPage("program_page", "Program");
export const ProgramDetailIndonesia = createIndonesiaPage(
  "program_detail",
  "Program Detail",
);
export const JobPageIndonesia = createIndonesiaPage("job_page", "Job");
export const JobDetailIndonesia = createIndonesiaPage("job_detail", "Job Detail");
export const BlogPageIndonesia = createIndonesiaPage("blog_page", "Blog");
export const BlogDetailIndonesia = createIndonesiaPage("blog_detail", "Blog Detail");
export const OfferDetailIndonesia = createIndonesiaPage(
  "offer_detail",
  "Offer Detail",
);
export const TentangKamiPageIndonesia = createIndonesiaPage(
  "tentang_kami",
  "Tentang Kami",
);
export const KarirPageIndonesia = createIndonesiaPage("karir_page", "Karir");
export const KarirDetailIndonesia = createIndonesiaPage(
  "karir_detail",
  "Karir Detail",
);
