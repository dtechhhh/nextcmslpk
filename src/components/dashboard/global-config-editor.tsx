"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDownIcon, SaveIcon } from "lucide-react";

import { IconPicker } from "@/components/dashboard/forms/icon-picker";
import { MediaPicker } from "@/components/dashboard/forms/media-picker";
import { SortableList } from "@/components/dashboard/forms/sortable-list";
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
  GLOBAL_CONFIG_EDITOR_DEFINITIONS,
  type GlobalConfigData,
  type GlobalConfigEditorKey,
  type GlobalConfigField,
  type GlobalConfigSection,
} from "@/lib/global-config-editor-definitions";
import { GLOBAL_CONFIG_SCHEMAS } from "@/lib/validations/global";
import { zodErrorToFieldErrors } from "@/lib/validations/global/_shared";
import { cn } from "@/lib/utils";
import { updateGlobalConfig } from "@/server/actions/tenant/global-config";

type GlobalConfigEditorProps = {
  tenantId: string;
  variantId: string;
  definitionKey: GlobalConfigEditorKey;
  initialData: GlobalConfigData;
  updatedAt: string;
};

type FieldErrors = Record<string, string[]>;
type SaveMode = "auto" | "manual";
type SaveState = "saved" | "dirty" | "saving" | "error";

export function GlobalConfigEditor({
  tenantId,
  variantId,
  definitionKey,
  initialData,
  updatedAt,
}: GlobalConfigEditorProps) {
  const definition = GLOBAL_CONFIG_EDITOR_DEFINITIONS[definitionKey];
  const validationSchema = GLOBAL_CONFIG_SCHEMAS[definitionKey];
  const [data, setData] = useState<GlobalConfigData>(() =>
    deepMerge(definition.defaultData, initialData),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [lastSavedAt, setLastSavedAt] = useState(updatedAt);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [isSaving, setIsSaving] = useState(false);
  const dataRef = useRef(data);
  const lastSavedSerializedRef = useRef(JSON.stringify(data));
  const saveSequenceRef = useRef(0);
  const pendingSaveCountRef = useRef(0);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const setValue = useCallback((path: string, value: unknown) => {
    setData((current) => setAtPath(current, path, value));
    setErrors((current) => clearErrorForPath(current, path));
  }, []);

  const save = useCallback(
    async (mode: SaveMode) => {
      const snapshot = dataRef.current;
      const serializedSnapshot = JSON.stringify(snapshot);

      if (mode === "auto" && serializedSnapshot === lastSavedSerializedRef.current) {
        return;
      }

      const clientValidation = validationSchema.safeParse(snapshot);

      if (!clientValidation.success) {
        setErrors(zodErrorToFieldErrors(clientValidation.error));
        setSaveState("error");

        if (mode === "manual") {
          toast.error("Periksa field yang belum valid.");
        }

        return;
      }

      const saveId = ++saveSequenceRef.current;

      pendingSaveCountRef.current += 1;
      setIsSaving(true);
      setSaveState("saving");

      try {
        const response = await updateGlobalConfig(
          variantId,
          definition.configKey,
          clientValidation.data,
        );

        if (!isGlobalConfigUpdateSuccess(response)) {
          const actionErrors = getActionFieldErrors(
            getRecordValue(response, "details"),
          );

          if (Object.keys(actionErrors).length > 0) {
            setErrors(actionErrors);
          }

          setSaveState("error");
          toast.error(getActionErrorMessage(response, "Global config gagal disimpan."));
          return;
        }

        if (saveId === saveSequenceRef.current) {
          setErrors({});
          setLastSavedAt(response.config.updatedAt);
          lastSavedSerializedRef.current = serializedSnapshot;
          setSaveState(
            JSON.stringify(dataRef.current) === serializedSnapshot ? "saved" : "dirty",
          );
        }

        if (mode === "manual") {
          toast.success("Global config tersimpan.");
        }
      } catch {
        setSaveState("error");
        toast.error("Global config gagal disimpan.");
      } finally {
        pendingSaveCountRef.current = Math.max(pendingSaveCountRef.current - 1, 0);
        setIsSaving(pendingSaveCountRef.current > 0);
      }
    },
    [definition.configKey, validationSchema, variantId],
  );

  useEffect(() => {
    const serializedData = JSON.stringify(data);

    if (serializedData === lastSavedSerializedRef.current) {
      setSaveState((current) => (current === "saving" ? current : "saved"));
      return;
    }

    setSaveState((current) => (current === "saving" ? current : "dirty"));
    const timeoutId = window.setTimeout(() => {
      void save("auto");
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [data, save]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save("manual");
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            {definition.variantKey === "indonesia" ? "Indonesia" : "Japan"} / Global
          </p>
          <h1 className="text-2xl font-semibold tracking-normal">
            {definition.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Live config</Badge>
          <span
            className={cn(
              "text-sm text-muted-foreground",
              saveState === "error" && "text-destructive",
            )}
          >
            {getSaveStatusLabel(saveState, isSaving, lastSavedAt)}
          </span>
          <Button type="submit" disabled={isSaving}>
            <SaveIcon />
            Save
          </Button>
        </div>
      </div>

      <FieldGroup>
        {definition.sections.map((section) => (
          <EditorSection
            key={section.key}
            section={section}
            data={data}
            errors={errors}
            tenantId={tenantId}
            setValue={setValue}
          />
        ))}
      </FieldGroup>
    </form>
  );
}

function EditorSection({
  section,
  data,
  errors,
  tenantId,
  setValue,
}: {
  section: GlobalConfigSection;
  data: GlobalConfigData;
  errors: FieldErrors;
  tenantId: string;
  setValue: (path: string, value: unknown) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="overflow-hidden rounded-lg border bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
          <span className="text-base font-medium">{section.title}</span>
          <ChevronDownIcon
            className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t p-4">
            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <FieldRenderer
                  key={`${section.key}.${field.path}`}
                  field={field}
                  data={data}
                  errors={errors}
                  tenantId={tenantId}
                  setValue={setValue}
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
  setValue,
  basePath,
}: {
  field: GlobalConfigField;
  data: GlobalConfigData;
  errors: FieldErrors;
  tenantId: string;
  setValue: (path: string, value: unknown) => void;
  basePath?: string;
}) {
  const path = joinPath(basePath, field.path);
  const error = getError(errors, path);
  const fieldClassName =
    field.kind === "textarea" ||
    field.kind === "array" ||
    field.kind === "string-array"
      ? "md:col-span-2"
      : undefined;

  if (field.kind === "array") {
    const rawItems = getAtPath(data, path);
    const items = Array.isArray(rawItems) ? rawItems : [];

    return (
      <Field className={fieldClassName} data-invalid={Boolean(error)}>
        <FieldLabel>{field.label}</FieldLabel>
        <SortableList
          items={items.map((item) =>
            isRecord(item) ? deepMerge(field.defaultItem, item) : item,
          )}
          addLabel={field.addLabel}
          emptyLabel="No items yet."
          createItem={(index) =>
            normalizeArrayItems(
              [
                cloneJson({
                  ...field.defaultItem,
                  ...(field.sortOrderField ? { [field.sortOrderField]: index } : {}),
                }),
              ],
              field.sortOrderField,
            )[0]
          }
          normalizeItems={(nextItems) =>
            normalizeArrayItems(nextItems, field.sortOrderField)
          }
          getItemLabel={(item, index) => getArrayItemLabel(field, item, index)}
          getItemKey={(item, index) => getArrayItemKey(item, index)}
          onChange={(nextItems) => setValue(path, nextItems)}
          renderItem={(_item, index) => (
            <div className="grid gap-4 md:grid-cols-2">
              {field.fields.map((itemField) => (
                <FieldRenderer
                  key={`${path}.${index}.${itemField.path}`}
                  field={itemField}
                  data={data}
                  errors={errors}
                  tenantId={tenantId}
                  setValue={setValue}
                  basePath={`${path}.${index}`}
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
      <Field className={fieldClassName} data-invalid={Boolean(error)}>
        <FieldLabel>{field.label}</FieldLabel>
        <SortableList
          items={items}
          addLabel={field.addLabel}
          emptyLabel="No items yet."
          createItem={() => field.defaultItem ?? ""}
          getItemLabel={(_item, index) => `${field.itemLabel ?? "Item"} ${index + 1}`}
          getItemKey={(item, index) => `${item}-${index}`}
          onChange={(nextItems) => setValue(path, nextItems)}
          renderItem={(_item, index) => (
            <FieldRenderer
              field={{
                kind: "text",
                path: String(index),
                label: field.itemLabel ?? "Item",
              }}
              data={data}
              errors={errors}
              tenantId={tenantId}
              setValue={setValue}
              basePath={path}
            />
          )}
        />
        <FieldError>{error}</FieldError>
      </Field>
    );
  }

  return (
    <Field className={fieldClassName} data-invalid={Boolean(error)}>
      {field.kind === "switch" ? (
        <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg border px-3 py-2">
          <FieldContent>
            <FieldLabel>{field.label}</FieldLabel>
          </FieldContent>
          <Switch
            checked={Boolean(getAtPath(data, path))}
            onCheckedChange={(checked) => setValue(path, checked)}
            aria-invalid={Boolean(error)}
          />
        </div>
      ) : (
        <>
          <FieldLabel>{field.label}</FieldLabel>
          {renderControl({ field, data, error, path, tenantId, setValue })}
        </>
      )}
      <FieldError>{error}</FieldError>
    </Field>
  );
}

function renderControl({
  field,
  data,
  error,
  path,
  tenantId,
  setValue,
}: {
  field: Exclude<GlobalConfigField, { kind: "array" | "string-array" | "switch" }>;
  data: GlobalConfigData;
  error: string | null;
  path: string;
  tenantId: string;
  setValue: (path: string, value: unknown) => void;
}) {
  const rawValue = getAtPath(data, path);

  switch (field.kind) {
    case "color":
      return (
        <div className="flex items-center gap-2">
          <Input
            value={
              isHexColor(rawValue)
                ? rawValue
                : isHexColor(field.placeholder)
                  ? field.placeholder
                  : "#000000"
            }
            type="color"
            className="h-8 w-12 shrink-0 cursor-pointer p-1"
            aria-label={`${field.label} swatch`}
            onChange={(event) => setValue(path, event.target.value)}
          />
          <Input
            value={toInputValue(rawValue)}
            type="text"
            inputMode="text"
            maxLength={7}
            placeholder={field.placeholder ?? "#000000"}
            aria-invalid={Boolean(error)}
            onChange={(event) => setValue(path, event.target.value)}
          />
        </div>
      );
    case "text":
      return (
        <Input
          value={toInputValue(rawValue)}
          type={field.inputType ?? "text"}
          placeholder={field.placeholder}
          aria-invalid={Boolean(error)}
          onChange={(event) => setValue(path, event.target.value)}
        />
      );
    case "textarea":
      return (
        <Textarea
          value={toInputValue(rawValue)}
          placeholder={field.placeholder}
          aria-invalid={Boolean(error)}
          onChange={(event) => setValue(path, event.target.value)}
        />
      );
    case "number":
      return (
        <Input
          value={typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0)}
          type="number"
          min={field.min}
          max={field.max}
          aria-invalid={Boolean(error)}
          onChange={(event) =>
            setValue(path, event.target.value === "" ? 0 : Number(event.target.value))
          }
        />
      );
    case "select":
      return (
        <Select
          value={toInputValue(rawValue)}
          onValueChange={(value) => setValue(path, value)}
        >
          <SelectTrigger className="w-full" aria-invalid={Boolean(error)}>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "media":
    case "document":
      return (
        <MediaPicker
          tenantId={tenantId}
          value={toInputValue(rawValue)}
          mediaType={field.kind === "document" ? "DOCUMENT" : "IMAGE"}
          mediaPreset={field.kind === "media" ? field.mediaPreset : undefined}
          cropPreset={field.kind === "media" ? field.cropPreset : undefined}
          onChange={(mediaId) => setValue(path, mediaId)}
        />
      );
    case "icon":
      return (
        <IconPicker
          value={toInputValue(rawValue)}
          onChange={(iconKey) => setValue(path, iconKey)}
        />
      );
  }
}

function getSaveStatusLabel(
  saveState: SaveState,
  isSaving: boolean,
  lastSavedAt: string,
) {
  if (isSaving || saveState === "saving") {
    return "Saving...";
  }

  if (saveState === "dirty") {
    return "Unsaved changes";
  }

  if (saveState === "error") {
    return "Needs attention";
  }

  return `Saved ${formatDateTime(lastSavedAt)}`;
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

function getArrayItemLabel(field: Extract<GlobalConfigField, { kind: "array" }>, item: unknown, index: number) {
  if (isRecord(item) && typeof item.label === "string" && item.label.trim() !== "") {
    return item.label;
  }

  return `${field.itemLabel ?? "Item"} ${index + 1}`;
}

function getArrayItemKey(item: unknown, index: number) {
  if (isRecord(item) && typeof item.key === "string" && item.key.trim() !== "") {
    return item.key;
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

  const errors: FieldErrors = {};

  for (const [key, value] of Object.entries(details.errors)) {
    if (Array.isArray(value)) {
      errors[key] = value.filter((item): item is string => typeof item === "string");
    }
  }

  return errors;
}

function isGlobalConfigUpdateSuccess(value: unknown): value is {
  ok: true;
  config: {
    updatedAt: string;
  };
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    isRecord(value.config) &&
    typeof value.config.updatedAt === "string"
  );
}

function getActionErrorMessage(value: unknown, fallback: string) {
  if (isRecord(value) && typeof value.error === "string") {
    return value.error;
  }

  return fallback;
}

function getRecordValue(value: unknown, key: string) {
  return isRecord(value) ? value[key] : undefined;
}

function getError(errors: FieldErrors, path: string) {
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

function setAtPath(source: GlobalConfigData, path: string, value: unknown) {
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

  return root as GlobalConfigData;
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

function cloneContainer(value: unknown, fallback: Record<string, unknown> | unknown[] = {}) {
  if (Array.isArray(value)) {
    return [...value];
  }

  if (isRecord(value)) {
    return { ...value };
  }

  return Array.isArray(fallback) ? [...fallback] : { ...fallback };
}

function deepMerge(defaultValue: unknown, currentValue: unknown): GlobalConfigData {
  if (!isRecord(defaultValue)) {
    return cloneJson(currentValue ?? defaultValue) as GlobalConfigData;
  }

  const merged: GlobalConfigData = { ...defaultValue };

  if (!isRecord(currentValue)) {
    return cloneJson(merged) as GlobalConfigData;
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

  return merged;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
