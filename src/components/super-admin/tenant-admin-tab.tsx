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
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setUsername("");
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

  function handleResetPassword(admin: TenantAdmin) {
    setError(null);
    setProvisioningResult(null);

    startTransition(async () => {
      const result = await resetPassword({
        tenantId,
        userId: admin.id,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setProvisioningResult({
        title: "Temporary password generated",
        username: admin.username,
        temporaryPassword: result.temporaryPassword,
      });
      toast.success("Password tenant admin berhasil direset.");
      router.refresh();
    });
  }

  function handleResetTotp(admin: TenantAdmin) {
    setError(null);
    setProvisioningResult(null);

    startTransition(async () => {
      const result = await resetTotp({
        tenantId,
        userId: admin.id,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setProvisioningResult({
        title: "TOTP reset",
        username: admin.username,
        qrCodeDataUri: result.qrCodeDataUri,
      });
      toast.success("TOTP tenant admin berhasil direset.");
      router.refresh();
    });
  }

  function handleToggleActive(admin: TenantAdmin) {
    setError(null);

    startTransition(async () => {
      const result = await toggleActive({
        tenantId,
        userId: admin.id,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(
        result.isActive
          ? "Tenant admin berhasil diaktifkan."
          : "Tenant admin berhasil dinonaktifkan.",
      );
      router.refresh();
    });
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
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleResetPassword(admin)}
                    >
                      <KeyRoundIcon />
                      Password
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleResetTotp(admin)}
                    >
                      <QrCodeIcon />
                      TOTP
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={admin.isActive ? "destructive" : "outline"}
                      disabled={isPending}
                      onClick={() => handleToggleActive(admin)}
                    >
                      {admin.isActive ? <PowerIcon /> : <RefreshCcwIcon />}
                      {admin.isActive ? "Deactivate" : "Activate"}
                    </Button>
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
