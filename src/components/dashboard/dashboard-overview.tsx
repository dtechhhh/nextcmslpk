"use client";

import Link from "next/link";
import { ExternalLinkIcon, FilePlusIcon, HomeIcon } from "lucide-react";

import { VariantTabs } from "@/components/dashboard/tenant-dashboard-shell";
import { useDashboardVariant } from "@/components/dashboard/variant-context";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardOverviewData } from "@/server/services/tenant-dashboard";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function DashboardOverview({ data }: { data: DashboardOverviewData }) {
  const { activeVariant } = useDashboardVariant();
  const variant =
    data.variants.find((item) => item.key === activeVariant) ?? data.variants[0];

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            Dashboard Overview
          </p>
          <h1 className="text-2xl font-semibold tracking-normal">
            {data.tenantName} content workspace
          </h1>
        </div>
        <VariantTabs />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {variant.stats.map((stat) => (
          <Card key={stat.label} className="rounded-lg">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>{variant.label} workflow shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {variant.quickActions.map((action, index) => (
              <QuickAction key={action.label} action={action} index={index} />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Recent Changes</CardTitle>
            <CardDescription>
              Last 5 content updates by {data.username}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {variant.recentChanges.length > 0 ? (
              <div className="flex flex-col divide-y">
                {variant.recentChanges.map((change) => (
                  <div
                    key={change.id}
                    className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate font-medium">{change.title}</p>
                        {change.status ? (
                          <Badge variant="outline">{change.status}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {change.type}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(change.updatedAt))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No recent changes for this variant yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function QuickAction({
  action,
  index,
}: {
  action: DashboardOverviewData["variants"][number]["quickActions"][number];
  index: number;
}) {
  const Icon = index === 0 ? HomeIcon : index === 1 ? FilePlusIcon : ExternalLinkIcon;

  if (!action.href) {
    return (
      <span
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-auto min-h-9 justify-start opacity-60",
        )}
        aria-disabled="true"
      >
        <Icon />
        {action.label}
      </span>
    );
  }

  return (
    <Link
      href={action.href}
      target={action.external ? "_blank" : undefined}
      rel={action.external ? "noreferrer" : undefined}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "h-auto min-h-9 justify-start",
      )}
    >
      <Icon />
      {action.label}
    </Link>
  );
}

