"use client";

import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { lookupCollectionItems } from "@/server/actions/tenant/collection";

type CollectionItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type CalloutPickerProps = {
  variantId: string;
  collectionKey: string;
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
};

export function CalloutPicker({
  variantId,
  collectionKey,
  value,
  onChange,
  placeholder = "Pilih item...",
}: CalloutPickerProps) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const loadedRef = useRef(false);

  const loadItems = useCallback(
    async (searchText?: string) => {
      setIsLoading(true);
      try {
        const response = await lookupCollectionItems({
          variantId,
          collectionKey,
          search: searchText || undefined,
        });

        if (
          response &&
          typeof response === "object" &&
          "ok" in response &&
          response.ok &&
          "items" in response &&
          Array.isArray(response.items)
        ) {
          setItems(response.items as CollectionItem[]);
        }
      } catch {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [variantId, collectionKey],
  );

  useEffect(() => {
    if (isOpen && !loadedRef.current) {
      loadedRef.current = true;
      void loadItems();
    }
  }, [isOpen, loadItems]);

  const selectedItem = items.find((item) => item.id === value);

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={value || "__empty"}
        onValueChange={(nextValue) => {
          onChange(nextValue === "__empty" || nextValue === null ? "" : nextValue ?? "");
        }}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSearch("");
          }
        }}
      >
        <SelectTrigger className="w-full" disabled={isLoading}>
          <SelectValue placeholder={placeholder}>
            {selectedItem ? selectedItem.title : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-64">
          <div className="flex items-center gap-2 border-b px-2 py-2 sticky top-0 bg-popover z-10">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <Input
              className="h-7 border-0 p-0 shadow-none focus-visible:ring-0"
              placeholder="Cari..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                void loadItems(event.target.value);
              }}
            />
          </div>
          <SelectItem value="__empty">None</SelectItem>
          {items.length === 0 ? (
            <div className="px-2 py-3 text-xs text-muted-foreground text-center">
              {isLoading ? "Memuat..." : "Tidak ada item."}
            </div>
          ) : (
            items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                <span className="truncate">{item.title}</span>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {selectedItem ? (
        <p className="truncate text-xs text-muted-foreground">
          {selectedItem.title}
          {selectedItem.status === "DRAFT" ? " (Draft)" : ""}
        </p>
      ) : null}
    </div>
  );
}
