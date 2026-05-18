export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-full bg-background text-foreground">
      {children}
    </section>
  );
}
