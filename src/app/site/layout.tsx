import { headers } from "next/headers";

export default async function SiteLayout() {
  const host = (await headers()).get("host") ?? "";

  return (
    <section className="flex min-h-full items-center justify-center bg-background px-6 text-foreground">
      <p className="text-lg font-medium">Public Site — {host}</p>
    </section>
  );
}
