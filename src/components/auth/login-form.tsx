"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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
import { checkLoginCredentialsAction } from "@/server/actions/auth";

const GENERIC_LOGIN_ERROR = "Username atau password salah";

type LoginScope = "super-admin" | "dashboard";

type LoginFormProps = {
  title: string;
  description: string;
  scope: LoginScope;
  redirectTo: string;
};

export function LoginForm({
  title,
  description,
  scope,
  redirectTo,
}: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      if (!requiresTotp) {
        const result = await checkLoginCredentialsAction({
          username,
          password,
          scope,
        });

        if (!result.ok) {
          setError(GENERIC_LOGIN_ERROR);
          return;
        }

        if (result.requiresTotp) {
          setRequiresTotp(true);
          return;
        }
      }

      try {
        const result = await signIn("credentials", {
          username,
          password,
          totpCode,
          scope,
          redirectTo,
          redirect: false,
        });

        if (result?.error) {
          setError(GENERIC_LOGIN_ERROR);
          return;
        }

        router.replace(redirectTo);
        router.refresh();
      } catch {
        setError(GENERIC_LOGIN_ERROR);
      }
    });
  }

  return (
    <Card className="w-full max-w-md rounded-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isPending || requiresTotp}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPending || requiresTotp}
                required
              />
            </Field>
            {requiresTotp ? (
              <Field>
                <FieldLabel htmlFor="totpCode">Kode TOTP</FieldLabel>
                <Input
                  id="totpCode"
                  name="totpCode"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={totpCode}
                  onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, ""))}
                  disabled={isPending}
                  required
                />
                <FieldDescription>Masukkan 6 digit dari authenticator.</FieldDescription>
              </Field>
            ) : null}
            {error ? <FieldError>{error}</FieldError> : null}
            <Button type="submit" className="w-full" disabled={isPending}>
              {requiresTotp ? "Verifikasi" : "Masuk"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
