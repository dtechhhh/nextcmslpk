"use client";

import { FormEvent, useState, useTransition } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  changeSuperAdminPassword,
  startSuperAdminTotpReset,
  verifySuperAdminTotpReset,
} from "@/server/actions/super-admin/account";

const SUPER_ADMIN_LOGIN_URL = "/super-admin/login";

export function SuperAdminAccountSecurityForms() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChangeSuperAdminPasswordForm />
      <ResetSuperAdminTotpForm />
    </div>
  );
}

function ChangeSuperAdminPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await changeSuperAdminPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!result.ok) {
        setError(result.error ?? "Password gagal diubah.");

        if (result.redirectTo) {
          await forceLogout(result.redirectTo);
        }

        return;
      }

      await forceLogout(result.redirectTo);
    });
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Setelah tersimpan, sesi saat ini akan ditutup otomatis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="superAdminCurrentPassword">
                Current password
              </FieldLabel>
              <Input
                id="superAdminCurrentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={isPending}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="superAdminNewPassword">New password</FieldLabel>
              <Input
                id="superAdminNewPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={isPending}
                required
              />
              <FieldDescription>Minimal 12 karakter.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="superAdminConfirmPassword">
                Confirm password
              </FieldLabel>
              <Input
                id="superAdminConfirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isPending}
                required
              />
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              Simpan dan logout
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function ResetSuperAdminTotpForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [qrCodeDataUri, setQrCodeDataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStartReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await startSuperAdminTotpReset({ currentPassword });

      if (!result.ok) {
        setError(result.error ?? "Reset TOTP gagal dimulai.");

        if (result.redirectTo) {
          await forceLogout(result.redirectTo);
        }

        return;
      }

      setResetToken(result.resetToken);
      setQrCodeDataUri(result.qrCodeDataUri);
      setCurrentPassword("");
      setTotpCode("");
    });
  }

  function handleVerifyReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resetToken) {
      setError("Reset TOTP belum dimulai.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await verifySuperAdminTotpReset({
        resetToken,
        totpCode,
      });

      if (!result.ok) {
        setError(result.error ?? "Reset TOTP gagal diverifikasi.");

        if (result.redirectTo) {
          await forceLogout(result.redirectTo);
        }

        return;
      }

      await forceLogout(result.redirectTo);
    });
  }

  if (resetToken && qrCodeDataUri) {
    return (
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Verify New TOTP</CardTitle>
          <CardDescription>
            Scan QR baru, lalu masukkan kode 6 digit dari authenticator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyReset}>
            <FieldGroup>
              <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
                <Image
                  src={qrCodeDataUri}
                  alt="QR code TOTP super admin"
                  width={240}
                  height={240}
                  unoptimized
                />
              </div>
              <Field>
                <FieldLabel htmlFor="superAdminTotpCode">TOTP code</FieldLabel>
                <Input
                  id="superAdminTotpCode"
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
              </Field>
              {error ? <FieldError>{error}</FieldError> : null}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2Icon className="animate-spin" /> : null}
                  Verifikasi dan logout
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setResetToken(null);
                    setQrCodeDataUri(null);
                    setTotpCode("");
                    setError(null);
                  }}
                >
                  Batal
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Reset TOTP</CardTitle>
        <CardDescription>
          Konfirmasi password untuk membuat QR TOTP baru.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStartReset}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="superAdminTotpPassword">
                Current password
              </FieldLabel>
              <Input
                id="superAdminTotpPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={isPending}
                required
              />
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              Generate QR baru
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

async function forceLogout(callbackUrl = SUPER_ADMIN_LOGIN_URL) {
  try {
    await signOut({ redirect: false });
  } catch {
    // Continue to the login screen even if the client sign-out request fails.
  }

  window.location.replace(callbackUrl);
}
