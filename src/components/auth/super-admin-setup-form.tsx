"use client";

import { FormEvent, useState, useTransition } from "react";
import Image from "next/image";
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
  completeSuperAdminSetupAction,
  startSuperAdminSetupAction,
} from "@/server/actions/auth";

export function SuperAdminSetupForm() {
  const [setupSecret, setSetupSecret] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [qrCodeDataUri, setQrCodeDataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      setupSecret,
      username,
      password,
    };

    startTransition(async () => {
      const result = await startSuperAdminSetupAction(payload);

      if (!result.ok) {
        setError(result.error ?? "Data setup tidak valid.");
        return;
      }

      if (!result.setupToken || !result.qrCodeDataUri) {
        setError("Data setup tidak valid.");
        return;
      }

      setSetupToken(result.setupToken);
      setQrCodeDataUri(result.qrCodeDataUri);
      setSetupSecret("");
      setUsername("");
      setPassword("");
    });
  }

  function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!setupToken) {
      setError("Data setup tidak valid.");
      return;
    }

    const code = totpCode;
    setTotpCode("");

    startTransition(async () => {
      const result = await completeSuperAdminSetupAction({
        setupToken,
        totpCode: code,
      });

      if (!result.ok) {
        setError(result.error ?? "Setup tidak tersedia.");
        return;
      }

      setSetupToken(null);
      setQrCodeDataUri(null);
      window.location.replace(result.redirectTo ?? "/super-admin/login");
    });
  }

  if (setupToken && qrCodeDataUri) {
    return (
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <CardTitle>Verifikasi TOTP</CardTitle>
          <CardDescription>Scan QR lalu masukkan kode 6 digit.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify}>
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
                <FieldLabel htmlFor="totpCode">Kode TOTP</FieldLabel>
                <Input
                  id="totpCode"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={totpCode}
                  onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, ""))}
                  disabled={isPending}
                  required
                />
              </Field>
              {error ? <FieldError>{error}</FieldError> : null}
              {isPending ? (
                <FieldDescription role="status" aria-live="polite">
                  Memverifikasi kode TOTP...
                </FieldDescription>
              ) : null}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2Icon className="animate-spin" /> : null}
                {isPending ? "Memverifikasi..." : "Selesaikan setup"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-lg">
      <CardHeader>
        <CardTitle>Setup Super Admin</CardTitle>
        <CardDescription>Buat akun pertama untuk konsol super admin.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="setupSecret">Setup secret</FieldLabel>
              <Input
                id="setupSecret"
                type="password"
                value={setupSecret}
                onChange={(event) => setSetupSecret(event.target.value)}
                disabled={isPending}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isPending}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                minLength={12}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPending}
                required
              />
              <FieldDescription>Minimal 12 karakter.</FieldDescription>
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
            {isPending ? (
              <FieldDescription role="status" aria-live="polite">
                Membuat QR TOTP...
              </FieldDescription>
            ) : null}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {isPending ? "Membuat QR..." : "Generate TOTP"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
