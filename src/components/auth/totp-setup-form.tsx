"use client";

import { FormEvent, useState, useTransition } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { verifyTOTPSetupAction } from "@/server/actions/auth";

type TOTPSetupFormProps = {
  qrCodeDataUri: string;
};

export function TOTPSetupForm({ qrCodeDataUri }: TOTPSetupFormProps) {
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const code = totpCode;
    setTotpCode("");

    startTransition(async () => {
      const result = await verifyTOTPSetupAction({ totpCode: code });

      if (!result.ok) {
        setError(result.error ?? "Kode TOTP tidak valid.");

        if (result.redirectTo) {
          window.location.replace(result.redirectTo);
        }

        return;
      }

      window.location.replace(result.redirectTo ?? "/dashboard");
    });
  }

  return (
    <Card className="w-full max-w-md rounded-lg">
      <CardHeader>
        <CardTitle>Setup TOTP</CardTitle>
        <CardDescription>Scan QR lalu masukkan kode 6 digit.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
              <Image
                src={qrCodeDataUri}
                alt="QR code TOTP dashboard"
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
            <Button type="submit" className="w-full" disabled={isPending}>
              Verifikasi TOTP
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
