import Link from "next/link";

import { Button } from "@/themes/starter/components/ui/Button";
import { Container } from "@/themes/starter/components/ui/Container";

export default function NotFoundPage() {
  return (
    <main className="theme-indonesia fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <Container className="flex max-w-md flex-col items-center gap-6 text-center">
        <p className="text-8xl font-bold leading-none text-primary-200">404</p>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-base leading-7 text-neutral-500">
            Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          </p>
        </div>
        <Button render={<Link href="/" />} variant="default">
          Kembali ke Beranda
        </Button>
      </Container>
    </main>
  );
}
