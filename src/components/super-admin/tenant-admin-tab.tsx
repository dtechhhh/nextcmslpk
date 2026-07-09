"use client";

import Image from "next/image";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CopyIcon,
  KeyRoundIcon,
  Loader2Icon,
  PowerIcon,
  QrCodeIcon,
  RefreshCcwIcon,
  UserPlusIcon,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createTenantAdmin,
  resetPassword,
  resetTotp,
  toggleActive,
} from "@/server/actions/super-admin/user";

type TenantAdmin = {
  id: string;
  username: string;
  isActive: boolean;
  totpVerified: boolean;
  mustChangePassword: boolean;
};

type ProvisioningResult = {
  title: string;
  username?: string;
  temporaryPassword?: string;
  qrCodeDataUri?: string;
};

type TenantAdminTabProps = {
  tenantId: string;
  admins: TenantAdmin[];
};

export function TenantAdminTab({ tenantId, admins }: TenantAdminTabProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [createCredentials, setCreateCredentials] =
    useState<SensitiveActionCredentials>(emptySensitiveActionCredentials);
  const [error, setError] = useState<string | null>(null);
  const [provisioningResult, setProvisioningResult] =
    useState<ProvisioningResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setProvisioningResult(null);

    startTransition(async () => {
      const result = await createTenantAdmin({
        tenantId,
        username,
        ...createCredentials,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setUsername("");
      setCreateCredentials(emptySensitiveActionCredentials());
      setProvisioningResult({
        title: "Tenant admin created",
        username,
        temporaryPassword: result.temporaryPassword,
        qrCodeDataUri: result.qrCodeDataUri,
      });
      toast.success("Tenant admin berhasil dibuat.");
      router.refresh();
    });
  }

  async function handleResetPassword(
    admin: TenantAdmin,
    credentials: SensitiveActionCredentials,
  ) {
    setError(null);
    setProvisioningResult(null);

    const result = await resetPassword({
      tenantId,
      userId: admin.id,
      ...credentials,
    });

    if (!result.ok) {
      return {
        ok: false as const,
        error: result.error,
      };
    }

    setProvisioningResult({
      title: "Temporary password generated",
      username: admin.username,
      temporaryPassword: result.temporaryPassword,
    });

    return {
      ok: true as const,
    };
  }

  async function handleResetTotp(
    admin: TenantAdmin,
    credentials: SensitiveActionCredentials,
  ) {
    setError(null);
    setProvisioningResult(null);

    const result = await resetTotp({
      tenantId,
      userId: admin.id,
      ...credentials,
    });

    if (!result.ok) {
      return {
        ok: false as const,
        error: result.error,
      };
    }

    setProvisioningResult({
      title: "TOTP reset",
      username: admin.username,
      qrCodeDataUri: result.qrCodeDataUri,
    });

    return {
      ok: true as const,
    };
  }

  async function handleToggleActive(
    admin: TenantAdmin,
    credentials: SensitiveActionCredentials,
  ) {
    setError(null);

    const result = await toggleActive({
      tenantId,
      userId: admin.id,
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
      isActive: result.isActive,
    };
  }

  return (
    <div className="flex flex-col gap-4">
      {admins.length === 0 ? (
        <form
          className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          onSubmit={handleCreateAdmin}
        >
          <Field className="gap-1.5">
            <FieldLabel htmlFor="tenant-admin-username">Username</FieldLabel>
            <Input
              id="tenant-admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isPending}
              minLength={3}
              required
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <UserPlusIcon />
              )}
              Create Admin
            </Button>
          </div>
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
            <SensitiveActionFields
              credentials={createCredentials}
              disabled={isPending}
              idPrefix="create-tenant-admin"
              onChange={setCreateCredentials}
            />
          </div>
        </form>
      ) : (
        <div className="rounded-lg border p-3 text-sm text-muted-foreground">
          MVP hanya mendukung 1 tenant admin per tenant.
        </div>
      )}

      {error ? <FieldError>{error}</FieldError> : null}
      {provisioningResult ? (
        <ProvisioningResultPanel result={provisioningResult} />
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>isActive</TableHead>
            <TableHead>totpVerified</TableHead>
            <TableHead>mustChangePassword</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.length > 0 ? (
            admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.username}</TableCell>
                <TableCell>
                  <BooleanBadge value={admin.isActive} />
                </TableCell>
                <TableCell>
                  <BooleanBadge value={admin.totpVerified} />
                </TableCell>
                <TableCell>
                  <BooleanBadge value={admin.mustChangePassword} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <SensitiveActionDialog
                      title="Reset tenant admin password?"
                      description="Password sementara baru akan dibuat dan sesi lama tenant admin akan invalid."
                      actionLabel="Reset Password"
                      triggerLabel="Password"
                      triggerIcon={<KeyRoundIcon />}
                      triggerSize="sm"
                      disabled={isPending}
                      onConfirm={(credentials) => handleResetPassword(admin, credentials)}
                      onSuccess={() => {
                        toast.success("Password tenant admin berhasil direset.");
                        router.refresh();
                      }}
                    />
                    <SensitiveActionDialog
                      title="Reset tenant admin TOTP?"
                      description="QR TOTP baru akan dibuat dan tenant admin perlu setup ulang."
                      actionLabel="Reset TOTP"
                      triggerLabel="TOTP"
                      triggerIcon={<QrCodeIcon />}
                      triggerSize="sm"
                      disabled={isPending}
                      onConfirm={(credentials) => handleResetTotp(admin, credentials)}
                      onSuccess={() => {
                        toast.success("TOTP tenant admin berhasil direset.");
                        router.refresh();
                      }}
                    />
                    <SensitiveActionDialog
                      title={
                        admin.isActive
                          ? "Deactivate tenant admin?"
                          : "Activate tenant admin?"
                      }
                      description={
                        admin.isActive
                          ? "Tenant admin tidak bisa login setelah dinonaktifkan."
                          : "Tenant admin akan bisa login kembali."
                      }
                      actionLabel={admin.isActive ? "Deactivate" : "Activate"}
                      triggerLabel={admin.isActive ? "Deactivate" : "Activate"}
                      triggerIcon={admin.isActive ? <PowerIcon /> : <RefreshCcwIcon />}
                      triggerVariant={admin.isActive ? "destructive" : "outline"}
                      triggerSize="sm"
                      actionVariant={admin.isActive ? "destructive" : "default"}
                      disabled={isPending}
                      onConfirm={(credentials) => handleToggleActive(admin, credentials)}
                      onSuccess={() => {
                        toast.success(
                          admin.isActive
                            ? "Tenant admin berhasil dinonaktifkan."
                            : "Tenant admin berhasil diaktifkan.",
                        );
                        router.refresh();
                      }}
                    />
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
                Belum ada tenant admin.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function BooleanBadge({ value }: { value: boolean }) {
  return (
    <Badge variant={value ? "secondary" : "outline"}>
      {value ? "true" : "false"}
    </Badge>
  );
}

function ProvisioningResultPanel({
  result,
}: {
  result: ProvisioningResult;
}) {
  async function copyPassword() {
    if (!result.temporaryPassword) {
      return;
    }

    await navigator.clipboard.writeText(result.temporaryPassword);
    toast.success("Password disalin.");
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <p className="text-sm font-medium">{result.title}</p>
        {result.username ? (
          <p className="mt-1 text-sm text-muted-foreground">{result.username}</p>
        ) : null}
        {result.temporaryPassword ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={result.temporaryPassword} />
            <Button type="button" variant="outline" onClick={copyPassword}>
              <CopyIcon />
              Copy
            </Button>
          </div>
        ) : null}
      </div>
      {result.qrCodeDataUri ? (
        <div className="flex justify-center rounded-lg border bg-background p-3">
          <Image
            src={result.qrCodeDataUri}
            alt="QR code TOTP tenant admin"
            width={180}
            height={180}
            unoptimized
          />
        </div>
      ) : null}
    </div>
  );
}
