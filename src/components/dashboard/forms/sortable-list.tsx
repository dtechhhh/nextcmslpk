"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortableListProps<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  createItem: (index: number) => T;
  renderItem: (item: T, index: number) => React.ReactNode;
  addLabel?: string;
  emptyLabel?: string;
  getItemLabel?: (item: T, index: number) => string;
  getItemKey?: (item: T, index: number) => string;
  normalizeItems?: (items: T[]) => T[];
  className?: string;
};

export function SortableList<T>({
  items,
  onChange,
  createItem,
  renderItem,
  addLabel = "Add item",
  emptyLabel = "No items yet.",
  getItemLabel = (_item, index) => `Item ${index + 1}`,
  getItemKey = (_item, index) => String(index),
  normalizeItems = (nextItems) => nextItems,
  className,
}: SortableListProps<T>) {
  const reactId = useId();
  const droppableId = `sortable-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  function emit(nextItems: T[]) {
    onChange(normalizeItems(nextItems));
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(result.source.index, 1);

    nextItems.splice(result.destination.index, 0, movedItem);
    emit(nextItems);
  }

  function handleRemove(index: number) {
    emit(items.filter((_item, itemIndex) => itemIndex !== index));
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              className="flex flex-col gap-3"
              {...provided.droppableProps}
            >
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  {emptyLabel}
                </div>
              )}

              {items.map((item, index) => {
                const itemKey = `${droppableId}-${getItemKey(item, index)}-${index}`;

                return (
                  <Draggable draggableId={itemKey} index={index} key={itemKey}>
                    {(dragProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        className="rounded-lg border bg-background"
                        {...dragProvided.draggableProps}
                      >
                        <div className="flex min-h-10 items-center gap-2 border-b px-3 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Drag item"
                            {...dragProvided.dragHandleProps}
                          >
                            <GripVerticalIcon />
                          </Button>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {getItemLabel(item, index)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove item"
                            onClick={() => handleRemove(index)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                        <div className="p-3">{renderItem(item, index)}</div>
                      </div>
                    )}
                  </Draggable>
                );
              })}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() => emit([...items, createItem(items.length)])}
      >
        <PlusIcon />
        {addLabel}
      </Button>
    </div>
  );
}
