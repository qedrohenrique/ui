"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CopyIcon, GithubIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CollapsibleDrawer, {
  CollapsibleDrawerBody,
  CollapsibleDrawerContent,
  CollapsibleDrawerHeader,
  CollapsibleDrawerTitle,
  CollapsibleDrawerTrigger,
} from "@/components/custom/collapsible-drawer";

export default function CollapsibleDrawerPage() {
  const INSTALL_CMD =
    "npx shadcn@latest add https://ui-iota-nine.vercel.app/r/collapsible-drawer.json";

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col mt-32 font-[family-name:var(--font-geist-sans)] items-center  h-100vh">
      <div className="flex flex-col gap-4 p-4 rounded-md border border-foreground/10 w-fit">
        <div>
          <h1 className="text-2xl font-bold">Collapsible Drawer</h1>
          <p className="text-sm text-muted-foreground">built with shadcn/ui</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <CollapsibleDrawer side="right">
            <CollapsibleDrawerTrigger asChild>
              <Button>Open Right</Button>
            </CollapsibleDrawerTrigger>
            <CollapsibleDrawerContent>
              <CollapsibleDrawerHeader>
                <CollapsibleDrawerTitle>
                  <h1>Collapsible Drawer</h1>
                </CollapsibleDrawerTitle>
              </CollapsibleDrawerHeader>
              <CollapsibleDrawerBody>
                <p>Content</p>
              </CollapsibleDrawerBody>
            </CollapsibleDrawerContent>
          </CollapsibleDrawer>

          <CollapsibleDrawer side="left">
            <CollapsibleDrawerTrigger asChild>
              <Button>Open Left</Button>
            </CollapsibleDrawerTrigger>
            <CollapsibleDrawerContent>
              <CollapsibleDrawerHeader>
                <CollapsibleDrawerTitle>
                  <h1>Collapsible Drawer</h1>
                </CollapsibleDrawerTitle>
              </CollapsibleDrawerHeader>
              <CollapsibleDrawerBody>
                <p>Content</p>
              </CollapsibleDrawerBody>
            </CollapsibleDrawerContent>
          </CollapsibleDrawer>

          <CollapsibleDrawer side="top">
            <CollapsibleDrawerTrigger asChild>
              <Button>Open Top</Button>
            </CollapsibleDrawerTrigger>
            <CollapsibleDrawerContent>
              <CollapsibleDrawerHeader>
                <CollapsibleDrawerTitle>
                  <h1>Collapsible Drawer</h1>
                </CollapsibleDrawerTitle>
              </CollapsibleDrawerHeader>
              <CollapsibleDrawerBody>
                <p>Content</p>
              </CollapsibleDrawerBody>
            </CollapsibleDrawerContent>
          </CollapsibleDrawer>

          <CollapsibleDrawer side="bottom">
            <CollapsibleDrawerTrigger asChild>
              <Button>Open Bottom</Button>
            </CollapsibleDrawerTrigger>
            <CollapsibleDrawerContent>
              <CollapsibleDrawerHeader>
                <CollapsibleDrawerTitle>
                  <h1>Collapsible Drawer</h1>
                </CollapsibleDrawerTitle>
              </CollapsibleDrawerHeader>
              <CollapsibleDrawerBody>
                <p>Content</p>
              </CollapsibleDrawerBody>
            </CollapsibleDrawerContent>
          </CollapsibleDrawer>
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
            "https://github.com/qedrohenrique/ui/blob/master/src/components/custom/collapsible-drawer.tsx",
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
