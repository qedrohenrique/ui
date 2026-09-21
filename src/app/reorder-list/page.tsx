"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon, GithubIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ReorderList,
  ReorderListHandle,
  ReorderListItem,
} from "@/components/custom/reorder-list";

type Task = { id: number; label: string };

const INITIAL_TASKS: Task[] = [
  { id: 1, label: "Draft the release notes" },
  { id: 2, label: "Review the migration plan" },
  { id: 3, label: "Ship the registry fix" },
  { id: 4, label: "Record the demo" },
];

export default function ReorderListPage() {
  const INSTALL_CMD =
    "npx shadcn@latest add https://ui-iota-nine.vercel.app/r/reorder-list.json";

  const [rows, setRows] = useState(INITIAL_TASKS);
  const [handled, setHandled] = useState(INITIAL_TASKS);

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col mt-32 font-[family-name:var(--font-geist-sans)] items-center h-100vh">
      <div className="flex flex-col gap-6 p-4 rounded-md border border-foreground/10 w-full max-w-xl">
        <div>
          <h1 className="text-2xl font-bold">Reorder List</h1>
          <p className="text-sm text-muted-foreground">built with shadcn/ui</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Drag anywhere on the row — or focus it and use ↑ / ↓
          </p>
          <ReorderList values={rows} onReorder={setRows}>
            {rows.map((task) => (
              <ReorderListItem key={task.id} value={task}>
                {task.label}
              </ReorderListItem>
            ))}
          </ReorderList>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            With a handle: only the grip starts a drag
          </p>
          <ReorderList values={handled} onReorder={setHandled} withHandle>
            {handled.map((task) => (
              <ReorderListItem key={task.id} value={task}>
                <ReorderListHandle />
                {task.label}
              </ReorderListItem>
            ))}
          </ReorderList>
        </div>
      </div>

      <span className="text-sm text-muted-foreground my-4 border border-foreground/10 rounded-md p-2 flex items-center gap-2">
        {INSTALL_CMD}
        <Separator orientation="vertical" />
        <CopyIcon className="w-4 h-4 cursor-pointer" onClick={handleCopy} />
      </span>
      <Button
        variant="outline"
        onClick={() =>
          window.open(
            "https://github.com/qedrohenrique/ui/blob/master/src/components/custom/reorder-list.tsx",
            "_blank",
          )
        }
      >
        <GithubIcon />
        GitHub
      </Button>
    </div>
  );
}
