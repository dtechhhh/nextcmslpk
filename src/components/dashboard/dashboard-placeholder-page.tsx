type DashboardPlaceholderPageProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function DashboardPlaceholderPage({
  eyebrow = "Dashboard",
  title,
  description = "Placeholder page for the tenant dashboard route.",
}: DashboardPlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
      </div>
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        {description}
      </div>
    </div>
  );
}

