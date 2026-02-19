"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CopyIcon, GithubIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { StatefullButton } from "@/components/custom/statefull-button";
import { useState } from "react";

export default function StatefullButtonPage() {
  const [buttonState, setButtonState] =
    useState<React.ComponentProps<typeof StatefullButton>["phase"]>("idle");

  const INSTALL_CMD =
    "npx shadcn@latest add https://multi-select-animated.vercel.app/r/statefull-button.json";

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    toast.success("Copied to clipboard");
  };

  const handleClick = () => {
    setButtonState("loading");
    setTimeout(() => {
      setButtonState("success");
    }, 1000);
    setTimeout(() => {
      setButtonState("idle");
    }, 2000);
  };

  return (
    <div className="flex flex-col mt-32 font-[family-name:var(--font-geist-sans)] items-center  h-100vh">
      <div className="flex flex-col gap-4 p-4 rounded-md border border-foreground/10 w-fit">
        <div>
          <h1 className="text-2xl font-bold">Statefull Button</h1>
          <p className="text-sm text-muted-foreground">built with shadcn/ui</p>
        </div>
        <StatefullButton phase={buttonState} onClick={handleClick}>
          Click me
        </StatefullButton>
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
            "https://github.com/qedrohenrique/ui/blob/master/src/components/custom/statefull-button.tsx",
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
