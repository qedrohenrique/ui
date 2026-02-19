import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="container mx-auto mt-10 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-8">Components</h1>
        <div className="flex flex-col items-center gap-4">
          <Button variant="link" asChild className="w-min !p-0">
            <Link href="/multi-select-animated">Multi Select Animated</Link>
          </Button>
          <Button variant="link" asChild className="w-min !p-0">
            <Link href="/statefull-button">Statefull Button</Link>
          </Button>
          <Button variant="link" asChild className="w-min !p-0">
            <Link href="/expandable-timeline">Expandable Timeline</Link>
          </Button>
          <Button variant="link" asChild className="w-min !p-0">
            <Link href="/collapsible-drawer">Collapsible Drawer</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="link" asChild className="w-min !p-0">
              <Link href="/bong-toast">Bong Toast</Link>
            </Button>
            <a
              href="https://bong-toast.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
