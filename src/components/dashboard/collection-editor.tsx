"use client";

import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  EyeIcon,
  FileImageIcon,
  Loader2Icon,
  SaveIcon,
  SendIcon,
  Undo2Icon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { CalloutPicker } from "@/components/dashboard/forms/callout-picker";
import { MediaPicker } from "@/components/dashboard/forms/media-picker";
import { SortableList } from "@/components/dashboard/forms/sortable-list";
import { StatusBadge } from "@/components/dashboard/collection-list";
import { useCmsBusy } from "@/components/cms/cms-busy-feedback";
import {
  useEditorExitGuard,
  useLongRunningOperationNotice,
} from "@/components/dashboard/use-editor-operation-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getCollectionDefinition,
  type CollectionField,
  type CollectionKey,
  type CollectionOptionSets,
  type CollectionSection,
  type ContentBlockType,
  type PublishStatus,
} from "@/lib/collection-definitions";
import {
  getCmsAddLabel,
  getCmsBlockTypeLabel,
  getCmsCollectionEyebrow,
  getCmsCollectionLabel,
  getCmsEmptyLabel,
  getCmsFieldGuidance,
  getCmsFieldLabel,
  getCmsItemLabel,
  getCmsPlaceholder,
  getCmsPublishStatusLabel,
  getCmsSectionTitle,
  getCmsStaticOptionLabel,
} from "@/lib/cms-field-guidance";
import { generateSlug } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import {
  changeItemStatus,
  checkItemSlugAvailability,
  createItem,
  generateItemPreviewToken,
  publishItem,
  updateItem,
  unpublishItem,
} from "@/server/actions/tenant/collection";

type CollectionEditorProps = {
  tenantId: string;
  variantId: string;
  collectionKey: CollectionKey;
  itemId: string | null;
  initialData: Record<string, unknown>;
  initialStatus: PublishStatus;
  updatedAt: string | null;
  optionSets: CollectionOptionSets;
};

type SaveState = "saved" | "dirty" | "saving" | "error";
type FieldErrors = Record<string, string[]>;
type SlugStatus = "idle" | "checking" | "available" | "taken";

const EMPTY_SELECT_VALUE = "__empty";

export function CollectionEditor({
  tenantId,
  variantId,
  collectionKey,
  itemId,
  initialData,
  initialStatus,
  updatedAt,
  optionSets,
}: CollectionEditorProps) {
  const router = useRouter();
  const definition = useMemo(
    () => getCollectionDefinition(collectionKey),
    [collectionKey],
  );
  const [currentItemId, setCurrentItemId] = useState(itemId);
  const [data, setData] = useState<Record<string, unknown>>(() =>
    deepMerge(definition.defaultData, initialData),
  );
  const [status, setStatus] = useState<PublishStatus>(initialStatus);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [lastSavedAt, setLastSavedAt] = useState(updatedAt);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(readString(initialData.slug)),
  );
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const dataRef = useRef(data);
  const currentItemIdRef = useRef(currentItemId);
  const lastSavedSerializedRef = useRef(JSON.stringify(data));
  const saveSequenceRef = useRef(0);
  const pendingSaveCountRef = useRef(0);
  const { start, startNavigation } = useCmsBusy();
  const { operationNotice, watchOperation } = useLongRunningOperationNotice();

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    currentItemIdRef.current = currentItemId;
  }, [currentItemId]);

  const hasUnsavedChanges = useCallback(
    () => JSON.stringify(dataRef.current) !== lastSavedSerializedRef.current,
    [],
  );

  const setValue = useCallback(
    (path: string, value: unknown) => {
      setData((current) => {
        const next = setAtPath(current, path, value);

        if (path === "title" && !slugManuallyEdited) {
          return setAtPath(next, "slug", generateSlug(String(value)));
        }

        return next;
      });
      setErrors((current) => clearErrorForPath(current, path));
    },
    [slugManuallyEdited],
  );

  const save = useCallback(
    async (showSuccessToast = false): Promise<string | null> => {
      const snapshot = dataRef.current;
      const serializedSnapshot = JSON.stringify(snapshot);
      const existingItemId = currentItemIdRef.current;

      if (
        existingItemId &&
        serializedSnapshot === lastSavedSerializedRef.current &&
        showSuccessToast
      ) {
        toast.success("Tidak ada perubahan baru.");
        return existingItemId;
      }

      if (
        existingItemId &&
        serializedSnapshot === lastSavedSerializedRef.current
      ) {
        return existingItemId;
      }

      const saveId = ++saveSequenceRef.current;

      pendingSaveCountRef.current += 1;
      setIsSaving(true);
      setSaveState("saving");
      const stopBusy = start(
        existingItemId ? "Menyimpan item..." : "Membuat item...",
      );
      const stopNotice = watchOperation(
        existingItemId
          ? "Koneksi lambat. Item masih disimpan, mohon tunggu."
          : "Koneksi lambat. Item baru masih dibuat, mohon tunggu.",
        "Belum ada respons dari server. Jangan tutup halaman sampai proses selesai atau gagal.",
      );

      try {
        const response = existingItemId
          ? await updateItem(existingItemId, snapshot)
          : await createItem(variantId, collectionKey, snapshot);

        if (!isItemMutationSuccess(response)) {
          const actionErrors = getActionFieldErrors(getRecordValue(response, "details"));

          if (Object.keys(actionErrors).length > 0) {
            setErrors(actionErrors);
          } else {
            setErrors({
              form: [getActionErrorMessage(response, "Gagal menyimpan.")],
            });
          }

          setSaveState("error");
          toast.error(getActionErrorMessage(response, "Gagal menyimpan."));
          return null;
        }

        const nextData = deepMerge(definition.defaultData, response.item.dataJson);

        if (saveId === saveSequenceRef.current) {
          setErrors({});
          setData(nextData);
          dataRef.current = nextData;
          setStatus(response.item.status);
          setLastSavedAt(response.item.updatedAt);
          setCurrentItemId(response.item.id);
          currentItemIdRef.current = response.item.id;
          lastSavedSerializedRef.current = JSON.stringify(nextData);
          setSaveState("saved");

          if (!existingItemId) {
            startNavigation("Membuka item baru...");
            router.replace(`${definition.listPath}/${response.item.id}`);
          }
        }

        if (showSuccessToast) {
          toast.success("Draft tersimpan.");
        }

        return response.item.id;
      } catch {
        setErrors({
          form: ["Gagal menyimpan. Coba lagi."],
        });
        setSaveState("error");
        toast.error("Gagal menyimpan. Coba lagi.");
        return null;
      } finally {
        stopNotice();
        stopBusy();
        pendingSaveCountRef.current = Math.max(pendingSaveCountRef.current - 1, 0);
        setIsSaving(pendingSaveCountRef.current > 0);
      }
    },
    [
      collectionKey,
      definition.defaultData,
      definition.listPath,
      router,
      start,
      startNavigation,
      variantId,
      watchOperation,
    ],
  );

  useEffect(() => {
    const serializedData = JSON.stringify(data);

    if (serializedData === lastSavedSerializedRef.current) {
      setSaveState((current) => (current === "saving" ? current : "saved"));
      return;
    }

    setSaveState((current) => (current === "saving" ? current : "dirty"));
  }, [data]);

  const hasPendingOperation =
    isSaving || isPublishing || isUnpublishing || isChangingStatus;

  useEditorExitGuard(
    useCallback(() => {
      if (hasPendingOperation) {
        return "Proses masih berjalan. Tinggalkan halaman sekarang bisa membuat hasil simpan belum pasti.";
      }

      if (hasUnsavedChanges()) {
        return "Ada perubahan belum disimpan. Tinggalkan halaman tanpa menyimpan?";
      }

      return null;
    }, [hasPendingOperation, hasUnsavedChanges]),
  );

  useEffect(() => {
    const slug = readString(getAtPath(data, "slug"));

    if (!slug) {
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setSlugStatus("checking");
      const response = await checkItemSlugAvailability({
        variantId,
        collectionKey,
        slug,
        itemId: currentItemIdRef.current ?? undefined,
      });

      if (cancelled) {
        return;
      }

      if (isSlugCheckSuccess(response)) {
        setSlugStatus(response.available ? "available" : "taken");
        return;
      }

      setSlugStatus("idle");
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [collectionKey, data, variantId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(true);
  }

  async function handlePublish() {
    setIsPublishing(true);
    const stopBusy = start(
      status === "PUBLISHED"
        ? "Menerbitkan perubahan item..."
        : "Menerbitkan item...",
    );
    let stopNotice: (() => void) | null = null;

    try {
      const savedItemId = await save(false);

      if (!savedItemId) {
        return;
      }

      stopNotice = watchOperation(
        "Koneksi lambat. Publish item masih diproses, mohon tunggu.",
        "Belum ada respons dari server. Jangan tutup halaman sampai publish selesai atau gagal.",
      );
      const response = await publishItem(savedItemId);

      if (!isItemMutationSuccess(response)) {
        const actionErrors = getActionFieldErrors(getRecordValue(response, "details"));

        if (Object.keys(actionErrors).length > 0) {
          setErrors(actionErrors);
        } else {
          setErrors({
            form: [getActionErrorMessage(response, "Gagal menerbitkan.")],
          });
        }

        toast.error(getActionErrorMessage(response, "Gagal menerbitkan."));
        return;
      }

      setErrors({});
      setStatus(response.item.status);
      setLastSavedAt(response.item.updatedAt);
      toast.success("Item diterbitkan.");
    } finally {
      stopNotice?.();
      stopBusy();
      setIsPublishing(false);
    }
  }

  async function handleUnpublish() {
    const savedItemId = currentItemIdRef.current;

    if (!savedItemId) {
      return;
    }

    setIsUnpublishing(true);
    const stopBusy = start("Mengembalikan item ke draft...");
    const stopNotice = watchOperation(
      "Koneksi lambat. Perubahan status item masih diproses.",
      "Belum ada respons dari server. Jangan tutup halaman sampai proses selesai atau gagal.",
    );

    try {
      const response = await unpublishItem(savedItemId);

      if (!isItemMutationSuccess(response)) {
        toast.error(getActionErrorMessage(response, "Gagal mengembalikan ke draft."));
        return;
      }

      setStatus(response.item.status);
      setLastSavedAt(response.item.updatedAt);
      toast.success("Item kembali ke draft.");
    } finally {
      stopNotice();
      stopBusy();
      setIsUnpublishing(false);
    }
  }

  async function handleStatusChange(value: string | null) {
    if (!value || value === status) {
      return;
    }

    if (value === "PUBLISHED") {
      await handlePublish();
      return;
    }

    if (value === "DRAFT") {
      await handleUnpublish();
      return;
    }

    const savedItemId = await save(false);

    if (!savedItemId) {
      return;
    }

    setIsChangingStatus(true);
    const stopBusy = start("Mengubah status item...");
    const stopNotice = watchOperation(
      "Koneksi lambat. Status item masih diubah, mohon tunggu.",
      "Belum ada respons dari server. Jangan tutup halaman sampai proses selesai atau gagal.",
    );

    try {
      const response = await changeItemStatus(savedItemId, value);

      if (!isItemMutationSuccess(response)) {
        toast.error(getActionErrorMessage(response, "Status gagal diubah."));
        return;
      }

      setStatus(response.item.status);
      setLastSavedAt(response.item.updatedAt);
      toast.success("Status diubah.");
    } finally {
      stopNotice();
      stopBusy();
      setIsChangingStatus(false);
    }
  }

  async function handlePreview() {
    const savedItemId = currentItemIdRef.current;

    if (!savedItemId) {
      toast.error("Simpan draft sebelum preview.");
      return;
    }

    const previewWindow = window.open("about:blank", "_blank");

    if (!previewWindow) {
      toast.error("Pratinjau diblokir browser.");
      return;
    }

    previewWindow.opener = null;
    setIsPreviewing(true);
    const stopBusy = start("Menyiapkan preview...");

    try {
      const response = await generateItemPreviewToken(savedItemId);

      if (!isPreviewTokenSuccess(response)) {
        previewWindow.close();
        toast.error(getActionErrorMessage(response, "Pratinjau gagal dibuka."));
        return;
      }

      previewWindow.location.href = response.previewUrl;
    } finally {
      stopBusy();
      setIsPreviewing(false);
    }
  }

  const controlsDisabled =
    isSaving || isPublishing || isUnpublishing || isChangingStatus;
  const canPreview =
    Boolean(currentItemId) && saveState === "saved" && !isSaving && !isPreviewing;
  const effectiveSlugStatus = readString(getAtPath(data, "slug"))
    ? slugStatus
    : "idle";
  const formError = getFieldError(errors, "form");

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            {getCmsCollectionEyebrow(definition.eyebrow)}
          </p>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-normal">
              {readString(data.title) ||
                `Tambah ${getCmsCollectionLabel(definition.label)}`}
            </h1>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm text-muted-foreground",
              saveState === "error" && "text-destructive",
            )}
          >
            {getSaveStatusLabel(saveState, isSaving, lastSavedAt)}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={!canPreview}
            onClick={handlePreview}
          >
            {isPreviewing ? <Loader2Icon className="animate-spin" /> : <EyeIcon />}
            {isPreviewing ? "Menyiapkan..." : "Pratinjau"}
          </Button>
          <Button type="submit" variant="outline" disabled={controlsDisabled}>
            {isSaving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button type="button" disabled={controlsDisabled} onClick={handlePublish}>
            {isPublishing ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
            {isPublishing
              ? "Menerbitkan..."
              : status === "PUBLISHED"
                ? "Terbitkan perubahan"
                : "Terbitkan"}
          </Button>
          {status === "PUBLISHED" ? (
            <Button
              type="button"
              variant="outline"
              disabled={controlsDisabled}
              onClick={handleUnpublish}
            >
              {isUnpublishing ? <Loader2Icon className="animate-spin" /> : <Undo2Icon />}
              {isUnpublishing ? "Membatalkan terbit..." : "Batalkan terbit"}
            </Button>
          ) : null}
        </div>
      </div>

      {operationNotice ? (
        <div
          role="status"
          className="rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
        >
          {operationNotice}
        </div>
      ) : null}

      {formError ? (
        <FieldError className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          {formError}
        </FieldError>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <FieldGroup>
          {definition.sections.map((section) => (
            <EditorSection
              key={section.title}
              section={section}
              data={data}
              errors={errors}
              tenantId={tenantId}
              variantId={variantId}
              optionSets={optionSets}
              setValue={setValue}
              slugStatus={effectiveSlugStatus}
              onSlugEdited={() => setSlugManuallyEdited(true)}
            />
          ))}
        </FieldGroup>

        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusBadge status={status} />
                  <Select
                    value={status}
                    onValueChange={handleStatusChange}
                    disabled={!currentItemId || controlsDisabled}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {definition.statuses.map((itemStatus) => (
                        <SelectItem key={itemStatus} value={itemStatus}>
                          {getCmsPublishStatusLabel(itemStatus)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {lastSavedAt ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Terakhir disimpan
                  </p>
                  <p className="text-sm">{formatDateTime(lastSavedAt)}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-4">
              <Field className="flex-row items-center justify-between">
                <FieldLabel>Unggulan</FieldLabel>
                <Switch
                  checked={Boolean(data.is_featured)}
                  onCheckedChange={(checked) => setValue("is_featured", checked)}
                />
              </Field>
              <Field>
                <FieldLabel>Urutan tampil</FieldLabel>
                <Input
                  type="number"
                  value={toNumberInputValue(data.sort_order)}
                  min={0}
                  onChange={(event) =>
                    setValue(
                      "sort_order",
                      event.target.value === "" ? 0 : Number(event.target.value),
                    )
                  }
                />
              </Field>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground">
                Pratinjau thumbnail
              </p>
              <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed bg-muted/40 p-3 text-center text-xs text-muted-foreground">
                {readString(getAtPath(data, definition.thumbnailPath)) ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileImageIcon className="size-6" />
                    <span className="break-all">
                      {readString(getAtPath(data, definition.thumbnailPath))}
                    </span>
                  </div>
                ) : (
                  "Belum ada thumbnail dipilih"
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

function EditorSection({
  section,
  data,
  errors,
  tenantId,
  variantId,
  optionSets,
  setValue,
  slugStatus,
  onSlugEdited,
}: {
  section: CollectionSection;
  data: Record<string, unknown>;
  errors: FieldErrors;
  tenantId: string;
  variantId: string;
  optionSets: CollectionOptionSets;
  setValue: (path: string, value: unknown) => void;
  slugStatus: SlugStatus;
  onSlugEdited: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="overflow-hidden rounded-lg border bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
          <span className="text-base font-medium">
            {getCmsSectionTitle(section.title)}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t p-4">
            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <FieldRenderer
                  key={`${section.title}.${field.path}`}
                  field={field}
                  data={data}
                  errors={errors}
                  tenantId={tenantId}
                  variantId={variantId}
                  optionSets={optionSets}
                  setValue={setValue}
                  slugStatus={slugStatus}
                  onSlugEdited={onSlugEdited}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function FieldRenderer({
  field,
  data,
  errors,
  tenantId,
  variantId,
  optionSets,
  setValue,
  basePath,
  slugStatus,
  onSlugEdited,
}: {
  field: CollectionField;
  data: Record<string, unknown>;
  errors: FieldErrors;
  tenantId: string;
  variantId: string;
  optionSets: CollectionOptionSets;
  setValue: (path: string, value: unknown) => void;
  basePath?: string;
  slugStatus: SlugStatus;
  onSlugEdited: () => void;
}) {
  const path = joinPath(basePath, field.path);
  const error = getFieldError(errors, path);
  const wide =
    field.kind === "textarea" ||
    field.kind === "array" ||
    field.kind === "string-array" ||
    field.kind === "media-array" ||
    field.kind === "content-blocks" ||
    field.kind === "multiselect";
  const label = getCmsFieldLabel(field);

  if (field.kind === "array") {
    const rawItems = getAtPath(data, path);
    const items = Array.isArray(rawItems) ? rawItems : [];

    return (
      <Field className={wide ? "md:col-span-2" : undefined} data-invalid={Boolean(error)}>
        <FieldLabel>{label}</FieldLabel>
        <FieldGuidance field={field} />
        <SortableList
          items={items.map((item) =>
            isRecord(item) ? deepMerge(field.defaultItem, item) : field.defaultItem,
          )}
          addLabel={getCmsAddLabel(field)}
          emptyLabel={getCmsEmptyLabel(field)}
          createItem={(index) =>
            normalizeArrayItems(
              [
                {
                  ...cloneJson(field.defaultItem),
                  ...(field.sortOrderField ? { [field.sortOrderField]: index } : {}),
                },
              ],
              field.sortOrderField,
            )[0]
          }
          normalizeItems={(nextItems) =>
            normalizeArrayItems(nextItems, field.sortOrderField)
          }
          getItemLabel={(item, index) =>
            getArrayItemLabel(item, index, getCmsItemLabel(field.itemLabel))
          }
          getItemKey={(item, index) => getArrayItemKey(item, index)}
          onChange={(nextItems) => setValue(path, nextItems)}
          renderItem={(_item, index) => (
            <div className="grid gap-4 md:grid-cols-2">
              {field.fields.map((childField) => (
                <FieldRenderer
                  key={`${path}.${index}.${childField.path}`}
                  field={childField}
                  data={data}
                  errors={errors}
                  tenantId={tenantId}
                  variantId={variantId}
                  optionSets={optionSets}
                  setValue={setValue}
                  basePath={`${path}.${index}`}
                  slugStatus={slugStatus}
                  onSlugEdited={onSlugEdited}
                />
              ))}
            </div>
          )}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  if (field.kind === "string-array") {
    const rawItems = getAtPath(data, path);
    const items = Array.isArray(rawItems)
      ? rawItems.map((item) => (typeof item === "string" ? item : ""))
      : [];

    return (
      <Field className="md:col-span-2" data-invalid={Boolean(error)}>
        <FieldLabel>{label}</FieldLabel>
        <FieldGuidance field={field} />
        <SortableList
          items={items}
          addLabel={getCmsAddLabel(field)}
          emptyLabel={getCmsEmptyLabel(field)}
          createItem={() => ""}
          getItemLabel={(_item, index) =>
            `${getCmsItemLabel(field.itemLabel)} ${index + 1}`
          }
          getItemKey={(item, index) => `${item}-${index}`}
          onChange={(nextItems) => setValue(path, nextItems)}
          renderItem={(_item, index) => (
            <Input
              value={items[index] ?? ""}
              placeholder={getCmsPlaceholder(field)}
              onChange={(event) => {
                const nextItems = [...items];

                nextItems[index] = event.target.value;
                setValue(path, nextItems);
              }}
            />
          )}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  if (field.kind === "media-array") {
    const items = normalizeStringArray(getAtPath(data, path));

    return (
      <Field className="md:col-span-2" data-invalid={Boolean(error)}>
        <FieldLabel>{label}</FieldLabel>
        <FieldGuidance field={field} />
        <SortableList
          items={items}
          addLabel={getCmsAddLabel(field)}
          emptyLabel={getCmsEmptyLabel(field)}
          createItem={() => ""}
          getItemLabel={(_item, index) =>
            `${getCmsItemLabel(field.itemLabel)} ${index + 1}`
          }
          getItemKey={(item, index) => `${item || "media"}-${index}`}
          onChange={(nextItems) => setValue(path, nextItems)}
          renderItem={(_item, index) => (
            <MediaPicker
              tenantId={tenantId}
              value={items[index] ?? ""}
              mediaType="IMAGE"
              cropPreset={field.cropPreset}
              onChange={(mediaId) => {
                const nextItems = [...items];

                nextItems[index] = mediaId;
                setValue(path, nextItems.filter((item) => item !== ""));
              }}
            />
          )}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  if (field.kind === "content-blocks") {
    return (
      <Field className="md:col-span-2" data-invalid={Boolean(error)}>
        <FieldLabel>{label}</FieldLabel>
        <FieldGuidance field={field} />
        <ContentBlocksEditor
          tenantId={tenantId}
          variantId={variantId}
          items={normalizeContentBlocks(getAtPath(data, path))}
          blockTypes={field.blockTypes}
          onChange={(items) => setValue(path, items)}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  if (field.kind === "multiselect") {
    const selectedValues = normalizeStringArray(getAtPath(data, path));
    const options = optionSets[field.optionSetKey] ?? [];

    return (
      <Field className="md:col-span-2" data-invalid={Boolean(error)}>
        <FieldLabel>{label}</FieldLabel>
        <FieldGuidance field={field} />
        <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada opsi.</p>
          ) : (
            options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={isOptionSelected(selectedValues, option)}
                  onChange={(event) => {
                    const valuesWithoutOption = selectedValues.filter(
                      (value) => value !== option.id && value !== option.value,
                    );
                    const nextValues = event.target.checked
                      ? [...valuesWithoutOption, option.id]
                      : valuesWithoutOption;

                    setValue(path, nextValues);
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))
          )}
        </div>
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  return (
    <Field className={wide ? "md:col-span-2" : undefined} data-invalid={Boolean(error)}>
      {field.kind === "switch" ? (
        <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg border px-3 py-2">
          <FieldContent>
            <FieldLabel>{label}</FieldLabel>
            <FieldGuidance field={field} compact />
          </FieldContent>
          <Switch
            checked={Boolean(getAtPath(data, path))}
            onCheckedChange={(checked) => setValue(path, checked)}
            aria-invalid={Boolean(error)}
          />
        </div>
      ) : (
        <>
          <FieldLabel>{label}</FieldLabel>
          <FieldGuidance field={field} />
          {renderControl({
            field,
            data,
            error,
            path,
            tenantId,
            optionSets,
            setValue,
            onSlugEdited,
          })}
          {path === "slug" ? <SlugHint status={slugStatus} /> : null}
          {field.kind === "date" && path.endsWith("expired_at") ? (
            <ExpiredWarning value={readString(getAtPath(data, path))} />
          ) : null}
        </>
      )}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function FieldGuidance({
  field,
  compact = false,
}: {
  field: CollectionField;
  compact?: boolean;
}) {
  const guidance = getCmsFieldGuidance(field);

  if (!guidance) {
    return null;
  }

  return (
    <div className={cn("space-y-1", compact && "mt-0.5")}>
      {guidance.helpText ? (
        <FieldDescription className={compact ? "text-xs" : undefined}>
          {guidance.helpText}
        </FieldDescription>
      ) : null}
      {guidance.usage ? (
        <p className="text-xs leading-5 text-muted-foreground">
          Dipakai untuk: {guidance.usage}
        </p>
      ) : null}
      {guidance.example ? (
        <p className="text-xs leading-5 text-muted-foreground">
          Contoh: <span className="font-medium text-foreground">{guidance.example}</span>
        </p>
      ) : null}
      {guidance.requiredForPublish ? (
        <Badge variant="outline" className="w-fit text-[11px]">
          Wajib sebelum terbit
        </Badge>
      ) : null}
    </div>
  );
}

function renderControl({
  field,
  data,
  error,
  path,
  tenantId,
  optionSets,
  setValue,
  onSlugEdited,
}: {
  field: Exclude<
    CollectionField,
    {
      kind:
        | "array"
        | "string-array"
        | "media-array"
        | "content-blocks"
        | "multiselect"
        | "switch";
    }
  >;
  data: Record<string, unknown>;
  error: string | null;
  path: string;
  tenantId: string;
  optionSets: CollectionOptionSets;
  setValue: (path: string, value: unknown) => void;
  onSlugEdited: () => void;
}) {
  const rawValue = getAtPath(data, path);

  switch (field.kind) {
    case "text":
      return (
        <Input
          value={toInputValue(rawValue)}
          type={field.inputType ?? "text"}
          maxLength={field.max}
          placeholder={getCmsPlaceholder(field)}
          aria-invalid={Boolean(error)}
          onBlur={() => {
            if (path === "slug") {
              setValue(path, generateSlug(toInputValue(rawValue)));
            }
          }}
          onChange={(event) => {
            if (path === "slug") {
              onSlugEdited();
            }

            setValue(path, event.target.value);
          }}
        />
      );
    case "textarea":
      return (
        <Textarea
          value={toInputValue(rawValue)}
          maxLength={field.max}
          placeholder={getCmsPlaceholder(field)}
          aria-invalid={Boolean(error)}
          onChange={(event) => setValue(path, event.target.value)}
        />
      );
    case "number":
      return (
        <Input
          value={toNumberInputValue(rawValue)}
          type="number"
          min={field.min}
          max={field.max}
          aria-invalid={Boolean(error)}
          onChange={(event) =>
            setValue(path, event.target.value === "" ? 0 : Number(event.target.value))
          }
        />
      );
    case "date":
      return (
        <Input
          value={toInputValue(rawValue)}
          type="date"
          aria-invalid={Boolean(error)}
          onChange={(event) => setValue(path, event.target.value)}
        />
      );
    case "select": {
      const usesOptionSet = Boolean(field.optionSetKey && !field.options);
      const options =
        field.options ??
        (field.optionSetKey ? optionSets[field.optionSetKey] ?? [] : []);
      const value = resolveSelectValue(
        toInputValue(rawValue),
        options,
        usesOptionSet,
      );

      return (
        <Select
          value={value}
          onValueChange={(nextValue) =>
            setValue(path, nextValue === EMPTY_SELECT_VALUE ? "" : nextValue ?? "")
          }
        >
          <SelectTrigger className="w-full" aria-invalid={Boolean(error)}>
            <SelectValue placeholder="Pilih nilai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_SELECT_VALUE}>Kosong</SelectItem>
            {options.map((option) => {
              const optionValue = getSelectOptionValue(option, usesOptionSet);

              return (
                <SelectItem key={optionValue} value={optionValue}>
                  {usesOptionSet ? option.label : getCmsStaticOptionLabel(option.label)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    }
    case "media":
      return (
        <MediaPicker
          tenantId={tenantId}
          value={toInputValue(rawValue)}
          mediaType="IMAGE"
          cropPreset={field.cropPreset}
          onChange={(mediaId) => setValue(path, mediaId)}
        />
      );
  }
}

function ContentBlocksEditor({
  tenantId,
  variantId,
  items,
  blockTypes,
  onChange,
}: {
  tenantId: string;
  variantId: string;
  items: Record<string, unknown>[];
  blockTypes: ContentBlockType[];
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  function updateBlock(index: number, path: string, value: unknown) {
    const nextItems = [...items];
    const block = isRecord(nextItems[index]) ? nextItems[index] : createBlock(blockTypes[0], index);

    nextItems[index] = setAtPath(block, path, value);
    onChange(normalizeArrayItems(nextItems, "sort_order"));
  }

  return (
    <SortableList
      items={items}
      addLabel="Tambah blok"
      emptyLabel="Belum ada blok konten."
      createItem={(index) => createBlock(blockTypes[0], index)}
      normalizeItems={(nextItems) => normalizeArrayItems(nextItems, "sort_order")}
      getItemLabel={(item, index) => getBlockLabel(item, index)}
      getItemKey={(item, index) => `${readString(item.type) || "block"}-${index}`}
      onChange={onChange}
      renderItem={(item, index) => {
        const type = readContentBlockType(item.type, blockTypes);

        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel>Tipe blok</FieldLabel>
              <Select
                value={type}
                onValueChange={(value) => {
                  const nextType = readContentBlockType(value, blockTypes);
                  const nextItems = [...items];

                  nextItems[index] = createBlock(nextType, index);
                  onChange(normalizeArrayItems(nextItems, "sort_order"));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe blok" />
                </SelectTrigger>
                <SelectContent>
                  {blockTypes.map((blockType) => (
                    <SelectItem key={blockType} value={blockType}>
                      {getCmsBlockTypeLabel(blockType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <BlockFields
              tenantId={tenantId}
              variantId={variantId}
              type={type}
              item={item}
              onChange={(path, value) => updateBlock(index, path, value)}
            />
          </div>
        );
      }}
    />
  );
}

function BlockFields({
  tenantId,
  variantId,
  type,
  item,
  onChange,
}: {
  tenantId: string;
  variantId: string;
  type: ContentBlockType;
  item: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}) {
  const data = isRecord(item.data) ? item.data : {};

  switch (type) {
    case "heading":
      return (
        <>
          <Field>
            <FieldLabel>Tingkat judul bagian</FieldLabel>
            <Select
              value={readString(data.level) || "h2"}
              onValueChange={(value) => onChange("data.level", value ?? "h2")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Teks</FieldLabel>
            <Input
              value={readString(data.text)}
              onChange={(event) => onChange("data.text", event.target.value)}
            />
          </Field>
        </>
      );
    case "paragraph":
      return (
        <Field className="md:col-span-2">
          <FieldLabel>Paragraf</FieldLabel>
          <Textarea
            value={readString(data.text)}
            placeholder="Tulis paragraf tanpa format khusus"
            onChange={(event) => onChange("data.text", event.target.value)}
          />
        </Field>
      );
    case "quote":
      return (
        <>
          <Field className="md:col-span-2">
            <FieldLabel>Kutipan</FieldLabel>
            <Textarea
              value={readString(data.text)}
              onChange={(event) => onChange("data.text", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Nama pengutip</FieldLabel>
            <Input
              value={readString(data.author)}
              onChange={(event) => onChange("data.author", event.target.value)}
            />
          </Field>
        </>
      );
    case "image":
      return (
        <>
          <Field>
            <FieldLabel>Gambar</FieldLabel>
            <MediaPicker
              tenantId={tenantId}
              value={readString(data.image_id)}
              mediaType="IMAGE"
              cropPreset="thumbnail"
              onChange={(mediaId) => onChange("data.image_id", mediaId)}
            />
          </Field>
          <Field>
            <FieldLabel>Teks alternatif gambar</FieldLabel>
            <Input
              value={readString(data.alt_text)}
              onChange={(event) => onChange("data.alt_text", event.target.value)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Keterangan gambar</FieldLabel>
            <Input
              value={readString(data.caption)}
              onChange={(event) => onChange("data.caption", event.target.value)}
            />
          </Field>
        </>
      );
    case "youtube_embed":
      return (
        <>
          <Field className="md:col-span-2">
            <FieldLabel>ID video YouTube</FieldLabel>
            <Input
              value={readString(data.video_id)}
              maxLength={11}
              placeholder="dQw4w9WgXcQ"
              aria-invalid={
                Boolean(readString(data.video_id)) &&
                !/^[a-zA-Z0-9_-]{11}$/.test(readString(data.video_id))
              }
              onChange={(event) =>
                onChange("data.video_id", event.target.value)
              }
            />
            {readString(data.video_id) &&
            !/^[a-zA-Z0-9_-]{11}$/.test(readString(data.video_id)) ? (
              <p className="text-xs text-destructive">
                Video ID harus 11 karakter (alfanumerik, dash, underscore).
              </p>
            ) : null}
          </Field>
          <Field>
            <FieldLabel>Keterangan video</FieldLabel>
            <Input
              value={readString(data.caption)}
              onChange={(event) => onChange("data.caption", event.target.value)}
            />
          </Field>
        </>
      );
    case "offer_callout":
      return (
        <Field className="md:col-span-2">
          <FieldLabel>Penawaran terkait</FieldLabel>
          <CalloutPicker
            variantId={variantId}
            collectionKey="offer"
            value={readString(data.offer_id)}
            onChange={(id) => onChange("data.offer_id", id)}
            placeholder="Pilih penawaran..."
          />
        </Field>
      );
    case "sector_callout":
      return (
        <>
          <Field className="md:col-span-2">
            <FieldLabel>Sektor terkait</FieldLabel>
            <CalloutPicker
              variantId={variantId}
              collectionKey="sector"
              value={readString(data.sector_id)}
              onChange={(id) => onChange("data.sector_id", id)}
              placeholder="Pilih sektor..."
            />
          </Field>
          <Field>
            <FieldLabel>Label tombol</FieldLabel>
            <Input
              value={readString(data.cta_label)}
              onChange={(event) => onChange("data.cta_label", event.target.value)}
            />
          </Field>
        </>
      );
    case "whatsapp_cta":
      return (
        <>
          <Field>
            <FieldLabel>Label</FieldLabel>
            <Input
              value={readString(data.label)}
              onChange={(event) => onChange("data.label", event.target.value)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Template pesan WhatsApp</FieldLabel>
            <Textarea
              value={readString(data.whatsapp_message_template)}
              onChange={(event) =>
                onChange("data.whatsapp_message_template", event.target.value)
              }
            />
          </Field>
        </>
      );
    case "line_cta":
      return (
        <>
          <Field>
            <FieldLabel>Label</FieldLabel>
            <Input
              value={readString(data.label)}
              onChange={(event) => onChange("data.label", event.target.value)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Template pesan LINE</FieldLabel>
            <Textarea
              value={readString(data.line_message_template)}
              onChange={(event) =>
                onChange("data.line_message_template", event.target.value)
              }
            />
          </Field>
        </>
      );
  }
}

function SlugHint({ status }: { status: SlugStatus }) {
  if (status === "idle") {
    return null;
  }

  const label =
    status === "checking"
      ? "Mengecek slug..."
      : status === "available"
        ? "Slug tersedia."
        : "Slug sudah digunakan.";

  return (
    <p
      className={cn(
        "text-xs text-muted-foreground",
        status === "available" && "text-emerald-600",
        status === "taken" && "text-destructive",
      )}
    >
      {label}
    </p>
  );
}

function ExpiredWarning({ value }: { value: string }) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || date >= new Date()) {
    return null;
  }

  return (
    <Badge variant="destructive" className="w-fit">
      Tanggal berakhir sudah lewat
    </Badge>
  );
}

function createBlock(type: ContentBlockType, index: number) {
  return {
    type,
    sort_order: index,
    data: getDefaultBlockData(type),
  };
}

function getDefaultBlockData(type: ContentBlockType) {
  switch (type) {
    case "heading":
      return { level: "h2", text: "" };
    case "paragraph":
      return { text: "" };
    case "quote":
      return { text: "", author: "" };
    case "image":
      return { image_id: "", alt_text: "", caption: "" };
    case "youtube_embed":
      return { video_id: "", caption: "" };
    case "offer_callout":
      return { offer_id: "" };
    case "whatsapp_cta":
      return { label: "", whatsapp_message_template: "" };
    case "line_cta":
      return { label: "", line_message_template: "" };
    case "sector_callout":
      return { sector_id: "", cta_label: "" };
  }
}

function normalizeContentBlocks(value: unknown) {
  return Array.isArray(value)
    ? value.map((item, index) =>
        isRecord(item) ? item : createBlock("paragraph", index),
      )
    : [];
}

function readContentBlockType(value: unknown, allowedTypes: ContentBlockType[]) {
  return allowedTypes.includes(value as ContentBlockType)
    ? (value as ContentBlockType)
    : allowedTypes[0];
}

function getBlockLabel(item: Record<string, unknown>, index: number) {
  const type = readString(item.type) as ContentBlockType;
  const data = isRecord(item.data) ? item.data : {};

  switch (type) {
    case "heading": {
      const level = readString(data.level) || "h2";
      const text = readString(data.text);
      return text
        ? `${level.toUpperCase()} - ${truncateText(text, 40)}`
        : `Judul bagian ${index + 1}`;
    }
    case "paragraph": {
      const text = readString(data.text);
      return text
        ? `Paragraf - ${truncateText(text, 50)}`
        : `Paragraf ${index + 1}`;
    }
    case "quote": {
      const text = readString(data.text);
      const author = readString(data.author);
      return text
        ? `Kutipan - ${truncateText(text, 40)}${author ? ` - ${author}` : ""}`
        : `Kutipan ${index + 1}`;
    }
    case "image": {
      const alt = readString(data.alt_text) || readString(data.caption);
      return alt ? `Gambar - ${truncateText(alt, 40)}` : `Gambar ${index + 1}`;
    }
    case "youtube_embed": {
      const videoId = readString(data.video_id);
      return videoId
        ? `YouTube - ${videoId}`
        : `YouTube ${index + 1}`;
    }
    case "offer_callout": {
      const offerId = readString(data.offer_id);
      return offerId
        ? `Tombol penawaran - ${offerId}`
        : `Tombol penawaran ${index + 1}`;
    }
    case "sector_callout": {
      const sectorId = readString(data.sector_id);
      return sectorId
        ? `Tombol sektor - ${sectorId}`
        : `Tombol sektor ${index + 1}`;
    }
    case "whatsapp_cta": {
      const label = readString(data.label);
      return label
        ? `Tombol WhatsApp - ${truncateText(label, 30)}`
        : `Tombol WhatsApp ${index + 1}`;
    }
    case "line_cta": {
      const label = readString(data.label);
      return label
        ? `Tombol LINE - ${truncateText(label, 30)}`
        : `Tombol LINE ${index + 1}`;
    }
    default:
      return `Blok ${index + 1}`;
  }
}

function truncateText(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function getSaveStatusLabel(
  saveState: SaveState,
  isSaving: boolean,
  lastSavedAt: string | null,
) {
  if (isSaving || saveState === "saving") {
    return "Menyimpan...";
  }

  if (saveState === "dirty") {
    return "Ada perubahan belum disimpan";
  }

  if (saveState === "error") {
    return "Perlu dicek";
  }

  return lastSavedAt ? `Tersimpan ${formatDateTime(lastSavedAt)}` : "Tersimpan";
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getArrayItemLabel(
  item: unknown,
  index: number,
  fallbackLabel: string | undefined,
) {
  if (isRecord(item)) {
    const label =
      readString(item.title) ||
      readString(item.label) ||
      readString(item.question) ||
      readString(item.name) ||
      readString(item.text);

    if (label) {
      return label;
    }
  }

  return `${fallbackLabel ?? "Item"} ${index + 1}`;
}

function getArrayItemKey(item: unknown, index: number) {
  if (isRecord(item) && readString(item.id)) {
    return readString(item.id);
  }

  return String(index);
}

function normalizeArrayItems<T>(items: T[], sortOrderField?: string) {
  if (!sortOrderField) {
    return items;
  }

  return items.map((item, index) =>
    isRecord(item)
      ? ({
          ...item,
          [sortOrderField]: index,
        } as T)
      : item,
  );
}

function getActionFieldErrors(details: unknown) {
  if (!isRecord(details) || !isRecord(details.errors)) {
    return {};
  }

  const result: FieldErrors = {};

  for (const [key, value] of Object.entries(details.errors)) {
    if (Array.isArray(value)) {
      result[key] = value.filter((item): item is string => typeof item === "string");
    }
  }

  return result;
}

function isItemMutationSuccess(value: unknown): value is {
  ok: true;
  item: {
    id: string;
    status: PublishStatus;
    dataJson: Record<string, unknown>;
    publishedDataJson: Record<string, unknown> | null;
    updatedAt: string;
  };
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    isRecord(value.item) &&
    typeof value.item.id === "string" &&
    typeof value.item.updatedAt === "string"
  );
}

function isSlugCheckSuccess(value: unknown): value is {
  ok: true;
  available: boolean;
  slug: string;
} {
  return isRecord(value) && value.ok === true && typeof value.available === "boolean";
}

function isPreviewTokenSuccess(value: unknown): value is {
  ok: true;
  token: string;
  expiresAt: string;
  previewUrl: string;
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    typeof value.previewUrl === "string"
  );
}

function getActionErrorMessage(value: unknown, fallback: string): string {
  if (isRecord(value) && value.code === "VALIDATION_ERROR") {
    return "Lengkapi field yang ditandai sebelum lanjut.";
  }

  if (isRecord(value) && typeof value.error === "string") {
    return value.error;
  }

  return fallback;
}

function getRecordValue(value: unknown, key: string) {
  return isRecord(value) ? value[key] : undefined;
}

function getFieldError(errors: FieldErrors, path: string) {
  return errors[path]?.join(" ") ?? null;
}

function clearErrorForPath(errors: FieldErrors, path: string) {
  const nextErrors: FieldErrors = {};

  for (const [key, value] of Object.entries(errors)) {
    if (key !== path && !key.startsWith(`${path}.`)) {
      nextErrors[key] = value;
    }
  }

  return nextErrors;
}

function joinPath(basePath: string | undefined, path: string) {
  return basePath ? `${basePath}.${path}` : path;
}

function getAtPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number(segment);

      return Number.isInteger(index) ? current[index] : undefined;
    }

    if (isRecord(current)) {
      return current[segment];
    }

    return undefined;
  }, source);
}

function setAtPath(source: Record<string, unknown>, path: string, value: unknown) {
  const segments = path.split(".");
  const root = cloneContainer(source);
  let cursor: Record<string, unknown> | unknown[] = root;

  segments.slice(0, -1).forEach((segment, index) => {
    const key = parsePathSegment(segment);
    const nextKey = parsePathSegment(segments[index + 1]);
    const current = readFromContainer(cursor, key);
    const nextContainer = cloneContainer(
      current,
      typeof nextKey === "number" ? [] : {},
    );

    writeToContainer(cursor, key, nextContainer);
    cursor = nextContainer;
  });

  writeToContainer(cursor, parsePathSegment(segments[segments.length - 1]), value);

  return root as Record<string, unknown>;
}

function parsePathSegment(segment: string) {
  return /^[0-9]+$/.test(segment) ? Number(segment) : segment;
}

function readFromContainer(
  container: Record<string, unknown> | unknown[],
  key: string | number,
) {
  if (Array.isArray(container) && typeof key === "number") {
    return container[key];
  }

  if (!Array.isArray(container) && typeof key === "string") {
    return container[key];
  }

  return undefined;
}

function writeToContainer(
  container: Record<string, unknown> | unknown[],
  key: string | number,
  value: unknown,
) {
  if (Array.isArray(container) && typeof key === "number") {
    container[key] = value;
    return;
  }

  if (!Array.isArray(container) && typeof key === "string") {
    container[key] = value;
  }
}

function cloneContainer(
  value: unknown,
  fallback: Record<string, unknown> | unknown[] = {},
) {
  if (Array.isArray(value)) {
    return [...value];
  }

  if (isRecord(value)) {
    return { ...value };
  }

  return Array.isArray(fallback) ? [...fallback] : { ...fallback };
}

function deepMerge(
  defaultValue: unknown,
  currentValue: unknown,
): Record<string, unknown> {
  if (!isRecord(defaultValue)) {
    return cloneJson(currentValue ?? defaultValue) as Record<string, unknown>;
  }

  const merged: Record<string, unknown> = { ...defaultValue };

  if (!isRecord(currentValue)) {
    return cloneJson(merged);
  }

  for (const [key, value] of Object.entries(currentValue)) {
    const defaultChild = defaultValue[key];

    if (Array.isArray(value)) {
      merged[key] = cloneJson(value);
    } else if (isRecord(defaultChild) && isRecord(value)) {
      merged[key] = deepMerge(defaultChild, value);
    } else {
      merged[key] = cloneJson(value);
    }
  }

  return cloneJson(merged);
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isOptionSelected(
  values: string[],
  option: { id: string; value: string },
) {
  return values.includes(option.id) || values.includes(option.value);
}

function resolveSelectValue(
  value: string,
  options: Array<{ id?: string; value: string }>,
  usesOptionSet: boolean,
) {
  if (!value) {
    return EMPTY_SELECT_VALUE;
  }

  if (!usesOptionSet) {
    return value;
  }

  return (
    options.find((option) => option.id === value || option.value === value)
      ?.id ?? value
  );
}

function getSelectOptionValue(
  option: { id?: string; value: string },
  usesOptionSet: boolean,
) {
  return usesOptionSet && option.id ? option.id : option.value;
}

function toInputValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function toNumberInputValue(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
