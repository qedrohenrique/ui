"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CopyIcon, GithubIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  MorphingCard,
  MorphingCardTrigger,
  MorphingCardContent,
  MorphingCardImage,
  MorphingCardTitle,
  MorphingCardDescription,
  MorphingCardBody,
} from "@/components/custom/morphing-card";

const PROJECTS = [
  {
    id: "aurora",
    title: "Aurora",
    description: "Shader-driven backgrounds",
    image: "https://picsum.photos/seed/aurora/800/600",
    body: "A WebGL surface that reacts to the pointer, with a CSS fallback when the context is unavailable. Ships as a single client component and renders nothing on the server.",
  },
  {
    id: "obsidian",
    title: "Obsidian",
    description: "A dark reading theme",
    image: "https://picsum.photos/seed/obsidian/800/600",
    body: "Typography tuned for long-form reading, with a warm parchment counterpart. Every token is defined once and flipped by a single data attribute on the root element.",
  },
  {
    id: "ophanim",
    title: "Ophanim",
    description: "Rings that never stop turning",
    image: "https://picsum.photos/seed/ophanim/800/600",
    body: "Concentric rings driven by a shared clock, so every instance on the page stays in phase no matter when it mounts.",
  },
];

export default function MorphingCardPage() {
  const INSTALL_CMD =
    "npx shadcn@latest add https://ui-iota-nine.vercel.app/r/morphing-card.json";

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col mt-32 font-[family-name:var(--font-geist-sans)] items-center h-100vh">
      <div className="flex flex-col gap-4 p-4 rounded-md border border-foreground/10 w-full max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Morphing Card</h1>
          <p className="text-sm text-muted-foreground">built with shadcn/ui</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PROJECTS.map((project) => (
            <MorphingCard key={project.id} id={project.id} size="md">
              <MorphingCardTrigger className="h-full">
                <MorphingCardImage
                  src={project.image}
                  alt={project.title}
                  className="h-32"
                />
                <div className="flex flex-col gap-1 p-3">
                  <MorphingCardTitle className="text-sm">
                    {project.title}
                  </MorphingCardTitle>
                  <MorphingCardDescription className="text-xs">
                    {project.description}
                  </MorphingCardDescription>
                </div>
              </MorphingCardTrigger>

              <MorphingCardContent>
                <MorphingCardImage
                  src={project.image}
                  alt={project.title}
                  className="h-56"
                />
                <div className="flex flex-col gap-2 p-5">
                  <MorphingCardTitle className="text-xl">
                    {project.title}
                  </MorphingCardTitle>
                  <MorphingCardDescription>
                    {project.description}
                  </MorphingCardDescription>
                  <MorphingCardBody className="mt-2 leading-relaxed">
                    {project.body}
                  </MorphingCardBody>
                </div>
              </MorphingCardContent>
            </MorphingCard>
          ))}
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
            "https://github.com/qedrohenrique/ui/blob/master/src/components/custom/morphing-card.tsx",
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
