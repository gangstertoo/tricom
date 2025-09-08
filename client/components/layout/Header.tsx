import { Button } from "@/components/ui/button";
import { Moon, SunMedium, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { startGoogleAuth, useAuthStore, getMe } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();
  useEffect(() => setMounted(true), []);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!token,
    staleTime: 60000,
  });

  const onConnect = async () => {
    try {
      const url = await startGoogleAuth();
      if (!url) throw new Error("Missing auth URL");
      window.location.href = url;
    } catch (e: any) {
      toast({
        title: "Google connection failed",
        description: e?.message || "Server configuration is missing.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-3">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Sparkles className="h-5 w-5" />
          <span>Email Workflow</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!token ? (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="outline">Login</Button></Link>
              <Link to="/register"><Button>Register</Button></Link>
            </div>
          ) : meQuery.data?.user?.googleConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20">
                Google Connected
              </span>
              <Button variant="ghost" onClick={() => { setToken(null); navigate("/"); }}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onConnect}>Connect Google</Button>
              <Button variant="ghost" onClick={() => { setToken(null); navigate("/"); }}>Logout</Button>
            </div>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && theme === "dark" ? (
              <SunMedium className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
