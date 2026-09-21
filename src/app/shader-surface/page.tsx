"use client";

import { toast } from "sonner";
import { CopyIcon, GithubIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShaderSurface } from "@/components/custom/shader-surface";

export default function ShaderSurfacePage() {
  const INSTALL_CMD =
    "npx shadcn@latest add https://ui-iota-nine.vercel.app/r/shader-surface.json";

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col mt-32 font-[family-name:var(--font-geist-sans)] items-center h-100vh">
      <div className="flex flex-col gap-6 p-4 rounded-md border border-foreground/10 w-full max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Shader Surface</h1>
          <p className="text-sm text-muted-foreground">
            built with shadcn/ui — no WebGL library, no dependencies
          </p>
        </div>

        <ShaderSurface className="rounded-xl h-64 flex items-end">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white drop-shadow">
              Move your cursor
            </h2>
            <p className="text-sm text-white/80 drop-shadow">
              The third gradient centre follows the pointer.
            </p>
          </div>
        </ShaderSurface>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ShaderSurface
            colors={["#f97316", "#facc15", "#ef4444"]}
            speed={0.6}
            className="h-32 rounded-lg"
          />
          <ShaderSurface
            colors={["#0ea5e9", "#22d3ee", "#a78bfa"]}
            speed={1.6}
            grain={0.08}
            className="h-32 rounded-lg"
          />
          <ShaderSurface
            colors={["#134e4a", "#10b981", "#84cc16"]}
            speed={0}
            interactive={false}
            className="h-32 rounded-lg"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          The third is <code>speed=0</code> and non-interactive: a still frame,
          same shader.
        </p>
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
            "https://github.com/qedrohenrique/ui/blob/master/src/components/custom/shader-surface.tsx",
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
