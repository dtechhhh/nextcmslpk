import { IdleTracker } from "@/components/auth/idle-tracker";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-full bg-background text-foreground">
      <IdleTracker callbackUrl="/dashboard/login" />
      {children}
    </section>
  );
}
