"use client";

import {
  ArrowRightLeftIcon,
  ChevronDownIcon,
  PencilIcon,
  Loader2Icon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useCmsBusy } from "@/components/cms/cms-busy-feedback";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  addOptionValue,
  deleteOptionValue,
  getOptionSetValues,
  listOptionSets,
  mergeOptionValue,
  toggleOptionValue,
  updateOptionValueLabel,
} from "@/server/actions/tenant/options";
import { cn } from "@/lib/utils";

type OptionSetRow = {
  id: string;
  key: string;
  label: string;
  valuesCount: number;
};

type OptionValueRow = {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  usageCount: number;
};

type OptionDataManagerProps = {
  variantId: string;
  variantLabel: string;
};

export function OptionDataManager({ variantId, variantLabel }: OptionDataManagerProps) {
  const [optionSets, setOptionSets] = useState<OptionSetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedValues, setExpandedValues] = useState<OptionValueRow[]>([]);
  const [valuesLoading, setValuesLoading] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [addingValue, setAddingValue] = useState(false);
  const [rowActionId, setRowActionId] = useState<string | null>(null);
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const { start } = useCmsBusy();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const stopBusy = start("Memuat option data...");

      try {
        const response = await listOptionSets(variantId);

        if (cancelled) return;

        if (isOptionSetsSuccess(response)) {
          setOptionSets(response.optionSets);
        } else {
          toast.error(getErrorMessage(response, "Option sets gagal dimuat."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
        stopBusy();
      }
    }

    void load();

    return () => { cancelled = true; };
  }, [variantId, start]);

  async function loadValues(optionSetId: string, options: { showLoading?: boolean } = {}) {
    const showLoading = options.showLoading ?? true;

    if (showLoading) {
      setValuesLoading(true);
    }

    const stopBusy = start("Memuat values...");

    try {
      const response = await getOptionSetValues(optionSetId);

      if (isValuesSuccess(response)) {
        setExpandedValues(response.values);
      } else {
        toast.error(getErrorMessage(response, "Values gagal dimuat."));
      }
    } finally {
      if (showLoading) {
        setValuesLoading(false);
      }
      stopBusy();
    }
  }

  async function toggleExpand(optionSetId: string) {
    if (expandedId === optionSetId) {
      setExpandedId(null);
      setExpandedValues([]);
      setEditingValueId(null);
      setMergeSourceId(null);
      return;
    }

    setExpandedId(optionSetId);
    setEditingValueId(null);
    setMergeSourceId(null);
    await loadValues(optionSetId);
  }

  async function handleAddValue(optionSetId: string) {
    if (!newLabel.trim()) return;

    setAddingValue(true);
    const stopBusy = start("Menambahkan value...");

    try {
      const response = await addOptionValue({ optionSetId, label: newLabel.trim() });

      if (isValueSuccess(response)) {
        setExpandedValues((current) => [...current, response.value]);
        setNewLabel("");
        toast.success("Value ditambahkan.");
        setOptionSets((current) =>
          current.map((set) =>
            set.id === optionSetId ? { ...set, valuesCount: set.valuesCount + 1 } : set,
          ),
        );
      } else {
        toast.error(getErrorMessage(response, "Value gagal ditambahkan."));
      }
    } finally {
      setAddingValue(false);
      stopBusy();
    }
  }

  async function handleToggleActive(valueId: string, isActive: boolean) {
    setRowActionId(`toggle:${valueId}`);
    const stopBusy = start("Mengubah status value...");

    try {
      const response = await toggleOptionValue({ valueId, isActive });

      if (isValueSuccess(response)) {
        setExpandedValues((current) =>
          current.map((v) =>
            v.id === valueId ? { ...v, isActive: response.value.isActive } : v,
          ),
        );
      } else {
        toast.error(getErrorMessage(response, "Status gagal diubah."));
      }
    } finally {
      setRowActionId(null);
      stopBusy();
    }
  }

  function startEditing(value: OptionValueRow) {
    setEditingValueId(value.id);
    setEditLabel(value.label);
    setMergeSourceId(null);
  }

  function cancelEditing() {
    setEditingValueId(null);
    setEditLabel("");
  }

  async function handleUpdateLabel(valueId: string) {
    const label = editLabel.trim();

    if (!label) {
      return;
    }

    setRowActionId(`edit:${valueId}`);
    const stopBusy = start("Menyimpan label value...");

    try {
      const response = await updateOptionValueLabel({ valueId, label });

      if (isValueSuccess(response)) {
        setExpandedValues((current) =>
          current.map((value) => (value.id === valueId ? response.value : value)),
        );
        cancelEditing();
        toast.success("Label value diperbarui.");
      } else {
        toast.error(getErrorMessage(response, "Label value gagal diubah."));
      }
    } finally {
      setRowActionId(null);
      stopBusy();
    }
  }

  async function handleDeleteValue(optionSetId: string, value: OptionValueRow) {
    if (value.usageCount > 0) {
      toast.error("Value masih dipakai. Gunakan merge atau nonaktifkan value.");
      return;
    }

    const confirmed = window.confirm(`Hapus value "${value.label}"? Tindakan ini tidak bisa dibatalkan.`);

    if (!confirmed) {
      return;
    }

    setRowActionId(`delete:${value.id}`);
    const stopBusy = start("Menghapus value...");

    try {
      const response = await deleteOptionValue({ valueId: value.id });

      if (isDeleteSuccess(response)) {
        setExpandedValues((current) => current.filter((item) => item.id !== value.id));
        setOptionSets((current) =>
          current.map((set) =>
            set.id === optionSetId
              ? { ...set, valuesCount: Math.max(0, set.valuesCount - 1) }
              : set,
          ),
        );
        toast.success("Value dihapus.");
      } else {
        toast.error(getErrorMessage(response, "Value gagal dihapus."));
      }
    } finally {
      setRowActionId(null);
      stopBusy();
    }
  }

  function startMerge(value: OptionValueRow) {
    const firstTarget = expandedValues.find((item) => item.id !== value.id);

    setMergeSourceId(value.id);
    setMergeTargetId(firstTarget?.id ?? "");
    setEditingValueId(null);
  }

  function cancelMerge() {
    setMergeSourceId(null);
    setMergeTargetId("");
  }

  async function handleMergeValue(optionSetId: string, sourceValue: OptionValueRow) {
    if (!mergeTargetId) {
      return;
    }

    const targetValue = expandedValues.find((value) => value.id === mergeTargetId);
    const confirmed = window.confirm(
      `Gabungkan "${sourceValue.label}" ke "${targetValue?.label ?? "target"}"? Semua konten yang memakai value ini akan diarahkan ke target.`,
    );

    if (!confirmed) {
      return;
    }

    setRowActionId(`merge:${sourceValue.id}`);
    const stopBusy = start("Menggabungkan value...");

    try {
      const response = await mergeOptionValue({
        sourceValueId: sourceValue.id,
        targetValueId: mergeTargetId,
      });

      if (isMergeSuccess(response)) {
        cancelMerge();
        setOptionSets((current) =>
          current.map((set) =>
            set.id === optionSetId
              ? { ...set, valuesCount: Math.max(0, set.valuesCount - 1) }
              : set,
          ),
        );

        if (expandedId) {
          await loadValues(expandedId, { showLoading: false });
        }

        toast.success(
          `Value digabung. ${response.affectedItems} konten diperbarui.`,
        );
      } else {
        toast.error(getErrorMessage(response, "Value gagal digabung."));
      }
    } finally {
      setRowActionId(null);
      stopBusy();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          {variantLabel} / Option Data
        </p>
        <h1 className="text-2xl font-semibold tracking-normal">Option Sets</h1>
      </div>

      {loading ? (
        <div className="grid min-h-72 place-items-center text-sm text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
        </div>
      ) : optionSets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No option sets found for this variant. Option sets are created automatically from registry when variant content is initialized.
        </div>
      ) : (
        <div className="flex flex-col rounded-lg border">
          {optionSets.map((optionSet, index) => (
            <OptionSetRow
              key={optionSet.id}
              optionSet={optionSet}
              bordered={index < optionSets.length - 1}
              expanded={expandedId === optionSet.id}
              values={expandedValues}
              valuesLoading={valuesLoading && expandedId === optionSet.id}
              newLabel={newLabel}
              addingValue={addingValue && expandedId === optionSet.id}
              onToggleExpand={() => toggleExpand(optionSet.id)}
              onNewLabelChange={setNewLabel}
              onAddValue={() => handleAddValue(optionSet.id)}
              onToggleActive={handleToggleActive}
              rowActionId={rowActionId}
              editingValueId={editingValueId}
              editLabel={editLabel}
              mergeSourceId={mergeSourceId}
              mergeTargetId={mergeTargetId}
              onStartEdit={startEditing}
              onEditLabelChange={setEditLabel}
              onCancelEdit={cancelEditing}
              onSaveEdit={handleUpdateLabel}
              onDeleteValue={(value) => handleDeleteValue(optionSet.id, value)}
              onStartMerge={startMerge}
              onCancelMerge={cancelMerge}
              onMergeTargetChange={setMergeTargetId}
              onConfirmMerge={(value) => handleMergeValue(optionSet.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OptionSetRow({
  optionSet,
  bordered,
  expanded,
  values,
  valuesLoading,
  newLabel,
  addingValue,
  onToggleExpand,
  onNewLabelChange,
  onAddValue,
  onToggleActive,
  rowActionId,
  editingValueId,
  editLabel,
  mergeSourceId,
  mergeTargetId,
  onStartEdit,
  onEditLabelChange,
  onCancelEdit,
  onSaveEdit,
  onDeleteValue,
  onStartMerge,
  onCancelMerge,
  onMergeTargetChange,
  onConfirmMerge,
}: {
  optionSet: OptionSetRow;
  bordered: boolean;
  expanded: boolean;
  values: OptionValueRow[];
  valuesLoading: boolean;
  newLabel: string;
  addingValue: boolean;
  onToggleExpand: () => void;
  onNewLabelChange: (value: string) => void;
  onAddValue: () => void;
  onToggleActive: (valueId: string, isActive: boolean) => void;
  rowActionId: string | null;
  editingValueId: string | null;
  editLabel: string;
  mergeSourceId: string | null;
  mergeTargetId: string;
  onStartEdit: (value: OptionValueRow) => void;
  onEditLabelChange: (value: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (valueId: string) => void;
  onDeleteValue: (value: OptionValueRow) => void;
  onStartMerge: (value: OptionValueRow) => void;
  onCancelMerge: () => void;
  onMergeTargetChange: (value: string) => void;
  onConfirmMerge: (value: OptionValueRow) => void;
}) {
  return (
    <Collapsible open={expanded} onOpenChange={onToggleExpand}>
      <div className={cn(bordered && "border-b")}>
        <CollapsibleTrigger className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-muted/50">
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{optionSet.label}</p>
            <p className="text-xs text-muted-foreground">
              {optionSet.key} &middot; {optionSet.valuesCount} value{optionSet.valuesCount !== 1 ? "s" : ""}
            </p>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t bg-muted/20 px-4 py-3">
            {valuesLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                Loading values...
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {values.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">No values yet.</p>
                ) : (
                  <div className="flex flex-col">
                    {values.map((value, index) => {
                      const isEditing = editingValueId === value.id;
                      const isMerging = mergeSourceId === value.id;
                      const busy = rowActionId?.endsWith(`:${value.id}`) ?? false;
                      const deleteDisabled = value.usageCount > 0 || busy;
                      const mergeDisabled = values.length < 2 || busy;

                      return (
                        <div
                          key={value.id}
                          className={cn(
                            "flex flex-col gap-3 py-3 md:flex-row md:items-center",
                            index < values.length - 1 && "border-b border-muted",
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <Field>
                                <FieldLabel className="sr-only">Edit value label</FieldLabel>
                                <Input
                                  value={editLabel}
                                  className="h-8 text-sm"
                                  maxLength={200}
                                  disabled={busy}
                                  onChange={(event) => onEditLabelChange(event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      onSaveEdit(value.id);
                                    }

                                    if (event.key === "Escape") {
                                      event.preventDefault();
                                      onCancelEdit();
                                    }
                                  }}
                                />
                              </Field>
                            ) : (
                              <>
                                <p className="text-sm font-medium">{value.label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {value.value} &middot; {value.usageCount} usage &middot; Created {formatDate(value.createdAt)}
                                </p>
                              </>
                            )}

                            {isMerging ? (
                              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                                <select
                                  value={mergeTargetId}
                                  className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                                  disabled={busy}
                                  onChange={(event) => onMergeTargetChange(event.target.value)}
                                >
                                  {values
                                    .filter((target) => target.id !== value.id)
                                    .map((target) => (
                                      <option key={target.id} value={target.id}>
                                        {target.label}
                                      </option>
                                    ))}
                                </select>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={!mergeTargetId || busy}
                                  onClick={() => onConfirmMerge(value)}
                                >
                                  {busy ? (
                                    <Loader2Icon className="size-4 animate-spin" />
                                  ) : (
                                    <ArrowRightLeftIcon className="size-4" />
                                  )}
                                  Merge
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={busy}
                                  onClick={onCancelMerge}
                                >
                                  <XIcon className="size-4" />
                                  Cancel
                                </Button>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <Switch
                              checked={value.isActive}
                              disabled={busy}
                              onCheckedChange={(checked) => onToggleActive(value.id, checked)}
                            />

                            {isEditing ? (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={!editLabel.trim() || busy}
                                  onClick={() => onSaveEdit(value.id)}
                                >
                                  {busy ? (
                                    <Loader2Icon className="size-4 animate-spin" />
                                  ) : (
                                    <SaveIcon className="size-4" />
                                  )}
                                  Save
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={busy}
                                  onClick={onCancelEdit}
                                >
                                  <XIcon className="size-4" />
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={busy}
                                  onClick={() => onStartEdit(value)}
                                >
                                  <PencilIcon className="size-4" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={mergeDisabled}
                                  onClick={() => onStartMerge(value)}
                                >
                                  <ArrowRightLeftIcon className="size-4" />
                                  Merge
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={deleteDisabled}
                                  title={
                                    value.usageCount > 0
                                      ? "Value masih dipakai. Gunakan merge atau nonaktifkan."
                                      : "Delete"
                                  }
                                  onClick={() => onDeleteValue(value)}
                                >
                                  <Trash2Icon className="size-4" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Field className="flex-1">
                    <FieldLabel className="sr-only">New value label</FieldLabel>
                    <Input
                      value={newLabel}
                      className="h-8 text-sm"
                      placeholder="New value label..."
                      maxLength={200}
                      disabled={addingValue}
                      onChange={(event) => onNewLabelChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          onAddValue();
                        }
                      }}
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!newLabel.trim() || addingValue}
                    onClick={onAddValue}
                  >
                    {addingValue ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <PlusIcon className="size-4" />
                    )}
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("id-ID", { dateStyle: "medium" });
}

function isOptionSetsSuccess(value: unknown): value is {
  ok: true;
  optionSets: OptionSetRow[];
} {
  return isRecord(value) && value.ok === true && Array.isArray(value.optionSets);
}

function isValuesSuccess(value: unknown): value is {
  ok: true;
  values: OptionValueRow[];
} {
  return isRecord(value) && value.ok === true && Array.isArray(value.values);
}

function isValueSuccess(value: unknown): value is {
  ok: true;
  value: OptionValueRow;
} {
  return isRecord(value) && value.ok === true && isRecord(value.value);
}

function isDeleteSuccess(value: unknown): value is {
  ok: true;
  valueId: string;
} {
  return isRecord(value) && value.ok === true && typeof value.valueId === "string";
}

function isMergeSuccess(value: unknown): value is {
  ok: true;
  sourceValueId: string;
  targetValue: OptionValueRow;
  affectedItems: number;
  replacedReferences: number;
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    typeof value.sourceValueId === "string" &&
    isRecord(value.targetValue)
  );
}

function getErrorMessage(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.error === "string") return value.error;
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
