import { Wrench } from "lucide-react";

import { Container } from "@/themes/starter/components/ui/Container";

export default function SuspendedPage() {
  return (
    <main className="theme-indonesia fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <Container className="flex max-w-md flex-col items-center gap-6 text-center">
        <Wrench aria-hidden="true" className="size-16 text-neutral-400" />
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Situs Dalam Pemeliharaan
          </h1>
          <p className="text-base leading-7 text-neutral-500">
            Situs ini sedang dalam pemeliharaan. Silakan coba lagi nanti.
          </p>
        </div>
      </Container>
    </main>
  );
}
