"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
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
import { checkLoginCredentialsAction } from "@/server/actions/auth";

const GENERIC_LOGIN_ERROR = "Username atau password salah";
const TOTP_LOGIN_ERROR = "Kode TOTP salah atau sudah kedaluwarsa";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const passwordRef = useRef("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const submittedPassword = requiresTotp ? passwordRef.current : password;

      if (!requiresTotp) {
        const result = await checkLoginCredentialsAction({
          username,
          password: submittedPassword,
          scope,
        });

        if (!result.ok) {
          passwordRef.current = "";
          setPassword("");
          setError(getPasswordStepError(result.error));
          return;
        }

        if (result.requiresTotp) {
          passwordRef.current = submittedPassword;
          setPassword("");
          setTotpCode("");
          setRequiresTotp(true);
          return;
        }
      }

      try {
        const result = await signIn("credentials", {
          username,
          password: submittedPassword,
          totpCode,
          scope,
          redirectTo,
          redirect: false,
        });

        if (result?.error) {
          setTotpCode("");
          setError(requiresTotp ? TOTP_LOGIN_ERROR : GENERIC_LOGIN_ERROR);
          return;
        }

        passwordRef.current = "";
        setPassword("");
        setTotpCode("");
        window.location.replace(redirectTo);
      } catch {
        setTotpCode("");
        setError(requiresTotp ? TOTP_LOGIN_ERROR : GENERIC_LOGIN_ERROR);
      }
    });
  }

  const submitLabel = getSubmitLabel({ isPending, requiresTotp });

  return (
    <Card className="w-full max-w-md rounded-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {requiresTotp ? (
              <>
                <Field>
                  <FieldLabel>Akun</FieldLabel>
                  <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    {username}
                  </p>
                </Field>
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
                    onChange={(event) =>
                      setTotpCode(event.target.value.replace(/\D/g, ""))
                    }
                    disabled={isPending}
                    required
                  />
                  <FieldDescription>Masukkan 6 digit dari authenticator.</FieldDescription>
                </Field>
              </>
            ) : (
              <>
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
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
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      passwordRef.current = event.target.value;
                      setPassword(event.target.value);
                    }}
                    disabled={isPending}
                    required
                  />
                </Field>
              </>
            )}
            {error ? <FieldError>{error}</FieldError> : null}
            {isPending ? (
              <FieldDescription role="status" aria-live="polite">
                {requiresTotp ? "Memverifikasi kode TOTP..." : "Memeriksa kredensial..."}
              </FieldDescription>
            ) : null}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {submitLabel}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function getSubmitLabel({
  isPending,
  requiresTotp,
}: {
  isPending: boolean;
  requiresTotp: boolean;
}) {
  if (isPending) {
    return requiresTotp ? "Memverifikasi..." : "Memeriksa...";
  }

  return requiresTotp ? "Verifikasi" : "Masuk";
}

function getPasswordStepError(error: unknown) {
  return typeof error === "string" && error.startsWith("Terlalu banyak percobaan")
    ? error
    : GENERIC_LOGIN_ERROR;
}
