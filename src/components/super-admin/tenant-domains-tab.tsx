"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2Icon,
  Loader2Icon,
  PlusIcon,
  PowerIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  emptySensitiveActionCredentials,
  SensitiveActionDialog,
  SensitiveActionFields,
  type SensitiveActionCredentials,
} from "@/components/super-admin/sensitive-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
  createDomain,
  deleteDomain,
  disableDomain,
  setPrimary,
  verifyDomain,
} from "@/server/actions/super-admin/domain";

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

type TenantVariantOption = {
  id: string;
  key: string;
  label: string;
};

type TenantDomain = {
  id: string;
  host: string;
  status: "PENDING" | "ACTIVE" | "DISABLED";
  isPrimary: boolean;
  verifiedAt: string | null;
  variantKey: string;
};

type TenantDomainsTabProps = {
  tenantId: string;
  variants: TenantVariantOption[];
  domains: TenantDomain[];
};

export function TenantDomainsTab({
  tenantId,
  variants,
  domains,
}: TenantDomainsTabProps) {
  const router = useRouter();
  const [host, setHost] = useState("");
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [createCredentials, setCreateCredentials] =
    useState<SensitiveActionCredentials>(emptySensitiveActionCredentials);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedVariant = variants.find((variant) => variant.id === variantId);
  const variantLabelsByKey = new Map(
    variants.map((variant) => [variant.key, variant.label]),
  );

  function handleAddDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createDomain({
        tenantId,
        variantId,
        host,
        ...createCredentials,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setHost("");
      setCreateCredentials(emptySensitiveActionCredentials());
      toast.success("Domain berhasil ditambahkan.");
      router.refresh();
    });
  }

  async function runDomainAction(
    action: (input: {
      tenantId: string;
      domainId: string;
      currentPassword: string;
      totpCode: string;
    }) => Promise<{
      ok: boolean;
      error?: string;
    }>,
    domainId: string,
    credentials: SensitiveActionCredentials,
  ) {
    setError(null);

    const result = await action({ tenantId, domainId, ...credentials });

    if (!result.ok) {
      return {
        ok: false as const,
        error: result.error ?? "Action gagal dijalankan.",
      };
    }

    return {
      ok: true as const,
    };
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="grid gap-3 rounded-lg border p-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
        onSubmit={handleAddDomain}
      >
        <Field className="gap-1.5">
          <FieldLabel htmlFor="domain-host">Host</FieldLabel>
          <Input
            id="domain-host"
            value={host}
            onChange={(event) => setHost(event.target.value)}
            placeholder="www.example.com"
            disabled={isPending}
            required
          />
        </Field>
        <Field className="gap-1.5">
          <FieldLabel>Variant</FieldLabel>
          <Select
            value={variantId}
            onValueChange={(value) => setVariantId(value ?? "")}
            disabled={isPending || variants.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih variant">
                {selectedVariant?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-end">
          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={isPending || variants.length === 0}
          >
            {isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
            Add Domain
          </Button>
        </div>
        {error ? (
          <FieldError className="md:col-span-3">{error}</FieldError>
        ) : null}
        <div className="grid gap-3 md:col-span-3 md:grid-cols-2">
          <SensitiveActionFields
            credentials={createCredentials}
            disabled={isPending}
            idPrefix="create-domain"
            onChange={setCreateCredentials}
          />
        </div>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Host</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>isPrimary</TableHead>
            <TableHead>verifiedAt</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {domains.length > 0 ? (
            domains.map((domain) => (
              <TableRow key={domain.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{domain.host}</span>
                    <span className="text-xs text-muted-foreground">
                      {variantLabelsByKey.get(domain.variantKey) ?? domain.variantKey}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={domain.status === "ACTIVE" ? "secondary" : "outline"}>
                    {domain.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {domain.isPrimary ? (
                    <Badge variant="secondary">true</Badge>
                  ) : (
                    <span className="text-muted-foreground">false</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {domain.verifiedAt
                    ? dateTimeFormatter.format(new Date(domain.verifiedAt))
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    {domain.status === "PENDING" ? (
                      <SensitiveActionDialog
                        title="Verify domain?"
                        description={`${domain.host} akan diaktifkan untuk public site.`}
                        actionLabel="Verify"
                        triggerLabel="Verify"
                        triggerIcon={<CheckCircle2Icon />}
                        triggerSize="sm"
                        disabled={isPending}
                        onConfirm={(credentials) =>
                          runDomainAction(verifyDomain, domain.id, credentials)
                        }
                        onSuccess={() => {
                          toast.success("Domain berhasil diverifikasi.");
                          router.refresh();
                        }}
                      />
                    ) : null}
                    {domain.status === "ACTIVE" && !domain.isPrimary ? (
                      <SensitiveActionDialog
                        title="Set primary domain?"
                        description={`${domain.host} akan menjadi primary domain untuk variant ini.`}
                        actionLabel="Set Primary"
                        triggerLabel="Primary"
                        triggerIcon={<StarIcon />}
                        triggerSize="sm"
                        disabled={isPending}
                        onConfirm={(credentials) =>
                          runDomainAction(setPrimary, domain.id, credentials)
                        }
                        onSuccess={() => {
                          toast.success("Primary domain berhasil diubah.");
                          router.refresh();
                        }}
                      />
                    ) : null}
                    {domain.status === "ACTIVE" ? (
                      <SensitiveActionDialog
                        title="Disable domain?"
                        description={`${domain.host} akan berhenti melayani public site.`}
                        actionLabel="Disable"
                        triggerLabel="Disable"
                        triggerIcon={<PowerIcon />}
                        triggerSize="sm"
                        actionVariant="destructive"
                        disabled={isPending}
                        onConfirm={(credentials) =>
                          runDomainAction(disableDomain, domain.id, credentials)
                        }
                        onSuccess={() => {
                          toast.success("Domain berhasil dinonaktifkan.");
                          router.refresh();
                        }}
                      />
                    ) : null}
                    {domain.status === "PENDING" ? (
                      <SensitiveActionDialog
                        title="Delete domain?"
                        description={`${domain.host} akan dihapus dari tenant ini.`}
                        actionLabel="Delete"
                        triggerLabel="Delete"
                        triggerIcon={<Trash2Icon />}
                        triggerVariant="destructive"
                        triggerSize="sm"
                        actionVariant="destructive"
                        disabled={isPending}
                        onConfirm={(credentials) =>
                          runDomainAction(deleteDomain, domain.id, credentials)
                        }
                        onSuccess={() => {
                          toast.success("Domain berhasil dihapus.");
                          router.refresh();
                        }}
                      />
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Belum ada domain.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
