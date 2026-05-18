export default function SuperAdminLayout({
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
