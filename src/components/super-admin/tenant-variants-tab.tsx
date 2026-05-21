"use client";

import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  changeVariantTheme,
  toggleVariantStatus,
} from "@/server/actions/super-admin/tenant";

type TenantVariant = {
  id: string;
  key: string;
  label: string;
  themeKey: string;
  status: "ACTIVE" | "DISABLED";
};

type TenantVariantsTabProps = {
  tenantId: string;
  variants: TenantVariant[];
};

export function TenantVariantsTab({
  tenantId,
  variants,
}: TenantVariantsTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleStatus(variant: TenantVariant) {
    startTransition(async () => {
      const result = await toggleVariantStatus({
        tenantId,
        variantId: variant.id,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(
        result.status === "ACTIVE"
          ? "Variant berhasil diaktifkan."
          : "Variant berhasil dinonaktifkan.",
      );
      router.refresh();
    });
  }

  function handleThemeChange(variant: TenantVariant, themeKey: string | null) {
    if (!themeKey || themeKey === variant.themeKey) {
      return;
    }

    startTransition(async () => {
      const result = await changeVariantTheme({
        tenantId,
        variantId: variant.id,
        themeKey,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Theme variant berhasil diubah.");
      router.refresh();
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Label</TableHead>
          <TableHead>theme_key</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variants.map((variant) => (
          <TableRow key={variant.id}>
            <TableCell className="font-medium">{variant.key}</TableCell>
            <TableCell>{variant.label}</TableCell>
            <TableCell>
              <Select
                value={variant.themeKey}
                onValueChange={(value) => handleThemeChange(variant, value)}
                disabled={isPending}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">starter</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Badge variant={variant.status === "ACTIVE" ? "secondary" : "outline"}>
                {variant.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-3">
                {isPending ? (
                  <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                ) : null}
                <Switch
                  checked={variant.status === "ACTIVE"}
                  onCheckedChange={() => handleToggleStatus(variant)}
                  disabled={isPending}
                  aria-label={`Toggle ${variant.key} status`}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
