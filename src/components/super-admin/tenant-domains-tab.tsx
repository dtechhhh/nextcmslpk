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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAddDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createDomain({
        tenantId,
        variantId,
        host,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setHost("");
      toast.success("Domain berhasil ditambahkan.");
      router.refresh();
    });
  }

  function runDomainAction(
    action: (input: { tenantId: string; domainId: string }) => Promise<{
      ok: boolean;
      error?: string;
    }>,
    domainId: string,
    successMessage: string,
  ) {
    setError(null);

    startTransition(async () => {
      const result = await action({ tenantId, domainId });

      if (!result.ok) {
        setError(result.error ?? "Action gagal dijalankan.");
        toast.error(result.error ?? "Action gagal dijalankan.");
        return;
      }

      toast.success(successMessage);
      router.refresh();
    });
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
              <SelectValue placeholder="Pilih variant" />
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
                      {domain.variantKey}
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
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          runDomainAction(
                            verifyDomain,
                            domain.id,
                            "Domain berhasil diverifikasi.",
                          )
                        }
                      >
                        <CheckCircle2Icon />
                        Verify
                      </Button>
                    ) : null}
                    {domain.status === "ACTIVE" && !domain.isPrimary ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          runDomainAction(
                            setPrimary,
                            domain.id,
                            "Primary domain berhasil diubah.",
                          )
                        }
                      >
                        <StarIcon />
                        Primary
                      </Button>
                    ) : null}
                    {domain.status === "ACTIVE" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          runDomainAction(
                            disableDomain,
                            domain.id,
                            "Domain berhasil dinonaktifkan.",
                          )
                        }
                      >
                        <PowerIcon />
                        Disable
                      </Button>
                    ) : null}
                    {domain.status === "PENDING" ? (
                      <DeleteDomainDialog
                        disabled={isPending}
                        host={domain.host}
                        onConfirm={() =>
                          runDomainAction(
                            deleteDomain,
                            domain.id,
                            "Domain berhasil dihapus.",
                          )
                        }
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

function DeleteDomainDialog({
  disabled,
  host,
  onConfirm,
}: {
  disabled: boolean;
  host: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" size="sm" variant="destructive" disabled={disabled} />
        }
      >
        <Trash2Icon />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete domain?</AlertDialogTitle>
          <AlertDialogDescription>
            {host} akan dihapus dari tenant ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
