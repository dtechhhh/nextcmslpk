import { IdleTracker } from "@/components/auth/idle-tracker";

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-full bg-background text-foreground">
      <IdleTracker callbackUrl="/super-admin/login" />
      {children}
    </section>
  );
}
