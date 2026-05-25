import Link from "next/link";

import { Button } from "@/themes/starter/components/ui/Button";
import { Container } from "@/themes/starter/components/ui/Container";

export default function UnavailablePage() {
  return (
    <main className="theme-indonesia fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <Container className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Halaman Tidak Tersedia
          </h1>
          <p className="text-base leading-7 text-neutral-500">
            Konten yang Anda cari saat ini tidak tersedia.
          </p>
        </div>
        <Button render={<Link href="/" />} variant="default">
          Kembali ke Beranda
        </Button>
      </Container>
    </main>
  );
}
