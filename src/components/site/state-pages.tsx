export function NotFoundPage() {
  return <StatePage title="Domain tidak ditemukan" description="Situs untuk domain ini belum aktif." />;
}

export function SuspendedPage() {
  return <StatePage title="Situs disuspend" description="Situs ini sedang dinonaktifkan sementara." />;
}

export function UnavailablePage() {
  return <StatePage title="Situs belum tersedia" description="Varian situs ini belum aktif." />;
}

function StatePage({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-neutral-900">
      <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
      </section>
    </main>
  );
}
