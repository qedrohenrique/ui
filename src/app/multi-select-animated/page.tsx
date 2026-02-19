"use client";

import MultiselectAnimated, {
  ContentItem,
} from "@/components/custom/multi-select-animated";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon, GithubIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const contentLorem: ContentItem[] = [
  {
    id: 1,
    content: "Lorem",
  },
  {
    id: 2,
    content: "Ipsum",
  },
  {
    id: 3,
    content: "Dolor",
  },
  {
    id: 4,
    content: "Sit",
  },
  {
    id: 5,
    content: "Amet",
  },
  {
    id: 6,
    content: "Consectetur",
  },
  {
    id: 7,
    content: "Adipiscing",
  },
  {
    id: 8,
    content: "Elit",
  },
  {
    id: 9,
    content: "Sed",
  },
];

export default function MultiSelectAnimatedPage() {
  const [selectedItems, setSelectedItems] =
    useState<ContentItem[]>(contentLorem);

  const INSTALL_CMD =
    "npx shadcn@latest add https://multi-select-animated.vercel.app/r/multi-select-animated.json";

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col mt-32 font-[family-name:var(--font-geist-sans)] items-center  h-100vh">
      <div className="flex flex-col gap-4 p-4 rounded-md border border-foreground/10 w-fit">
        <div>
          <h1 className="text-2xl font-bold">Multi Select Animated</h1>
          <p className="text-sm text-muted-foreground">built with shadcn/ui</p>
        </div>
        <MultiselectAnimated
          options={contentLorem}
          initialSelectedItems={selectedItems}
          placeholder="Select options"
          onSelect={(item) => {
            setSelectedItems((prev) => {
              if (prev.find((i) => i.id === item.id)) {
                return prev;
              }
              return [...prev, item];
            });
          }}
          onDeselect={(item) => {
            setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
          }}
          triggerClassName="w-full max-w-80"
        />
        <Button
          onClick={() => {
            if (selectedItems.length > 0) {
              toast.success(
                `Submitted items: ${selectedItems
                  .map((i) => i.content)
                  .join(", ")}`,
              );
            } else {
              toast.error("No items selected");
            }
          }}
        >
          Submit
        </Button>
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
            "https://github.com/qedrohenrique/ui/blob/master/src/components/custom/multi-select-animated.tsx",
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
