"use client";

import { FormEvent, ReactNode, useId, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type SensitiveActionCredentials = {
  currentPassword: string;
  totpCode: string;
};

type SensitiveActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

type SensitiveActionFieldsProps = {
  credentials: SensitiveActionCredentials;
  disabled?: boolean;
  idPrefix: string;
  onChange: (credentials: SensitiveActionCredentials) => void;
};

type SensitiveActionDialogProps = {
  title: string;
  description: string;
  actionLabel: string;
  triggerLabel: ReactNode;
  triggerIcon?: ReactNode;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  triggerSize?: "default" | "sm";
  actionVariant?: "default" | "destructive";
  disabled?: boolean;
  onConfirm: (
    credentials: SensitiveActionCredentials,
  ) => Promise<SensitiveActionResult>;
  onSuccess: () => void;
};

export function SensitiveActionFields({
  credentials,
  disabled,
  idPrefix,
  onChange,
}: SensitiveActionFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-current-password`}>
          Password super admin
        </FieldLabel>
        <Input
          id={`${idPrefix}-current-password`}
          type="password"
          autoComplete="current-password"
          value={credentials.currentPassword}
          onChange={(event) =>
            onChange({
              ...credentials,
              currentPassword: event.target.value,
            })
          }
          disabled={disabled}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-totp-code`}>Kode TOTP</FieldLabel>
        <Input
          id={`${idPrefix}-totp-code`}
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoComplete="one-time-code"
          value={credentials.totpCode}
          onChange={(event) =>
            onChange({
              ...credentials,
              totpCode: event.target.value.replace(/\D/g, ""),
            })
          }
          disabled={disabled}
          required
        />
        <FieldDescription>
          Masukkan 6 digit dari authenticator super admin.
        </FieldDescription>
      </Field>
    </>
  );
}

export function SensitiveActionDialog({
  title,
  description,
  actionLabel,
  triggerLabel,
  triggerIcon,
  triggerVariant = "outline",
  triggerSize = "default",
  actionVariant = "default",
  disabled,
  onConfirm,
  onSuccess,
}: SensitiveActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<SensitiveActionCredentials>(
    emptyCredentials,
  );
  const idPrefix = useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setCredentials(emptyCredentials);
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await onConfirm(credentials);

      if (!result.ok) {
        setError(result.error);
        setCredentials((current) => ({ ...current, totpCode: "" }));
        return;
      }

      setOpen(false);
      reset();
      onSuccess();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant={triggerVariant}
            size={triggerSize}
            disabled={disabled}
          />
        }
      >
        {triggerIcon}
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>

          <FieldGroup className="py-2">
            <SensitiveActionFields
              credentials={credentials}
              disabled={isPending}
              idPrefix={`sensitive-action-${idPrefix}`}
              onChange={setCredentials}
            />
            {error ? <FieldError>{error}</FieldError> : null}
          </FieldGroup>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              variant={actionVariant}
              disabled={isPending}
            >
              {isPending ? <Loader2Icon className="animate-spin" /> : null}
              {actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function emptySensitiveActionCredentials(): SensitiveActionCredentials {
  return { ...emptyCredentials };
}

const emptyCredentials: SensitiveActionCredentials = {
  currentPassword: "",
  totpCode: "",
};
