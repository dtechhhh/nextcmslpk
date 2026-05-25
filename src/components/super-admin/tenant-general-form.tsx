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
  emptySensitiveActionCredentials,
  SensitiveActionFields,
  type SensitiveActionCredentials,
} from "@/components/super-admin/sensitive-action";
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

type TenantStatusResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export function TenantGeneralForm({ tenant }: TenantGeneralFormProps) {
  const router = useRouter();
  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);
  const [saveCredentials, setSaveCredentials] =
    useState<SensitiveActionCredentials>(emptySensitiveActionCredentials);
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
        ...saveCredentials,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setSlug(normalizedSlug);
      setSaveCredentials(emptySensitiveActionCredentials());
      toast.success("Tenant berhasil diperbarui.");
      router.refresh();
    });
  }

  async function toggleStatus(
    credentials: SensitiveActionCredentials,
  ): Promise<TenantStatusResult> {
    setError(null);

    const input = {
      id: tenant.id,
      currentPassword: credentials.currentPassword,
      totpCode: credentials.totpCode,
    };

    const result =
      tenant.status === "ACTIVE"
        ? await suspendTenant(input)
        : await activateTenant(input);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
      };
    }

    return {
      ok: true,
    };
  }

  function handleStatusSuccess() {
    toast.success(
      tenant.status === "ACTIVE"
        ? "Tenant berhasil disuspend."
        : "Tenant berhasil diaktifkan.",
    );
    router.refresh();
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
            onSuccess={handleStatusSuccess}
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
        <SensitiveActionFields
          credentials={saveCredentials}
          disabled={isPending}
          idPrefix="tenant-general-save"
          onChange={setSaveCredentials}
        />
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
  onSuccess,
}: {
  status: "ACTIVE" | "SUSPENDED";
  disabled: boolean;
  onConfirm: (credentials: SensitiveActionCredentials) => Promise<TenantStatusResult>;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isActive = status === "ACTIVE";

  function resetFields() {
    setCurrentPassword("");
    setTotpCode("");
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      resetFields();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const credentials = {
      currentPassword,
      totpCode,
    };

    startTransition(async () => {
      const result = await onConfirm(credentials);

      if (!result.ok) {
        setError(result.error);
        setTotpCode("");
        return;
      }

      setOpen(false);
      resetFields();
      onSuccess();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<Button type="button" variant="outline" disabled={disabled} />}>
        {isActive ? "Suspend" : "Activate"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
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

          <FieldGroup className="py-2">
            <Field>
              <FieldLabel htmlFor="tenant-status-password">
                Password super admin
              </FieldLabel>
              <Input
                id="tenant-status-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={isPending}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="tenant-status-totp">Kode TOTP</FieldLabel>
              <Input
                id="tenant-status-totp"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(event) =>
                  setTotpCode(event.target.value.replace(/\D/g, ""))
                }
                disabled={isPending}
                required
              />
              <FieldDescription>
                Masukkan 6 digit dari authenticator super admin.
              </FieldDescription>
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
          </FieldGroup>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              variant={isActive ? "destructive" : "default"}
              disabled={isPending}
            >
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isActive ? "Suspend" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
