"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
import { changePasswordAction } from "@/server/actions/auth";

export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!result.ok) {
        setError(result.error ?? "Password gagal diubah.");

        if (result.redirectTo) {
          router.replace(result.redirectTo);
        }

        return;
      }

      router.replace(result.redirectTo ?? "/dashboard");
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md rounded-lg">
      <CardHeader>
        <CardTitle>Ubah password</CardTitle>
        <CardDescription>Gunakan password baru minimal 12 karakter.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="currentPassword">Password saat ini</FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={isPending}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="newPassword">Password baru</FieldLabel>
              <Input
                id="newPassword"
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
              <FieldLabel htmlFor="confirmPassword">Konfirmasi password</FieldLabel>
              <Input
                id="confirmPassword"
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
            <Button type="submit" className="w-full" disabled={isPending}>
              Simpan password
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
