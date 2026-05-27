import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/themes/starter/components/ui/Button";
import { Container } from "@/themes/starter/components/ui/Container";

const copy = {
  indonesia: {
    heading: "Halaman Tidak Ditemukan",
    subtext: "Halaman yang Anda cari tidak tersedia atau telah dipindahkan.",
    cta: "Kembali ke Beranda",
    themeClass: "theme-indonesia",
    fontClass: "",
  },
  japan: {
    heading: "ページが見つかりません",
    subtext: "お探しのページは存在しないか、移動した可能性があります。",
    cta: "ホームに戻る",
    themeClass: "theme-japan",
    fontClass: "font-japanese",
  },
} as const;

type NotFoundPageProps = {
  variantKey?: string;
};

export default function NotFoundPage({ variantKey }: NotFoundPageProps) {
  const key = variantKey === "japan" ? "japan" : "indonesia";
  const c = copy[key];

  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4",
        c.themeClass,
        c.fontClass,
      )}
    >
      <Container className="flex max-w-md flex-col items-center gap-6 text-center">
        <p className="text-8xl font-bold leading-none text-primary-200">404</p>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-neutral-900">
            {c.heading}
          </h1>
          <p className="text-base leading-7 text-neutral-500">{c.subtext}</p>
        </div>
        <Button render={<Link href="/" />} variant="default">
          {c.cta}
        </Button>
      </Container>
    </main>
  );
}
