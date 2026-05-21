"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

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
import { generateSlug } from "@/lib/slugify";
import {
  checkTenantSlugAvailability,
  createTenant,
} from "@/server/actions/super-admin/tenant";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function CreateTenantForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function checkSlug() {
    const nextSlug = generateSlug(slug);

    if (nextSlug !== slug) {
      setSlug(nextSlug);
    }

    if (!nextSlug) {
      setSlugStatus("invalid");
      return false;
    }

    setSlugStatus("checking");
    const result = await checkTenantSlugAvailability({ slug: nextSlug });

    if (!result.ok) {
      setSlugStatus("idle");
      setError(result.error);
      return false;
    }

    setSlugStatus(result.available ? "available" : "taken");
    return result.available;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const slugAvailable = await checkSlug();

      if (!slugAvailable) {
        return;
      }

      const result = await createTenant({
        name,
        slug,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("Tenant berhasil dibuat.");
      router.replace(result.redirectTo);
      router.refresh();
    });
  }

  const slugMessage = getSlugMessage(slugStatus);

  return (
    <Card className="max-w-2xl rounded-lg">
      <CardHeader>
        <CardTitle>Create Tenant</CardTitle>
        <CardDescription>
          Tenant baru akan dibuat bersama variant, collection, option set, page,
          dan global config awal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(event) => {
                  const nextName = event.target.value;

                  setName(nextName);

                  if (!slugEdited) {
                    setSlug(generateSlug(nextName));
                    setSlugStatus("idle");
                  }
                }}
                disabled={isPending}
                minLength={3}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onBlur={() => {
                  void checkSlug();
                }}
                onChange={(event) => {
                  setSlugEdited(true);
                  setSlug(generateSlug(event.target.value));
                  setSlugStatus("idle");
                }}
                disabled={isPending}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
                aria-invalid={
                  slugStatus === "taken" || slugStatus === "invalid" || undefined
                }
              />
              {slugMessage ? (
                <FieldDescription className={slugStatus === "available" ? "text-emerald-600" : undefined}>
                  {slugMessage}
                </FieldDescription>
              ) : null}
            </Field>

            {error ? <FieldError>{error}</FieldError> : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => router.push("/super-admin/tenants")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  slugStatus === "checking" ||
                  slugStatus === "taken" ||
                  slugStatus === "invalid"
                }
              >
                {isPending ? <Loader2Icon className="animate-spin" /> : null}
                Create Tenant
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function getSlugMessage(status: SlugStatus) {
  if (status === "checking") {
    return "Mengecek slug...";
  }

  if (status === "available") {
    return "Slug tersedia.";
  }

  if (status === "taken") {
    return "Slug sudah digunakan.";
  }

  if (status === "invalid") {
    return "Slug wajib diisi dengan huruf kecil, angka, dan dash.";
  }

  return null;
}
