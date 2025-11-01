import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "./ui/button";
import { GithubIcon, HomeIcon } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-primary/2 p-4 border-b-1 gap-2">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <HomeIcon />
          </Button>
        </Link>
        <Link
          href="https://github.com/qedrohenrique/ui"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="icon">
            <GithubIcon />
          </Button>
        </Link>
        <ModeToggle />
      </div>
    </nav>
  );
}
