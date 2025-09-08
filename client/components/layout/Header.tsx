import { Button } from "@/components/ui/button";
import { Moon, SunMedium, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { startGoogleAuth } from "@/lib/api";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onConnect = async () => {
    const url = await startGoogleAuth();
    window.location.href = url;
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-3">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Sparkles className="h-5 w-5" />
          <span>Email Workflow</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={onConnect}>Connect Google</Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
