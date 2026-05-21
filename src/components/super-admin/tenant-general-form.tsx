"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { generateSlug } from "@/lib/slugify";
import {
  activateTenant,
  checkTenantSlugAvailability,
  suspendTenant,
  updateTenant,
} from "@/server/actions/super-admin/tenant";

type TenantGeneralFormProps = {
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: "ACTIVE" | "SUSPENDED";
    domainCount: number;
  };
};

export function TenantGeneralForm({ tenant }: TenantGeneralFormProps) {
  const router = useRouter();
  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const normalizedSlug = generateSlug(slug);
      const availability = await checkTenantSlugAvailability({
        slug: normalizedSlug,
        excludeTenantId: tenant.id,
      });

      if (!availability.ok) {
        setError(availability.error);
        return;
      }

      if (!availability.available) {
        setError("Slug sudah digunakan.");
        return;
      }

      const result = await updateTenant({
        id: tenant.id,
        name,
        slug: normalizedSlug,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setSlug(normalizedSlug);
      toast.success("Tenant berhasil diperbarui.");
      router.refresh();
    });
  }

  function toggleStatus() {
    setError(null);

    startTransition(async () => {
      const result =
        tenant.status === "ACTIVE"
          ? await suspendTenant({ id: tenant.id })
          : await activateTenant({ id: tenant.id });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(
        tenant.status === "ACTIVE"
          ? "Tenant berhasil disuspend."
          : "Tenant berhasil diaktifkan.",
      );
      router.refresh();
    });
  }

  const isSlugImmutable = tenant.domainCount > 0;
  const hasLockedSlugChange = isSlugImmutable && slug !== tenant.slug;

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex items-center justify-between gap-3">
          <Badge variant={tenant.status === "ACTIVE" ? "secondary" : "destructive"}>
            {tenant.status}
          </Badge>
          <StatusDialog
            status={tenant.status}
            disabled={isPending}
            onConfirm={toggleStatus}
          />
        </div>

        <Field>
          <FieldLabel htmlFor="tenant-name">Name</FieldLabel>
          <Input
            id="tenant-name"
            value={name}
            minLength={3}
            onChange={(event) => setName(event.target.value)}
            disabled={isPending}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="tenant-slug">Slug</FieldLabel>
          <Input
            id="tenant-slug"
            value={slug}
            onChange={(event) => setSlug(generateSlug(event.target.value))}
            disabled={isPending || isSlugImmutable}
            aria-invalid={hasLockedSlugChange || undefined}
            required
          />
          {isSlugImmutable ? (
            <FieldDescription>
              Slug terkunci setelah tenant memiliki domain.
            </FieldDescription>
          ) : null}
        </Field>

        {hasLockedSlugChange ? (
          <FieldError>Slug tidak bisa diubah setelah domain ditambahkan.</FieldError>
        ) : null}
        {error ? <FieldError>{error}</FieldError> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || hasLockedSlugChange}>
            {isPending ? <Loader2Icon className="animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

function StatusDialog({
  status,
  disabled,
  onConfirm,
}: {
  status: "ACTIVE" | "SUSPENDED";
  disabled: boolean;
  onConfirm: () => void;
}) {
  const isActive = status === "ACTIVE";

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant="outline" disabled={disabled} />}>
        {isActive ? "Suspend" : "Activate"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? "Suspend tenant?" : "Activate tenant?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? "Tenant admin akan perlu login ulang dan domain publik menampilkan status suspended."
              : "Domain publik tenant akan kembali melayani konten aktif."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={isActive ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {isActive ? "Suspend" : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
