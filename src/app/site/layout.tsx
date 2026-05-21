import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { resolvePublicDomainByHost } from "@/server/resolvers/domain";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = (await headers()).get("host") ?? "";
  const domain = await resolvePublicDomainByHost(host);

  if (domain.status === "suspended") {
    return <SuspendedPage host={domain.host} tenantName={domain.tenantName} />;
  }

  if (domain.status === "disabled") {
    notFound();
  }

  return (
    <section className="min-h-full bg-background text-foreground">
      {children}
    </section>
  );
}

function SuspendedPage({
  host,
  tenantName,
}: {
  host: string;
  tenantName: string;
}) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md rounded-lg border p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">{host}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">
          Tenant Suspended
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {tenantName} sedang disuspend sementara.
        </p>
      </div>
    </section>
  );
}
