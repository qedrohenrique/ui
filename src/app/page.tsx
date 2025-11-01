import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="container mx-auto mt-10 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-8">Components</h1>
        <div className="flex flex-col gap-4">
          <Button variant="link" asChild>
            <Link href="/multi-select-animated">Multi Select Animated</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/statefull-button">Statefull Button</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/expandable-timeline">Expandable Timeline</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/collapsible-drawer">Collapsible Drawer</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
