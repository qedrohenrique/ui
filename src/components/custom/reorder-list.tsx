"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";

import { cn } from "@/lib/utils";

const REORDER_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

type ReorderListContextValue = {
  values: unknown[];
  axis: "x" | "y";
  withHandle: boolean;
  move: (value: unknown, offset: number) => void;
};

const ReorderListContext = React.createContext<
  ReorderListContextValue | undefined
>(undefined);

const useReorderList = () => {
  const context = React.useContext(ReorderListContext);
  if (!context) {
    throw new Error("useReorderList must be used within a ReorderList");
  }
  return context;
};

type ReorderListItemContextValue = {
  dragControls: ReturnType<typeof useDragControls>;
  value: unknown;
};

const ReorderListItemContext = React.createContext<
  ReorderListItemContextValue | undefined
>(undefined);

const useReorderListItem = () => {
  const context = React.useContext(ReorderListItemContext);
  if (!context) {
    throw new Error("useReorderListItem must be used within a ReorderListItem");
  }
  return context;
};

interface ReorderListProps<T> {
  values: T[];
  onReorder: (values: T[]) => void;
  children: React.ReactNode;
  axis?: "x" | "y";
  /** Restrict dragging to <ReorderListHandle>, leaving the rest of the row inert. */
  withHandle?: boolean;
  className?: string;
}

function ReorderList<T>({
  values,
  onReorder,
  children,
  axis = "y",
  withHandle = false,
  className,
}: ReorderListProps<T>) {
  // Keyboard reordering: arrow keys shift an item without a pointer.
  const move = React.useCallback(
    (value: unknown, offset: number) => {
      const from = values.indexOf(value as T);
      if (from === -1) return;

      const to = from + offset;
      if (to < 0 || to >= values.length) return;

      const next = [...values];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder(next);
    },
    [values, onReorder]
  );

  return (
    <ReorderListContext.Provider
      value={{ values: values as unknown[], axis, withHandle, move }}
    >
      <Reorder.Group
        axis={axis}
        values={values}
        onReorder={onReorder}
        data-slot="reorder-list"
        className={cn(
          "flex list-none gap-2 p-0",
          axis === "y" ? "flex-col" : "flex-row",
          className
        )}
      >
        {children}
      </Reorder.Group>
    </ReorderListContext.Provider>
  );
}

ReorderList.displayName = "ReorderList";

interface ReorderListItemProps<T> {
  value: T;
  children: React.ReactNode;
  className?: string;
}

function ReorderListItem<T>({
  value,
  children,
  className,
}: ReorderListItemProps<T>) {
  const { axis, withHandle, move } = useReorderList();
  const dragControls = useDragControls();

  const previousKey = axis === "y" ? "ArrowUp" : "ArrowLeft";
  const nextKey = axis === "y" ? "ArrowDown" : "ArrowRight";

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== previousKey && event.key !== nextKey) return;
    event.preventDefault();
    move(value, event.key === previousKey ? -1 : 1);
  };

  return (
    <ReorderListItemContext.Provider value={{ dragControls, value }}>
      <Reorder.Item
        value={value}
        dragListener={!withHandle}
        dragControls={dragControls}
        transition={REORDER_TRANSITION}
        whileDrag={{ scale: 1.02, zIndex: 1 }}
        // Without a handle the row itself is the control, so it takes focus.
        tabIndex={withHandle ? undefined : 0}
        onKeyDown={withHandle ? undefined : handleKeyDown}
        data-slot="reorder-list-item"
        className={cn(
          "flex select-none items-center gap-3 rounded-md border border-border bg-background p-3 text-sm shadow-sm outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          !withHandle && "cursor-grab active:cursor-grabbing",
          className
        )}
      >
        {children}
      </Reorder.Item>
    </ReorderListItemContext.Provider>
  );
}

ReorderListItem.displayName = "ReorderListItem";

type ReorderListHandleProps = React.ComponentProps<"button">;

function ReorderListHandle({
  className,
  children,
  ...props
}: ReorderListHandleProps) {
  const { axis, move } = useReorderList();
  const { dragControls, value } = useReorderListItem();

  const previousKey = axis === "y" ? "ArrowUp" : "ArrowLeft";
  const nextKey = axis === "y" ? "ArrowDown" : "ArrowRight";

  return (
    <button
      type="button"
      aria-label="Reorder item"
      onPointerDown={(event) => {
        event.preventDefault();
        dragControls.start(event);
      }}
      onKeyDown={(event) => {
        if (event.key !== previousKey && event.key !== nextKey) return;
        event.preventDefault();
        move(value, event.key === previousKey ? -1 : 1);
      }}
      data-slot="reorder-list-handle"
      className={cn(
        "touch-none rounded text-muted-foreground outline-none transition-colors",
        "cursor-grab active:cursor-grabbing hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children ?? <GripVertical className="size-4" />}
    </button>
  );
}

ReorderListHandle.displayName = "ReorderListHandle";

export { ReorderList, ReorderListItem, ReorderListHandle, useReorderList };
