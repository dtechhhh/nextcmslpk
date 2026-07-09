"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  toggleVariantStatus,
} from "@/server/actions/super-admin/tenant";
import { SensitiveActionDialog } from "@/components/super-admin/sensitive-action";

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

  async function handleToggleStatus(
    variant: TenantVariant,
    credentials: { currentPassword: string; totpCode: string },
  ) {
    const result = await toggleVariantStatus({
        tenantId,
        variantId: variant.id,
      ...credentials,
    });

    if (!result.ok) {
      return {
        ok: false as const,
        error: result.error,
      };
    }

    return {
      ok: true as const,
      status: result.status,
    };
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
                disabled
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
                <SensitiveActionDialog
                  title={
                    variant.status === "ACTIVE"
                      ? "Disable variant?"
                      : "Activate variant?"
                  }
                  description={
                    variant.status === "ACTIVE"
                      ? "Public domain untuk variant ini akan berhenti melayani konten."
                      : "Public domain untuk variant ini akan kembali melayani konten."
                  }
                  actionLabel={variant.status === "ACTIVE" ? "Disable" : "Activate"}
                  triggerLabel={variant.status === "ACTIVE" ? "Disable" : "Activate"}
                  triggerVariant={variant.status === "ACTIVE" ? "destructive" : "outline"}
                  triggerSize="sm"
                  actionVariant={variant.status === "ACTIVE" ? "destructive" : "default"}
                  onConfirm={(credentials) => handleToggleStatus(variant, credentials)}
                  onSuccess={() => {
                    toast.success(
                      variant.status === "ACTIVE"
                        ? "Variant berhasil dinonaktifkan."
                        : "Variant berhasil diaktifkan.",
                    );
                    router.refresh();
                  }}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
