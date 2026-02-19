"use client";

import { BongToast } from "@/components/bong-toast";
import { useBongToast } from "@/hooks/use-bong-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyIcon, ExternalLink, GithubIcon } from "lucide-react";
import { toast } from "sonner";

const INSTALL_CMD =
  "npx shadcn@latest add https://bong-toast.vercel.app/r/bong-toast.json";

const VARIANTS = [
  {
    variant: "default",
    label: "Default",
    description: "A simple default notification.",
  },
  {
    variant: "success",
    label: "Success",
    description: "The operation completed successfully.",
  },
  {
    variant: "error",
    label: "Error",
    description: "Something went wrong, please try again.",
  },
  {
    variant: "warning",
    label: "Warning",
    description: "Proceed with caution.",
  },
  {
    variant: "info",
    label: "Info",
    description: "Here is some useful information.",
  },
] as const;

function BongToastDemo() {
  const { toast: bongToast } = useBongToast();

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {VARIANTS.map(({ variant, label, description }) => (
        <Button
          key={variant}
          variant="outline"
          onClick={() => bongToast({ title: label, description, variant })}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

export default function BongToastPage() {
  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col mt-32 font-[family-name:var(--font-geist-sans)] items-center h-100vh">
      <div className="flex flex-col gap-4 p-4 rounded-md border border-foreground/10 w-fit">
        <div>
          <h1 className="text-2xl font-bold">Bong Toast</h1>
          <p className="text-sm text-muted-foreground">built with shadcn/ui</p>
        </div>
        <BongToastDemo />
        <BongToast position="bottom-right" />
      </div>
      <span className="text-sm text-muted-foreground my-4 border border-foreground/10 rounded-md p-2 flex items-center gap-2">
        {INSTALL_CMD}
        <Separator orientation="vertical" />
        <CopyIcon className="w-4 h-4 cursor-pointer" onClick={handleCopy} />
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => window.open("https://bong-toast.vercel.app", "_blank")}
        >
          <ExternalLink />
          Original
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              "https://github.com/qedrohenrique/ui/blob/master/src/components/bong-toast.tsx",
              "_blank",
            )
          }
        >
          <GithubIcon />
          GitHub
        </Button>
      </div>
    </div>
  );
}
