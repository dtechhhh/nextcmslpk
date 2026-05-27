import {
  generatePublicMetadata,
  renderJapanStaticPage,
  type PageSearchParams,
} from "@/app/site/_public-page-helpers";

export const revalidate = 3600;

export function generateMetadata({ searchParams }: { searchParams: PageSearchParams }) {
  return generatePublicMetadata({
    pageKey: "profil_kandidat",
    path: "/candidate-profile",
    titleFallback: "Candidate Profile",
    searchParams,
  });
}

export default function CandidateProfilePage({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  return renderJapanStaticPage({
    kind: "candidate_profile",
    pageKey: "profil_kandidat",
    path: "/candidate-profile",
    cacheTags: (variantId) => [`page:${variantId}:profil_kandidat`],
    revalidate: 3600,
    searchParams,
  });
}
