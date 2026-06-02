"use client";

import {
  ChevronDownIcon,
  Loader2Icon,
  PlusIcon,
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
  getOptionSetValues,
  listOptionSets,
  toggleOptionValue,
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

  async function toggleExpand(optionSetId: string) {
    if (expandedId === optionSetId) {
      setExpandedId(null);
      setExpandedValues([]);
      return;
    }

    setExpandedId(optionSetId);
    setValuesLoading(true);
    const stopBusy = start("Memuat values...");

    try {
      const response = await getOptionSetValues(optionSetId);

      if (isValuesSuccess(response)) {
        setExpandedValues(response.values);
      } else {
        toast.error(getErrorMessage(response, "Values gagal dimuat."));
      }
    } finally {
      setValuesLoading(false);
      stopBusy();
    }
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
                    {values.map((value, index) => (
                      <div
                        key={value.id}
                        className={cn(
                          "flex items-center gap-3 py-2",
                          index < values.length - 1 && "border-b border-muted",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{value.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {value.value} &middot; Created {formatDate(value.createdAt)}
                          </p>
                        </div>
                        <Switch
                          checked={value.isActive}
                          onCheckedChange={(checked) => onToggleActive(value.id, checked)}
                        />
                      </div>
                    ))}
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

function getErrorMessage(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.error === "string") return value.error;
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
