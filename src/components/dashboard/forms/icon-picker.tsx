"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { createElement, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ICON_OPTIONS, getIconComponent } from "@/lib/icon-registry";
import { cn } from "@/lib/utils";

type IconPickerProps = {
  value: string;
  onChange: (iconKey: string) => void;
  disabled?: boolean;
};

export function IconPicker({ value, onChange, disabled = false }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return ICON_OPTIONS;
    }

    return ICON_OPTIONS.filter(
      (option) =>
        option.key.toLowerCase().includes(normalizedQuery) ||
        option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  function handleSelect(iconKey: string) {
    onChange(iconKey);
    setOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className="min-w-0 justify-start"
        onClick={() => setOpen(true)}
      >
        {createElement(getIconComponent(value))}
        <span className="truncate">{value || "Select icon"}</span>
      </Button>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear icon"
          disabled={disabled}
          onClick={() => onChange("")}
        >
          <XIcon />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select icon</DialogTitle>
            <DialogDescription>Icon registry preview.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                className="pl-8"
                placeholder="Search icons"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="max-h-[56vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {filteredOptions.map((option) => {
                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={cn(
                        "flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border bg-background p-3 text-center text-sm transition-colors hover:border-primary",
                        option.key === value && "border-primary ring-2 ring-primary/20",
                      )}
                      onClick={() => handleSelect(option.key)}
                    >
                      {createElement(getIconComponent(option.key), {
                        className: "size-5",
                      })}
                      <span className="line-clamp-2 text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
